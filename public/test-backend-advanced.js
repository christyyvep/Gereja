/**
 * Advanced Backend API Testing
 */

async function testBackendAdvanced() {
  console.log('🔬 Advanced Backend API Testing...')
  
  const backendUrl = 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI'
  const apiToken = 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'
  
  // Test 1: Health Check
  try {
    console.log('🩺 Testing health check...')
    const healthResponse = await fetch(`${backendUrl}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check response:', healthData)
  } catch (error) {
    console.error('❌ Health check failed:', error)
  }
  
  // Test 2: Root endpoint
  try {
    console.log('🏠 Testing root endpoint...')
    const rootResponse = await fetch(backendUrl)
    const rootData = await rootResponse.json()
    console.log('✅ Root endpoint response:', rootData)
  } catch (error) {
    console.error('❌ Root endpoint failed:', error)
  }
  
  // Test 3: getUpdates endpoint
  try {
    console.log('📥 Testing getUpdates endpoint...')
    const updatesResponse = await fetch(`${backendUrl}/getUpdates?limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    })
    
    console.log('📊 getUpdates status:', updatesResponse.status)
    
    if (updatesResponse.ok) {
      const updatesData = await updatesResponse.json()
      console.log('✅ getUpdates response:', updatesData)
    } else {
      const errorText = await updatesResponse.text()
      console.log('❌ getUpdates error:', errorText)
    }
  } catch (error) {
    console.error('❌ getUpdates failed:', error)
  }
  
  // Test 4: sendMessage endpoint (with test message)
  try {
    console.log('📤 Testing sendMessage endpoint...')
    const sendResponse = await fetch(`${backendUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        chatId: '123456789', // Dummy chat ID
        text: 'Test message'
      })
    })
    
    console.log('📊 sendMessage status:', sendResponse.status)
    
    if (sendResponse.ok) {
      const sendData = await sendResponse.json()
      console.log('✅ sendMessage response:', sendData)
    } else {
      const errorText = await sendResponse.text()
      console.log('❌ sendMessage error:', errorText)
    }
  } catch (error) {
    console.error('❌ sendMessage failed:', error)
  }
  
  console.log('🏁 Advanced testing complete!')
}

// Run the test
testBackendAdvanced()
