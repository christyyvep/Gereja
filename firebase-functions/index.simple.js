/**
 * Simple Firebase Functions for testing deployment
 */

const functions = require('firebase-functions')

// Simple health check function
exports.telegramAPI = functions.https.onRequest((req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.path === '/health' || req.method === 'GET') {
    res.json({
      status: 'OK',
      message: 'MyRajawali Telegram API is running',
      timestamp: new Date().toISOString(),
      environment: 'production'
    })
    return
  }
  
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: ['/health']
  })
})
