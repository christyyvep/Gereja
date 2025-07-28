// QUICK FIX COMMANDS - Run these in browser console
// Copy and paste each command one by one

console.log('🚀 MyRajawali Hybrid Auth Quick Fix Commands')
console.log('================================================')

// 1. Clear all rate limiting and storage
function clearAllData() {
  localStorage.clear()
  sessionStorage.clear()
  // Clear rate limiting keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rate_limit_')) {
      localStorage.removeItem(key)
    }
  })
  console.log('✅ All data cleared')
}

// 2. Check current users in database
async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    // Import Firebase services
    const { db } = await import('/src/services/firebase-security.js')
    const { collection, getDocs, query, where } = await import('firebase/firestore')
    
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    console.log(`📋 Found ${snapshot.size} users:`)
    
    if (snapshot.empty) {
      console.log('❌ No users found in database!')
      console.log('💡 You need to create users first')
      return []
    }
    
    const users = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        nama: data.nama,
        hasPassword: !!data.password,
        isRegistered: data.isRegistered,
        role: data.role
      })
      
      console.log(`👤 ${data.nama}:`)
      console.log(`   - Has password: ${!!data.password}`)
      console.log(`   - Is registered: ${data.isRegistered}`)
      console.log(`   - Role: ${data.role}`)
    })
    
    return users
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
    return []
  }
}

// 3. Create admin user with correct hash
async function createAdmin() {
  try {
    console.log('👤 Creating admin user...')
    
    const { db } = await import('/src/services/firebase-security.js')
    const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore')
    const CryptoJS = (await import('crypto-js')).default
    
    // Hash password function
    function hashPassword(password) {
      const salt = CryptoJS.lib.WordArray.random(128/8)
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      })
      return salt.toString() + ':' + hash.toString()
    }
    
    // Check if admin exists
    const jemaatRef = collection(db, 'jemaat')
    const adminQuery = query(jemaatRef, where('nama', '==', 'admin'))
    const existing = await getDocs(adminQuery)
    
    if (!existing.empty) {
      console.log('⚠️ Admin already exists!')
      return existing.docs[0].id
    }
    
    // Create admin
    const adminData = {
      nama: 'admin',
      password: hashPassword('admin123'),
      role: 'admin',
      isRegistered: true,
      isActive: true,
      email: 'admin@myrajawali.com',
      createdAt: new Date(),
      lastLogin: null
    }
    
    const docRef = await addDoc(jemaatRef, adminData)
    console.log('✅ Admin created with ID:', docRef.id)
    
    return docRef.id
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    throw error
  }
}

// 4. Test login function
async function testLogin(nama = 'admin', password = 'admin123') {
  try {
    console.log(`🔐 Testing login: ${nama}`)
    
    const { loginUser } = await import('/src/services/auth-hybrid.js')
    const result = await loginUser(nama, password)
    
    console.log('✅ Login successful!', result)
    return result
    
  } catch (error) {
    console.error('❌ Login failed:', error.message)
    return null
  }
}

// Make functions available globally
window.clearAllData = clearAllData
window.checkUsers = checkUsers
window.createAdmin = createAdmin
window.testLogin = testLogin

console.log('')
console.log('📋 Available commands:')
console.log('1. clearAllData() - Clear all data and rate limits')
console.log('2. checkUsers() - Check existing users in database')
console.log('3. createAdmin() - Create admin user with correct password')
console.log('4. testLogin() - Test login with admin credentials')
console.log('')
console.log('💡 Suggested order:')
console.log('   1. clearAllData()')
console.log('   2. checkUsers()')
console.log('   3. createAdmin() (if no admin found)')
console.log('   4. testLogin()')
