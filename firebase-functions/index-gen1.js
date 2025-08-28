/**
 * MyRajawali Telegram API - Gen 1 Functions
 * Compatible with older Firebase Functions runtime
 */

const functions = require('firebase-functions');
const https = require('https');

// Configuration
const TELEGRAM_BOT_TOKEN = functions.config().telegram?.bot_token;
const API_SECRET = functions.config().api?.secret;

// Telegram API base URL
const TELEGRAM_API_BASE = 'https://api.telegram.org';

// Helper function to validate API token
function validateApiToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === API_SECRET;
}

// Helper function to make HTTPS requests
function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MyRajawali-Bot/1.0',
        ...options.headers
      }
    };

    const request = https.request(requestOptions, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`JSON Parse Error: ${e.message}`));
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      request.write(options.body);
    }
    
    request.end();
  });
}

// Main HTTP function (Generation 1)
exports.telegramAPI = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log(`📥 ${req.method} ${req.url}`);
    
    // Health check
    if (req.url === '/' || req.url === '/health') {
      res.json({
        status: 'OK',
        message: 'MyRajawali Telegram API Gen1 is running',
        timestamp: new Date().toISOString(),
        version: '1.6.0-gen1',
        config: {
          telegram: !!TELEGRAM_BOT_TOKEN,
          api: !!API_SECRET
        }
      });
      return;
    }
    
    // Check auth for protected endpoints
    if (req.url.startsWith('/getUpdates') || req.url.startsWith('/sendMessage')) {
      if (!TELEGRAM_BOT_TOKEN || !API_SECRET) {
        res.status(500).json({ error: 'Configuration missing' });
        return;
      }
      
      if (!validateApiToken(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    }
    
    // getUpdates endpoint
    if (req.url.startsWith('/getUpdates')) {
      try {
        const url = `${TELEGRAM_API_BASE}/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=100`;
        console.log('Fetching updates from Telegram...');
        
        const data = await makeHttpsRequest(url);
        
        if (data.ok) {
          res.json({ success: true, updates: data.result });
        } else {
          res.status(400).json({ error: data.description });
        }
        
      } catch (error) {
        console.error('getUpdates error:', error);
        res.status(500).json({ error: error.message });
      }
      return;
    }
    
    // sendMessage endpoint
    if (req.url.startsWith('/sendMessage')) {
      try {
        const { chatId, text, parse_mode } = req.body;
        
        if (!chatId || !text) {
          res.status(400).json({ error: 'chatId and text required' });
          return;
        }
        
        const payload = JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: parse_mode || 'HTML'
        });
        
        const url = `${TELEGRAM_API_BASE}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        console.log('Sending message to Telegram...');
        
        const data = await makeHttpsRequest(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          body: payload
        });
        
        if (data.ok) {
          res.json({ success: true, result: data.result });
        } else {
          res.status(400).json({ error: data.description });
        }
        
      } catch (error) {
        console.error('sendMessage error:', error);
        res.status(500).json({ error: error.message });
      }
      return;
    }
    
    // Not found
    res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});
