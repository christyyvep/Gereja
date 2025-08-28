/**
 * Test Telegram getUpdates API
 */

console.log('📥 Testing Telegram getUpdates API...')

const BACKEND_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'

async function testGetUpdates() {
  try {
    // Get API token from environment or localStorage
    const apiToken = window.VUE_APP_API_TOKEN || localStorage.getItem('VUE_APP_API_TOKEN') || 'your-api-token'
    
    console.log('🔑 Using API token:', apiToken.substring(0, 10) + '...')
    console.log('📡 Testing getUpdates endpoint...')
    
    const response = await fetch(`${BACKEND_URL}/getUpdates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ getUpdates SUCCESS!')
      console.log('📋 Response data:', data)
      console.log('📮 Updates count:', data.count)
      
      if (data.updates && data.updates.length > 0) {
        console.log('📝 Recent messages:')
        data.updates.slice(-3).forEach((update, index) => {
          if (update.message) {
            console.log(`  ${index + 1}. From: ${update.message.from.first_name} - "${update.message.text}"`)
          }
        })
      } else {
        console.log('📭 No new messages')
      }
      
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log('❌ getUpdates FAILED!')
      console.log('Error:', errorData)
      
      if (response.status === 401) {
        console.log('🔑 Authentication issue - check API token')
      } else if (response.status === 500) {
        console.log('⚙️ Configuration issue - check bot token')
      }
    }
    
  } catch (error) {
    console.error('❌ Network/Request error:', error)
  }
}

// Test function
window.testGetUpdates = testGetUpdates

// Auto run
testGetUpdates().then(() => {
  console.log('\n📋 getUpdates Test Complete')
  console.log('💡 Available commands:')
  console.log('   • testGetUpdates() - Test again')
})
