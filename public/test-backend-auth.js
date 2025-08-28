/**
 * Test Backend Authentication
 */

console.log('🧪 Testing Backend Authentication...')

const BACKEND_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'

async function testBackendAuth() {
  console.log('\n🔍 Testing authentication endpoints...')
  
  // Test 1: Health check (no auth required)
  try {
    console.log('1. Health check (no auth)...')
    const response = await fetch(`${BACKEND_URL}/health`)
    const data = await response.json()
    console.log('✅ Health check:', data.status, data.version)
  } catch (error) {
    console.log('❌ Health check failed:', error.message)
  }
  
  // Test 2: Auth test without token (should work but show not authenticated)
  try {
    console.log('\n2. Auth test without token...')
    const response = await fetch(`${BACKEND_URL}/testAuth`)
    const data = await response.json()
    console.log('✅ Auth test (no token):', data.authenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED')
  } catch (error) {
    console.log('❌ Auth test failed:', error.message)
  }
  
  // Test 3: Auth test with token (get from environment)
  try {
    console.log('\n3. Auth test with token...')
    const apiToken = localStorage.getItem('VUE_APP_API_TOKEN') || 'test-token-from-env'
    
    const response = await fetch(`${BACKEND_URL}/testAuth`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    })
    const data = await response.json()
    console.log('✅ Auth test (with token):', data.authenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED')
    console.log('Config available:', data.hasConfig ? 'YES' : 'NO')
  } catch (error) {
    console.log('❌ Auth test with token failed:', error.message)
  }
  
  // Test 4: Protected endpoint (should require auth)
  try {
    console.log('\n4. Protected endpoint test...')
    const response = await fetch(`${BACKEND_URL}/getUpdates`)
    
    if (response.status === 401) {
      console.log('✅ Protected endpoint correctly requires authentication')
    } else {
      console.log('⚠️ Protected endpoint response:', response.status)
    }
  } catch (error) {
    console.log('❌ Protected endpoint test failed:', error.message)
  }
}

// Run test
testBackendAuth().then(() => {
  console.log('\n📋 Backend Authentication Test Complete')
  console.log('Next: Add Telegram API calls step by step')
})
