// Telegram Service - Secure Implementation
// API disimpan di frontend tapi dengan obfuscation dan encoding

class TelegramSecureService {
  constructor() {
    // Encoded dan obfuscated API data
    this.config = this.decodeConfig()
    this.lastNotificationTime = 0
    this.notificationCooldown = 60000 // 1 menit cooldown
  }

  // Decode configuration yang di-obfuscate
  decodeConfig() {
    // Base64 encoded configuration (ganti dengan token bot Anda)
    const encodedData = 'eyJib3RUb2tlbiI6IjYyNzU1MzIxNzM6QUFGaHNkZmhzZGZoc2RmaHNkZmhzZGZoIiwiY2hhdElkIjoiLTEwMDE2ODQyNzg5MDEifQ=='
    
    try {
      const decoded = atob(encodedData)
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Configuration decode error')
      return null
    }
  }

  // Obfuscated method untuk kirim pesan
  async sendSecureMessage(messageData) {
    if (!this.config || !this.config.botToken || !this.config.chatId) {
      console.warn('Telegram configuration not available')
      return false
    }

    // Rate limiting
    const now = Date.now()
    if (now - this.lastNotificationTime < this.notificationCooldown) {
      console.log('Notification cooldown active')
      return false
    }

    try {
      // Obfuscated URL construction
      const baseUrl = 'https://api.telegram.org'
      const method = 'sendMessage'
      const url = `${baseUrl}/bot${this.config.botToken}/${method}`

      const payload = {
        chat_id: this.config.chatId,
        text: messageData.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        this.lastNotificationTime = now
        console.log('Notification sent successfully')
        return true
      } else {
        console.error('Failed to send notification:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  // Format pesan untuk berbagai event
  formatMessage(type, data) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

    switch (type) {
      case 'login':
        return {
          text: `🔐 <b>Login Alert - MyRajawali</b>\n\n` +
                `👤 User: ${data.username || 'Unknown'}\n` +
                `📧 Email: ${data.email || 'N/A'}\n` +
                `🌐 IP: ${data.ip || 'N/A'}\n` +
                `🕒 Waktu: ${timestamp}\n` +
                `✅ Status: Login Berhasil`
        }

      case 'failed_login':
        return {
          text: `⚠️ <b>Failed Login Alert - MyRajawali</b>\n\n` +
                `📧 Email: ${data.email || 'N/A'}\n` +
                `🌐 IP: ${data.ip || 'N/A'}\n` +
                `❌ Reason: ${data.reason || 'Invalid credentials'}\n` +
                `🔢 Attempts: ${data.attempts || 1}\n` +
                `🕒 Waktu: ${timestamp}`
        }

      case 'user_locked':
        return {
          text: `🚨 <b>Account Locked - MyRajawali</b>\n\n` +
                `📧 Email: ${data.email || 'N/A'}\n` +
                `🌐 IP: ${data.ip || 'N/A'}\n` +
                `🔒 Account telah dikunci karena terlalu banyak percobaan login\n` +
                `🕒 Waktu: ${timestamp}`
        }

      case 'admin_action':
        return {
          text: `👑 <b>Admin Action - MyRajawali</b>\n\n` +
                `👤 Admin: ${data.adminName || 'Unknown'}\n` +
                `🎯 Action: ${data.action || 'Unknown'}\n` +
                `📋 Target: ${data.target || 'N/A'}\n` +
                `🕒 Waktu: ${timestamp}`
        }

      case 'security_alert':
        return {
          text: `🚨 <b>Security Alert - MyRajawali</b>\n\n` +
                `⚠️ Alert: ${data.alert || 'Security event detected'}\n` +
                `📧 Email: ${data.email || 'N/A'}\n` +
                `🌐 IP: ${data.ip || 'N/A'}\n` +
                `📊 Details: ${data.details || 'N/A'}\n` +
                `🕒 Waktu: ${timestamp}`
        }

      default:
        return {
          text: `📢 <b>MyRajawali Notification</b>\n\n` +
                `${data.message || 'Unknown event'}\n` +
                `🕒 Waktu: ${timestamp}`
        }
    }
  }

  // Public methods untuk berbagai notifikasi
  async notifyLogin(userData) {
    const message = this.formatMessage('login', userData)
    return await this.sendSecureMessage(message)
  }

  async notifyFailedLogin(userData) {
    const message = this.formatMessage('failed_login', userData)
    return await this.sendSecureMessage(message)
  }

  async notifyUserLocked(userData) {
    const message = this.formatMessage('user_locked', userData)
    return await this.sendSecureMessage(message)
  }

  async notifyAdminAction(actionData) {
    const message = this.formatMessage('admin_action', actionData)
    return await this.sendSecureMessage(message)
  }

  async notifySecurityAlert(alertData) {
    const message = this.formatMessage('security_alert', alertData)
    return await this.sendSecureMessage(message)
  }

  async notifyCustom(type, data) {
    const message = this.formatMessage(type, data)
    return await this.sendSecureMessage(message)
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
const telegramService = new TelegramSecureService()

export default telegramService
