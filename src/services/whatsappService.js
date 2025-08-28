import { db } from './firebase'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { getAllJemaat, findJemaatByPhone, updateJemaatTelegramUserId, getJemaatWithTelegram } from './jemaatService'

/**
 * Telegram Service untuk mengelola integrasi Telegram
 */
class TelegramService {
  constructor() {
    this.apiUrl = process.env.VUE_APP_TELEGRAM_API_URL || 'https://api.telegram.org'
    this.botToken = process.env.VUE_APP_TELEGRAM_BOT_TOKEN || ''
    // Tidak perlu chatId karena kirim ke individual jemaat
  }

  /**
   * Kirim pesan Telegram
   * @param {string} chatId - Chat ID tujuan (bisa personal atau grup)
   * @param {string} message - Pesan yang akan dikirim
   * @param {Object} options - Opsi tambahan (parse_mode, etc.)
   * @returns {Promise<Object>} Response dari API Telegram
   */
  async sendMessage(chatId, message, options = {}) {
    try {
      const url = `${this.apiUrl}/bot${this.botToken}/sendMessage`
      
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: options.parse_mode || 'HTML',
        ...options
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Telegram API error: ${errorData.description || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      throw error
    }
  }

  /**
   * Kirim pesan broadcast ke semua jemaat individu via Telegram
   * @param {string} message - Pesan yang akan dikirim
   * @returns {Promise<Object>} Hasil pengiriman
   */
  async sendBroadcastToAllJemaat(message) {
    try {
      console.log('📱 [TelegramService] Memulai broadcast ke semua jemaat...')
      
      // Ambil data jemaat yang sudah terdaftar di Telegram
      const jemaatWithTelegram = await getJemaatWithTelegram()
      
      console.log(`📊 [TelegramService] Total jemaat dengan Telegram: ${jemaatWithTelegram.length}`)
      
      if (jemaatWithTelegram.length === 0) {
        return {
          success: true,
          broadcastType: 'individual',
          results: {
            total: 0,
            success: 0,
            failed: 0,
            details: [],
            message: 'Tidak ada jemaat yang terdaftar di Telegram'
          }
        }
      }
      
      const results = {
        total: jemaatWithTelegram.length,
        success: 0,
        failed: 0,
        details: []
      }
      
      // Kirim ke setiap jemaat dengan delay untuk menghindari rate limit
      for (let i = 0; i < jemaatWithTelegram.length; i++) {
        const jemaat = jemaatWithTelegram[i]
        
        try {
          const personalMessage = this.personalizeMessage(message, jemaat)
          const result = await this.sendMessage(jemaat.telegramUserId, personalMessage)
          
          results.success++
          results.details.push({
            jemaatId: jemaat.id,
            nama: jemaat.nama,
            telegramUserId: jemaat.telegramUserId,
            status: 'sent',
            result: result
          })
          
          console.log(`✅ [TelegramService] Berhasil kirim ke ${jemaat.nama}`)
          
        } catch (error) {
          results.failed++
          results.details.push({
            jemaatId: jemaat.id,
            nama: jemaat.nama,
            telegramUserId: jemaat.telegramUserId,
            status: 'failed',
            error: error.message
          })
          
          console.error(`❌ [TelegramService] Gagal kirim ke ${jemaat.nama}:`, error.message)
        }
        
        // Delay 1 detik antar pengiriman untuk menghindari rate limit
        if (i < jemaatWithTelegram.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      console.log(`📊 [TelegramService] Broadcast selesai. Sukses: ${results.success}, Gagal: ${results.failed}`)
      
      return {
        success: true,
        broadcastType: 'individual',
        results
      }
      
    } catch (error) {
      console.error('Error sending broadcast to all jemaat:', error)
      throw error
    }
  }

  /**
   * Personalisasi pesan untuk setiap jemaat
   * @param {string} message - Pesan asli
   * @param {Object} jemaat - Data jemaat
   * @returns {string} Pesan yang dipersonalisasi
   */
  personalizeMessage(message, jemaat) {
    const personalGreeting = `🙏 Halo ${jemaat.nama}!\n\n`
    return personalGreeting + message
  }

  /**
   * Kirim renungan otomatis ke semua jemaat via Telegram saat admin upload renungan baru
   * @param {Object} renunganData - Data renungan yang baru diupload
   * @returns {Promise<Object>} Hasil pengiriman
   */
  async sendRenunganToTelegram(renunganData) {
    try {
      console.log('📱 [TelegramService] Mengirim renungan ke semua jemaat:', renunganData.title)
      
      // Format pesan renungan untuk Telegram
      const message = this.formatRenunganMessage(renunganData)
      
      // Kirim ke semua jemaat individu
      const result = await this.sendBroadcastToAllJemaat(message)
      
      // Simpan log pengiriman
      await this.saveMessageLog({
        type: 'renungan_broadcast',
        broadcastType: 'individual',
        totalSent: result.results.success,
        totalFailed: result.results.failed,
        totalJemaat: result.results.total,
        message: message,
        renunganId: renunganData.id,
        renunganTitle: renunganData.title,
        sentBy: renunganData.createdBy || 'admin',
        result: result,
        details: result.results.details
      })
      
      console.log(`✅ [TelegramService] Renungan berhasil dikirim ke ${result.results.success}/${result.results.total} jemaat`)
      return result
      
    } catch (error) {
      console.error('❌ [TelegramService] Error mengirim renungan ke Telegram:', error)
      
      // Simpan log error
      await this.saveMessageLog({
        type: 'renungan_broadcast_error',
        renunganId: renunganData.id,
        renunganTitle: renunganData.title,
        sentBy: renunganData.createdBy || 'admin',
        error: error.message,
        status: 'failed'
      })
      
      throw error
    }
  }

  /**
   * Simpan log pesan ke Firestore
   * @param {Object} messageData - Data pesan
   * @returns {Promise<string>} Document ID
   */
  async saveMessageLog(messageData) {
    try {
      const docRef = await addDoc(collection(db, 'telegram_logs'), {
        ...messageData,
        timestamp: new Date(),
        status: messageData.status || 'sent'
      })
      return docRef.id
    } catch (error) {
      console.error('Error saving message log:', error)
      throw error
    }
  }

  /**
   * Ambil history pesan dari Firestore
   * @returns {Promise<Array>} Array history pesan
   */
  async getMessageHistory() {
    try {
      const querySnapshot = await getDocs(collection(db, 'telegram_logs'))
      const messages = []
      
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return messages.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error getting message history:', error)
      throw error
    }
  }

  /**
   * Update status pesan
   * @param {string} messageId - ID dokumen pesan
   * @param {string} status - Status baru
   * @returns {Promise<void>}
   */
  async updateMessageStatus(messageId, status) {
    try {
      const messageRef = doc(db, 'telegram_logs', messageId)
      await updateDoc(messageRef, {
        status,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating message status:', error)
      throw error
    }
  }

  /**
   * Hapus log pesan
   * @param {string} messageId - ID dokumen pesan
   * @returns {Promise<void>}
   */
  async deleteMessageLog(messageId) {
    try {
      await deleteDoc(doc(db, 'telegram_logs', messageId))
    } catch (error) {
      console.error('Error deleting message log:', error)
      throw error
    }
  }

  /**
   * Format pesan renungan untuk Telegram
   * @param {Object} renunganData - Data renungan
   * @returns {string} Pesan yang diformat untuk Telegram
   */
  formatRenunganMessage(renunganData) {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let message = `🙏 <b>RENUNGAN HARIAN</b>\n`
    message += `📅 ${today}\n\n`
    
    if (renunganData.title) {
      message += `<b>${renunganData.title}</b>\n\n`
    }
    
    if (renunganData.verse) {
      message += `📖 <i>${renunganData.verse}</i>\n\n`
    }
    
    if (renunganData.content) {
      // Limit content untuk menghindari pesan terlalu panjang
      const maxLength = 3000
      let content = renunganData.content
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...\n\n<i>[Baca selengkapnya di aplikasi MyRajawali]</i>'
      }
      message += `${content}\n\n`
    }
    
    if (renunganData.prayer) {
      message += `🤲 <b>Doa:</b>\n${renunganData.prayer}\n\n`
    }
    
    message += `💝 Tuhan Yesus memberkati\n`
    message += `🏛️ <b>Gereja MyRajawali</b>`
    
    return message
  }

  /**
   * Dapatkan info jemaat untuk statistik pengiriman
   * @returns {Promise<Object>} Statistik jemaat
   */
  async getJemaatStats() {
    try {
      const allJemaat = await getAllJemaat()
      const jemaatWithTelegram = await getJemaatWithTelegram()
      
      const stats = {
        total: allJemaat.length,
        registered: allJemaat.filter(j => j.isRegistered).length,
        active: allJemaat.filter(j => j.status === 'aktif').length,
        withPhone: allJemaat.filter(j => j.noHP && j.noHP.trim()).length,
        withTelegram: jemaatWithTelegram.length,
        telegramPercentage: allJemaat.length > 0 ? Math.round((jemaatWithTelegram.length / allJemaat.length) * 100) : 0
      }
      
      return stats
    } catch (error) {
      console.error('Error getting jemaat stats:', error)
      return { 
        total: 0, 
        registered: 0, 
        active: 0, 
        withPhone: 0, 
        withTelegram: 0,
        telegramPercentage: 0
      }
    }
  }

  /**
   * Template pesan untuk berbagai keperluan
   */
  getMessageTemplates() {
    return {
      welcome: (name) => `🎉 Selamat datang di MyRajawali, ${name}! Terima kasih telah bergabung dengan komunitas kami.`,
      reminder: (name, event) => `🔔 Halo ${name}, ini adalah pengingat untuk acara ${event}. Jangan lupa untuk hadir!`,
      announcement: (title, content) => `📢 <b>PENGUMUMAN</b>\n\n<b>${title}</b>\n\n${content}`,
      birthday: (name) => `🎂 Selamat Ulang Tahun, ${name}! Tuhan Yesus memberkati hidup Anda.`,
      prayer: (name, request) => `🙏 <b>Permohonan Doa</b>\n\nDari: ${name}\n\n${request}\n\nMari kita doakan bersama.`,
      devotional: (title, verse, content) => `🙏 <b>RENUNGAN HARIAN</b>\n\n<b>${title}</b>\n\n📖 <i>${verse}</i>\n\n${content}`
    }
  }

  /**
   * Test koneksi ke Telegram Bot API
   * @returns {Promise<Object>} Info bot dan status koneksi
   */
  async testConnection() {
    try {
      const url = `${this.apiUrl}/bot${this.botToken}/getMe`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.ok) {
        return {
          success: true,
          botInfo: data.result,
          message: `Bot "${data.result.first_name}" (@${data.result.username}) terhubung dengan sukses!`
        }
      } else {
        throw new Error(data.description || 'Unknown Telegram API error')
      }
      
    } catch (error) {
      console.error('Error testing Telegram connection:', error)
      return {
        success: false,
        error: error.message,
        message: 'Gagal terhubung ke Telegram Bot API'
      }
    }
  }

  /**
   * Konversi nomor HP ke Telegram User ID (untuk testing/setup awal)
   * Note: Ini hanya contoh implementasi. Di praktiknya, jemaat harus:
   * 1. Chat dengan bot terlebih dahulu
   * 2. Bot menyimpan chat_id mereka ke database
   * @param {string} phoneNumber - Nomor HP jemaat
   * @returns {string|null} Telegram User ID jika ada
   */
  getJemaatTelegramUserId(phoneNumber) {
    // Placeholder implementasi
    // Di production, ini akan mengambil dari database mapping
    // Format nomor HP ke Telegram User ID
    return null
  }

  /**
   * Registrasi jemaat ke bot Telegram
   * Dipanggil ketika jemaat pertama kali chat dengan bot
   * @param {string} telegramUserId - User ID dari Telegram
   * @param {string} phoneNumber - Nomor HP jemaat untuk matching
   * @returns {Promise<Object>} Status registrasi dan data jemaat
   */
  async registerJemaatTelegram(telegramUserId, phoneNumber) {
    try {
      console.log(`📱 [TelegramService] Registering jemaat: ${phoneNumber} -> ${telegramUserId}`)
      
      // Cari jemaat berdasarkan nomor HP
      const jemaatData = await findJemaatByPhone(phoneNumber)
      
      if (!jemaatData) {
        return {
          success: false,
          message: 'Nomor HP tidak ditemukan dalam database jemaat. Silakan hubungi admin gereja.'
        }
      }
      
      // Update telegramUserId di database jemaat
      await updateJemaatTelegramUserId(jemaatData.id, telegramUserId)
      
      // Kirim pesan welcome
      await this.sendWelcomeMessage(telegramUserId, jemaatData)
      
      console.log(`✅ [TelegramService] Jemaat ${jemaatData.nama} berhasil terdaftar`)
      
      return {
        success: true,
        message: `Selamat datang ${jemaatData.nama}! Anda berhasil terdaftar untuk menerima renungan harian.`,
        jemaatData: {
          id: jemaatData.id,
          nama: jemaatData.nama,
          sektor: jemaatData.sektor
        }
      }
      
    } catch (error) {
      console.error('Error registering jemaat to Telegram:', error)
      return {
        success: false,
        message: 'Terjadi error saat registrasi. Silakan coba lagi atau hubungi admin.'
      }
    }
  }

  /**
   * Kirim pesan welcome saat jemaat pertama kali chat dengan bot
   * @param {string} telegramUserId - User ID Telegram jemaat
   * @param {Object} jemaatData - Data jemaat
   * @returns {Promise<Object>} Hasil pengiriman
   */
  async sendWelcomeMessage(telegramUserId, jemaatData) {
    try {
      const welcomeMessage = `🙏 Selamat datang ${jemaatData.nama}!\n\nTerima kasih telah terhubung dengan MyRajawali Bot.\n\nAnda akan menerima:\n📖 Renungan harian\n📢 Pengumuman gereja  \n🎂 Ucapan ulang tahun\n🙏 Permohonan doa\n\nTuhan Yesus memberkati! \n🏛️ Gereja MyRajawali`

      return await this.sendMessage(telegramUserId, welcomeMessage)
    } catch (error) {
      console.error('Error sending welcome message:', error)
      throw error
    }
  }

  /**
   * Ambil updates dari Telegram untuk mendapatkan User ID jemaat yang chat dengan bot
   * @returns {Promise<Array>} Array updates Telegram
   */
  async getTelegramUpdates() {
    try {
      const url = `${this.apiUrl}/bot${this.botToken}/getUpdates?limit=100`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.ok) {
        return data.result
      } else {
        throw new Error(data.description || 'Unknown Telegram API error')
      }
      
    } catch (error) {
      console.error('Error getting Telegram updates:', error)
      throw error
    }
  }

  /**
   * Registrasi jemaat dengan Telegram User ID
   * @param {string} jemaatId - ID jemaat
   * @param {string} telegramUserId - Telegram User ID
   * @returns {Promise<boolean>} Success status
   */
  async registerJemaatTelegram(jemaatId, telegramUserId) {
    try {
      await updateJemaatTelegramUserId(jemaatId, telegramUserId)
      
      // Log registrasi
      await this.saveMessageLog({
        type: 'jemaat_registration',
        jemaatId: jemaatId,
        telegramUserId: telegramUserId,
        status: 'registered',
        timestamp: new Date()
      })
      
      console.log(`✅ [TelegramService] Jemaat ${jemaatId} berhasil didaftarkan dengan Telegram ${telegramUserId}`)
      return true
      
    } catch (error) {
      console.error('Error registering jemaat to Telegram:', error)
      throw error
    }
  }

  /**
   * Hapus registrasi jemaat dari Telegram
   * @param {string} jemaatId - ID jemaat
   * @returns {Promise<boolean>} Success status
   */
  async unregisterJemaatTelegram(jemaatId) {
    try {
      await updateJemaatTelegramUserId(jemaatId, null)
      
      // Log unregistration
      await this.saveMessageLog({
        type: 'jemaat_unregistration',
        jemaatId: jemaatId,
        status: 'unregistered',
        timestamp: new Date()
      })
      
      console.log(`✅ [TelegramService] Jemaat ${jemaatId} berhasil dihapus dari Telegram`)
      return true
      
    } catch (error) {
      console.error('Error unregistering jemaat from Telegram:', error)
      throw error
    }
  }

  /**
   * Kirim pesan welcome ke jemaat yang baru mendaftar
   * @param {Object} jemaat - Data jemaat
   * @returns {Promise<Object>} Hasil pengiriman
   */
  async sendWelcomeMessage(jemaat) {
    try {
      const welcomeMessage = `🎉 Selamat datang di MyRajawali, ${jemaat.nama}!

📱 Anda telah berhasil mendaftar untuk menerima renungan harian otomatis.

🙏 Setiap hari Anda akan menerima:
• Renungan harian dengan ayat Alkitab
• Doa dan refleksi rohani
• Pengumuman gereja (jika ada)

💝 Tuhan Yesus memberkati!
🏛️ <b>Gereja MyRajawali</b>`

      const result = await this.sendMessage(jemaat.telegramUserId, welcomeMessage)
      
      // Log welcome message
      await this.saveMessageLog({
        type: 'welcome_message',
        jemaatId: jemaat.id,
        telegramUserId: jemaat.telegramUserId,
        message: welcomeMessage,
        status: 'sent',
        result: result
      })
      
      return result
      
    } catch (error) {
      console.error('Error sending welcome message:', error)
      throw error
    }
  }

  /**
   * Parse updates Telegram untuk menemukan User ID berdasarkan username atau nama
   * @param {Array} updates - Array updates dari Telegram
   * @returns {Array} Array user yang chat dengan bot
   */
  parseUpdatesForUsers(updates) {
    const users = []
    
    updates.forEach(update => {
      if (update.message && update.message.from) {
        const user = update.message.from
        const userInfo = {
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          lastMessage: update.message.text || '',
          messageDate: new Date(update.message.date * 1000)
        }
        
        // Hindari duplikasi user
        if (!users.find(u => u.id === user.id)) {
          users.push(userInfo)
        }
      }
    })
    
    return users.sort((a, b) => b.messageDate - a.messageDate)
  }

  /**
   * Validasi apakah user memiliki akses ke bot (security check)
   * @param {string} telegramUserId - User ID dari Telegram
   * @param {string} phoneNumber - Nomor HP untuk validasi
   * @returns {Promise<Object>} Status validasi
   */
  async validateUserAccess(telegramUserId, phoneNumber) {
    try {
      // Normalize nomor HP
      const normalizedPhone = phoneNumber.replace(/[\s-+()]/g, '')
      
      // Cek apakah nomor HP ada di database jemaat
      const jemaatData = await findJemaatByPhone(normalizedPhone)
      
      if (!jemaatData) {
        // Log unauthorized access attempt
        await this.saveMessageLog({
          type: 'unauthorized_access',
          telegramUserId: telegramUserId,
          phoneNumber: normalizedPhone,
          status: 'blocked',
          reason: 'Phone number not found in jemaat database'
        })
        
        return {
          valid: false,
          message: '❌ Nomor HP tidak terdaftar dalam database jemaat.\n\nSilakan hubungi admin gereja untuk bantuan.'
        }
      }
      
      // Cek apakah jemaat sudah terdaftar dengan Telegram lain
      if (jemaatData.telegramUserId && jemaatData.telegramUserId !== telegramUserId) {
        return {
          valid: false,
          message: '❌ Nomor HP ini sudah terdaftar dengan akun Telegram lain.\n\nSilakan hubungi admin gereja untuk bantuan.'
        }
      }
      
      return {
        valid: true,
        jemaatData: jemaatData,
        message: `✅ Validasi berhasil! Selamat datang ${jemaatData.nama}.`
      }
      
    } catch (error) {
      console.error('Error validating user access:', error)
      return {
        valid: false,
        message: '❌ Terjadi error saat validasi. Silakan coba lagi.'
      }
    }
  }

  /**
   * Kirim pesan blokir ke user tidak terotorisasi
   * @param {string} telegramUserId - User ID yang diblokir
   * @returns {Promise<void>}
   */
  async sendBlockMessage(telegramUserId) {
    try {
      const blockMessage = `🚫 <b>AKSES DITOLAK</b>

Maaf, bot ini khusus untuk jemaat Gereja MyRajawali yang terdaftar.

Jika Anda adalah jemaat gereja:
1. Pastikan nomor HP Anda sudah terdaftar di database gereja
2. Hubungi admin gereja untuk bantuan

Terima kasih atas pengertiannya.

🏛️ <b>Gereja MyRajawali</b>`

      await this.sendMessage(telegramUserId, blockMessage)
    } catch (error) {
      console.error('Error sending block message:', error)
    }
  }
}

export default new TelegramService()
