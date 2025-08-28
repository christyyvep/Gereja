/**
 * Test current backend deployment status
 */

// Test health check
async function testBackendHealth() {
  try {
    console.log('🔍 Testing backend health check...')
    
    const url = 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI/health'
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('✅ Health check response:', data)
    
    if (data.status === 'OK') {
      console.log('🟢 Backend is responding to health checks!')
      return true
    } else {
      console.log('🔴 Backend health check failed')
      return false
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message)
    return false
  }
}

// Test API endpoint with auth
async function testBackendAPI() {
  try {
    console.log('🔍 Testing backend API endpoint...')
    
    // Use environment variables from frontend
    const apiUrl = window.VUE_APP_BACKEND_API_URL || 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI'
    const apiToken = window.VUE_APP_API_TOKEN || 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'
    
    const url = `${apiUrl}/getUpdates?limit=1`
    
    console.log('📡 Testing getUpdates endpoint...')
    console.log('URL:', url)
    console.log('Token:', apiToken.substring(0, 10) + '...')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API response:', data)
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ API error response:', errorText)
      return false
    }
    
  } catch (error) {
    console.error('💥 API test error:', error.message)
    return false
  }
}

// Run all tests
async function runBackendTests() {
  console.log('🚀 Starting backend deployment tests...')
  console.log('=====================================')
  
  const healthOk = await testBackendHealth()
  console.log('')
  
  const apiOk = await testBackendAPI()
  console.log('')
  
  console.log('📊 TEST RESULTS:')
  console.log('================')
  console.log(`Health Check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`API Endpoint: ${apiOk ? '✅ PASS' : '❌ FAIL'}`)
  
  if (healthOk && apiOk) {
    console.log('🎉 Backend is working! You can re-enable polling.')
  } else if (healthOk) {
    console.log('⚠️ Health check works but API endpoints need fixes.')
  } else {
    console.log('🚧 Backend deployment still needs work.')
  }
}

// Auto-run tests
runBackendTests()
