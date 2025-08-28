/**
 * MyRajawali - Enhanced CORS Fixed Telegram Backend
 * Version 3.0 - Ultimate CORS Solution
 */

const functions = require('firebase-functions');

// Helper function to set comprehensive CORS headers
function setCorsHeaders(res, req) {
  // Allow all origins for now
  const origin = req.headers.origin;
  res.set('Access-Control-Allow-Origin', origin || '*');
  
  // Allow all common methods
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  
  // Allow all common headers
  res.set('Access-Control-Allow-Headers', [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID'
  ].join(', '));
  
  // Allow credentials
  res.set('Access-Control-Allow-Credentials', 'true');
  
  // Cache preflight for 1 hour
  res.set('Access-Control-Max-Age', '3600');
  
  // Expose custom headers
  res.set('Access-Control-Expose-Headers', 'Content-Length, X-Request-ID');
  
  // Prevent caching of actual requests
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
}

// Main Telegram API function with ultimate CORS support
exports.telegramapi = functions.runWith({
  timeoutSeconds: 60,
  memory: '512MB'
}).https.onRequest(async (req, res) => {
  
  console.log(`🌐 ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  
  // Set CORS headers first thing
  setCorsHeaders(res, req);
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    res.status(200).send('');
    return;
  }
  
  // Log request for debugging
  console.log('📋 Headers:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none',
    'origin': req.headers.origin,
    'user-agent': req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 50) + '...' : 'none'
  }, null, 2));

  // Get configuration
  const TELEGRAM_BOT_TOKEN = functions.config().telegram?.bot_token;
  const API_SECRET = functions.config().api?.secret;

  // Health check endpoint
  if (req.url === '/' || req.url === '/health') {
    const response = {
      status: 'OK',
      message: 'MyRajawali Telegram API v3.0 - CORS Enhanced',
      timestamp: new Date().toISOString(),
      server: 'firebase-functions',
      cors: 'enhanced',
      config: {
        telegram: !!TELEGRAM_BOT_TOKEN,
        api: !!API_SECRET
      },
      request: {
        method: req.method,
        url: req.url,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']
      }
    };
    
    console.log('✅ Health check OK');
    res.status(200).json(response);
    return;
  }

  // Helper function to validate API token
  function validateApiToken(req) {
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth check:', authHeader ? 'Bearer token present' : 'No auth header');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth failed: Invalid format');
      return false;
    }
    
    const token = authHeader.substring(7);
    const isValid = token === API_SECRET;
    console.log('🔑 Token validation:', isValid ? 'VALID' : 'INVALID');
    return isValid;
  }

  // Test auth endpoint (no auth required for testing)
  if (req.url.startsWith('/testAuth')) {
    const isAuthorized = validateApiToken(req);
    const response = {
      success: true,
      message: 'Auth test endpoint',
      authenticated: isAuthorized,
      hasConfig: !!(TELEGRAM_BOT_TOKEN && API_SECRET),
      timestamp: new Date().toISOString(),
      headers: {
        hasAuth: !!req.headers.authorization,
        contentType: req.headers['content-type'],
        origin: req.headers.origin
      }
    };
    
    console.log('🧪 Auth test:', isAuthorized ? 'PASS' : 'FAIL');
    res.status(200).json(response);
    return;
  }

  // Check configuration for protected endpoints
  if (!TELEGRAM_BOT_TOKEN || !API_SECRET) {
    console.log('❌ Configuration missing');
    res.status(500).json({ 
      error: 'Configuration missing',
      details: 'Bot token or API secret not configured in Firebase functions config'
    });
    return;
  }

  // Check auth for protected endpoints
  const protectedEndpoints = ['/getUpdates', '/sendMessage'];
  const isProtected = protectedEndpoints.some(endpoint => req.url.startsWith(endpoint));
  
  if (isProtected && !validateApiToken(req)) {
    console.log('❌ Unauthorized request to protected endpoint');
    res.status(401).json({ 
      error: 'Unauthorized',
      details: 'Invalid or missing API token'
    });
    return;
  }

  // getUpdates endpoint
  if (req.url.startsWith('/getUpdates')) {
    try {
      console.log('📥 Getting Telegram updates...');
      
      const https = require('https');
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=100`;
      
      const telegramResponse = await new Promise((resolve, reject) => {
        https.get(url, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`JSON Parse Error: ${e.message}`));
            }
          });
        }).on('error', reject);
      });
      
      if (telegramResponse.ok) {
        console.log(`✅ Retrieved ${telegramResponse.result.length} updates`);
        res.status(200).json({ 
          success: true, 
          updates: telegramResponse.result,
          count: telegramResponse.result.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('❌ Telegram API error:', telegramResponse.description);
        res.status(400).json({ 
          success: false,
          error: telegramResponse.description 
        });
      }
      
    } catch (error) {
      console.error('❌ getUpdates error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
    return;
  }

  // sendMessage endpoint
  if (req.url.startsWith('/sendMessage')) {
    try {
      console.log('📤 Sending Telegram message...');
      
      const { chatId, text, parse_mode } = req.body;
      
      if (!chatId || !text) {
        res.status(400).json({ 
          success: false,
          error: 'chatId and text are required' 
        });
        return;
      }
      
      const https = require('https');
      const payload = JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parse_mode || 'HTML'
      });
      
      const telegramResponse = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.telegram.org',
          path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        };
        
        const request = https.request(options, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`JSON Parse Error: ${e.message}`));
            }
          });
        });
        
        request.on('error', reject);
        request.write(payload);
        request.end();
      });
      
      if (telegramResponse.ok) {
        console.log('✅ Message sent successfully');
        res.status(200).json({ 
          success: true, 
          result: telegramResponse.result,
          message_id: telegramResponse.result.message_id,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('❌ Telegram send error:', telegramResponse.description);
        res.status(400).json({ 
          success: false,
          error: telegramResponse.description 
        });
      }
      
    } catch (error) {
      console.error('❌ sendMessage error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
    return;
  }

  // Default endpoint for unhandled paths
  console.log('❓ Unhandled endpoint:', req.url);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available: ['/health', '/testAuth', '/getUpdates', '/sendMessage'],
    requested: req.url
  });
});

// Additional test endpoints for debugging
exports.corstest = functions.https.onRequest((req, res) => {
  setCorsHeaders(res, req);
  
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  
  res.status(200).json({
    message: 'CORS test successful',
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

exports.simpletest = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  
  res.status(200).json({
    status: 'OK',
    message: 'Simple test endpoint working'
  });
});
