/**
 * Backend API untuk Telegram Operations (Node.js/Express)
 * File: firebase-functions/telegramAPI.js
 * 
 * Fungsi utama:
 * 1. Menyimpan bot token di backend (secure)
 * 2. Menyediakan API endpoints untuk frontend
 * 3. Proxy request ke Telegram API
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// ✅ SECURE: Bot token disimpan di environment backend
const TELEGRAM_BOT_TOKEN = functions.config().telegram?.bot_token || process.env.TELEGRAM_BOT_TOKEN
const API_SECRET = functions.config().api?.secret || process.env.API_SECRET || 'your-api-secret'

/**
 * Middleware untuk validasi API access
 */
function validateApiAccess(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }
  
  const token = authHeader.split('Bearer ')[1]
  
  if (token !== API_SECRET) {
    return res.status(403).json({ error: 'Invalid API token' })
  }
  
  next()
}

/**
 * POST /telegram/send-message
 * Kirim pesan ke chat Telegram tertentu
 */
app.post('/telegram/send-message', validateApiAccess, async (req, res) => {
  try {
    const { chatId, message, options = {} } = req.body
    
    if (!chatId || !message) {
      return res.status(400).json({ error: 'chatId and message are required' })
    }
    
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: options.parse_mode || 'HTML',
      ...options
    }
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${result.description || response.statusText}`)
    }
    
    // Log untuk monitoring
    console.log(`✅ Message sent to ${chatId}:`, {
      messageId: result.result?.message_id,
      timestamp: new Date().toISOString()
    })
    
    res.json({
      success: true,
      result: result.result,
      messageId: result.result?.message_id
    })
    
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /telegram/broadcast
 * Kirim broadcast ke multiple users
 */
app.post('/telegram/broadcast', validateApiAccess, async (req, res) => {
  try {
    const { message, userIds, options = {} } = req.body
    
    if (!message || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'message and userIds array are required' })
    }
    
    const results = {
      total: userIds.length,
      success: 0,
      failed: 0,
      details: []
    }
    
    // Rate limiting: 50ms delay between messages
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i]
      
      try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
        
        const payload = {
          chat_id: userId,
          text: message,
          parse_mode: options.parse_mode || 'HTML',
          ...options
        }
        
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const result = await response.json()
        
        if (response.ok) {
          results.success++
          results.details.push({
            userId,
            status: 'success',
            messageId: result.result?.message_id
          })
        } else {
          throw new Error(result.description || 'Unknown error')
        }
        
      } catch (error) {
        results.failed++
        results.details.push({
          userId,
          status: 'failed',
          error: error.message
        })
      }
      
      // Rate limiting: 50ms delay
      if (i < userIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    // Log broadcast results
    console.log(`📊 Broadcast completed:`, {
      total: results.total,
      success: results.success,
      failed: results.failed,
      timestamp: new Date().toISOString()
    })
    
    res.json({
      success: true,
      results
    })
    
  } catch (error) {
    console.error('❌ Error in broadcast:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /telegram/webhook-info
 * Get webhook information (untuk debugging)
 */
app.get('/telegram/webhook-info', validateApiAccess, async (req, res) => {
  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    
    const response = await fetch(telegramUrl)
    const result = await response.json()
    
    res.json({
      success: true,
      webhookInfo: result.result
    })
    
  } catch (error) {
    console.error('❌ Error getting webhook info:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /telegram/set-webhook
 * Set webhook URL untuk bot
 */
app.post('/telegram/set-webhook', validateApiAccess, async (req, res) => {
  try {
    const { webhookUrl } = req.body
    
    if (!webhookUrl) {
      return res.status(400).json({ error: 'webhookUrl is required' })
    }
    
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${result.description}`)
    }
    
    res.json({
      success: true,
      result: result.result
    })
    
  } catch (error) {
    console.error('❌ Error setting webhook:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'telegram-api'
  })
})

// Export sebagai Firebase Cloud Function
exports.telegramAPI = functions.https.onRequest(app)

module.exports = app
