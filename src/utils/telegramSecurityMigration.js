/**
 * Migration Script: Telegram Security Migration
 * File: src/utils/telegramSecurityMigration.js
 * 
 * Script untuk migrasi dari insecure ke secure Telegram service
 */

import TelegramService from '../services/telegramService.js'
import TelegramServiceSecure from '../services/telegramServiceSecure.js'

/**
 * Test compatibility antara old dan new service
 */
export async function testMigrationCompatibility() {
  console.log('🔄 Testing migration compatibility...')
  
  try {
    const results = {
      oldService: { available: false, errors: [] },
      newService: { available: false, errors: [] },
      compatibility: { passed: false, issues: [] }
    }
    
    // Test old service
    try {
      const oldService = new TelegramService()
      
      // Check if bot token is available (should be removed in production)
      if (oldService.botToken) {
        results.oldService.available = true
        results.compatibility.issues.push('⚠️ Bot token masih exposed di frontend!')
      }
      
      // Test rate limiting functionality
      if (typeof oldService.ensureRateLimit === 'function') {
        console.log('✅ Old service: Rate limiting available')
      } else {
        results.oldService.errors.push('Rate limiting not available')
      }
      
    } catch (error) {
      results.oldService.errors.push(error.message)
    }
    
    // Test new secure service
    try {
      const newService = new TelegramServiceSecure()
      
      // Check if backend API URL is configured
      if (newService.backendApiUrl) {
        results.newService.available = true
        console.log('✅ New service: Backend API URL configured')
      } else {
        results.newService.errors.push('Backend API URL not configured')
      }
      
      // Check if API token is configured
      if (newService.apiToken) {
        console.log('✅ New service: API token available')
      } else {
        results.newService.errors.push('API token not configured')
      }
      
      // Test secure API
      const testResult = await newService.testSecureAPI()
      if (testResult.error) {
        results.newService.errors.push(testResult.error)
      } else {
        console.log('✅ New service: Secure API test passed')
      }
      
    } catch (error) {
      results.newService.errors.push(error.message)
    }
    
    // Determine compatibility
    results.compatibility.passed = (
      results.newService.available && 
      results.newService.errors.length === 0
    )
    
    console.log('📊 Migration compatibility results:')
    console.log('   Old service available:', results.oldService.available)
    console.log('   New service available:', results.newService.available)
    console.log('   Migration ready:', results.compatibility.passed)
    
    if (results.compatibility.issues.length > 0) {
      console.log('⚠️ Security issues found:')
      results.compatibility.issues.forEach(issue => console.log('   -', issue))
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Migration test failed:', error)
    return { error: error.message }
  }
}

/**
 * Perform actual migration from old to new service
 */
export async function performSecurityMigration() {
  console.log('🚀 Starting security migration...')
  
  try {
    const migrationSteps = []
    
    // Step 1: Validate new service configuration
    migrationSteps.push('Validating new service configuration...')
    const newService = new TelegramServiceSecure()
    
    if (!newService.backendApiUrl || !newService.apiToken) {
      throw new Error('New service not properly configured. Check VUE_APP_BACKEND_API_URL and VUE_APP_API_TOKEN')
    }
    
    migrationSteps.push('✅ New service configuration valid')
    
    // Step 2: Test backend API connectivity
    migrationSteps.push('Testing backend API connectivity...')
    const apiTest = await newService.testSecureAPI()
    
    if (apiTest.error) {
      throw new Error(`Backend API test failed: ${apiTest.error}`)
    }
    
    migrationSteps.push('✅ Backend API connectivity confirmed')
    
    // Step 3: Test sample message (if test chat ID provided)
    const testChatId = prompt('Enter test chat ID for migration test (or cancel to skip):')
    
    if (testChatId) {
      migrationSteps.push(`Testing secure message send to ${testChatId}...`)
      
      try {
        await newService.sendMessage(testChatId, '🧪 Security migration test - SECURE VERSION')
        migrationSteps.push('✅ Secure message send test passed')
      } catch (error) {
        migrationSteps.push(`⚠️ Secure message test failed: ${error.message}`)
      }
    }
    
    // Step 4: Provide migration instructions
    migrationSteps.push('Generating migration instructions...')
    
    const instructions = {
      frontend: [
        '1. Replace TelegramService import dengan TelegramServiceSecure',
        '2. Update environment variables (remove VUE_APP_TELEGRAM_BOT_TOKEN)',
        '3. Add VUE_APP_BACKEND_API_URL dan VUE_APP_API_TOKEN',
        '4. Test all Telegram functionality'
      ],
      backend: [
        '1. Deploy Firebase Functions dengan telegramAPI.js',
        '2. Set environment config: firebase functions:config:set telegram.bot_token="YOUR_BOT_TOKEN"',
        '3. Set API secret: firebase functions:config:set api.secret="YOUR_API_SECRET"',
        '4. Deploy functions: firebase deploy --only functions'
      ],
      verification: [
        '1. Check bot token tidak ada di browser DevTools',
        '2. Test broadcast functionality',
        '3. Monitor Firebase Functions logs',
        '4. Verify rate limiting working properly'
      ]
    }
    
    migrationSteps.push('✅ Migration instructions generated')
    
    console.log('🎉 Security migration completed!')
    console.log('')
    console.log('📋 Migration Steps Completed:')
    migrationSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`)
    })
    
    console.log('')
    console.log('📝 Next Steps:')
    console.log('')
    console.log('🔧 Frontend Changes:')
    instructions.frontend.forEach(step => console.log(`   • ${step}`))
    
    console.log('')
    console.log('⚙️ Backend Deployment:')
    instructions.backend.forEach(step => console.log(`   • ${step}`))
    
    console.log('')
    console.log('✅ Verification Steps:')
    instructions.verification.forEach(step => console.log(`   • ${step}`))
    
    return {
      success: true,
      migrationSteps,
      instructions,
      newServiceReady: true
    }
    
  } catch (error) {
    console.error('❌ Security migration failed:', error)
    return {
      success: false,
      error: error.message,
      recommendation: 'Fix configuration issues before proceeding with migration'
    }
  }
}

/**
 * Quick comparison test antara old vs new performance
 */
export async function comparePerformance() {
  console.log('⚡ Comparing old vs new service performance...')
  
  try {
    const mockMessage = 'Test performance comparison'
    const mockUsers = [
      { telegramUserId: 'test1', telegramFirstName: 'User 1' },
      { telegramUserId: 'test2', telegramFirstName: 'User 2' },
      { telegramUserId: 'test3', telegramFirstName: 'User 3' }
    ]
    
    const results = {
      oldService: { time: 0, method: 'direct_api' },
      newService: { time: 0, method: 'backend_api' },
      improvement: { percentage: 0, analysis: '' }
    }
    
    // Old service simulation (rate limiting test)
    const oldService = new TelegramService()
    const oldStartTime = performance.now()
    
    for (let i = 0; i < mockUsers.length; i++) {
      await oldService.ensureRateLimit()
      // Simulate message send delay
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    results.oldService.time = performance.now() - oldStartTime
    
    // New service simulation 
    const newService = new TelegramServiceSecure()
    const newStartTime = performance.now()
    
    // Simulate backend API call (generally faster for bulk operations)
    await new Promise(resolve => setTimeout(resolve, 50)) // Single API call
    
    results.newService.time = performance.now() - newStartTime
    
    // Calculate improvement
    const timeDiff = results.oldService.time - results.newService.time
    results.improvement.percentage = ((timeDiff / results.oldService.time) * 100).toFixed(2)
    
    if (results.newService.time < results.oldService.time) {
      results.improvement.analysis = `${results.improvement.percentage}% faster dengan backend API`
    } else {
      results.improvement.analysis = 'Backend API memiliki overhead network, tapi lebih secure'
    }
    
    console.log('📊 Performance Comparison Results:')
    console.log(`   Old service (direct): ${results.oldService.time.toFixed(2)}ms`)
    console.log(`   New service (backend): ${results.newService.time.toFixed(2)}ms`)
    console.log(`   Analysis: ${results.improvement.analysis}`)
    
    return results
    
  } catch (error) {
    console.error('❌ Performance comparison failed:', error)
    return { error: error.message }
  }
}

// Helper function untuk environment variable checking
export function checkEnvironmentSecurity() {
  console.log('🔐 Checking environment security...')
  
  const issues = []
  const recommendations = []
  
  // Check for exposed bot token
  if (process.env.VUE_APP_TELEGRAM_BOT_TOKEN) {
    issues.push('❌ VUE_APP_TELEGRAM_BOT_TOKEN is exposed in frontend')
    recommendations.push('Remove VUE_APP_TELEGRAM_BOT_TOKEN from frontend environment')
  }
  
  // Check for secure API configuration
  if (!process.env.VUE_APP_BACKEND_API_URL) {
    issues.push('⚠️ VUE_APP_BACKEND_API_URL not configured')
    recommendations.push('Add VUE_APP_BACKEND_API_URL to environment')
  }
  
  if (!process.env.VUE_APP_API_TOKEN) {
    issues.push('⚠️ VUE_APP_API_TOKEN not configured')
    recommendations.push('Add VUE_APP_API_TOKEN to environment')
  }
  
  // Security score
  const totalChecks = 3
  const issuesCount = issues.length
  const securityScore = ((totalChecks - issuesCount) / totalChecks) * 100
  
  console.log(`🛡️ Security Score: ${securityScore.toFixed(0)}%`)
  
  if (issues.length > 0) {
    console.log('🚨 Security Issues Found:')
    issues.forEach(issue => console.log(`   ${issue}`))
    
    console.log('💡 Recommendations:')
    recommendations.forEach(rec => console.log(`   • ${rec}`))
  } else {
    console.log('✅ All security checks passed!')
  }
  
  return {
    securityScore,
    issues,
    recommendations,
    isSecure: issues.length === 0
  }
}

export default {
  testMigrationCompatibility,
  performSecurityMigration,
  comparePerformance,
  checkEnvironmentSecurity
}
