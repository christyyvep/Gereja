// Debug script untuk check user data di Firestore
import { db } from './src/services/firebase-security.js'
import { collection, getDocs, query, where } from 'firebase/firestore'

async function debugUserData() {
  console.log('🔍 Checking existing user data in Firestore...')
  
  try {
    // Check jemaat collection
    const jemaatRef = collection(db, 'jemaat')
    const jemaatSnapshot = await getDocs(jemaatRef)
    
    console.log(`📋 Found ${jemaatSnapshot.size} users in jemaat collection:`)
    
    jemaatSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`👤 User: ${doc.id}`)
      console.log(`   - nama: ${data.nama}`)
      console.log(`   - password field exists: ${!!data.password}`)
      console.log(`   - password type: ${typeof data.password}`)
      console.log(`   - password length: ${data.password ? data.password.length : 0}`)
      console.log(`   - created: ${data.createdAt || 'not set'}`)
      console.log(`   - role: ${data.role || 'not set'}`)
      console.log('   ---')
    })
    
    // Check specific admin user
    const adminQuery = query(jemaatRef, where('nama', '==', 'admin'))
    const adminSnapshot = await getDocs(adminQuery)
    
    if (adminSnapshot.empty) {
      console.log('❌ No admin user found!')
      console.log('💡 You may need to create an admin user first')
    } else {
      console.log('✅ Admin user found!')
      adminSnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('👤 Admin user details:')
        console.log('   Data:', data)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking user data:', error)
  }
}

// Run the debug
debugUserData()
