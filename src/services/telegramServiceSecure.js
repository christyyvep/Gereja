import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import simpleTelegramRegistration from './simpleTelegramRegistration'

/**
 * Telegram Service - SECURE VERSION (menggunakan backend API)
 * ✅ Bot token tidak exposed di frontend
 * ✅ All communications melalui backend API
 */
class TelegramServiceSecure {
  constructor() {
    // ✅ SECURE: Tidak ada bot token di frontend
    this.backendApiUrl = process.env.VUE_APP_BACKEND_API_URL || 'https://your-project.cloudfunctions.net/telegramAPI'
    this.apiToken = process.env.VUE_APP_API_TOKEN || '' // API token untuk autentikasi ke backend
    this.isPolling = false
    this.pollingInterval = null
    
    // Rate limiting constants (tetap diperlukan untuk chunking)
    this.RATE_LIMITS = {
      MIN_DELAY_BETWEEN_MESSAGES: 50,
      CHUNK_SIZE: 25,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000
    }
    
    this.lastMessageTime = 0
  }

  /**
   * Ensure minimum delay between messages (untuk chunking di frontend)
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
   * ✅ SECURE: Send message via backend API
   */
  async sendMessage(chatId, message, options = {}) {
    try {
      if (!this.apiToken) {
        throw new Error('API token tidak ditemukan. Set VUE_APP_API_TOKEN di environment.')
      }

      const response = await fetch(`${this.backendApiUrl}/telegram/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify({
          chatId,
          message,
          options
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend API error: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(`Message send failed: ${result.error}`)
      }

      return {
        ok: true,
        result: {
          message_id: result.messageId
        }
      }

    } catch (error) {
      console.error(`Error sending message to ${chatId}:`, error.message)
      throw error
    }
  }

  /**
   * ✅ SECURE: Send message with rate limiting via backend
   */
  async sendMessageWithRateLimit(chatId, message, options = {}, retryCount = 0) {
    try {
      // Frontend rate limiting untuk chunking
      await this.ensureRateLimit()
      
      const result = await this.sendMessage(chatId, message, options)
      return result
      
    } catch (error) {
      // Retry logic untuk network errors
      if (error.message.includes('fetch') && retryCount < this.RATE_LIMITS.RETRY_ATTEMPTS) {
        console.log(`⏳ Network error, retrying... (attempt ${retryCount + 1}/${this.RATE_LIMITS.RETRY_ATTEMPTS})`)
        
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMITS.RETRY_DELAY))
        
        return this.sendMessageWithRateLimit(chatId, message, options, retryCount + 1)
      }
      
      throw error
    }
  }

  /**
   * ✅ SECURE: Broadcast via backend API (lebih efisien)
   */
  async sendBroadcastToAllJemaat(message) {
    try {
      console.log('📱 [TelegramService] Memulai broadcast ke semua user Telegram...')
      
      // Ambil data user Telegram yang sudah approved
      const approvedUsers = await simpleTelegramRegistration.getApprovedRegistrations()
      
      console.log(`📊 [TelegramService] Total user Telegram approved: ${approvedUsers.length}`)
      
      if (approvedUsers.length === 0) {
        return {
          success: true,
          broadcastType: 'backend_api',
          results: {
            total: 0,
            success: 0,
            failed: 0,
            details: [],
            message: 'Tidak ada user Telegram yang approved'
          }
        }
      }

      // Extract user IDs
      const userIds = approvedUsers.map(user => user.telegramUserId)

      // ✅ SECURE: Send broadcast via backend API
      const response = await fetch(`${this.backendApiUrl}/telegram/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify({
          message,
          userIds,
          options: { parse_mode: 'HTML' }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend broadcast error: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(`Broadcast failed: ${result.error}`)
      }

      // Log hasil broadcast
      await this.saveMessageLog({
        messageType: 'broadcast_secure',
        message: message.substring(0, 100) + '...',
        targetCount: result.results.total,
        successCount: result.results.success,
        failedCount: result.results.failed,
        timestamp: new Date(),
        broadcastResults: result.results.details,
        processingInfo: {
          method: 'backend_api',
          secure: true
        }
      })

      console.log(`📊 [TelegramService] Broadcast selesai: ${result.results.success}/${result.results.total} berhasil`)

      return {
        success: true,
        broadcastType: 'backend_api',
        results: result.results
      }

    } catch (error) {
      console.error('❌ [TelegramService] Error dalam broadcast:', error)
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
   * Personalisasi pesan untuk user Telegram
   */
  personalizeMessageForUser(message) {
    return message
  }

  /**
   * ✅ SECURE: Kirim renungan harian via backend API
   */
  async sendRenunganToTelegram(renunganData) {
    try {
      console.log('📖 [TelegramService] Mengirim renungan ke Telegram (SECURE)...')
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
      
      console.log('✅ [TelegramService] Renungan berhasil dikirim ke Telegram (SECURE)')
      
      return result
    } catch (error) {
      console.error('❌ [TelegramService] Error mengirim renungan:', error)
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

    let message = `🙏 RENUNGAN HARIAN MYRAJAWALI
📅 ${today}

<b>${this.escapeHtml(renungan.title)}</b>

📖 Ayat Emas:
${this.escapeHtml(renungan.verse)}
"${this.escapeHtml(renungan.content)}"

✨ Renungan:
${this.escapeHtml(renungan.reflection)}

🤲 Doa:
${this.escapeHtml(renungan.prayer)}

---
Tuhan Yesus Memberkati! 🙏`

    return message
  }

  /**
   * Escape HTML characters untuk Telegram
   */
  escapeHtml(text) {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * Save message log
   */
  async saveMessageLog(logData) {
    try {
      const messageLog = {
        type: logData.messageType || 'unknown',
        message: logData.message,
        targetCount: logData.targetCount || 0,
        successCount: logData.successCount || 0,
        failedCount: logData.failedCount || 0,
        timestamp: logData.timestamp || new Date(),
        details: logData.broadcastResults || [],
        processingInfo: logData.processingInfo || {},
        source: 'telegram_service_secure'
      }

      await addDoc(collection(db, 'telegram_logs'), messageLog)
      console.log('📝 Message log saved successfully (SECURE)')
      
    } catch (error) {
      console.error('Error saving message log:', error)
    }
  }

  /**
   * ✅ SECURE: Get webhook info via backend API
   */
  async getWebhookInfo() {
    try {
      const response = await fetch(`${this.backendApiUrl}/telegram/webhook-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend API error: ${errorData.error}`)
      }

      const result = await response.json()
      return result.webhookInfo

    } catch (error) {
      console.error('Error getting webhook info:', error)
      throw error
    }
  }

  /**
   * Method for testing secure API functionality
   */
  async testSecureAPI() {
    console.log('🧪 Testing secure Telegram API...')
    
    try {
      // Test 1: Health check
      const healthResponse = await fetch(`${this.backendApiUrl}/health`)
      const healthData = await healthResponse.json()
      
      console.log('✅ Backend health check:', healthData)
      
      // Test 2: API authentication
      try {
        await this.getWebhookInfo()
        console.log('✅ API authentication working')
      } catch (error) {
        console.log('❌ API authentication failed:', error.message)
      }
      
      return {
        backendHealth: healthData,
        apiAuthentication: 'tested'
      }
      
    } catch (error) {
      console.error('❌ Secure API test failed:', error)
      return { error: error.message }
    }
  }
}

export default TelegramServiceSecure
