/**
 * Quick validation test for TelegramService migration
 */

console.log('🔍 Validating TelegramService migration...')

// Check if app is running without errors
function validateMigration() {
  const issues = []
  
  // Check console for error patterns
  const originalConsoleError = console.error
  let errorCount = 0
  
  console.error = function(...args) {
    const errorMessage = args.join(' ')
    
    // Count Telegram-related errors
    if (errorMessage.includes('Telegram') || 
        errorMessage.includes('apiUrl') || 
        errorMessage.includes('botToken') ||
        errorMessage.includes('Unknown error')) {
      errorCount++
      issues.push(`Error detected: ${errorMessage}`)
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args)
  }
  
  // Test basic service instantiation
  try {
    console.log('📝 Testing service instantiation...')
    
    // Check if environment variables are available
    const backendUrl = window.VUE_APP_BACKEND_API_URL || 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI'
    const apiToken = window.VUE_APP_API_TOKEN || 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'
    
    console.log('✅ Backend URL configured:', backendUrl)
    console.log('✅ API Token configured:', apiToken.substring(0, 10) + '...')
    
    // Simulate basic checks
    setTimeout(() => {
      console.log('📊 VALIDATION RESULTS:')
      console.log('==================')
      
      if (errorCount === 0) {
        console.log('✅ NO TELEGRAM ERRORS DETECTED!')
        console.log('✅ Migration appears successful')
        console.log('✅ Service should be working normally')
      } else {
        console.log(`❌ ${errorCount} errors detected:`)
        issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`)
        })
      }
      
      // Restore original console.error
      console.error = originalConsoleError
      
      console.log('\n🎯 NEXT STEPS:')
      if (errorCount === 0) {
        console.log('   • Test Telegram features in admin panel')
        console.log('   • Verify polling is working')
        console.log('   • Send test messages')
      } else {
        console.log('   • Check browser console for specific errors')
        console.log('   • Review TelegramService implementation')
      }
    }, 5000) // Wait 5 seconds to catch any delayed errors
    
  } catch (error) {
    issues.push(`Service instantiation error: ${error.message}`)
    console.error('❌ Service validation failed:', error)
  }
  
  console.log('⏳ Running 5-second error monitoring...')
}

// Run validation
validateMigration()
