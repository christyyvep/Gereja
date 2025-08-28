/**
 * MyRajawali Telegram API - Simple Gen 1 Functions
 */

const functions = require('firebase-functions');

// Export basic test function first
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.json({
    message: 'Hello from MyRajawali Firebase Functions!',
    timestamp: new Date().toISOString()
  });
});

// Configuration
const TELEGRAM_BOT_TOKEN = functions.config().telegram?.bot_token;
const API_SECRET = functions.config().api?.secret;

// Main Telegram API function
exports.telegramAPI = functions.https.onRequest((req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Health check
  if (req.url === '/' || req.url === '/health') {
    res.json({
      status: 'OK',
      message: 'MyRajawali Telegram API (Gen1) is running',
      timestamp: new Date().toISOString(),
      version: '1.7.0-gen1-simple',
      config: {
        telegram: !!TELEGRAM_BOT_TOKEN,
        api: !!API_SECRET
      }
    });
    return;
  }

  // For now, just return success for all endpoints
  res.json({
    success: true,
    message: 'Telegram API endpoint placeholder',
    endpoint: req.url,
    method: req.method
  });
});
