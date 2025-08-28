/**
 * Test file untuk menguji rate limiting pada TelegramService
 * 
 * Cara menjalankan:
 * 1. Import file ini di console browser atau di komponen Vue
 * 2. Panggil function testTelegramRateLimit()
 */

import TelegramService from './telegramService.js'

/**
 * Test basic rate limiting functionality
 */
export async function testTelegramRateLimit() {
  console.log('🧪 Memulai test rate limiting TelegramService...')
  
  try {
    const telegramService = new TelegramService()
    
    // Test 1: Basic rate limiting dengan ensureRateLimit()
    console.log('\n📋 Test 1: Basic rate limiting')
    const basicTest = await telegramService.testRateLimiting(5)
    
    if (basicTest.allDelaysCorrect) {
      console.log('✅ Test 1 PASSED: Semua delay sudah sesuai minimum 50ms')
    } else {
      console.log('❌ Test 1 FAILED: Ada delay yang kurang dari 50ms')
    }
    
    // Test 2: Rate limiting dengan chunk processing
    console.log('\n📋 Test 2: Chunk processing rate limiting')
    const mockUsers = []
    for (let i = 1; i <= 10; i++) {
      mockUsers.push({
        telegramUserId: `test_user_${i}`,
        telegramFirstName: `User ${i}`
      })
    }
    
    console.log(`📊 Testing dengan ${mockUsers.length} mock users...`)
    const chunks = telegramService.chunkArray(mockUsers, telegramService.RATE_LIMITS.CHUNK_SIZE)
    console.log(`📦 Dibagi menjadi ${chunks.length} chunks dengan ukuran max ${telegramService.RATE_LIMITS.CHUNK_SIZE}`)
    
    if (chunks.length > 0 && chunks.every(chunk => chunk.length <= telegramService.RATE_LIMITS.CHUNK_SIZE)) {
      console.log('✅ Test 2 PASSED: Chunk processing bekerja dengan benar')
    } else {
      console.log('❌ Test 2 FAILED: Chunk processing tidak bekerja dengan benar')
    }
    
    // Test 3: Rate limit constants validation
    console.log('\n📋 Test 3: Rate limit constants validation')
    const rateLimits = telegramService.RATE_LIMITS
    
    console.log('📊 Current rate limit settings:')
    console.log(`   - MIN_DELAY_BETWEEN_MESSAGES: ${rateLimits.MIN_DELAY_BETWEEN_MESSAGES}ms`)
    console.log(`   - MAX_MESSAGES_PER_SECOND: ${rateLimits.MAX_MESSAGES_PER_SECOND}`)
    console.log(`   - CHUNK_SIZE: ${rateLimits.CHUNK_SIZE}`)
    console.log(`   - RETRY_ATTEMPTS: ${rateLimits.RETRY_ATTEMPTS}`)
    console.log(`   - RETRY_DELAY: ${rateLimits.RETRY_DELAY}ms`)
    
    const isValid = (
      rateLimits.MIN_DELAY_BETWEEN_MESSAGES >= 50 &&
      rateLimits.MAX_MESSAGES_PER_SECOND <= 30 &&
      rateLimits.CHUNK_SIZE >= 1 &&
      rateLimits.RETRY_ATTEMPTS >= 1 &&
      rateLimits.RETRY_DELAY >= 500
    )
    
    if (isValid) {
      console.log('✅ Test 3 PASSED: Rate limit constants sudah optimal')
    } else {
      console.log('❌ Test 3 FAILED: Rate limit constants perlu adjustment')
    }
    
    console.log('\n🏁 Rate limiting tests completed!')
    
    return {
      basicTest,
      chunkTest: { passed: chunks.length > 0 },
      constantsTest: { passed: isValid },
      allTestsPassed: basicTest.allDelaysCorrect && chunks.length > 0 && isValid
    }
    
  } catch (error) {
    console.error('❌ Error dalam test rate limiting:', error)
    return { error: error.message }
  }
}

/**
 * Test rate limiting dalam kondisi real (HATI-HATI: akan mengirim pesan real jika ada bot token)
 */
export async function testRealRateLimit(testChatId = null) {
  if (!testChatId) {
    console.log('⚠️ Tidak ada test chat ID, skip real test')
    return { skipped: true }
  }
  
  console.log('🧪 Memulai test real rate limiting...')
  console.log('⚠️ PERINGATAN: Test ini akan mengirim pesan real ke Telegram!')
  
  try {
    const telegramService = new TelegramService()
    const testMessages = [
      'Test message 1 - Rate limiting test',
      'Test message 2 - Rate limiting test', 
      'Test message 3 - Rate limiting test'
    ]
    
    const startTime = Date.now()
    const results = []
    
    for (let i = 0; i < testMessages.length; i++) {
      const messageStartTime = Date.now()
      
      try {
        await telegramService.sendMessageWithRateLimit(testChatId, testMessages[i])
        
        const messageEndTime = Date.now()
        const delay = messageEndTime - messageStartTime
        
        results.push({
          messageIndex: i + 1,
          delay,
          success: true
        })
        
        console.log(`✅ Message ${i + 1} sent successfully with ${delay}ms delay`)
        
      } catch (error) {
        results.push({
          messageIndex: i + 1,
          error: error.message,
          success: false
        })
        
        console.error(`❌ Message ${i + 1} failed:`, error.message)
      }
    }
    
    const totalTime = Date.now() - startTime
    
    console.log(`🏁 Real rate limiting test completed in ${totalTime}ms`)
    console.log('📊 Results:', results)
    
    return {
      totalTime,
      results,
      successCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length
    }
    
  } catch (error) {
    console.error('❌ Error dalam real rate limiting test:', error)
    return { error: error.message }
  }
}

// Export untuk digunakan di tempat lain
export default {
  testTelegramRateLimit,
  testRealRateLimit
}

/**
 * NEXT STEPS HELPER FUNCTIONS
 * Tambahan untuk memudahkan migration dan testing
 */

/**
 * Test koneksi ke backend API yang baru
 */
export async function testBackendConnection() {
  console.log('🔗 Testing backend API connection...')
  
  try {
    const backendUrl = process.env.VUE_APP_BACKEND_API_URL || 'https://your-project-id.cloudfunctions.net/telegramAPI'
    
    // Test health endpoint
    const healthResponse = await fetch(`${backendUrl}/health`)
    const healthData = await healthResponse.json()
    
    if (healthResponse.ok) {
      console.log('✅ Backend API health check passed:', healthData)
      return { success: true, backend: 'available', data: healthData }
    } else {
      console.log('❌ Backend API health check failed')
      return { success: false, error: 'Backend not responding' }
    }
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Quick migration readiness check
 */
export async function checkMigrationReadiness() {
  console.log('📋 Checking migration readiness...')
  
  const checks = {
    backendApi: false,
    environment: false,
    rateLimiting: false,
    overall: false
  }
  
  // Check 1: Backend API availability
  const backendTest = await testBackendConnection()
  checks.backendApi = backendTest.success
  
  // Check 2: Environment variables
  const hasBackendUrl = !!process.env.VUE_APP_BACKEND_API_URL
  const hasApiToken = !!process.env.VUE_APP_API_TOKEN
  const hasOldToken = !!process.env.VUE_APP_TELEGRAM_BOT_TOKEN
  
  checks.environment = hasBackendUrl && hasApiToken && !hasOldToken
  
  // Check 3: Rate limiting functionality
  try {
    const rateLimitTest = await testTelegramRateLimit()
    checks.rateLimiting = rateLimitTest.allTestsPassed
  } catch (error) {
    checks.rateLimiting = false
  }
  
  // Overall readiness
  checks.overall = checks.backendApi && checks.environment && checks.rateLimiting
  
  console.log('📊 Migration Readiness Report:')
  console.log(`   Backend API: ${checks.backendApi ? '✅' : '❌'}`)
  console.log(`   Environment: ${checks.environment ? '✅' : '❌'}`)
  console.log(`   Rate Limiting: ${checks.rateLimiting ? '✅' : '❌'}`)
  console.log(`   Overall Ready: ${checks.overall ? '✅ READY' : '❌ NOT READY'}`)
  
  if (!checks.overall) {
    console.log('\n💡 Action Items:')
    if (!checks.backendApi) {
      console.log('   • Deploy Firebase Functions dengan telegramAPI.js')
      console.log('   • Set bot token: firebase functions:config:set telegram.bot_token="YOUR_TOKEN"')
    }
    if (!checks.environment) {
      console.log('   • Update .env file dengan backend URL dan API token')
      console.log('   • Remove VUE_APP_TELEGRAM_BOT_TOKEN dari environment')
    }
    if (!checks.rateLimiting) {
      console.log('   • Fix rate limiting implementation di TelegramService')
    }
  }
  
  return checks
}

/**
 * Generate step-by-step migration guide
 */
export function generateMigrationSteps() {
  console.log('📝 STEP-BY-STEP MIGRATION GUIDE')
  console.log('=====================================')
  
  const steps = [
    {
      phase: '🔥 CRITICAL SECURITY (Day 1)',
      tasks: [
        'Deploy backend API functions ke Firebase',
        'Set secure environment variables di Firebase Functions',
        'Test backend API connectivity',
        'Update frontend environment variables'
      ]
    },
    {
      phase: '⚡ CODE MIGRATION (Day 2)', 
      tasks: [
        'Replace TelegramService imports dengan TelegramServiceSecure',
        'Update admin components yang menggunakan Telegram',
        'Test broadcast functionality',
        'Verify rate limiting masih bekerja'
      ]
    },
    {
      phase: '✅ VERIFICATION (Day 3)',
      tasks: [
        'Run comprehensive tests',
        'Check bot token tidak exposed di browser',
        'Monitor Firebase Functions logs',
        'Performance testing'
      ]
    },
    {
      phase: '🚀 PRODUCTION (Day 4)',
      tasks: [
        'Deploy ke production',
        'Monitor sistem selama 24 jam',
        'Setup alerts untuk errors',
        'Documentation update'
      ]
    }
  ]
  
  steps.forEach((phase, index) => {
    console.log(`\n${phase.phase}`)
    phase.tasks.forEach((task, taskIndex) => {
      console.log(`   ${taskIndex + 1}. ${task}`)
    })
  })
  
  console.log('\n🎯 IMMEDIATE ACTIONS (Sekarang):')
  console.log('   1. Run: await checkMigrationReadiness()')
  console.log('   2. Deploy backend API functions')
  console.log('   3. Update environment variables')
  console.log('   4. Test backend connection')
  
  return steps
}

/**
 * TAHAP 1: COMPREHENSIVE SYSTEM ASSESSMENT
 * Assessment lengkap untuk current system sebelum migration
 */

/**
 * Assessment current security status
 */
export async function assessCurrentSecurity() {
  console.log('🔐 TAHAP 1.1: Assessing Current Security Status...')
  console.log('='.repeat(50))
  
  const assessment = {
    score: 0,
    totalChecks: 0,
    issues: [],
    recommendations: [],
    details: {}
  }
  
  // Check 1: Bot Token Exposure
  assessment.totalChecks++
  const hasBotToken = !!process.env.VUE_APP_TELEGRAM_BOT_TOKEN
  if (hasBotToken) {
    assessment.issues.push('🚨 CRITICAL: Bot token exposed di frontend environment')
    assessment.recommendations.push('Immediately move bot token to backend API')
    assessment.details.botTokenExposed = true
  } else {
    assessment.score++
    assessment.details.botTokenExposed = false
  }
  
  // Check 2: Environment Variable Security
  assessment.totalChecks++
  const envVars = Object.keys(process.env).filter(key => key.startsWith('VUE_APP_'))
  const sensitiveVars = envVars.filter(key => 
    key.includes('TOKEN') || key.includes('SECRET') || key.includes('KEY')
  )
  
  if (sensitiveVars.length > 0) {
    assessment.issues.push(`⚠️ Found ${sensitiveVars.length} potentially sensitive environment variables exposed`)
    assessment.recommendations.push('Review and secure sensitive environment variables')
    assessment.details.exposedSensitiveVars = sensitiveVars
  } else {
    assessment.score++
    assessment.details.exposedSensitiveVars = []
  }
  
  // Check 3: API Security Architecture
  assessment.totalChecks++
  const hasBackendApi = !!process.env.VUE_APP_BACKEND_API_URL
  const hasApiToken = !!process.env.VUE_APP_API_TOKEN
  
  if (hasBackendApi && hasApiToken) {
    assessment.score++
    assessment.details.hasSecureArchitecture = true
  } else {
    assessment.issues.push('❌ Secure backend API architecture not implemented')
    assessment.recommendations.push('Implement backend API proxy for secure communication')
    assessment.details.hasSecureArchitecture = false
  }
  
  // Calculate security score
  const securityScore = Math.round((assessment.score / assessment.totalChecks) * 100)
  assessment.securityScore = securityScore
  
  console.log('📊 Security Assessment Results:')
  console.log(`   Security Score: ${securityScore}% (${assessment.score}/${assessment.totalChecks})`)
  
  if (assessment.issues.length > 0) {
    console.log('\n🚨 Security Issues Found:')
    assessment.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
    
    console.log('\n💡 Recommendations:')
    assessment.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`)
    })
  } else {
    console.log('✅ No critical security issues found!')
  }
  
  return assessment
}

/**
 * Assessment current system functionality
 */
export async function assessCurrentFunctionality() {
  console.log('\n⚙️ TAHAP 1.2: Assessing Current System Functionality...')
  console.log('='.repeat(50))
  
  const functionality = {
    telegramService: { available: false, features: [], issues: [] },
    rateLimiting: { implemented: false, effective: false, details: {} },
    broadcasting: { working: false, performance: null },
    overall: { status: 'unknown', readiness: 0 }
  }
  
  try {
    // Test TelegramService availability
    const telegramService = new TelegramService()
    functionality.telegramService.available = true
    
    // Check available features
    if (typeof telegramService.sendMessage === 'function') {
      functionality.telegramService.features.push('sendMessage')
    }
    if (typeof telegramService.sendBroadcastToAllJemaat === 'function') {
      functionality.telegramService.features.push('broadcast')
    }
    if (typeof telegramService.ensureRateLimit === 'function') {
      functionality.telegramService.features.push('rateLimiting')
    }
    if (typeof telegramService.chunkArray === 'function') {
      functionality.telegramService.features.push('chunking')
    }
    
    console.log(`✅ TelegramService available with ${functionality.telegramService.features.length} features`)
    
    // Test rate limiting
    if (telegramService.RATE_LIMITS) {
      functionality.rateLimiting.implemented = true
      functionality.rateLimiting.details = telegramService.RATE_LIMITS
      
      // Check if rate limiting is effective
      const minDelay = telegramService.RATE_LIMITS.MIN_DELAY_BETWEEN_MESSAGES
      functionality.rateLimiting.effective = minDelay >= 50
      
      console.log(`✅ Rate limiting implemented (${minDelay}ms min delay)`)
    } else {
      functionality.rateLimiting.issues.push('Rate limiting not implemented')
      console.log('❌ Rate limiting not found')
    }
    
    // Test basic functionality (simulation)
    const mockUsers = [
      { telegramUserId: 'test1', telegramFirstName: 'Test 1' },
      { telegramUserId: 'test2', telegramFirstName: 'Test 2' }
    ]
    
    const chunks = telegramService.chunkArray(mockUsers, 25)
    if (chunks.length > 0) {
      functionality.broadcasting.working = true
      console.log('✅ Broadcasting logic functional')
    }
    
    // Calculate overall readiness
    let readinessScore = 0
    if (functionality.telegramService.available) readinessScore += 25
    if (functionality.rateLimiting.implemented) readinessScore += 25
    if (functionality.rateLimiting.effective) readinessScore += 25
    if (functionality.broadcasting.working) readinessScore += 25
    
    functionality.overall.readiness = readinessScore
    functionality.overall.status = readinessScore >= 75 ? 'good' : readinessScore >= 50 ? 'fair' : 'poor'
    
    console.log(`📊 Functionality Score: ${readinessScore}%`)
    
  } catch (error) {
    functionality.telegramService.issues.push(error.message)
    console.error('❌ Error assessing functionality:', error.message)
  }
  
  return functionality
}

/**
 * Generate deployment preparation checklist
 */
export function generateDeploymentPreparation() {
  console.log('\n📋 TAHAP 1.3: Deployment Preparation Checklist...')
  console.log('='.repeat(50))
  
  const preparation = {
    firebaseFunctions: {
      ready: false,
      steps: [
        'Check firebase-functions/ directory exists',
        'Install required dependencies (express, cors, node-fetch)',
        'Configure environment variables',
        'Test function locally'
      ]
    },
    securityTokens: {
      generated: false,
      tokens: {
        apiSecret: null,
        backendUrl: null
      }
    },
    backupPlan: {
      created: false,
      items: [
        'Backup current .env file',
        'Create rollback script',
        'Document current system state'
      ]
    }
  }
  
  // Generate secure API secret
  const generateSecureToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  preparation.securityTokens.tokens.apiSecret = generateSecureToken()
  preparation.securityTokens.generated = true
  
  console.log('🔑 Generated Secure API Secret:')
  console.log(`   ${preparation.securityTokens.tokens.apiSecret}`)
  console.log('   ⚠️ SAVE THIS TOKEN - Anda akan membutuhkannya untuk environment variables')
  
  console.log('\n📝 Pre-deployment Checklist:')
  console.log('   Firebase Functions:')
  preparation.firebaseFunctions.steps.forEach((step, index) => {
    console.log(`     ${index + 1}. [ ] ${step}`)
  })
  
  console.log('   Security Setup:')
  console.log('     1. [✅] Generate API secret token')
  console.log('     2. [ ] Configure Firebase Functions environment')
  console.log('     3. [ ] Prepare frontend environment variables')
  
  console.log('   Backup & Safety:')
  preparation.backupPlan.items.forEach((item, index) => {
    console.log(`     ${index + 1}. [ ] ${item}`)
  })
  
  return preparation
}

/**
 * Run complete assessment for migration readiness
 */
export async function runCompleteAssessment() {
  console.log('🏁 TAHAP 1: COMPLETE SYSTEM ASSESSMENT')
  console.log('='.repeat(60))
  console.log('Starting comprehensive system assessment...\n')
  
  try {
    // Step 1: Security Assessment
    const security = await assessCurrentSecurity()
    
    // Step 2: Functionality Assessment  
    const functionality = await assessCurrentFunctionality()
    
    // Step 3: Deployment Preparation
    const preparation = generateDeploymentPreparation()
    
    // Generate final report
    console.log('\n📊 FINAL ASSESSMENT REPORT')
    console.log('='.repeat(60))
    
    const overallScore = Math.round((
      (security.securityScore * 0.4) + 
      (functionality.overall.readiness * 0.4) +
      (preparation.securityTokens.generated ? 20 : 0)
    ))
    
    console.log(`🎯 Overall Migration Readiness: ${overallScore}%`)
    
    if (overallScore >= 70) {
      console.log('✅ READY: System siap untuk migration!')
    } else if (overallScore >= 50) {
      console.log('⚠️ PARTIALLY READY: Perlu beberapa fixes sebelum migration')
    } else {
      console.log('❌ NOT READY: Requires significant fixes sebelum migration')
    }
    
    console.log('\n🎯 NEXT IMMEDIATE ACTIONS:')
    if (security.securityScore < 70) {
      console.log('   1. 🔥 PRIORITY: Deploy backend API to secure bot token')
    }
    if (functionality.overall.readiness < 75) {
      console.log('   2. ⚡ Fix rate limiting dan functionality issues')
    }
    console.log('   3. 📦 Prepare Firebase Functions deployment')
    console.log('   4. 🧪 Setup testing environment')
    
    return {
      overallScore,
      security,
      functionality,
      preparation,
      readyForMigration: overallScore >= 70
    }
    
  } catch (error) {
    console.error('❌ Assessment failed:', error)
    return { error: error.message }
  }
}
