// SIMPLE TELEGRAM REGISTRATION SYSTEM
// Tidak perlu validasi nomor HP, admin approve manual

import { db } from './firebase'
import { collection, addDoc, getDocs, updateDoc, query, where } from 'firebase/firestore'

/**
 * Sistem Registrasi Telegram yang Disederhanakan
 * 1. Jemaat kirim /start
 * 2. Bot auto-registrasi (pending approval)
 * 3. Admin approve di panel
 * 4. User mulai terima renungan
 */
export class SimpleTelegramRegistration {
  
  /**
   * Registrasi otomatis saat user /start (tanpa validasi HP)
   */
  async autoRegister(telegramUser) {
    try {
      console.log('🤖 Auto-registering user:', telegramUser)
      
      // Cek apakah sudah terdaftar
      const existing = await this.checkExistingUser(telegramUser.id)
      
      if (existing) {
        if (existing.status === 'approved') {
          // User sudah approved, kirim welcome back message
          console.log('✅ User already approved:', telegramUser.first_name)
          return { success: true, status: 'approved', sendMessage: false } // Jangan kirim pesan dari sini
        } else if (existing.status === 'pending_approval') {
          // User sudah daftar tapi masih pending
          console.log('⏳ User already pending:', telegramUser.first_name)
          return { success: true, status: 'pending', sendMessage: false } // Jangan kirim pesan dari sini
        }
      }
      
      // Registrasi baru - simpan untuk approval admin
      await this.savePendingRegistration(telegramUser)
      console.log('📝 New user registered as pending:', telegramUser.first_name)
      
      return { success: true, status: 'new_pending', sendMessage: true }
      
    } catch (error) {
      console.error('Auto-registration error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Cek apakah user sudah terdaftar dan statusnya
   */
  async checkExistingUser(telegramUserId) {
    const registrationsRef = collection(db, 'telegram_registrations')
    const q = query(registrationsRef, where('telegramUserId', '==', telegramUserId.toString()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null // User belum terdaftar sama sekali
    }
    
    const userData = snapshot.docs[0].data()
    return {
      exists: true,
      status: userData.status,
      data: userData
    }
  }
  
  /**
   * Simpan data registrasi pending
   */
  async savePendingRegistration(telegramUser) {
    // First, check if user already exists to prevent duplicates
    const existing = await this.checkExistingUser(telegramUser.id)
    if (existing) {
      console.log('⚠️ User already exists, skipping duplicate registration')
      return // Don't create duplicate
    }
    
    const registrationsRef = collection(db, 'telegram_registrations')
    await addDoc(registrationsRef, {
      telegramUserId: telegramUser.id.toString(),
      telegramUsername: telegramUser.username || null,
      telegramFirstName: telegramUser.first_name,
      telegramLastName: telegramUser.last_name || null,
      status: 'pending_approval',
      registeredAt: new Date(),
      approvedAt: null,
      approvedBy: null
    })
  }
  
  /**
   * Kirim pesan untuk user yang sudah terdaftar
   */
  async sendWelcomeBackMessage(telegramUser) {
    const message = `👋 Halo lagi, ${telegramUser.first_name}!

✅ Anda sudah terdaftar di MyRajawali.
📖 Terus terima renungan harian setiap hari.

🙏 Tuhan memberkati!`
    
    return await this.sendTelegramMessage(telegramUser.id, message)
  }
  
  /**
   * Kirim pesan pending approval
   */
  async sendPendingMessage(telegramUser) {
    const message = `🙏 Selamat datang, ${telegramUser.first_name}!

📝 Pendaftaran Anda sedang diproses admin.

⏳ Setelah disetujui, Anda akan terima:
• 📖 Renungan harian
• 🙏 Ayat & doa
• 📢 Info gereja

🔔 Notifikasi akan dikirim setelah disetujui.

Terima kasih! 🌟`
    
    return await this.sendTelegramMessage(telegramUser.id, message)
  }
  
  /**
   * Kirim pesan error
   */
  async sendErrorMessage(telegramUserId) {
    const message = `❌ Maaf, terjadi kesalahan.

🔄 Coba lagi dengan /start
📞 Atau hubungi admin gereja.`
    
    return await this.sendTelegramMessage(telegramUserId, message)
  }
  
  /**
   * Notifikasi admin tentang registrasi baru
   */
  async notifyAdmin(telegramUser) {
    const notificationsRef = collection(db, 'admin_notifications')
    await addDoc(notificationsRef, {
      type: 'new_telegram_registration',
      telegramUser: {
        id: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name
      },
      message: `📱 Pendaftaran baru: ${telegramUser.first_name} (@${telegramUser.username || 'no_username'})`,
      status: 'unread',
      timestamp: new Date()
    })
  }
  
  /**
   * Approve registrasi (dipanggil dari admin panel)
   */
  async approveRegistration(telegramUserId, adminId) {
    try {
      // Ensure adminId is not undefined
      const safeAdminId = adminId || 'admin-unknown'
      
      // Update status di database
      const registrationsRef = collection(db, 'telegram_registrations')
      const q = query(registrationsRef, where('telegramUserId', '==', telegramUserId.toString()))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref
        const userData = snapshot.docs[0].data()
        
        await updateDoc(docRef, {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: safeAdminId
        })
        
        // Kirim notifikasi approval ke user
        await this.sendApprovalMessage(telegramUserId, userData.telegramFirstName)
        
        return { success: true, message: 'Registrasi disetujui!' }
      }
      
      return { success: false, message: 'Registrasi tidak ditemukan' }
      
    } catch (error) {
      console.error('Error approving registration:', error)
      throw error
    }
  }
  
  /**
   * Kirim notifikasi approval ke user
   */
  async sendApprovalMessage(telegramUserId, firstName) {
    const message = `🎉 Selamat, ${firstName}!

✅ Pendaftaran Anda DISETUJUI!

📖 Mulai sekarang terima:
• Renungan harian pagi
• Ayat Alkitab
• Doa & refleksi

🙏 Selamat bergabung di MyRajawali!
Tuhan Yesus memberkati! 🌟`
    
    return await this.sendTelegramMessage(telegramUserId, message)
  }
  
  /**
   * Helper function untuk kirim pesan Telegram
   */
  async sendTelegramMessage(chatId, message) {
    try {
      // Get bot token from environment or fallback
      const botToken = import.meta.env?.VUE_APP_TELEGRAM_BOT_TOKEN || 
                      process.env.VUE_APP_TELEGRAM_BOT_TOKEN || 
                      '8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw'
      
      if (!botToken) {
        throw new Error('Bot token tidak ditemukan')
      }
      
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`
      
      console.log('🤖 Sending message to:', chatId, 'Token:', botToken.substring(0, 10) + '...')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      })
      
      const result = await response.json()
      console.log('📤 Telegram API response:', result)
      
      return result
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      throw error
    }
  }
  
  /**
   * Dapatkan semua registrasi pending untuk admin panel
   */
  async getPendingRegistrations() {
    try {
      const registrationsRef = collection(db, 'telegram_registrations')
      const q = query(registrationsRef, where('status', '==', 'pending_approval'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate()
      }))
    } catch (error) {
      console.error('Error getting pending registrations:', error)
      return []
    }
  }
  
  /**
   * Dapatkan semua registrasi yang sudah approved
   */
  async getApprovedRegistrations() {
    try {
      const registrationsRef = collection(db, 'telegram_registrations')
      const q = query(registrationsRef, where('status', '==', 'approved'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate()
      }))
    } catch (error) {
      console.error('Error getting approved registrations:', error)
      return []
    }
  }

  /**
   * Manual registration untuk testing/debugging
   */
  async addTestUser(userData = {}) {
    try {
      const testUser = {
        id: Date.now(),
        first_name: userData.first_name || 'Test User',
        last_name: userData.last_name || 'Bot',
        username: userData.username || 'testuser',
        ...userData
      }
      
      console.log('🧪 Adding test user:', testUser)
      
      return await this.autoRegister(testUser)
    } catch (error) {
      console.error('Error adding test user:', error)
      throw error
    }
  }

  /**
   * Reject registrasi (dipanggil dari admin panel)
   */
  async rejectRegistration(telegramUserId, adminId) {
    try {
      console.log('📤 [Service] Rejecting registration for user:', telegramUserId)
      console.log('👤 [Service] Admin ID:', adminId)
      
      // Ensure adminId is not undefined
      const safeAdminId = adminId || 'admin-unknown'
      
      // Update status di database atau hapus document
      const registrationsRef = collection(db, 'telegram_registrations')
      const q = query(registrationsRef, where('telegramUserId', '==', telegramUserId.toString()))
      const snapshot = await getDocs(q)
      
      console.log('🔍 [Service] Found documents:', snapshot.size)
      
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc, index) => {
          console.log(`📄 [Service] Document ${index + 1}:`, {
            id: doc.id,
            data: doc.data()
          })
        })
        
        const docRef = snapshot.docs[0].ref
        const userData = snapshot.docs[0].data()
        
        console.log('✏️ [Service] Updating document:', snapshot.docs[0].id)
        
        await updateDoc(docRef, {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: safeAdminId
        })
        
        console.log('✅ [Service] Document updated successfully')
        
        // Kirim notifikasi rejection ke user
        console.log('📤 [Service] Sending rejection message to user')
        await this.sendRejectionMessage(telegramUserId, userData.telegramFirstName)
        
        console.log('🎉 [Service] Rejection process completed')
        return { success: true, message: 'Registrasi di-reject!' }
      }
      
      console.log('❌ [Service] No documents found for user:', telegramUserId)
      return { success: false, message: 'Registrasi tidak ditemukan' }
      
    } catch (error) {
      console.error('Error rejecting registration:', error)
      throw error
    }
  }

  /**
   * Kirim notifikasi rejection ke user
   */
  async sendRejectionMessage(telegramUserId, firstName) {
    const message = `😔 Maaf, ${firstName}.

❌ Pendaftaran Anda DITOLAK.

📞 Silakan hubungi admin gereja untuk informasi lebih lanjut.

🙏 Terima kasih.`
    
    return await this.sendTelegramMessage(telegramUserId, message)
  }

  /**
   * Clean up duplicate registrations
   */
  async cleanupDuplicateRegistrations() {
    try {
      console.log('🧹 [Service] Starting duplicate cleanup...')
      
      const registrationsRef = collection(db, 'telegram_registrations')
      const snapshot = await getDocs(registrationsRef)
      
      const userGroups = {}
      
      // Group by telegramUserId
      snapshot.forEach(doc => {
        const data = doc.data()
        const userId = data.telegramUserId
        
        if (!userGroups[userId]) {
          userGroups[userId] = []
        }
        
        userGroups[userId].push({
          docId: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate() || new Date(0)
        })
      })
      
      let deletedCount = 0
      const deletedDocs = []
      
      for (const userId in userGroups) {
        const docs = userGroups[userId]
        
        if (docs.length > 1) {
          // Sort: approved first, then rejected, then by date
          docs.sort((a, b) => {
            if (a.status === 'approved' && b.status !== 'approved') return -1
            if (b.status === 'approved' && a.status !== 'approved') return 1
            if (a.status === 'rejected' && b.status === 'pending_approval') return -1
            if (b.status === 'rejected' && a.status === 'pending_approval') return 1
            return b.registeredAt - a.registeredAt
          })
          
          const keepDoc = docs[0]
          const deleteDoc = docs.slice(1)
          
          console.log(`🔄 User ${userId}: keeping ${keepDoc.docId} (${keepDoc.status}), deleting ${deleteDoc.length} duplicates`)
          
          for (const docToDelete of deleteDoc) {
            const { deleteDoc: deleteDocFunc, doc } = await import('firebase/firestore')
            const { db } = await import('./firebase')
            
            await deleteDocFunc(doc(db, 'telegram_registrations', docToDelete.docId))
            deletedCount++
            deletedDocs.push({
              userId: userId,
              docId: docToDelete.docId,
              status: docToDelete.status,
              name: docToDelete.telegramFirstName
            })
          }
        }
      }
      
      console.log(`✅ [Service] Cleanup complete: deleted ${deletedCount} duplicates`)
      
      return {
        success: true,
        deletedCount,
        deletedDocs,
        message: `Successfully deleted ${deletedCount} duplicate registrations`
      }
      
    } catch (error) {
      console.error('❌ [Service] Error cleaning duplicates:', error)
      throw error
    }
  }

  /**
   * Debugging function - cek current registrations
   */
  async debugRegistrations() {
    try {
      console.log('🔍 Debug: Checking current registrations...')
      
      const registrationsRef = collection(db, 'telegram_registrations')
      const snapshot = await getDocs(registrationsRef)
      
      console.log(`📊 Total documents in telegram_registrations: ${snapshot.size}`)
      
      snapshot.docs.forEach((doc, index) => {
        console.log(`${index + 1}. Document ID: ${doc.id}`)
        console.log('   Data:', doc.data())
      })
      
      const pending = await this.getPendingRegistrations()
      const approved = await this.getApprovedRegistrations()
      
      console.log(`📋 Pending: ${pending.length}`)
      console.log(`✅ Approved: ${approved.length}`)
      
      return {
        total: snapshot.size,
        pending: pending.length,
        approved: approved.length,
        allDocs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } catch (error) {
      console.error('Error debugging registrations:', error)
      throw error
    }
  }
}

export default new SimpleTelegramRegistration()
