// Telegram Service - Environment Variables Version
// Alternative implementation using VUE_APP environment variables

class TelegramEnvService {
  constructor() {
    this.config = this.loadConfig()
    this.lastNotificationTime = 0
    this.notificationCooldown = 60000 // 1 menit cooldown
    this.maxRetries = 3
  }

  // Load configuration from environment variables
  loadConfig() {
    const botToken = process.env.VUE_APP_TELEGRAM_BOT_TOKEN
    const chatId = process.env.VUE_APP_TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.warn('⚠️ [TelegramEnvService] Telegram configuration missing in environment variables')
      console.warn('📝 [TelegramEnvService] Please set VUE_APP_TELEGRAM_BOT_TOKEN and VUE_APP_TELEGRAM_CHAT_ID in .env file')
      return null
    }

    return {
      botToken: botToken.trim(),
      chatId: chatId.trim()
    }
  }

  // Validate configuration
  isValidConfig(config) {
    return config && 
           config.botToken && 
           config.chatId && 
           typeof config.botToken === 'string' && 
           config.botToken.includes(':') &&
           typeof config.chatId === 'string' &&
           config.chatId.match(/^-?\d+$/)
  }

  // Generate API URL dynamically
  generateApiUrl() {
    if (!this.config) return null
    
    const parts = [
      'https://',
      'api',
      '.',
      'telegram',
      '.',
      'org',
      '/bot',
      this.config.botToken,
      '/sendMessage'
    ]
    
    return parts.join('')
  }

  // Enhanced message sending with retry logic
  async sendMessage(messageData, retryCount = 0) {
    if (!this.config || !this.isValidConfig(this.config)) {
      console.warn('⚠️ [TelegramEnvService] Invalid or missing configuration')
      return false
    }

    // Rate limiting check
    const now = Date.now()
    if (now - this.lastNotificationTime < this.notificationCooldown) {
      console.log('ℹ️ [TelegramEnvService] Rate limit active, skipping notification')
      return false
    }

    try {
      const url = this.generateApiUrl()
      if (!url) return false

      const payload = {
        chat_id: this.config.chatId,
        text: messageData.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        this.lastNotificationTime = now
        console.log('✅ [TelegramEnvService] Notification sent successfully')
        return true
      } else if (response.status === 429 && retryCount < this.maxRetries) {
        // Rate limited by Telegram, wait and retry
        const waitTime = 2000 * (retryCount + 1)
        console.log(`⏳ [TelegramEnvService] Rate limited, retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        return this.sendMessage(messageData, retryCount + 1)
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const waitTime = 1000 * (retryCount + 1)
        console.log(`⏳ [TelegramEnvService] Error, retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        return this.sendMessage(messageData, retryCount + 1)
      }
      
      console.error('❌ [TelegramEnvService] Send error:', error.message)
      return false
    }
  }

  // Message formatting methods
  formatLoginMessage(userData) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    return {
      text: `🔐 <b>MyRajawali - Login Success</b>\n\n` +
            `👤 User: ${userData.username || 'Unknown'}\n` +
            `📧 Email: ${userData.email || 'N/A'}\n` +
            `🌐 IP: ${userData.ip || 'N/A'}\n` +
            `🔧 Role: ${userData.role || 'jemaat'}\n` +
            `🕒 Waktu: ${timestamp}`
    }
  }

  formatFailedLoginMessage(userData) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    return {
      text: `⚠️ <b>MyRajawali - Failed Login</b>\n\n` +
            `📧 Email: ${userData.email || 'N/A'}\n` +
            `🌐 IP: ${userData.ip || 'N/A'}\n` +
            `❌ Reason: ${userData.reason || 'Invalid credentials'}\n` +
            `🔢 Attempts: ${userData.attempts || 1}/${userData.maxAttempts || 5}\n` +
            `🕒 Waktu: ${timestamp}`
    }
  }

  formatSecurityAlertMessage(alertData) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    return {
      text: `🚨 <b>MyRajawali - Security Alert</b>\n\n` +
            `⚠️ Alert: ${alertData.type || 'Security Event'}\n` +
            `📧 Email: ${alertData.email || 'N/A'}\n` +
            `🌐 IP: ${alertData.ip || 'N/A'}\n` +
            `📊 Details: ${alertData.details || 'N/A'}\n` +
            `🕒 Waktu: ${timestamp}`
    }
  }

  formatCustomMessage(text) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    return {
      text: `📢 <b>MyRajawali Notification</b>\n\n${text}\n\n🕒 ${timestamp}`
    }
  }

  // Public API methods
  async notifyLogin(userData) {
    const message = this.formatLoginMessage(userData)
    return await this.sendMessage(message)
  }

  async notifyFailedLogin(userData) {
    const message = this.formatFailedLoginMessage(userData)
    return await this.sendMessage(message)
  }

  async notifySecurityAlert(alertData) {
    const message = this.formatSecurityAlertMessage(alertData)
    return await this.sendMessage(message)
  }

  async notifyCustom(text) {
    const message = this.formatCustomMessage(text)
    return await this.sendMessage(message)
  }

  // Configuration status
  getStatus() {
    return {
      configured: !!this.config,
      valid: this.config ? this.isValidConfig(this.config) : false,
      botToken: this.config ? `${this.config.botToken.substring(0, 10)}...` : 'Not set',
      chatId: this.config ? this.config.chatId : 'Not set',
      lastNotification: this.lastNotificationTime ? new Date(this.lastNotificationTime).toLocaleString('id-ID') : 'Never',
      cooldownActive: Date.now() - this.lastNotificationTime < this.notificationCooldown
    }
  }
}

// Singleton instance
const telegramEnvService = new TelegramEnvService()

export default telegramEnvService
