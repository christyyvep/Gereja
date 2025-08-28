/**
 * Simple Telegram API for testing deployment
 */

const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'MyRajawali Telegram API is running'
  })
})

// Simple echo endpoint for testing
app.post('/echo', (req, res) => {
  res.json({
    message: 'Echo successful',
    received: req.body,
    timestamp: new Date().toISOString()
  })
})

// Export as Firebase Function
exports.telegramAPI = functions.https.onRequest(app)
