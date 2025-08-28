/**
 * TAHAP 1: BACKUP & SAFETY SCRIPTS
 * Scripts untuk backup current system sebelum migration
 */

import fs from 'fs'
import path from 'path'

/**
 * Create backup of current system state
 */
export function createSystemBackup() {
  console.log('💾 Creating system backup...')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backup', `pre-migration-${timestamp}`)
  
  const backup = {
    timestamp,
    backupDir,
    files: [],
    environment: {},
    success: false
  }
  
  try {
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Backup critical files
    const filesToBackup = [
      '.env',
      'src/services/telegramService.js',
      'src/services/simpleTelegramRegistration.js',
      'firebase-functions/index.js',
      'firebase-functions/package.json'
    ]
    
    filesToBackup.forEach(file => {
      const sourcePath = path.join(process.cwd(), file)
      if (fs.existsSync(sourcePath)) {
        const backupPath = path.join(backupDir, file.replace(/\//g, '_'))
        fs.copyFileSync(sourcePath, backupPath)
        backup.files.push({ original: file, backup: backupPath })
        console.log(`✅ Backed up: ${file}`)
      } else {
        console.log(`⚠️ File not found: ${file}`)
      }
    })
    
    // Backup environment variables
    backup.environment = {
      VUE_APP_TELEGRAM_BOT_TOKEN: process.env.VUE_APP_TELEGRAM_BOT_TOKEN || null,
      VUE_APP_BACKEND_API_URL: process.env.VUE_APP_BACKEND_API_URL || null,
      VUE_APP_API_TOKEN: process.env.VUE_APP_API_TOKEN || null,
      NODE_ENV: process.env.NODE_ENV || null
    }
    
    // Save backup manifest
    const manifestPath = path.join(backupDir, 'backup-manifest.json')
    fs.writeFileSync(manifestPath, JSON.stringify(backup, null, 2))
    
    backup.success = true
    console.log(`✅ Backup created successfully at: ${backupDir}`)
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    backup.error = error.message
  }
  
  return backup
}

/**
 * Generate rollback script
 */
export function generateRollbackScript(backupInfo) {
  console.log('🔄 Generating rollback script...')
  
  const rollbackScript = `#!/bin/bash
# ROLLBACK SCRIPT - Generated ${new Date().toISOString()}
# Use this script to rollback migration if needed

echo "🔄 Starting rollback process..."

# Restore backed up files
${backupInfo.files.map(file => 
  `cp "${file.backup}" "${file.original}"`
).join('\n')}

# Restore environment variables
cat > .env << 'EOF'
${Object.entries(backupInfo.environment)
  .filter(([key, value]) => value !== null)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}
EOF

echo "✅ Rollback completed!"
echo "🔄 Please restart your development server"
`
  
  const rollbackPath = path.join(backupInfo.backupDir, 'rollback.sh')
  fs.writeFileSync(rollbackPath, rollbackScript)
  fs.chmodSync(rollbackPath, '755') // Make executable
  
  console.log(`✅ Rollback script created: ${rollbackPath}`)
  
  return rollbackPath
}

/**
 * Validate Firebase project setup
 */
export async function validateFirebaseSetup() {
  console.log('🔥 Validating Firebase setup...')
  
  const validation = {
    firebaseConfigExists: false,
    functionsDirectoryExists: false,
    packageJsonExists: false,
    firebaseJsonExists: false,
    issues: [],
    recommendations: []
  }
  
  try {
    // Check firebase.json
    if (fs.existsSync('firebase.json')) {
      validation.firebaseJsonExists = true
      console.log('✅ firebase.json found')
    } else {
      validation.issues.push('firebase.json not found')
      validation.recommendations.push('Run: firebase init functions')
    }
    
    // Check functions directory
    if (fs.existsSync('firebase-functions')) {
      validation.functionsDirectoryExists = true
      console.log('✅ firebase-functions directory exists')
      
      // Check package.json in functions
      if (fs.existsSync('firebase-functions/package.json')) {
        validation.packageJsonExists = true
        console.log('✅ firebase-functions/package.json found')
        
        // Check if required dependencies exist
        const packageJson = JSON.parse(fs.readFileSync('firebase-functions/package.json', 'utf8'))
        const requiredDeps = ['firebase-functions', 'firebase-admin']
        const optionalDeps = ['express', 'cors']
        
        const missingRequired = requiredDeps.filter(dep => !packageJson.dependencies?.[dep])
        const missingOptional = optionalDeps.filter(dep => !packageJson.dependencies?.[dep])
        
        if (missingRequired.length > 0) {
          validation.issues.push(`Missing required dependencies: ${missingRequired.join(', ')}`)
        }
        
        if (missingOptional.length > 0) {
          validation.recommendations.push(`Install optional dependencies: npm install ${missingOptional.join(' ')}`)
        }
        
      } else {
        validation.issues.push('firebase-functions/package.json not found')
      }
    } else {
      validation.issues.push('firebase-functions directory not found')
      validation.recommendations.push('Create functions directory and setup')
    }
    
    console.log('📊 Firebase Setup Validation:')
    console.log(`   Issues: ${validation.issues.length}`)
    console.log(`   Recommendations: ${validation.recommendations.length}`)
    
    if (validation.issues.length > 0) {
      console.log('\n❌ Issues found:')
      validation.issues.forEach(issue => console.log(`   • ${issue}`))
    }
    
    if (validation.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      validation.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }
    
  } catch (error) {
    console.error('❌ Firebase validation failed:', error)
    validation.error = error.message
  }
  
  return validation
}

export default {
  createSystemBackup,
  generateRollbackScript,
  validateFirebaseSetup
}
