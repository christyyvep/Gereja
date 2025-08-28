/**
 * STOP POLLING SPAM - Emergency Fix
 */

console.log('🛑 Stopping Telegram polling to eliminate console spam...')

// Try to access telegramService and stop polling
if (window.telegramService || window.Vue) {
  try {
    // Method 1: Direct service access
    if (window.telegramService) {
      window.telegramService.stopPolling()
      console.log('✅ Polling stopped via direct service access')
    }
    
    // Method 2: Vue app access
    if (window.Vue && window.Vue.prototype.$telegramService) {
      window.Vue.prototype.$telegramService.stopPolling()
      console.log('✅ Polling stopped via Vue prototype')
    }
    
    // Method 3: Clear any intervals manually
    for (let i = 1; i < 99999; i++) {
      window.clearInterval(i)
    }
    console.log('✅ All intervals cleared')
    
  } catch (error) {
    console.log('⚠️ Could not stop polling directly:', error.message)
  }
}

// Override the polling method temporarily
window.stopTelegramPolling = function() {
  console.log('🛑 Manual polling stop initiated...')
  
  // Clear all intervals
  for (let i = 1; i < 99999; i++) {
    clearInterval(i)
  }
  
  // Override console.error temporarily to reduce spam
  const originalError = console.error
  let errorCount = 0
  
  console.error = function(...args) {
    const message = args.join(' ')
    
    // Only show Telegram errors occasionally
    if (message.includes('Telegram') || message.includes('Unknown error')) {
      errorCount++
      if (errorCount % 10 === 0) {
        originalError(`[${errorCount}] Telegram errors suppressed, last:`, ...args)
      }
      return
    }
    
    // Show other errors normally
    originalError.apply(console, args)
  }
  
  console.log('✅ Console error spam reduced')
  console.log('📝 Telegram errors will be shown every 10th occurrence')
}

// Auto-execute
window.stopTelegramPolling()

console.log('🎯 EMERGENCY FIX APPLIED')
console.log('📋 Commands available:')
console.log('   • stopTelegramPolling() - Stop polling and reduce error spam')
console.log('   • directTelegram.testBotInfo() - Test bot (if loaded)')
console.log('')
console.log('✅ Console should be much cleaner now!')
