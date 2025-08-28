// webhook-handler.js - Handler untuk webhook Telegram bot
// File ini akan di-deploy ke server atau Firebase Functions

import simpleTelegramRegistration from './simpleTelegramRegistration.js'

/**
 * Handle webhook dari Telegram bot
 * Endpoint: /webhook/telegram
 */
export const handleTelegramWebhook = async (req, res) => {
  try {
    console.log('📥 Telegram webhook received:', JSON.stringify(req.body, null, 2))
    
    const update = req.body
    
    // Validate update has message
    if (!update.message) {
      console.log('⚠️ No message in update, ignoring')
      return res.status(200).json({ ok: true, message: 'No message to process' })
    }
    
    const message = update.message
    const telegramUser = message.from
    const text = message.text || ''
    
    console.log(`👤 Message from ${telegramUser.first_name} (${telegramUser.id}): "${text}"`)
    
    // Handle /start command for auto-registration
    if (text.startsWith('/start')) {
      console.log('🚀 Processing /start command for auto-registration')
      
      try {
        const result = await simpleTelegramRegistration.autoRegister(telegramUser)
        
        if (result.success) {
          console.log(`✅ Auto-registration successful: ${result.status}`)
        } else {
          console.error('❌ Auto-registration failed:', result.error)
        }
      } catch (autoRegError) {
        console.error('❌ Auto-registration error:', autoRegError)
      }
    }
    // Handle other commands or messages
    else if (text.toLowerCase().includes('help') || text === '/help') {
      // Send help message
      await sendHelpMessage(telegramUser.id)
    }
    else {
      // Handle regular messages - could be implemented later
      console.log('📝 Regular message received (not processed)')
    }
    
    // Always respond with 200 OK to Telegram
    res.status(200).json({ ok: true })
    
  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    
    // Still respond with 200 to avoid Telegram retries
    res.status(200).json({ 
      ok: false, 
      error: error.message 
    })
  }
}

/**
 * Send help message to user
 */
const sendHelpMessage = async (chatId) => {
  const helpMessage = `🤖 MyRajawali Bot

Selamat datang di bot Telegram GPdI Rajawali Kanonang!

📋 Cara menggunakan:
1. Kirim /start untuk mendaftar
2. Tunggu approval dari admin
3. Terima renungan harian otomatis

❓ Butuh bantuan? Hubungi admin gereja.

🙏 Tuhan memberkati!`

  try {
    await simpleTelegramRegistration.sendTelegramMessage(chatId, helpMessage)
  } catch (error) {
    console.error('Error sending help message:', error)
  }
}

/**
 * Setup webhook untuk bot Telegram
 * Fungsi ini dipanggil sekali untuk setup webhook URL
 */
export const setupTelegramWebhook = async (webhookUrl, botToken) => {
  try {
    console.log('🔧 Setting up Telegram webhook...')
    console.log('Webhook URL:', webhookUrl)
    console.log('Bot Token:', botToken.substring(0, 10) + '...')
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    })
    
    const result = await response.json()
    
    if (result.ok) {
      console.log('✅ Webhook setup successful!')
      return { success: true, result }
    } else {
      console.error('❌ Webhook setup failed:', result)
      return { success: false, error: result.description }
    }
    
  } catch (error) {
    console.error('❌ Webhook setup error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get webhook info untuk debugging
 */
export const getWebhookInfo = async (botToken) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
    const result = await response.json()
    
    console.log('📋 Webhook Info:', result)
    return result
    
  } catch (error) {
    console.error('❌ Error getting webhook info:', error)
    return { ok: false, error: error.message }
  }
}

/**
 * Delete webhook (untuk testing dengan polling)
 */
export const deleteWebhook = async (botToken) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
      method: 'POST'
    })
    const result = await response.json()
    
    console.log('🗑️ Webhook deleted:', result)
    return result
    
  } catch (error) {
    console.error('❌ Error deleting webhook:', error)
    return { ok: false, error: error.message }
  }
}

// Export default untuk Firebase Functions atau Express
export default {
  handleTelegramWebhook,
  setupTelegramWebhook,
  getWebhookInfo,
  deleteWebhook
}
