/**
 * TAHAP 1: FIREBASE DEPLOYMENT PREPARATION
 * Script untuk prepare Firebase Functions deployment
 */

/**
 * Pre-deployment checklist and validation
 */
export function runPreDeploymentCheck() {
  console.log('🚀 TAHAP 1.4: Pre-deployment Validation...')
  console.log('='.repeat(50))
  
  const checks = {
    dependencies: { status: 'unknown', details: [] },
    firebaseConfig: { status: 'unknown', details: [] },
    environmentVars: { status: 'unknown', details: [] },
    codeStructure: { status: 'unknown', details: [] },
    overall: { ready: false, score: 0 }
  }
  
  // Check 1: Dependencies
  try {
    const packagePath = 'firebase-functions/package.json'
    if (require('fs').existsSync(packagePath)) {
      const pkg = JSON.parse(require('fs').readFileSync(packagePath, 'utf8'))
      const requiredDeps = [
        'firebase-functions',
        'firebase-admin', 
        'express',
        'cors',
        'node-fetch'
      ]
      
      const missing = requiredDeps.filter(dep => !pkg.dependencies[dep])
      
      if (missing.length === 0) {
        checks.dependencies.status = 'ready'
        checks.dependencies.details.push('All required dependencies present')
        checks.overall.score += 25
      } else {
        checks.dependencies.status = 'missing'
        checks.dependencies.details.push(`Missing: ${missing.join(', ')}`)
      }
    } else {
      checks.dependencies.status = 'error'
      checks.dependencies.details.push('package.json not found')
    }
  } catch (error) {
    checks.dependencies.status = 'error'
    checks.dependencies.details.push(error.message)
  }
  
  // Check 2: Firebase configuration
  try {
    if (require('fs').existsSync('firebase.json')) {
      checks.firebaseConfig.status = 'ready'
      checks.firebaseConfig.details.push('firebase.json exists')
      checks.overall.score += 25
    } else {
      checks.firebaseConfig.status = 'missing'
      checks.firebaseConfig.details.push('firebase.json not found')
    }
  } catch (error) {
    checks.firebaseConfig.status = 'error'
    checks.firebaseConfig.details.push(error.message)
  }
  
  // Check 3: Environment variables preparation
  const currentBotToken = process.env.VUE_APP_TELEGRAM_BOT_TOKEN
  if (currentBotToken) {
    checks.environmentVars.status = 'ready'
    checks.environmentVars.details.push('Bot token available for migration')
    checks.overall.score += 25
  } else {
    checks.environmentVars.status = 'missing'
    checks.environmentVars.details.push('Bot token not found in current environment')
  }
  
  // Check 4: Code structure
  try {
    const requiredFiles = [
      'firebase-functions/index.js',
      'firebase-functions/telegramAPI.js'
    ]
    
    const existingFiles = requiredFiles.filter(file => 
      require('fs').existsSync(file)
    )
    
    if (existingFiles.length === requiredFiles.length) {
      checks.codeStructure.status = 'ready'
      checks.codeStructure.details.push('All required files present')
      checks.overall.score += 25
    } else {
      checks.codeStructure.status = 'partial'
      checks.codeStructure.details.push(`${existingFiles.length}/${requiredFiles.length} files ready`)
      checks.overall.score += Math.round(25 * (existingFiles.length / requiredFiles.length))
    }
  } catch (error) {
    checks.codeStructure.status = 'error'
    checks.codeStructure.details.push(error.message)
  }
  
  // Overall readiness
  checks.overall.ready = checks.overall.score >= 75
  
  // Display results
  console.log('📊 Pre-deployment Check Results:')
  console.log(`   Overall Score: ${checks.overall.score}%`)
  console.log(`   Ready for deployment: ${checks.overall.ready ? '✅ YES' : '❌ NO'}`)
  
  console.log('\n📋 Detailed Results:')
  Object.entries(checks).forEach(([key, check]) => {
    if (key !== 'overall') {
      const icon = check.status === 'ready' ? '✅' : check.status === 'partial' ? '⚠️' : '❌'
      console.log(`   ${icon} ${key}: ${check.status}`)
      check.details.forEach(detail => console.log(`      • ${detail}`))
    }
  })
  
  return checks
}

/**
 * Generate deployment commands
 */
export function generateDeploymentCommands(botToken, apiSecret) {
  console.log('\n📝 TAHAP 1.5: Generated Deployment Commands...')
  console.log('='.repeat(50))
  
  const commands = {
    installation: [
      'cd firebase-functions',
      'npm install'
    ],
    configuration: [
      `firebase functions:config:set telegram.bot_token="${botToken}"`,
      `firebase functions:config:set api.secret="${apiSecret}"`
    ],
    deployment: [
      'firebase deploy --only functions'
    ],
    testing: [
      'firebase functions:log --only telegramAPI',
      'curl https://YOUR_PROJECT_ID.cloudfunctions.net/telegramAPI/health'
    ]
  }
  
  console.log('🔧 Installation Commands:')
  commands.installation.forEach(cmd => console.log(`   ${cmd}`))
  
  console.log('\n⚙️ Configuration Commands:')
  commands.configuration.forEach(cmd => console.log(`   ${cmd}`))
  
  console.log('\n🚀 Deployment Commands:')
  commands.deployment.forEach(cmd => console.log(`   ${cmd}`))
  
  console.log('\n🧪 Testing Commands:')
  commands.testing.forEach(cmd => console.log(`   ${cmd}`))
  
  console.log('\n⚠️ IMPORTANT NOTES:')
  console.log('   1. Replace YOUR_PROJECT_ID dengan Firebase project ID Anda')
  console.log('   2. Simpan API secret yang generated - Anda akan membutuhkannya')
  console.log('   3. Test health endpoint setelah deployment')
  console.log('   4. Monitor logs untuk memastikan function berjalan dengan baik')
  
  return commands
}

export default {
  runPreDeploymentCheck,
  generateDeploymentCommands
}
