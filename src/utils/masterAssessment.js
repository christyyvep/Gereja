/**
 * TAHAP 1: MASTER ASSESSMENT RUNNER
 * Run semua assessment dan preparation untuk migration
 */

// Import all assessment functions
import { 
  runCompleteAssessment,
  assessCurrentSecurity,
  assessCurrentFunctionality,
  generateDeploymentPreparation
} from '../services/test-telegram-rate-limit.js'

import {
  createSystemBackup,
  generateRollbackScript,
  validateFirebaseSetup
} from './systemBackup.js'

import {
  runPreDeploymentCheck,
  generateDeploymentCommands
} from './deploymentPreparation.js'

/**
 * MASTER FUNCTION: Run complete Tahap 1 assessment
 */
export async function runTahap1Assessment() {
  console.log('🎯 MASTER ASSESSMENT: TAHAP 1 PREPARATION')
  console.log('='.repeat(70))
  console.log('Starting complete system assessment and preparation...\n')
  
  const results = {
    timestamp: new Date().toISOString(),
    phase: 'TAHAP_1_PREPARATION',
    assessments: {},
    preparation: {},
    recommendations: [],
    nextSteps: [],
    readyForTahap2: false
  }
  
  try {
    // Step 1: Run complete system assessment
    console.log('🔍 Running complete system assessment...')
    results.assessments.complete = await runCompleteAssessment()
    
    // Step 2: Create system backup
    console.log('\n💾 Creating system backup...')
    results.preparation.backup = createSystemBackup()
    
    if (results.preparation.backup.success) {
      results.preparation.rollbackScript = generateRollbackScript(results.preparation.backup)
    }
    
    // Step 3: Validate Firebase setup
    console.log('\n🔥 Validating Firebase setup...')
    results.preparation.firebaseValidation = await validateFirebaseSetup()
    
    // Step 4: Run pre-deployment check
    console.log('\n🚀 Running pre-deployment check...')
    results.preparation.deploymentCheck = runPreDeploymentCheck()
    
    // Step 5: Generate deployment commands
    if (results.assessments.complete?.preparation?.securityTokens?.tokens?.apiSecret) {
      const botToken = process.env.VUE_APP_TELEGRAM_BOT_TOKEN
      const apiSecret = results.assessments.complete.preparation.securityTokens.tokens.apiSecret
      
      console.log('\n📝 Generating deployment commands...')
      results.preparation.deploymentCommands = generateDeploymentCommands(botToken, apiSecret)
    }
    
    // Step 6: Generate final recommendations
    console.log('\n📊 Generating final recommendations...')
    results.recommendations = generateFinalRecommendations(results)
    results.nextSteps = generateNextSteps(results)
    
    // Step 7: Determine readiness for Tahap 2
    results.readyForTahap2 = determineReadinessForTahap2(results)
    
    // Display final summary
    displayFinalSummary(results)
    
    return results
    
  } catch (error) {
    console.error('❌ Master assessment failed:', error)
    results.error = error.message
    return results
  }
}

/**
 * Generate final recommendations based on assessment results
 */
function generateFinalRecommendations(results) {
  const recommendations = []
  
  // Security recommendations
  if (results.assessments.complete?.security?.securityScore < 70) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Security',
      action: 'Deploy backend API immediately to secure bot token',
      reason: 'Bot token currently exposed in frontend'
    })
  }
  
  // Functionality recommendations
  if (results.assessments.complete?.functionality?.overall?.readiness < 75) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Functionality',
      action: 'Fix rate limiting implementation',
      reason: 'Current rate limiting may not be effective'
    })
  }
  
  // Firebase recommendations
  if (results.preparation.firebaseValidation?.issues?.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Infrastructure',
      action: 'Fix Firebase Functions setup',
      reason: 'Missing dependencies or configuration'
    })
  }
  
  // Deployment recommendations
  if (!results.preparation.deploymentCheck?.overall?.ready) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Deployment',
      action: 'Complete pre-deployment requirements',
      reason: 'Some deployment prerequisites not met'
    })
  }
  
  return recommendations
}

/**
 * Generate next steps based on assessment
 */
function generateNextSteps(results) {
  const steps = []
  
  if (results.readyForTahap2) {
    steps.push({
      phase: 'TAHAP_2',
      title: 'Deploy Backend API',
      description: 'System ready - proceed with backend deployment',
      estimated_time: '30-60 minutes'
    })
  } else {
    // Add fixes needed before Tahap 2
    if (results.assessments.complete?.security?.securityScore < 70) {
      steps.push({
        phase: 'FIX_REQUIRED',
        title: 'Fix Security Issues',
        description: 'Address critical security vulnerabilities first',
        estimated_time: '15-30 minutes'
      })
    }
    
    if (results.preparation.firebaseValidation?.issues?.length > 0) {
      steps.push({
        phase: 'FIX_REQUIRED', 
        title: 'Setup Firebase Functions',
        description: 'Complete Firebase Functions configuration',
        estimated_time: '15-30 minutes'
      })
    }
    
    steps.push({
      phase: 'RETRY_TAHAP_1',
      title: 'Re-run Assessment',
      description: 'Re-run Tahap 1 after fixes',
      estimated_time: '5-10 minutes'
    })
  }
  
  return steps
}

/**
 * Determine if system is ready for Tahap 2
 */
function determineReadinessForTahap2(results) {
  const securityScore = results.assessments.complete?.security?.securityScore || 0
  const functionalityScore = results.assessments.complete?.functionality?.overall?.readiness || 0
  const deploymentReady = results.preparation.deploymentCheck?.overall?.ready || false
  const backupCreated = results.preparation.backup?.success || false
  
  // Minimum requirements for Tahap 2
  const requirements = {
    securityMinimum: securityScore >= 33, // At least some security measures
    functionalityMinimum: functionalityScore >= 50, // Basic functionality working
    deploymentReady: deploymentReady,
    backupCreated: backupCreated
  }
  
  const passedRequirements = Object.values(requirements).filter(req => req).length
  const totalRequirements = Object.keys(requirements).length
  
  return passedRequirements >= Math.ceil(totalRequirements * 0.75) // 75% requirements met
}

/**
 * Display final summary
 */
function displayFinalSummary(results) {
  console.log('\n🏁 TAHAP 1 ASSESSMENT COMPLETE')
  console.log('='.repeat(70))
  
  const securityScore = results.assessments.complete?.security?.securityScore || 0
  const functionalityScore = results.assessments.complete?.functionality?.overall?.readiness || 0
  const overallScore = results.assessments.complete?.overallScore || 0
  
  console.log('📊 FINAL SCORES:')
  console.log(`   🔐 Security Score: ${securityScore}%`)
  console.log(`   ⚙️ Functionality Score: ${functionalityScore}%`)
  console.log(`   🎯 Overall Readiness: ${overallScore}%`)
  
  console.log(`\n🚀 READY FOR TAHAP 2: ${results.readyForTahap2 ? '✅ YES' : '❌ NO'}`)
  
  if (results.recommendations.length > 0) {
    console.log('\n🎯 CRITICAL RECOMMENDATIONS:')
    results.recommendations
      .filter(rec => rec.priority === 'CRITICAL')
      .forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.action}`)
        console.log(`      Reason: ${rec.reason}`)
      })
  }
  
  console.log('\n📋 NEXT STEPS:')
  results.nextSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. [${step.phase}] ${step.title}`)
    console.log(`      ${step.description} (${step.estimated_time})`)
  })
  
  if (results.preparation.backup?.success) {
    console.log(`\n💾 BACKUP CREATED: ${results.preparation.backup.backupDir}`)
    console.log('   Use rollback script if needed during migration')
  }
  
  console.log('\n🎯 TO PROCEED TO TAHAP 2:')
  if (results.readyForTahap2) {
    console.log('   ✅ System ready - you can proceed with backend deployment')
    console.log('   ✅ Run deployment commands that were generated')
  } else {
    console.log('   ❌ Please address the recommendations above first')
    console.log('   ❌ Re-run this assessment after fixes')
  }
}

/**
 * Quick status check function
 */
export async function quickStatusCheck() {
  console.log('⚡ QUICK STATUS CHECK')
  console.log('='.repeat(30))
  
  const status = {
    botTokenExposed: !!process.env.VUE_APP_TELEGRAM_BOT_TOKEN,
    backendConfigured: !!(process.env.VUE_APP_BACKEND_API_URL && process.env.VUE_APP_API_TOKEN),
    firebaseFunctionsReady: require('fs').existsSync('firebase-functions/telegramAPI.js'),
    backupExists: require('fs').existsSync('backup')
  }
  
  console.log('🔍 Current Status:')
  console.log(`   Bot Token Exposed: ${status.botTokenExposed ? '❌ YES (CRITICAL)' : '✅ NO'}`)
  console.log(`   Backend Configured: ${status.backendConfigured ? '✅ YES' : '❌ NO'}`)
  console.log(`   Functions Ready: ${status.firebaseFunctionsReady ? '✅ YES' : '❌ NO'}`)
  console.log(`   Backup Exists: ${status.backupExists ? '✅ YES' : '❌ NO'}`)
  
  const readyScore = Object.values(status).filter((val, index) => 
    index === 0 ? !val : val // Bot token exposed should be false
  ).length
  
  console.log(`\n📊 Ready Score: ${readyScore}/4`)
  
  return status
}

export default {
  runTahap1Assessment,
  quickStatusCheck
}
