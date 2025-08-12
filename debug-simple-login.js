// Simple Debug Login Test
// Paste this in browser console to test login directly

(async function debugLogin() {
  console.log('🐛 Starting Debug Login Test...')
  console.log('=' .repeat(40))
  
  try {
    // Test Firebase connection first
    console.log('📡 Step 1: Testing Firebase connection...')
    
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js')
    const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
    
    const firebaseConfig = {
      apiKey: "AIzaSyBtGgShLr_s_gqqDGhOEPmh5VfwZUJDHeY",
      authDomain: "myrajawali-app.firebaseapp.com", 
      projectId: "myrajawali-app",
      storageBucket: "myrajawali-app.appspot.com",
      messagingSenderId: "414682263250",
      appId: "1:414682263250:web:a0e1e2f3g4h5i6j7k8l9m0"
    }
    
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase connected')
    
    // Test finding Christy
    console.log('🔍 Step 2: Looking for Christy...')
    
    const jemaatRef = collection(db, 'jemaat')
    
    // Try exact search first
    const exactQuery = query(jemaatRef, where('nama', '==', 'christy potabuga'))
    let snapshot = await getDocs(exactQuery)
    
    if (snapshot.empty) {
      console.log('❌ Exact match not found, trying case-insensitive...')
      
      // Get all users and search manually
      const allSnapshot = await getDocs(jemaatRef)
      let foundUser = null
      
      allSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.nama && data.nama.toLowerCase().includes('christy')) {
          foundUser = { id: doc.id, ...data }
          console.log(`✅ Found user: "${data.nama}"`)
        }
      })
      
      if (!foundUser) {
        console.log('❌ Christy not found in any format')
        console.log('Available users:')
        allSnapshot.forEach(doc => {
          const data = doc.data()
          console.log(`  - ${data.nama || 'No name'}`)
        })
        return
      }
      
      // Test password verification
      console.log('🔐 Step 3: Testing password...')
      console.log(`User data:`, foundUser)
      console.log(`Has password: ${!!foundUser.password}`)
      console.log(`Is registered: ${foundUser.isRegistered}`)
      
      if (!foundUser.password) {
        console.log('❌ User has no password set')
        return
      }
      
      if (!foundUser.isRegistered) {
        console.log('❌ User is not registered')
        return
      }
      
      // Simple password check (assuming plain text for debugging)
      const testPassword = 'christy123'
      console.log(`Testing password: ${testPassword}`)
      
      if (foundUser.password === testPassword) {
        console.log('✅ Plain text password matches!')
      } else if (foundUser.password.includes(':')) {
        console.log('ℹ️ Password is hashed, need to verify with proper hash function')
      } else {
        console.log('❌ Password does not match')
        console.log(`Expected: ${testPassword}`)
        console.log(`Found: ${foundUser.password}`)
      }
      
      console.log('🎯 Debug completed. Check results above.')
      
    } else {
      console.log('✅ Exact match found!')
      snapshot.forEach(doc => {
        const data = doc.data()
        console.log('User data:', data)
      })
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
})()

console.log('🚀 Debug login test started...')
