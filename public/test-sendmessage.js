/**
 * Test Telegram sendMessage API
 */

console.log('📤 Testing Telegram sendMessage API...')

const BACKEND_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'

async function testSendMessage() {
  try {
    // Get API token from environment or localStorage
    const apiToken = window.VUE_APP_API_TOKEN || localStorage.getItem('VUE_APP_API_TOKEN') || 'your-api-token'
    
    // Test chat ID (you can use your own Telegram chat ID)
    const testChatId = 'YOUR_CHAT_ID' // Replace with actual chat ID for testing
    const testMessage = `🧪 Test message from MyRajawali Backend\n⏰ ${new Date().toLocaleString()}\n✅ Backend API working!`
    
    console.log('🔑 Using API token:', apiToken.substring(0, 10) + '...')
    console.log('📤 Sending test message...')
    console.log('💬 Message:', testMessage)
    
    const response = await fetch(`${BACKEND_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId: testChatId,
        text: testMessage,
        parse_mode: 'HTML'
      })
    })
    
    console.log('📊 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ sendMessage SUCCESS!')
      console.log('📋 Response data:', data)
      console.log('📮 Message ID:', data.message_id)
      
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log('❌ sendMessage FAILED!')
      console.log('Error:', errorData)
      
      if (response.status === 401) {
        console.log('🔑 Authentication issue - check API token')
      } else if (response.status === 400) {
        console.log('📝 Request issue - check chatId and message')
      } else if (response.status === 500) {
        console.log('⚙️ Configuration issue - check bot token')
      }
    }
    
  } catch (error) {
    console.error('❌ Network/Request error:', error)
  }
}

// Helper function to send custom message
window.sendTestMessage = function(chatId, message) {
  const apiToken = window.VUE_APP_API_TOKEN || localStorage.getItem('VUE_APP_API_TOKEN') || 'your-api-token'
  
  return fetch(`${BACKEND_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chatId: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  }).then(response => response.json())
}

// Test function
window.testSendMessage = testSendMessage

console.log('\n📋 sendMessage Test Ready')
console.log('💡 Available commands:')
console.log('   • testSendMessage() - Test with default message')
console.log('   • sendTestMessage(chatId, message) - Send custom message')
console.log('')
console.log('⚠️  Note: Update testChatId in the script for actual testing')
