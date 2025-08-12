// Test koneksi database untuk hosted app
// Jalankan di browser console pada https://myrajawali-app.web.app

(async function testHostingConnection() {
  console.log('🌐 Testing MyRajawali Hosting Connection...')
  console.log('=' .repeat(50))
  
  try {
    // Tunggu sampai Firebase dimuat
    await new Promise(resolve => {
      if (window.firebase) {
        resolve()
      } else {
        const checkFirebase = setInterval(() => {
          if (window.firebase) {
            clearInterval(checkFirebase)
            resolve()
          }
        }, 100)
      }
    })
    
    console.log('🔥 Firebase loaded successfully')
    
    // Test koneksi ke Firestore
    const db = window.firebase.firestore()
    console.log('📊 Firestore instance created')
    
    // Test read data jemaat
    console.log('📖 Testing database read...')
    const jemaatSnapshot = await db.collection('jemaat').limit(5).get()
    
    if (jemaatSnapshot.empty) {
      console.log('⚠️  No data found in jemaat collection')
      console.log('💡 Database might be empty or rules are blocking access')
    } else {
      console.log(`✅ Successfully read ${jemaatSnapshot.size} records from jemaat collection`)
      
      // Show sample data
      jemaatSnapshot.forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. ${data.nama || 'No name'} - Registered: ${data.isRegistered || false}`)
      })
    }
    
    // Test authentication state
    console.log('🔐 Testing authentication state...')
    const auth = window.firebase.auth()
    const currentUser = auth.currentUser
    
    if (currentUser) {
      console.log(`✅ User logged in: ${currentUser.displayName || currentUser.email}`)
    } else {
      console.log('ℹ️  No user currently logged in')
    }
    
    console.log('🎉 Hosting connection test completed successfully!')
    console.log('🌐 App URL: https://myrajawali-app.web.app')
    console.log('📋 Console: https://console.firebase.google.com/project/myrajawali-app')
    
  } catch (error) {
    console.error('❌ Hosting connection test failed:', error)
    console.log('')
    console.log('🔧 Troubleshooting steps:')
    console.log('   1. Check if you have internet connection')
    console.log('   2. Verify Firebase project is active')
    console.log('   3. Check browser console for additional errors')
    console.log('   4. Try refreshing the page')
  }
})()

// Auto run test setelah 2 detik
setTimeout(() => {
  console.log('🚀 Starting hosting connection test...')
}, 2000)
