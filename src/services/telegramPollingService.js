// Simple Telegram Polling Service
// Untuk mendengarkan pesan /start dari user baru

class TelegramPollingService {
  constructor() {
    this.botToken = import.meta.env?.VUE_APP_TELEGRAM_BOT_TOKEN || 
                   '8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw'
    this.isPolling = false
    this.pollingInterval = null
    this.lastUpdateId = 0
    this.pollingDelay = 2000 // 2 seconds
  }

  /**
   * Start polling for new messages
   */
  async startPolling() {
    if (this.isPolling) {
      console.log('⚠️ Polling already running')
      return
    }

    console.log('🚀 Starting Telegram polling...')
    this.isPolling = true
    
    // Start polling loop
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollUpdates()
      } catch (error) {
        console.error('❌ Polling error:', error)
      }
    }, this.pollingDelay)
    
    console.log('✅ Telegram polling started')
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (!this.isPolling) {
      console.log('⚠️ Polling not running')
      return
    }

    console.log('🛑 Stopping Telegram polling...')
    this.isPolling = false
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    console.log('✅ Telegram polling stopped')
  }

  /**
   * Poll for new updates from Telegram
   */
  async pollUpdates() {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getUpdates`
      const params = new URLSearchParams({
        offset: this.lastUpdateId + 1,
        limit: 10,
        timeout: 1
      })

      const response = await fetch(`${url}?${params}`)
      const data = await response.json()

      if (!data.ok) {
        console.error('❌ Telegram API error:', data.description)
        return
      }

      const updates = data.result || []
      
      if (updates.length > 0) {
        console.log(`📨 Received ${updates.length} updates`)
        
        for (const update of updates) {
          await this.processUpdate(update)
          this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id)
        }
      }

    } catch (error) {
      console.error('❌ Error polling updates:', error)
    }
  }

  /**
   * Process individual update
   */
  async processUpdate(update) {
    try {
      console.log('📤 Processing update:', update.update_id)

      // Handle text messages
      if (update.message && update.message.text) {
        const message = update.message
        const telegramUser = message.from
        const text = message.text

        console.log(`👤 Message from ${telegramUser.first_name} (${telegramUser.id}): "${text}"`)

        // Handle /start command
        if (text.startsWith('/start')) {
          await this.handleStartCommand(telegramUser)
        }
        // Handle other commands
        else if (text === '/help') {
          await this.handleHelpCommand(telegramUser)
        }
      }

    } catch (error) {
      console.error('❌ Error processing update:', error)
    }
  }

  /**
   * Handle /start command
   */
  async handleStartCommand(telegramUser) {
    try {
      console.log(`🚀 Processing /start from ${telegramUser.first_name}`)

      // Import and use registration service
      const { default: simpleTelegramRegistration } = await import('./simpleTelegramRegistration.js')
      
      const result = await simpleTelegramRegistration.autoRegister(telegramUser)
      
      if (result.success) {
        console.log(`✅ Auto-registration result: ${result.status}`)
        
        // Send message based on status and sendMessage flag
        if (result.status === 'approved') {
          await this.sendMessage(telegramUser.id, `👋 Selamat datang kembali, ${telegramUser.first_name}!

✅ Anda sudah terdaftar dan approved.
📖 Terus terima renungan harian dari MyRajawali.

🙏 Tuhan memberkati!`)
        } 
        else if (result.status === 'pending') {
          await this.sendMessage(telegramUser.id, `🙏 Halo lagi, ${telegramUser.first_name}!

⏳ Pendaftaran Anda masih menunggu persetujuan admin.

📧 Silakan tunggu konfirmasi lebih lanjut.

🙏 Terima kasih!`)
        }
        else if (result.status === 'new_pending' && result.sendMessage) {
          await this.sendMessage(telegramUser.id, `🙏 Selamat datang di GPdI Rajawali Kanonang, ${telegramUser.first_name}!

📝 Pendaftaran Anda sedang diproses admin.

⏳ Setelah disetujui, Anda akan terima:
• 📖 Renungan harian
• 🙏 Ayat & doa  
• 📢 Info gereja

🔔 Notifikasi akan dikirim setelah disetujui.

Terima kasih! 🌟`)
          
          // Notify admin about new registration
          await this.notifyAdminNewRegistration(telegramUser)
        }
      } else {
        console.error('❌ Auto-registration failed:', result.error)
        await this.sendMessage(telegramUser.id, `❌ Maaf, terjadi kesalahan saat mendaftar.

🔄 Silakan coba lagi dengan kirim /start
📞 Atau hubungi admin jika masalah berlanjut.`)
      }

    } catch (error) {
      console.error('❌ Error handling /start command:', error)
      await this.sendMessage(telegramUser.id, `❌ Maaf, terjadi kesalahan sistem.

🔄 Silakan coba lagi dengan kirim /start`)
    }
  }

  /**
   * Handle /help command
   */
  async handleHelpCommand(telegramUser) {
    const helpMessage = `📋 Bantuan MyRajawali Bot

🤖 Perintah yang tersedia:
/start - Daftar untuk menerima renungan
/help - Tampilkan bantuan ini

📖 Tentang MyRajawali:
Bot ini mengirimkan renungan harian dan info gereja GPdI Rajawali Kanonang.

👥 Untuk bergabung:
1. Kirim /start
2. Tunggu approval admin
3. Mulai terima konten rohani

🙏 Tuhan memberkati!`

    await this.sendMessage(telegramUser.id, helpMessage)
  }

  /**
   * Send message to user
   */
  async sendMessage(chatId, text) {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      })

      const result = await response.json()
      
      if (result.ok) {
        console.log(`✅ Message sent to ${chatId}`)
      } else {
        console.error(`❌ Failed to send message to ${chatId}:`, result.description)
      }

      return result

    } catch (error) {
      console.error(`❌ Error sending message to ${chatId}:`, error)
      throw error
    }
  }

  /**
   * Get polling status
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      lastUpdateId: this.lastUpdateId,
      pollingDelay: this.pollingDelay
    }
  }
}

// Create and export singleton instance
const telegramPollingService = new TelegramPollingService()
export default telegramPollingService
