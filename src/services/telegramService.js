import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import simpleTelegramRegistration from './simpleTelegramRegistration'

/**
 * Telegram Service untuk mengelola integrasi Telegram (SIMPLE VERSION)
 * Tidak perlu validasi nomor HP, admin approve manual
 */
class TelegramService {
  constructor() {
    // Singleton pattern - prevent multiple instances
    if (TelegramService.instance) {
      console.log('🔄 Returning existing TelegramService instance')
      return TelegramService.instance
    }
    
    // ✅ Get bot token from environment variables (Vue 3 compatible)
    this.telegramBotToken = import.meta.env?.VUE_APP_TELEGRAM_BOT_TOKEN || 
                           process.env?.VUE_APP_TELEGRAM_BOT_TOKEN ||
                           '8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw' // Fallback
    
    this.useBackend = false // Use direct API for now
    
    console.log('🔧 TelegramService initialized with direct API mode')
    console.log('Bot token available:', !!this.telegramBotToken)
    console.log('Bot token preview:', this.telegramBotToken?.substring(0, 10) + '...')
    
    this.isPolling = false
    this.pollingInterval = null
    this.lastUpdateId = 0
    this.pollingEnabled = false // Add flag to control polling
    
    // Rate limiting constants
    this.RATE_LIMITS = {
      MIN_DELAY_BETWEEN_MESSAGES: 50, // 50ms minimum delay
      MAX_MESSAGES_PER_SECOND: 30,    // Telegram rate limit
      CHUNK_SIZE: 25,                 // Process in chunks to avoid overwhelming
      RETRY_ATTEMPTS: 3,              // Number of retries for failed messages
      RETRY_DELAY: 1000              // 1 second delay between retries
    }
    
    this.lastMessageTime = 0
    
    // Set singleton instance
    TelegramService.instance = this
    
    // Stop any existing polling when creating instance
    this.stopAllPolling()
  }

  /**
   * Stop all polling instances and clean up
   */
  stopAllPolling() {
    console.log('🛑 [TelegramService] Stopping all polling instances...')
    
    // Clear any existing intervals
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    // Reset polling state
    this.isPolling = false
    this.pollingEnabled = false
    
    // Clear webhook by calling getUpdates with a large offset
    this.clearPendingUpdates()
  }

  /**
   * Clear pending updates to resolve conflicts
   */
  async clearPendingUpdates() {
    try {
      console.log('🧹 [TelegramService] Clearing pending updates...')
      
      const response = await fetch(`https://api.telegram.org/bot${this.telegramBotToken}/getUpdates?offset=-1&limit=1`, {
        method: 'GET'
      })
      
      const data = await response.json()
      if (data.ok) {
        console.log('✅ [TelegramService] Pending updates cleared')
      }
      
    } catch (error) {
      console.error('❌ [TelegramService] Error clearing pending updates:', error)
    }
  }

  /**
   * Kirim pesan Telegram menggunakan Direct API
   */
  async sendMessage(chatId, message, options = {}) {
    try {
      console.log(`📤 [TelegramService] Sending to ${chatId}:`, message.substring(0, 50) + '...')
      
      if (!this.telegramBotToken) {
        console.error('❌ Bot token tidak tersedia')
        throw new Error('Bot token tidak tersedia')
      }
      
      // Validate chatId
      if (!chatId) {
        console.error('❌ Chat ID tidak valid:', chatId)
        throw new Error('Chat ID tidak valid')
      }
      
      // Ensure message is not empty
      if (!message || message.trim() === '') {
        console.error('❌ Pesan kosong')
        throw new Error('Pesan tidak boleh kosong')
      }
      
      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`
      
      const payload = {
        chat_id: chatId.toString(), // Ensure string format
        text: message.trim(),
        parse_mode: options.parse_mode || 'HTML',
        ...options
      }

      console.log('🔧 Payload:', { chat_id: payload.chat_id, text_length: payload.text.length, parse_mode: payload.parse_mode })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('❌ HTTP Response not OK:', response.status, response.statusText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📨 Telegram API response:', result)
      
      if (!result.ok) {
        // Handle specific Telegram API errors
        if (result.error_code === 429) {
          console.error('❌ Rate limit exceeded')
          throw new Error(`Rate limit exceeded: ${result.description}`)
        } else if (result.error_code === 403) {
          console.error(`❌ User ${chatId} blocked bot or chat not found`)
          throw new Error(`User ${chatId} blocked the bot or chat not found`)
        } else if (result.error_code === 400) {
          console.error('❌ Bad request:', result.description)
          throw new Error(`Bad request: ${result.description}`)
        }
        
        console.error('❌ Telegram API error:', result)
        throw new Error(`Telegram API error: ${result.description}`)
      }

      console.log(`✅ Message sent successfully to ${chatId}`)
      return result
      
    } catch (error) {
      console.error(`❌ Error sending Telegram message to ${chatId}:`, error)
      throw error
    }
  }

  /**
   * Kirim broadcast ke semua user Telegram yang sudah approved
   */
  async sendBroadcastToAllJemaat(message) {
    try {
      console.log('🚀 [TelegramService] MEMULAI BROADCAST...')
      
      // Validate message
      if (!message || message.trim() === '') {
        throw new Error('Pesan broadcast tidak boleh kosong')
      }
      
      // Ambil data user Telegram yang sudah approved
      const approvedUsers = await simpleTelegramRegistration.getApprovedRegistrations()
      
      console.log(`📊 [TelegramService] Total user approved: ${approvedUsers.length}`)
      
      if (approvedUsers.length === 0) {
        console.log('⚠️ [TelegramService] Tidak ada user approved')
        return {
          success: true,
          broadcastType: 'individual',
          results: {
            total: 0,
            success: 0,
            failed: 0,
            details: [],
            message: 'Tidak ada user Telegram yang approved'
          }
        }
      }

      // ✅ DEDUPLICATE USERS - hapus duplikat berdasarkan telegramUserId
      const uniqueUsers = new Map()
      approvedUsers.forEach(user => {
        if (user.telegramUserId && !uniqueUsers.has(user.telegramUserId)) {
          uniqueUsers.set(user.telegramUserId, user)
        }
      })
      
      const deduplicatedUsers = Array.from(uniqueUsers.values())
      
      console.log(`🔧 [TelegramService] Deduplikasi: ${approvedUsers.length} → ${deduplicatedUsers.length} unique users`)
      console.log('📋 [TelegramService] Users yang akan dikirimi:', deduplicatedUsers.map(u => `${u.telegramFirstName} (${u.telegramUserId})`))

      const results = {
        total: deduplicatedUsers.length,
        success: 0,
        failed: 0,
        details: []
      }

      // Process each user individually (NO CHUNKING untuk avoid confusion)
      for (let i = 0; i < deduplicatedUsers.length; i++) {
        const user = deduplicatedUsers[i]
        const progress = `[${i + 1}/${deduplicatedUsers.length}]`
        
        try {
          // Validate user data
          if (!user.telegramUserId) {
            console.error(`❌ ${progress} User tidak memiliki telegramUserId:`, user)
            results.failed++
            results.details.push({
              telegramUserId: 'UNKNOWN',
              nama: user.telegramFirstName || 'Unknown',
              status: 'failed',
              error: 'Telegram User ID tidak valid'
            })
            continue
          }
          
          console.log(`📤 ${progress} Mengirim ke ${user.telegramFirstName} (${user.telegramUserId})`)
          
          // Send message with rate limiting
          await this.ensureRateLimit()
          const result = await this.sendMessage(user.telegramUserId, message)
          
          results.success++
          results.details.push({
            telegramUserId: user.telegramUserId,
            nama: user.telegramFirstName,
            status: 'success',
            messageId: result.result?.message_id
          })
          
          console.log(`✅ ${progress} BERHASIL kirim ke ${user.telegramFirstName}`)
          
        } catch (error) {
          console.error(`❌ ${progress} GAGAL kirim ke ${user.telegramFirstName}:`, error.message)
          
          results.failed++
          results.details.push({
            telegramUserId: user.telegramUserId || 'UNKNOWN',
            nama: user.telegramFirstName || 'Unknown',
            status: 'failed',
            error: error.message
          })
        }
        
        // Small delay between users
        if (i < deduplicatedUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`🏁 [TelegramService] BROADCAST SELESAI: ${results.success}/${results.total} berhasil`)
      
      return {
        success: true,
        broadcastType: 'individual',
        results
      }
      
    } catch (error) {
      console.error('❌ [TelegramService] Error dalam broadcast:', error)
      return {
        success: false,
        broadcastType: 'individual',
        error: error.message,
        results: {
          total: 0,
          success: 0,
          failed: 0,
          details: []
        }
      }
    }
  }

  /**
   * Personalisasi pesan untuk user Telegram
   */
  personalizeMessageForUser(message) {
    // Tidak perlu personalisasi dengan nama, langsung kirim pesan
    return message
  }

  /**
   * Kirim renungan harian ke Telegram
   */
  async sendRenunganToTelegram(renunganData) {
    try {
      console.log('📖 [TelegramService] Mengirim renungan ke Telegram...')
      console.log('📋 [TelegramService] Renungan data:', {
        id: renunganData.id,
        title: renunganData.title?.substring(0, 50) + '...',
        hasVerse: !!renunganData.verse,
        hasContent: !!renunganData.content,
        hasReflection: !!renunganData.reflection,
        hasPrayer: !!renunganData.prayer
      })
      
      // Validasi data renungan
      if (!renunganData.title) {
        throw new Error('Renungan harus memiliki title')
      }
      
      const message = this.formatRenunganMessage(renunganData)
      console.log('📝 [TelegramService] Formatted message length:', message.length)
      
      const result = await this.sendBroadcastToAllJemaat(message)
      
      console.log('✅ [TelegramService] Renungan berhasil dikirim ke Telegram')
      
      return result
    } catch (error) {
      console.error('❌ [TelegramService] Error mengirim renungan:', error)
      console.error('❌ [TelegramService] Error details:', {
        message: error.message,
        stack: error.stack,
        renunganData: renunganData
      })
      throw error
    }
  }

  /**
   * Format pesan renungan untuk Telegram
   */
  formatRenunganMessage(renungan) {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Handle missing fields with safe defaults
    const title = renungan.title || 'Renungan Harian'
    const verse = renungan.verse || ''
    const content = renungan.content || ''
    const reflection = renungan.reflection || ''
    const prayer = renungan.prayer || ''

    let message = `🙏 <b>RENUNGAN HARIAN MYRAJAWALI</b>\n📅 ${today}\n\n<b>${title}</b>\n\n`

    if (verse) {
      message += `📖 <b>Bacaan Alkitab:</b>\n${verse}\n\n`
    }

    if (content) {
      message += `"<i>${content}</i>"\n\n`
    }

    if (reflection) {
      message += `✨ <b>Renungan:</b>\n${reflection}\n\n`
    }

    if (prayer) {
      message += `🤲 <b>Doa:</b>\n${prayer}\n\n`
    }

    message += `---\nTuhan Yesus Memberkati! 🙏`

    return message
  }

  /**
   * Handle Telegram webhook/updates untuk auto-registrasi
   */
  async handleTelegramWebhook(update) {
    try {
      console.log('📥 [TelegramService] Received webhook update:', update)
      
      if (!update.message) {
        return { success: false, message: 'No message in update' }
      }
      
      const message = update.message
      const telegramUser = message.from
      const text = message.text
      
      console.log(`📱 Message from ${telegramUser.first_name}: ${text}`)
      
      // Handle command /start untuk registrasi
      if (text === '/start' || text === '/start@MyRajawali_bot') {
        return await this.handleStartCommand(telegramUser)
      }
      
      // Handle pesan lainnya jika diperlukan
      return await this.handleRegularMessage(telegramUser)
      
    } catch (error) {
      console.error('❌ [TelegramService] Webhook error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Handle command /start - auto registrasi
   */
  async handleStartCommand(telegramUser) {
    try {
      console.log(`🚀 [TelegramService] Processing /start from ${telegramUser.first_name}`)
      
      // Gunakan simple registration system
      const result = await simpleTelegramRegistration.autoRegister(telegramUser)
      
      console.log(`✅ [TelegramService] Auto-registration result:`, result)
      return result
      
    } catch (error) {
      console.error('❌ Error handling /start command:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Handle pesan reguler (bukan command)
   */
  async handleRegularMessage(telegramUser) {
    try {
      // Cek apakah user sudah terdaftar
      const isRegistered = await simpleTelegramRegistration.checkExistingUser(telegramUser.id)
      
      if (!isRegistered) {
        // User belum terdaftar, minta untuk /start dulu
        const helpMessage = `👋 Halo ${telegramUser.first_name}!

Sepertinya Anda belum terdaftar. 

🚀 Silakan kirim /start untuk mendaftar terlebih dahulu.

🙏 Terima kasih!`
        
        await this.sendMessage(telegramUser.id, helpMessage)
        return { success: true, message: 'Sent registration help' }
      }
      
      // User sudah terdaftar, bisa handle pesan lain di sini
      // Misalnya: bantuan, info, dll.
      
      return { success: true, message: 'Message received from registered user' }
      
    } catch (error) {
      console.error('Error handling regular message:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Test koneksi ke backend API
   */
  async testConnection() {
    try {
      // ✅ SECURE: Test backend API health instead of direct Telegram API
      const url = `${this.backendApiUrl}/health`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === 'OK') {
        return {
          success: true,
          botInfo: {
            message: data.message,
            version: data.version,
            timestamp: data.timestamp
          }
        }
      } else {
        throw new Error(data.message || 'Backend API error')
      }
    } catch (error) {
      console.error('Backend API connection test failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Ambil updates dari Telegram
   */
  async getTelegramUpdates(offset = null) {
    try {
      // ✅ SECURE: Use backend API
      let url = `${this.backendApiUrl}/getUpdates?limit=100`
      
      if (offset) {
        url += `&offset=${offset}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      })
      const data = await response.json()
      
      if (data.ok || data.success) {
        return {
          success: true,
          updates: data.result || data.updates || []
        }
      } else {
        throw new Error(data.description || data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error getting Telegram updates:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Simpan log pesan
   */
  async saveMessageLog(messageData) {
    try {
      const telegramLogsRef = collection(db, 'telegram_logs')
      await addDoc(telegramLogsRef, {
        ...messageData,
        timestamp: messageData.timestamp || new Date()
      })
      console.log('📝 Message log saved')
    } catch (error) {
      console.error('Error saving message log:', error)
    }
  }

  /**
   * Ambil riwayat pesan
   */
  async getMessageHistory() {
    try {
      const telegramLogsRef = collection(db, 'telegram_logs')
      const snapshot = await getDocs(telegramLogsRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })).sort((a, b) => b.timestamp - a.timestamp)
      
    } catch (error) {
      console.error('Error getting message history:', error)
      return []
    }
  }

  /**
   * Statistik jemaat Telegram
   */
  async getJemaatStats() {
    try {
      const pendingUsers = await simpleTelegramRegistration.getPendingRegistrations()
      const approvedUsers = await simpleTelegramRegistration.getApprovedRegistrations()
      
      return {
        total: pendingUsers.length + approvedUsers.length,
        approved: approvedUsers.length,
        pending: pendingUsers.length,
        registrationRate: approvedUsers.length > 0 ? (approvedUsers.length / (pendingUsers.length + approvedUsers.length) * 100).toFixed(1) : 0
      }
    } catch (error) {
      console.error('Error getting jemaat stats:', error)
      return {
        total: 0,
        approved: 0,
        pending: 0,
        registrationRate: 0
      }
    }
  }

  // Fungsi approval untuk admin panel
  async approveUser(telegramUserId, adminId) {
    return await simpleTelegramRegistration.approveRegistration(telegramUserId, adminId)
  }

  async getPendingUsers() {
    return await simpleTelegramRegistration.getPendingRegistrations()
  }

  async getApprovedUsers() {
    return await simpleTelegramRegistration.getApprovedRegistrations()
  }

  // Fungsi debugging dan testing untuk admin panel
  async debugRegistrations() {
    return await simpleTelegramRegistration.debugRegistrations()
  }

  async addTestUser(userData) {
    return await simpleTelegramRegistration.addTestUser(userData)
  }

  // Simulasi user yang kirim /start untuk testing
  async simulateUserStart(userData = {}) {
    const testUser = {
      id: userData.id || Date.now(),
      first_name: userData.first_name || 'Test Jemaat',
      last_name: userData.last_name || null,
      username: userData.username || null,
      ...userData
    }
    
    console.log('🎭 Simulating /start command from:', testUser)
    
    return await this.handleStartCommand(testUser)
  }

  /**
   * Start polling untuk menerima pesan real dari user (DISABLED BY DEFAULT)
   */
  async startPolling() {
    // ⚠️ Polling disabled to prevent conflicts
    console.log('⚠️ [TelegramService] Polling is disabled to prevent API conflicts')
    console.log('💡 [TelegramService] Use webhook or manual message processing instead')
    
    return { 
      success: false, 
      message: 'Polling disabled to prevent Telegram API conflicts. Use webhook mode instead.' 
    }
    
    /* DISABLED CODE - Uncomment only if you need polling and ensure no other instances are running
    if (this.isPolling) {
      console.log('📡 Polling already running')
      return
    }
    
    // Clear any existing polling first
    this.stopAllPolling()
    
    this.isPolling = true
    this.pollingEnabled = true
    this.lastUpdateId = 0
    
    console.log('🚀 Starting Telegram polling...')
    
    // Polling every 5 seconds (increased interval to reduce conflicts)
    this.pollingInterval = setInterval(() => {
      if (this.pollingEnabled) {
        this.pollUpdates()
      }
    }, 5000)
    
    return { success: true, message: 'Polling started' }
    */
  }

  /**
   * Stop polling
   */
  stopPolling() {
    console.log('⏹️ [TelegramService] Stopping polling...')
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    this.isPolling = false
    this.pollingEnabled = false
    
    console.log('✅ [TelegramService] Polling stopped successfully')
  }

  /**
   * Poll updates dari Telegram API
   */
  async pollUpdates() {
    try {
      const result = await this.getTelegramUpdates()
      
      if (result.success && result.updates.length > 0) {
        console.log(`📥 Received ${result.updates.length} updates`)
        
        for (const update of result.updates) {
          // Update last update ID
          this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id)
          
          // Handle each update
          await this.handleTelegramWebhook(update)
        }
        
        // Mark updates as processed by calling getUpdates with offset
        await this.markUpdatesAsProcessed()
      }
    } catch (error) {
      console.error('❌ Polling error:', error)
    }
  }

  /**
   * Mark updates as processed
   */
  async markUpdatesAsProcessed() {
    try {
      // ✅ SECURE: Use backend API with offset to mark updates as processed
      const url = `${this.backendApiUrl}/getUpdates?offset=${this.lastUpdateId + 1}&limit=1`
      
      await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      })
    } catch (error) {
      console.error('Error marking updates as processed:', error)
    }
  }

  /**
   * Check if polling is active
   */
  isPollingActive() {
    return this.isPolling || false
  }

  /**
   * Ensure minimum delay between messages
   */
  async ensureRateLimit() {
    const now = Date.now()
    const timeSinceLastMessage = now - this.lastMessageTime
    
    if (timeSinceLastMessage < this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES) {
      const delayNeeded = this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES - timeSinceLastMessage
      await new Promise(resolve => setTimeout(resolve, delayNeeded))
    }
    
    this.lastMessageTime = Date.now()
  }

  /**
   * Send message with rate limiting and retry mechanism
   */
  async sendMessageWithRateLimit(chatId, message, options = {}, retryCount = 0) {
    try {
      // Ensure minimum delay between messages
      await this.ensureRateLimit()
      
      const result = await this.sendMessage(chatId, message, options)
      return result
      
    } catch (error) {
      // Check if it's a rate limit error and we can retry
      if (error.message.includes('Too Many Requests') && retryCount < this.RATE_LIMITS.RETRY_ATTEMPTS) {
        console.log(`⏳ Rate limited, retrying in ${this.RATE_LIMITS.RETRY_DELAY}ms... (attempt ${retryCount + 1}/${this.RATE_LIMITS.RETRY_ATTEMPTS})`)
        
        // Wait longer for rate limit errors
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMITS.RETRY_DELAY))
        
        return this.sendMessageWithRateLimit(chatId, message, options, retryCount + 1)
      }
      
      throw error
    }
  }

  /**
   * Split array into chunks for batch processing
   */
  chunkArray(array, chunkSize) {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Batch send messages with rate limiting
   */
  async batchSendMessages(chatId, messages, options = {}) {
    try {
      console.log(`📦 [TelegramService] Mengirim ${messages.length} pesan ke ${chatId}...`)
      
      // Split messages into chunks
      const chunks = this.chunkArray(messages, this.RATE_LIMITS.CHUNK_SIZE)
      
      for (const chunk of chunks) {
        // Kirim setiap chunk dengan rate limiting
        await this.sendMessageWithRateLimit(chatId, chunk.join('\n\n'), options)
      }
      
      console.log(`✅ [TelegramService] Berhasil mengirim ${messages.length} pesan ke ${chatId}`)
      return { success: true, message: `Berhasil mengirim ${messages.length} pesan` }
    } catch (error) {
      console.error('❌ [TelegramService] Gagal mengirim pesan:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Method for testing rate limiting functionality
   * For development/testing purposes only
   */
  async testRateLimiting(testCount = 5) {
    console.log(`🧪 [TelegramService] Testing rate limiting dengan ${testCount} pesan...`)
    
    const startTime = Date.now()
    const testResults = []
    
    for (let i = 0; i < testCount; i++) {
      const messageStartTime = Date.now()
      
      try {
        await this.ensureRateLimit()
        
        const messageEndTime = Date.now()
        const actualDelay = messageEndTime - messageStartTime
        
        testResults.push({
          messageIndex: i + 1,
          actualDelay,
          minDelayExpected: this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES,
          isDelayCorrect: actualDelay >= this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES || i === 0
        })
        
        console.log(`📊 [Test] Message ${i + 1}: delay = ${actualDelay}ms (min: ${this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES}ms)`)
        
      } catch (error) {
        console.error(`❌ [Test] Error pada message ${i + 1}:`, error)
      }
    }
    
    const totalTime = Date.now() - startTime
    const averageDelay = testCount > 1 ? totalTime / (testCount - 1) : 0
    
    console.log(`🏁 [Test] Rate limiting test selesai:`)
    console.log(`   - Total waktu: ${totalTime}ms`)
    console.log(`   - Average delay: ${averageDelay.toFixed(2)}ms`)
    console.log(`   - Min delay setting: ${this.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES}ms`)
    console.log(`   - Test results:`, testResults)
    
    return {
      totalTime,
      averageDelay,
      testResults,
      allDelaysCorrect: testResults.every(r => r.isDelayCorrect)
    }
  }
}

export default new TelegramService()
