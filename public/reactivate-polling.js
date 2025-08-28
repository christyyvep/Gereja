/**
 * REACTIVATE TELEGRAM POLLING
 * Re-enable polling setelah backend fix
 */

console.log('🔄 Reactivating Telegram Polling...')

async function reactivatePolling() {
  console.log('\n📋 REACTIVATION CHECKLIST:')
  
  // 1. Test backend connection
  console.log('1️⃣ Testing backend connection...')
  try {
    const response = await fetch('https://telegramapi-7hu5np5oka-uc.a.run.app/health')
    const data = await response.json()
    
    if (response.ok && data.status === 'OK') {
      console.log('✅ Backend is online and healthy')
      console.log(`   Version: ${data.version}`)
    } else {
      console.log('❌ Backend health check failed')
      return
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error.message)
    return
  }
  
  // 2. Update environment variables
  console.log('\n2️⃣ Updating environment variables...')
  
  // Set proper backend URL
  window.VUE_APP_BACKEND_API_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'
  window.VUE_APP_API_TOKEN = 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'
  
  // Store in localStorage as backup
  localStorage.setItem('VUE_APP_BACKEND_API_URL', window.VUE_APP_BACKEND_API_URL)
  localStorage.setItem('VUE_APP_API_TOKEN', window.VUE_APP_API_TOKEN)
  
  console.log('✅ Environment variables updated')
  console.log(`   Backend URL: ${window.VUE_APP_BACKEND_API_URL}`)
  console.log(`   API Token: ${window.VUE_APP_API_TOKEN.substring(0, 10)}...`)
  
  // 3. Test telegramService if available
  console.log('\n3️⃣ Testing telegramService...')
  
  if (window.telegramService) {
    try {
      // Update telegramService URLs
      window.telegramService.backendApiUrl = window.VUE_APP_BACKEND_API_URL
      window.telegramService.apiToken = window.VUE_APP_API_TOKEN
      
      console.log('✅ TelegramService URLs updated')
      
      // Test connection
      const testResponse = await window.telegramService.makeRequest('/health')
      if (testResponse) {
        console.log('✅ TelegramService connection test passed')
      }
      
    } catch (error) {
      console.log('⚠️ TelegramService test error (expected if service not initialized):', error.message)
    }
  } else {
    console.log('⚠️ TelegramService not found (app may need refresh)')
  }
  
  // 4. Clear any existing error suppressions
  console.log('\n4️⃣ Clearing error suppressions...')
  
  // Restore original console.error if it was overridden
  if (window.originalConsoleError) {
    console.error = window.originalConsoleError
    console.log('✅ Original console.error restored')
  }
  
  // Clear any lingering intervals
  for (let i = 1; i < 1000; i++) {
    clearInterval(i)
  }
  console.log('✅ Cleared any remaining intervals')
  
  // 5. Ready for polling
  console.log('\n5️⃣ Ready for polling activation...')
  
  console.log('✅ REACTIVATION COMPLETE!')
  console.log('\n📝 NEXT STEPS:')
  console.log('1. Refresh the app to load new backend URL')
  console.log('2. Or manually restart polling with: startPolling()')
  console.log('3. Test broadcast functionality')
  console.log('4. Monitor for errors')
  
  return true
}

// Helper function to manually start polling
window.startTelegramPolling = function() {
  console.log('🔄 Starting Telegram polling manually...')
  
  if (window.telegramService) {
    try {
      window.telegramService.startPolling()
      console.log('✅ Polling started successfully')
    } catch (error) {
      console.log('❌ Error starting polling:', error.message)
    }
  } else {
    console.log('❌ TelegramService not available')
  }
}

// Helper function to stop polling
window.stopTelegramPolling = function() {
  console.log('🛑 Stopping Telegram polling...')
  
  if (window.telegramService) {
    try {
      window.telegramService.stopPolling()
      console.log('✅ Polling stopped successfully')
    } catch (error) {
      console.log('❌ Error stopping polling:', error.message)
    }
  } else {
    console.log('❌ TelegramService not available')
  }
}

// Auto-run reactivation
reactivatePolling().then(() => {
  console.log('\n💡 Available commands:')
  console.log('   • startTelegramPolling() - Start polling manually')
  console.log('   • stopTelegramPolling() - Stop polling')
  console.log('   • reactivatePolling() - Run reactivation again')
})
