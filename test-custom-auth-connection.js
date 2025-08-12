// Test Custom Authentication System Connection
// Untuk sistem autentikasi custom (nama + password di Firestore)

(async function testCustomAuthConnection() {
  console.log('🔐 Testing Custom Authentication System...')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check Firebase Firestore connection
    console.log('📡 Step 1: Checking Firestore connection...')
    
    const { db } = await import('./src/services/firebase-security.js')
    if (db) {
      console.log('✅ Firestore database connected')
    } else {
      console.log('❌ Firestore database not connected')
      return
    }
    
    // Test 2: Check jemaat collection access
    console.log('📖 Step 2: Testing jemaat collection access...')
    
    const { collection, getDocs } = await import('firebase/firestore')
    
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    console.log(`✅ Jemaat collection accessible! Found ${snapshot.size} users`)
    
    // Test 3: Check authentication service
    console.log('🔧 Step 3: Testing custom auth service...')
    
    try {
      const authService = await import('./src/services/auth-hybrid.js')
      console.log('✅ Custom authentication service loaded')
      console.log('Available functions:', Object.keys(authService))
    } catch (authError) {
      console.log('❌ Custom auth service error:', authError.message)
    }
    
    // Test 4: Check user data structure
    console.log('👥 Step 4: Checking user data structure...')
    
    let validUsers = 0
    let usersWithPassword = 0
    let christyFound = false
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      const hasName = data.nama && data.nama.trim() !== ''
      const hasPassword = data.password && data.password.trim() !== ''
      
      if (hasName) validUsers++
      if (hasPassword) usersWithPassword++
      
      if (data.nama && data.nama.toLowerCase().includes('christy')) {
        christyFound = true
        console.log(`✅ Found Christy: "${data.nama}"`)
        console.log(`   - Document ID: ${doc.id}`)
        console.log(`   - Has password: ${hasPassword}`)
        console.log(`   - Is registered: ${data.isRegistered || false}`)
        console.log(`   - Password format: ${data.password && data.password.includes(':') ? 'Hashed (Good)' : 'Plain/Legacy'}`)
      }
    })
    
    console.log(`📊 Summary:`)
    console.log(`   - Total documents: ${snapshot.size}`)
    console.log(`   - Users with names: ${validUsers}`)
    console.log(`   - Users with passwords: ${usersWithPassword}`)
    console.log(`   - Christy found: ${christyFound ? 'Yes' : 'No'}`)
    
    // Test 5: Test login function availability
    console.log('🧪 Step 5: Testing login functionality...')
    
    try {
      const { loginUser } = await import('./src/services/auth-hybrid.js')
      if (typeof loginUser === 'function') {
        console.log('✅ Login function available')
        console.log('🎯 Custom authentication system is ready!')
        
        if (christyFound) {
          console.log('')
          console.log('💡 Test login with:')
          console.log('   Name: Christy Potabuga (or similar)')
          console.log('   Password: christy123 (or as configured)')
        }
      } else {
        console.log('❌ Login function not available')
      }
    } catch (loginError) {
      console.log('❌ Login function error:', loginError.message)
    }
    
    // Test 6: Check hosting environment
    console.log('🌐 Step 6: Checking hosting environment...')
    
    const isHosted = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1'
    
    console.log(`Environment: ${isHosted ? 'Production (Hosted)' : 'Development (Local)'}`)
    console.log(`URL: ${window.location.href}`)
    
    if (isHosted) {
      console.log('✅ Running on hosted environment')
      console.log('🔍 Database should be accessible from hosting')
    } else {
      console.log('ℹ️ Running on local development')
    }
    
  } catch (error) {
    console.error('❌ Custom authentication test failed:', error)
    console.log('')
    console.log('💡 Troubleshooting:')
    console.log('   1. Check Firestore rules allow read access')
    console.log('   2. Verify Firebase project configuration')
    console.log('   3. Check network connectivity')
    console.log('   4. Ensure jemaat collection exists')
    console.log('   5. Try refreshing the page')
  }
})()

console.log('🚀 Custom authentication test started...')
