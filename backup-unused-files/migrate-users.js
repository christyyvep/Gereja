// Migration Script untuk Fix Existing Users dari Sistem Lama ke Hybrid Auth
// Jalankan script ini untuk update akun Christy Potabuga

import { db } from './src/services/firebase-security.js'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import CryptoJS from 'crypto-js'

// Password hashing function (sama seperti hybrid auth)
function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
  return salt.toString() + ':' + hash.toString()
}

/**
 * Migrate existing user dari sistem lama ke hybrid auth
 * @param {string} userName - Nama user yang akan di-migrate
 * @param {string} newPassword - Password baru untuk user
 */
export async function migrateUser(userName, newPassword) {
  try {
    console.log(`🔄 Migrating user: ${userName}`)
    
    // Find user by name
    const jemaatRef = collection(db, 'jemaat')
    const userQuery = query(jemaatRef, where('nama', '==', userName))
    const snapshot = await getDocs(userQuery)
    
    if (snapshot.empty) {
      throw new Error(`User ${userName} tidak ditemukan`)
    }
    
    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()
    
    console.log('📋 Current user data:', userData)
    
    // Update user dengan field hybrid auth yang diperlukan
    const updateData = {
      // Hash password baru dengan PBKDF2
      password: hashPassword(newPassword),
      
      // Set hybrid auth required fields
      isRegistered: true,
      isActive: true,
      
      // Preserve existing data
      role: userData.role || 'jemaat',
      email: userData.email || `${userName.toLowerCase().replace(' ', '.')}@myrajawali.com`,
      
      // Add migration metadata
      migratedAt: new Date(),
      migratedFrom: 'legacy_system',
      updatedAt: new Date(),
      
      // Preserve original data for reference
      originalData: userData
    }
    
    // Update document
    await updateDoc(doc(db, 'jemaat', userDoc.id), updateData)
    
    console.log('✅ User migration completed!')
    console.log('📋 Updated data:', updateData)
    console.log(`🔑 New password: ${newPassword}`)
    console.log(`🔐 Password hash: ${updateData.password}`)
    
    return {
      success: true,
      userId: userDoc.id,
      newPassword: newPassword,
      message: `User ${userName} berhasil di-migrate ke hybrid auth`
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    throw error
  }
}

/**
 * Migrate semua users di database ke hybrid auth
 * @param {string} defaultPassword - Default password untuk semua user
 */
export async function migrateAllUsers(defaultPassword = 'myrajawali2025') {
  try {
    console.log('🔄 Migrating all users to hybrid auth...')
    
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    if (snapshot.empty) {
      console.log('❌ No users found to migrate')
      return
    }
    
    const results = []
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data()
      const userName = userData.nama
      
      try {
        // Skip jika sudah di-migrate
        if (userData.isRegistered === true && userData.migratedAt) {
          console.log(`⏭️ Skipping ${userName} - already migrated`)
          continue
        }
        
        console.log(`🔄 Migrating: ${userName}`)
        
        // Generate password dari nama (atau gunakan default)
        const userPassword = userData.nama === 'Christy Potabuga' ? 'christy123' : defaultPassword
        
        const result = await migrateUser(userName, userPassword)
        results.push(result)
        
        console.log(`✅ ${userName} migrated successfully`)
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${userName}:`, error)
        results.push({
          success: false,
          userName: userName,
          error: error.message
        })
      }
    }
    
    console.log('🎉 Migration completed!')
    console.log('📊 Results:', results)
    
    return results
    
  } catch (error) {
    console.error('❌ Bulk migration error:', error)
    throw error
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.migrateUser = migrateUser
  window.migrateAllUsers = migrateAllUsers
}

console.log('🚀 Migration script loaded!')
console.log('📋 Available functions:')
console.log('  - migrateUser(userName, newPassword)')
console.log('  - migrateAllUsers(defaultPassword)')
console.log('')
console.log('💡 Quick fix untuk Christy:')
console.log('  migrateUser("Christy Potabuga", "christy123")')
