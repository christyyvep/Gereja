// Quick Database Check - Run this in browser console
// This will show all users in the database and identify the issue

(async function quickDatabaseCheck() {
  console.log('🔍 Quick Database Check for Christy Login Issue')
  console.log('=' .repeat(50))
  
  try {
    // Import Firebase services
    const { db } = await import('./src/services/firebase-security.js')
    const { collection, getDocs } = await import('firebase/firestore')
    
    console.log('📡 Connecting to Firebase...')
    
    // Get all users from jemaat collection
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    console.log(`📋 Found ${snapshot.size} users in database:`)
    console.log('')
    
    if (snapshot.empty) {
      console.log('❌ No users found in database!')
      console.log('💡 This means the database is empty or not connected properly')
      return
    }
    
    // List all users
    let christyFound = false
    snapshot.forEach((doc, index) => {
      const data = doc.data()
      const isChristy = data.nama && data.nama.toLowerCase().includes('christy')
      
      if (isChristy) {
        christyFound = true
        console.log(`🎯 FOUND CHRISTY: "${data.nama}"`)
      } else {
        console.log(`${index + 1}. ${data.nama || 'No name'}`)
      }
      
      if (isChristy) {
        console.log(`   📋 Full data:`)
        console.log(`   - ID: ${doc.id}`)
        console.log(`   - Password exists: ${!!data.password}`)
        console.log(`   - Password type: ${data.password && data.password.includes(':') ? 'Hybrid (secure)' : 'Old format'}`)
        console.log(`   - Is registered: ${data.isRegistered}`)
        console.log(`   - Role: ${data.role || 'jemaat'}`)
        console.log(`   - Is active: ${data.isActive}`)
        console.log('')
      }
    })
    
    if (!christyFound) {
      console.log('❌ Christy Potabuga not found!')
      console.log('💡 Possible reasons:')
      console.log('   1. Name is spelled differently in database')
      console.log('   2. User was not created yet')
      console.log('   3. Case sensitivity issue')
      console.log('')
      console.log('🔍 Try searching for similar names manually above')
    }
    
    console.log('')
    console.log('🛠️ What to do next:')
    if (christyFound) {
      console.log('   1. Run fixChristyLogin() to migrate user to hybrid auth')
      console.log('   2. Then try logging in with password: christy123')
    } else {
      console.log('   1. Check if the name is spelled exactly as shown above')
      console.log('   2. Or create a new user account')
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
    console.log('')
    console.log('💡 Possible issues:')
    console.log('   1. Firebase not properly initialized')
    console.log('   2. Network connection problem')
    console.log('   3. Authentication/permission issue')
  }
})()

console.log('🚀 Quick database check started...')
