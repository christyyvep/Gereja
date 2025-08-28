/**
 * EMERGENCY ENVIRONMENT FIX
 * Fix URL backend yang masih pakai URL lama
 */

console.log('🚨 FIXING BACKEND URL ENVIRONMENT...')

// Set URL backend yang benar
const CORRECT_BACKEND_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'
const CORRECT_API_TOKEN = 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'

console.log('🔧 Setting correct environment variables...')

// Update window variables
window.VUE_APP_BACKEND_API_URL = CORRECT_BACKEND_URL
window.VUE_APP_API_TOKEN = CORRECT_API_TOKEN

// Update localStorage
localStorage.setItem('VUE_APP_BACKEND_API_URL', CORRECT_BACKEND_URL)
localStorage.setItem('VUE_APP_API_TOKEN', CORRECT_API_TOKEN)

console.log('✅ Environment variables updated:')
console.log('   Backend URL:', CORRECT_BACKEND_URL)
console.log('   API Token:', CORRECT_API_TOKEN.substring(0, 10) + '...')

// Fix telegramService if available
if (window.telegramService) {
  console.log('🔧 Updating telegramService URLs...')
  window.telegramService.backendApiUrl = CORRECT_BACKEND_URL
  window.telegramService.apiToken = CORRECT_API_TOKEN
  
  // Stop any existing polling that uses wrong URL
  if (window.telegramService.isPolling) {
    console.log('🛑 Stopping old polling...')
    window.telegramService.stopPolling()
  }
  
  console.log('✅ TelegramService updated with correct URLs')
}

// Clear any intervals that might be using old URLs
for (let i = 1; i < 10000; i++) {
  clearInterval(i)
}

console.log('✅ Cleared all intervals')

// Test new backend connection
async function testNewBackend() {
  console.log('🧪 Testing new backend connection...')
  
  try {
    const response = await fetch(`${CORRECT_BACKEND_URL}/health`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ NEW BACKEND IS WORKING!')
      console.log('   Status:', data.status)
      console.log('   Version:', data.version)
      console.log('   Config OK:', data.config.telegram && data.config.api)
    } else {
      console.log('❌ Backend test failed:', response.status)
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error.message)
  }
}

// Override any fetch requests to old URL
const originalFetch = window.fetch
window.fetch = function(url, options) {
  // Redirect old URLs to new backend
  if (typeof url === 'string' && url.includes('us-central1-myrajawali-app.cloudfunctions.net/telegramAPI')) {
    const newUrl = url.replace(
      'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI',
      CORRECT_BACKEND_URL
    )
    console.log('🔄 Redirecting request:', url, '→', newUrl)
    return originalFetch(newUrl, options)
  }
  
  return originalFetch(url, options)
}

console.log('🔄 Fetch intercept installed - will redirect old URLs')

// Run test
testNewBackend()

console.log('\n✅ EMERGENCY FIX APPLIED!')
console.log('📝 This should stop the error spam immediately')
console.log('🔄 Refresh page or restart polling to use new URLs')
