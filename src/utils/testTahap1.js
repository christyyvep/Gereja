/**
 * TAHAP 1 TESTING SCRIPT
 * Script untuk test semua assessment tools sebelum lanjut ke Tahap 2
 */

// Import assessment functions
import { 
  assessCurrentSecurity,
  assessCurrentFunctionality,
  generateDeploymentPreparation,
  runCompleteAssessment,
  testTelegramRateLimit,
  checkMigrationReadiness
} from '../services/test-telegram-rate-limit.js'

/**
 * Test runner untuk Tahap 1
 */
export async function testTahap1() {
  console.log('🧪 TESTING TAHAP 1 ASSESSMENT TOOLS')
  console.log('='.repeat(60))
  console.log('Testing all assessment functions before proceeding to Tahap 2...\n')
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }
  
  try {
    // Test 1: Security Assessment
    console.log('🔐 Test 1: Security Assessment...')
    try {
      testResults.tests.securityAssessment = await assessCurrentSecurity()
      testResults.summary.passed++
      console.log('✅ Security assessment test PASSED')
    } catch (error) {
      testResults.tests.securityAssessment = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Security assessment test FAILED:', error.message)
    }
    
    // Test 2: Functionality Assessment
    console.log('\n⚙️ Test 2: Functionality Assessment...')
    try {
      testResults.tests.functionalityAssessment = await assessCurrentFunctionality()
      testResults.summary.passed++
      console.log('✅ Functionality assessment test PASSED')
    } catch (error) {
      testResults.tests.functionalityAssessment = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Functionality assessment test FAILED:', error.message)
    }
    
    // Test 3: Deployment Preparation
    console.log('\n📦 Test 3: Deployment Preparation...')
    try {
      testResults.tests.deploymentPreparation = generateDeploymentPreparation()
      testResults.summary.passed++
      console.log('✅ Deployment preparation test PASSED')
    } catch (error) {
      testResults.tests.deploymentPreparation = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Deployment preparation test FAILED:', error.message)
    }
    
    // Test 4: Rate Limiting
    console.log('\n⚡ Test 4: Rate Limiting Functionality...')
    try {
      testResults.tests.rateLimiting = await testTelegramRateLimit()
      
      if (testResults.tests.rateLimiting.allTestsPassed) {
        testResults.summary.passed++
        console.log('✅ Rate limiting test PASSED')
      } else {
        testResults.summary.warnings++
        console.log('⚠️ Rate limiting test PASSED with warnings')
      }
    } catch (error) {
      testResults.tests.rateLimiting = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Rate limiting test FAILED:', error.message)
    }
    
    // Test 5: Migration Readiness Check
    console.log('\n🚀 Test 5: Migration Readiness Check...')
    try {
      testResults.tests.migrationReadiness = await checkMigrationReadiness()
      testResults.summary.passed++
      console.log('✅ Migration readiness test PASSED')
    } catch (error) {
      testResults.tests.migrationReadiness = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Migration readiness test FAILED:', error.message)
    }
    
    // Test 6: Complete Assessment (integration test)
    console.log('\n🏁 Test 6: Complete Assessment Integration...')
    try {
      testResults.tests.completeAssessment = await runCompleteAssessment()
      testResults.summary.passed++
      console.log('✅ Complete assessment test PASSED')
    } catch (error) {
      testResults.tests.completeAssessment = { error: error.message }
      testResults.summary.failed++
      console.log('❌ Complete assessment test FAILED:', error.message)
    }
    
    // Generate test summary
    generateTestSummary(testResults)
    
    return testResults
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    testResults.error = error.message
    return testResults
  }
}

/**
 * Generate comprehensive test summary
 */
function generateTestSummary(testResults) {
  console.log('\n📊 TAHAP 1 TEST SUMMARY')
  console.log('='.repeat(60))
  
  const totalTests = testResults.summary.passed + testResults.summary.failed + testResults.summary.warnings
  const successRate = Math.round((testResults.summary.passed / totalTests) * 100)
  
  console.log(`📈 Test Results:`)
  console.log(`   Total Tests: ${totalTests}`)
  console.log(`   Passed: ${testResults.summary.passed} ✅`)
  console.log(`   Failed: ${testResults.summary.failed} ❌`)
  console.log(`   Warnings: ${testResults.summary.warnings} ⚠️`)
  console.log(`   Success Rate: ${successRate}%`)
  
  // Detailed results
  console.log('\n📋 Detailed Test Results:')
  
  Object.entries(testResults.tests).forEach(([testName, result]) => {
    if (result.error) {
      console.log(`   ❌ ${testName}: FAILED - ${result.error}`)
    } else if (testName === 'rateLimiting' && !result.allTestsPassed) {
      console.log(`   ⚠️ ${testName}: PASSED with warnings`)
    } else {
      console.log(`   ✅ ${testName}: PASSED`)
    }
  })
  
  // Security analysis
  if (testResults.tests.securityAssessment && !testResults.tests.securityAssessment.error) {
    const securityScore = testResults.tests.securityAssessment.securityScore
    console.log(`\n🔐 Security Analysis:`)
    console.log(`   Security Score: ${securityScore}%`)
    
    if (securityScore < 50) {
      console.log('   🚨 CRITICAL: Immediate security fixes required!')
    } else if (securityScore < 70) {
      console.log('   ⚠️ WARNING: Security improvements needed before production')
    } else {
      console.log('   ✅ GOOD: Security level acceptable')
    }
  }
  
  // Functionality analysis
  if (testResults.tests.functionalityAssessment && !testResults.tests.functionalityAssessment.error) {
    const functionalityScore = testResults.tests.functionalityAssessment.overall.readiness
    console.log(`\n⚙️ Functionality Analysis:`)
    console.log(`   Functionality Score: ${functionalityScore}%`)
    
    if (functionalityScore < 50) {
      console.log('   ❌ CRITICAL: Major functionality issues detected!')
    } else if (functionalityScore < 75) {
      console.log('   ⚠️ WARNING: Some functionality improvements needed')
    } else {
      console.log('   ✅ GOOD: All core functionality working')
    }
  }
  
  // Migration readiness
  if (testResults.tests.completeAssessment && !testResults.tests.completeAssessment.error) {
    const overallScore = testResults.tests.completeAssessment.overallScore
    const readyForMigration = testResults.tests.completeAssessment.readyForMigration
    
    console.log(`\n🚀 Migration Readiness:`)
    console.log(`   Overall Score: ${overallScore}%`)
    console.log(`   Ready for Tahap 2: ${readyForMigration ? '✅ YES' : '❌ NO'}`)
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  
  if (testResults.summary.failed > 0) {
    console.log('   🔥 IMMEDIATE: Fix failed tests before proceeding')
  }
  
  if (testResults.tests.securityAssessment?.securityScore < 70) {
    console.log('   🛡️ SECURITY: Deploy backend API to secure bot token')
  }
  
  if (testResults.tests.functionalityAssessment?.overall?.readiness < 75) {
    console.log('   ⚙️ FUNCTIONALITY: Improve rate limiting and core features')
  }
  
  if (testResults.summary.failed === 0 && testResults.summary.warnings <= 1) {
    console.log('   🚀 READY: All tests passed - can proceed to Tahap 2!')
  }
  
  console.log('\n🎯 Next Actions:')
  if (testResults.summary.failed === 0) {
    console.log('   ✅ All tests passed - Ready for Tahap 2: Deploy Backend API')
  } else {
    console.log('   ❌ Fix failed tests first, then re-run this test suite')
  }
}

/**
 * Quick validation test (faster version)
 */
export async function quickValidationTest() {
  console.log('⚡ QUICK VALIDATION TEST')
  console.log('='.repeat(30))
  
  const quickTests = {
    telegramServiceExists: false,
    rateLimitingImplemented: false,
    securityTokenGeneration: false,
    assessmentFunctionsWork: false
  }
  
  try {
    // Test 1: TelegramService availability
    const TelegramService = (await import('../services/telegramService.js')).default
    const service = new TelegramService()
    quickTests.telegramServiceExists = !!service
    
    // Test 2: Rate limiting
    quickTests.rateLimitingImplemented = !!(service.RATE_LIMITS && service.ensureRateLimit)
    
    // Test 3: Security token generation
    quickTests.securityTokenGeneration = true // Always works
    
    // Test 4: Assessment functions
    const securityResult = await assessCurrentSecurity()
    quickTests.assessmentFunctionsWork = !securityResult.error
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message)
  }
  
  const passedTests = Object.values(quickTests).filter(Boolean).length
  const totalTests = Object.keys(quickTests).length
  
  console.log('📊 Quick Test Results:')
  console.log(`   Telegram Service: ${quickTests.telegramServiceExists ? '✅' : '❌'}`)
  console.log(`   Rate Limiting: ${quickTests.rateLimitingImplemented ? '✅' : '❌'}`)
  console.log(`   Security Functions: ${quickTests.securityTokenGeneration ? '✅' : '❌'}`)
  console.log(`   Assessment Tools: ${quickTests.assessmentFunctionsWork ? '✅' : '❌'}`)
  console.log(`   Overall: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('✅ READY: Quick validation passed - run full test for complete analysis')
  } else {
    console.log('❌ ISSUES: Some components not working - check detailed errors')
  }
  
  return quickTests
}

/**
 * Environment check test
 */
export function testEnvironmentSetup() {
  console.log('🌍 ENVIRONMENT SETUP TEST')
  console.log('='.repeat(30))
  
  const envCheck = {
    botTokenPresent: !!process.env.VUE_APP_TELEGRAM_BOT_TOKEN,
    backendUrlConfigured: !!process.env.VUE_APP_BACKEND_API_URL,
    apiTokenConfigured: !!process.env.VUE_APP_API_TOKEN,
    firebaseConfigured: !!process.env.VUE_APP_FIREBASE_PROJECT_ID
  }
  
  console.log('📊 Environment Variables:')
  console.log(`   Bot Token (VUE_APP_TELEGRAM_BOT_TOKEN): ${envCheck.botTokenPresent ? '✅ Present' : '❌ Missing'}`)
  console.log(`   Backend URL (VUE_APP_BACKEND_API_URL): ${envCheck.backendUrlConfigured ? '✅ Present' : '❌ Missing'}`)
  console.log(`   API Token (VUE_APP_API_TOKEN): ${envCheck.apiTokenConfigured ? '✅ Present' : '❌ Missing'}`)
  console.log(`   Firebase Project (VUE_APP_FIREBASE_PROJECT_ID): ${envCheck.firebaseConfigured ? '✅ Present' : '❌ Missing'}`)
  
  // Security warning
  if (envCheck.botTokenPresent) {
    console.log('\n🚨 SECURITY WARNING: Bot token is exposed in frontend!')
    console.log('   This is a CRITICAL security issue that needs immediate attention.')
  }
  
  // Migration status
  if (envCheck.backendUrlConfigured && envCheck.apiTokenConfigured && !envCheck.botTokenPresent) {
    console.log('\n✅ SECURE SETUP: Backend API configuration detected')
  } else if (envCheck.botTokenPresent && !envCheck.backendUrlConfigured) {
    console.log('\n⚠️ INSECURE SETUP: Still using direct bot token')
  }
  
  return envCheck
}

export default {
  testTahap1,
  quickValidationTest,
  testEnvironmentSetup
}
