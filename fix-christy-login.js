// Fix Christy Login Issue - Debug & Migration Script
// Run this in browser console to diagnose and fix the login issue

import { db } from './src/services/firebase-security.js'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import CryptoJS from 'crypto-js'

// Password hashing function (same as hybrid auth)
function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
  return salt.toString() + ':' + hash.toString()
}

// Main diagnostic and fix function
async function fixChristyLogin() {
  console.log('🔍 Diagnosing Christy login issue...')
  
  try {
    // 1. Check all users in database
    console.log('📋 Step 1: Checking all users...')
    const jemaatRef = collection(db, 'jemaat')
    const allSnapshot = await getDocs(jemaatRef)
    
    console.log(`Found ${allSnapshot.size} total users:`)
    
    const allUsers = []
    allSnapshot.forEach((doc) => {
      const data = doc.data()
      allUsers.push({
        id: doc.id,
        nama: data.nama,
        hasPassword: !!data.password,
        isRegistered: data.isRegistered,
        role: data.role || 'jemaat',
        passwordType: data.password && data.password.includes(':') ? 'hybrid' : 'legacy'
      })
    })
    
    // Display all users
    allUsers.forEach(user => {
      console.log(`👤 ${user.nama}:`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Has password: ${user.hasPassword}`)
      console.log(`   - Is registered: ${user.isRegistered}`)
      console.log(`   - Role: ${user.role}`)
      console.log(`   - Password type: ${user.passwordType}`)
      console.log('   ---')
    })
    
    // 2. Look for Christy specifically (case-insensitive)
    console.log('🔍 Step 2: Looking for Christy (case-insensitive)...')
    
    const christyVariations = [
      'Christy Potabuga',
      'christy potabuga', 
      'CHRISTY POTABUGA',
      'Christy potabuga',
      'christy Potabuga'
    ]
    
    let christyUser = null
    
    // Check each variation
    for (const variation of christyVariations) {
      const foundUser = allUsers.find(user => 
        user.nama.toLowerCase() === variation.toLowerCase()
      )
      if (foundUser) {
        christyUser = foundUser
        console.log(`✅ Found Christy as: "${foundUser.nama}"`)
        break
      }
    }
    
    if (!christyUser) {
      console.log('❌ Christy not found in database!')
      console.log('💡 Available users:')
      allUsers.forEach(user => console.log(`   - "${user.nama}"`))
      return { success: false, reason: 'user_not_found' }
    }
    
    // 3. Check if Christy needs migration
    console.log('🔧 Step 3: Checking if Christy needs migration...')
    
    if (!christyUser.isRegistered || christyUser.passwordType === 'legacy') {
      console.log('🔄 Christy needs migration to hybrid auth...')
      
      // Get the actual document
      const christyDoc = allSnapshot.docs.find(doc => doc.id === christyUser.id)
      
      // Migrate to hybrid auth
      const newPassword = 'christy123' // Default password
      const hashedPassword = hashPassword(newPassword)
      
      await updateDoc(doc(db, 'jemaat', christyUser.id), {
        password: hashedPassword,
        isRegistered: true,
        isActive: true,
        role: christyUser.role || 'jemaat',
        migratedAt: new Date(),
        migratedFrom: 'legacy_system',
        updatedAt: new Date()
      })
      
      console.log('✅ Christy successfully migrated!')
      console.log(`🔑 New password: ${newPassword}`)
      
      return {
        success: true,
        reason: 'migrated',
        userName: christyUser.nama,
        newPassword: newPassword
      }
    } else {
      console.log('✅ Christy is already properly configured for hybrid auth')
      return {
        success: true,
        reason: 'already_configured',
        userName: christyUser.nama
      }
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error)
    return { success: false, error: error.message }
  }
}

// Test login function
async function testChristyLogin() {
  console.log('🧪 Testing Christy login...')
  
  try {
    // Import login function
    const { loginUser } = await import('./src/services/auth-hybrid.js')
    
    // Test with default password
    const result = await loginUser('Christy Potabuga', 'christy123')
    
    console.log('✅ Login test successful!', result)
    return result
    
  } catch (error) {
    console.error('❌ Login test failed:', error)
    return { success: false, error: error.message }
  }
}

// Export functions for console use
if (typeof window !== 'undefined') {
  window.fixChristyLogin = fixChristyLogin
  window.testChristyLogin = testChristyLogin
}

console.log('🚀 Christy Login Fix script loaded!')
console.log('📋 Available functions:')
console.log('  - fixChristyLogin() - Diagnose and fix the issue')
console.log('  - testChristyLogin() - Test login after fix')
console.log('')
console.log('💡 Quick fix command:')
console.log('  fixChristyLogin().then(() => testChristyLogin())')
