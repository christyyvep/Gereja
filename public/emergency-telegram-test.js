/**
 * EMERGENCY TELEGRAM TESTING SOLUTION
 * Direct API call untuk testing sementara backend deployment issue
 */

class DirectTelegramTest {
  constructor() {
    // TEMPORARY: For testing only - get from Firebase config
    this.botToken = '8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw'
    this.apiBase = 'https://api.telegram.org'
  }
  
  async testDirectSend(chatId, message) {
    try {
      console.log('🚨 EMERGENCY: Testing direct Telegram API call')
      console.log('This is TEMPORARY until backend is fixed!')
      
      const url = `${this.apiBase}/bot${this.botToken}/sendMessage`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      })
      
      const data = await response.json()
      
      if (data.ok) {
        console.log('✅ Direct send successful:', data.result)
        return { success: true, result: data.result }
      } else {
        console.error('❌ Direct send failed:', data.description)
        return { success: false, error: data.description }
      }
      
    } catch (error) {
      console.error('💥 Direct send error:', error)
      return { success: false, error: error.message }
    }
  }
  
  async testBotInfo() {
    try {
      const url = `${this.apiBase}/bot${this.botToken}/getMe`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.ok) {
        console.log('✅ Bot info:', data.result)
        return { success: true, botInfo: data.result }
      } else {
        console.error('❌ Bot info failed:', data.description)
        return { success: false, error: data.description }
      }
    } catch (error) {
      console.error('💥 Bot info error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create global instance for testing
window.directTelegram = new DirectTelegramTest()

console.log('🚨 EMERGENCY TELEGRAM TESTING LOADED')
console.log('📝 Available commands:')
console.log('   • directTelegram.testBotInfo() - Test bot connection')
console.log('   • directTelegram.testDirectSend(chatId, message) - Send direct message')
console.log('')
console.log('⚠️  WARNING: This uses direct API calls for testing only!')
console.log('🔧 Backend deployment issues will be resolved soon.')

// Auto-test bot info
directTelegram.testBotInfo().then(result => {
  if (result.success) {
    console.log('🎉 Bot is working! You can test sending messages now.')
    console.log('Example: directTelegram.testDirectSend("CHAT_ID", "Test message")')
  }
})
