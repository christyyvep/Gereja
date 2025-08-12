// Create Admin User Script
// Run this in browser console to create admin user with correct password hash

import { db } from './src/services/firebase-security.js'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import CryptoJS from 'crypto-js'

// Password hashing function (sama seperti di auth-hybrid.js)
function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
  return salt.toString() + ':' + hash.toString()
}

async function createAdminUser() {
  try {
    console.log('🔑 Creating admin user...')
    
    // Check if admin already exists
    const jemaatRef = collection(db, 'jemaat')
    const adminQuery = query(jemaatRef, where('nama', '==', 'admin'))
    const existingAdmin = await getDocs(adminQuery)
    
    if (!existingAdmin.empty) {
      console.log('⚠️ Admin user already exists!')
      console.log('Existing admin data:')
      existingAdmin.forEach(doc => {
        console.log(doc.data())
      })
      return
    }
    
    // Create new admin user
    const adminData = {
      nama: 'admin',
      password: hashPassword('admin123'), // Hash the password
      role: 'admin',
      email: 'admin@myrajawali.com',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      lastLogin: null
    }
    
    const docRef = await addDoc(jemaatRef, adminData)
    console.log('✅ Admin user created with ID:', docRef.id)
    console.log('📋 Admin data:', adminData)
    console.log('🔐 Password hash:', adminData.password)
    
    return docRef.id
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

// Test password verification
function testPasswordVerification() {
  const testPassword = 'admin123'
  const hashedPassword = hashPassword(testPassword)
  
  console.log('🧪 Testing password verification:')
  console.log('Original password:', testPassword)
  console.log('Hashed password:', hashedPassword)
  
  // Verify function (sama seperti di auth-hybrid.js)
  function verifyPassword(password, storedHash) {
    try {
      const [salt, hash] = storedHash.split(':')
      const hashToVerify = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256/32,
        iterations: 10000
      })
      return hash === hashToVerify.toString()
    } catch (error) {
      console.error('Error verifying password:', error)
      return false
    }
  }
  
  const isValid = verifyPassword(testPassword, hashedPassword)
  console.log('Verification result:', isValid ? '✅ VALID' : '❌ INVALID')
  
  return isValid
}

// Export functions for use in console
window.createAdminUser = createAdminUser
window.testPasswordVerification = testPasswordVerification

console.log('🚀 Admin user creation script loaded!')
console.log('📋 Available functions:')
console.log('   - createAdminUser() - Create admin user')
console.log('   - testPasswordVerification() - Test password hashing')
