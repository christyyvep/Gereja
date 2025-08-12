// Quick Firebase Connection Test
// Paste this in browser console to test Firebase connection

(async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...')
  console.log('=' .repeat(40))
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('📡 Step 1: Checking Firebase initialization...')
    
    const { db } = await import('./src/services/firebase-security.js')
    if (db) {
      console.log('✅ Firebase database initialized successfully')
    } else {
      console.log('❌ Firebase database not initialized')
      return
    }
    
    // Test 2: Try to read from database
    console.log('📖 Step 2: Testing database read access...')
    
    const { collection, getDocs } = await import('firebase/firestore')
    
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    console.log(`✅ Database read successful! Found ${snapshot.size} users`)
    
    // Test 3: Look for Christy specifically
    console.log('🔍 Step 3: Looking for Christy...')
    
    let christyFound = false
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.nama && data.nama.toLowerCase().includes('christy')) {
        christyFound = true
        console.log(`✅ Found: "${data.nama}"`)
        console.log(`   - Has password: ${!!data.password}`)
        console.log(`   - Is registered: ${data.isRegistered}`)
        console.log(`   - Password format: ${data.password && data.password.includes(':') ? 'Hybrid (Good)' : 'Legacy (Needs update)'}`)
      }
    })
    
    if (!christyFound) {
      console.log('❌ Christy not found in database')
      console.log('📋 Available users:')
      snapshot.forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. ${data.nama || 'No name'}`)
      })
    }
    
    // Test 4: Test authentication service
    console.log('🔐 Step 4: Testing authentication service...')
    
    try {
      const { loginUser } = await import('./src/services/auth-hybrid.js')
      console.log('✅ Authentication service loaded successfully')
      
      if (christyFound) {
        console.log('🧪 All systems ready! You can now try logging in.')
        console.log('💡 Recommended login credentials:')
        console.log('   Username: Christy Potabuga')
        console.log('   Password: christy123')
      }
    } catch (authError) {
      console.log('❌ Authentication service error:', authError.message)
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    console.log('')
    console.log('💡 Troubleshooting:')
    console.log('   1. Check if Firebase rules are deployed')
    console.log('   2. Verify Firebase project configuration')
    console.log('   3. Check network connectivity')
    console.log('   4. Try refreshing the page')
  }
})()

console.log('🚀 Firebase connection test started...')
