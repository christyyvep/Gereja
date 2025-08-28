// Telegram Configuration Generator
// Tool untuk menggenerate konfigurasi yang di-obfuscate

class TelegramConfigGenerator {
  // Simple XOR encryption untuk obfuscation tambahan
  static xorEncrypt(text, key) {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  }

  static xorDecrypt(encrypted, key) {
    return this.xorEncrypt(encrypted, key) // XOR is symmetric
  }

  // Generate obfuscated config
  static generateConfig(botToken, chatId) {
    const config = {
      botToken: botToken,
      chatId: chatId
    }

    const jsonString = JSON.stringify(config)
    
    // Multiple layers of obfuscation
    const base64Encoded = btoa(jsonString)
    const xorKey = 'MyRajawaliSecure2025' // Change this key
    const xorEncrypted = this.xorEncrypt(base64Encoded, xorKey)
    const finalEncoded = btoa(xorEncrypted)

    return {
      encoded: finalEncoded,
      key: xorKey
    }
  }

  // Decode obfuscated config
  static decodeConfig(encodedData, xorKey) {
    try {
      const step1 = atob(encodedData)
      const step2 = this.xorDecrypt(step1, xorKey)
      const step3 = atob(step2)
      return JSON.parse(step3)
    } catch (error) {
      console.error('Config decode error')
      return null
    }
  }
}

// Enhanced Telegram Service dengan multiple obfuscation
class TelegramEnhancedService {
  constructor() {
    this.initConfig()
    this.lastNotificationTime = 0
    this.notificationCooldown = 60000
    this.maxRetries = 3
  }

  initConfig() {
    // Multi-layer obfuscated configuration
    // REAL CONFIG - MyRajawali Bot (GPdI Rajawali Kanonang)
    // Chat ID: 5929124699 (Private chat dengan Anitha Gerungan)
    const encodedConfig = 'KAAYCAhSJTQOWycJARw7U3taVU8AAxMbJSU2UCEDAlMyIDQiYwBkBBovABsONzUTIVkFVy0wJxJoXUp6GEscFCckPQ44EzcpLQ8oK1doUVwBOhgLCyYxUT8+AgwsHDtUfWR7AAAtG1EkCxxUJQdjWA=='
    const xorKey = 'MyRajawaliSecure2025'
    
    this.config = TelegramConfigGenerator.decodeConfig(encodedConfig, xorKey)
    
    // Additional security check
    if (!this.config || !this.isValidConfig(this.config)) {
      this.config = null
      console.warn('⚠️ [TelegramService] Invalid configuration detected')
      console.warn('📝 [TelegramService] Please check bot token and chat ID')
    } else {
      console.log('✅ [TelegramService] Configuration loaded successfully')
      console.log('🤖 [TelegramService] Bot: @MyRajawali_bot ready for notifications')
    }
  }

  isValidConfig(config) {
    return config && 
           config.botToken && 
           config.chatId && 
           typeof config.botToken === 'string' && 
           config.botToken.includes(':')
  }

  // Dynamic URL generation untuk menghindari static strings
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

  // Enhanced message sending dengan retry logic
  async sendMessage(messageData, retryCount = 0) {
    if (!this.config) {
      console.warn('Telegram service not configured')
      return false
    }

    // Rate limiting check
    const now = Date.now()
    if (now - this.lastNotificationTime < this.notificationCooldown) {
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
        return true
      } else if (response.status === 429 && retryCount < this.maxRetries) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)))
        return this.sendMessage(messageData, retryCount + 1)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return this.sendMessage(messageData, retryCount + 1)
      }
      
      console.error('Telegram send error:', error.message)
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
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    const message = {
      text: `📢 <b>MyRajawali Notification</b>\n\n${text}\n\n🕒 ${timestamp}`
    }

    return await this.sendMessage(message)
  }
}

// Singleton instance
const telegramService = new TelegramEnhancedService()

export default telegramService
export { TelegramConfigGenerator }
