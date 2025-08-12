// Complete Login Fix for Christy Potabuga
// Run this in browser console to fix all login issues

(async function completeLoginFix() {
  console.log('🔧 Complete Login Fix for Christy Potabuga')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Clear all existing sessions
    console.log('🧹 Step 1: Clearing all existing sessions...')
    localStorage.removeItem('myrajawali_session')
    localStorage.removeItem('myrajawali_user')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberedUser')
    sessionStorage.removeItem('recentLogin')
    console.log('✅ All sessions cleared')
    
    // Step 2: Test Firebase connection
    console.log('🔥 Step 2: Testing Firebase connection...')
    const { db } = await import('./src/services/firebase-security.js')
    const { collection, getDocs, doc, updateDoc, query, where } = await import('firebase/firestore')
    
    // Step 3: Find and fix Christy's account
    console.log('🔍 Step 3: Looking for Christy in database...')
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    console.log(`📋 Found ${snapshot.size} total users`)
    
    let christyDoc = null
    let christyData = null
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const nama = data.nama || ''
      
      // Check various spellings of Christy
      if (nama.toLowerCase().includes('christy') || 
          nama.toLowerCase().includes('kristy') ||
          nama.toLowerCase() === 'christy potabuga') {
        christyDoc = docSnap
        christyData = data
        console.log(`✅ Found user: "${nama}"`)
      }
    })
    
    if (!christyDoc) {
      console.log('❌ Christy not found! Creating new user...')
      
      // Import for user creation
      const { addDoc } = await import('firebase/firestore')
      
      // Hash password function
      const CryptoJS = await import('crypto-js')
      function hashPassword(password) {
        const salt = CryptoJS.lib.WordArray.random(128/8)
        const hash = CryptoJS.PBKDF2(password, salt, {
          keySize: 256/32,
          iterations: 10000
        })
        return salt.toString() + ':' + hash.toString()
      }
      
      // Create new Christy user
      const newUserData = {
        nama: 'Christy Potabuga',
        password: hashPassword('christy123'),
        isRegistered: true,
        isActive: true,
        role: 'jemaat',
        sektor: 'Sektor Umum',
        status: 'Single',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(jemaatRef, newUserData)
      console.log('✅ New user created with ID:', docRef.id)
      
    } else {
      console.log('🔧 Step 4: Updating Christy\'s account for hybrid auth...')
      
      // Hash password function
      const CryptoJS = await import('crypto-js')
      function hashPassword(password) {
        const salt = CryptoJS.lib.WordArray.random(128/8)
        const hash = CryptoJS.PBKDF2(password, salt, {
          keySize: 256/32,
          iterations: 10000
        })
        return salt.toString() + ':' + hash.toString()
      }
      
      // Update existing user
      const updateData = {
        password: hashPassword('christy123'),
        isRegistered: true,
        isActive: true,
        role: christyData.role || 'jemaat',
        updatedAt: new Date(),
        migratedAt: new Date(),
        migratedFrom: 'legacy_system'
      }
      
      await updateDoc(doc(db, 'jemaat', christyDoc.id), updateData)
      console.log('✅ User updated successfully')
    }
    
    // Step 5: Test login
    console.log('🧪 Step 5: Testing login...')
    
    try {
      const { loginUser } = await import('./src/services/auth-hybrid.js')
      
      const loginResult = await loginUser('Christy Potabuga', 'christy123')
      
      if (loginResult.success) {
        console.log('🎉 LOGIN TEST SUCCESSFUL!')
        console.log('✅ User:', loginResult.user.nama)
        console.log('✅ Role:', loginResult.user.role)
        console.log('✅ Session created successfully')
        
        console.log('')
        console.log('🎯 SOLUTION COMPLETE!')
        console.log('📋 Login credentials:')
        console.log('   Username: Christy Potabuga')
        console.log('   Password: christy123')
        console.log('')
        console.log('🔄 Please refresh the page and try logging in again')
        
        // Auto refresh after 3 seconds
        setTimeout(() => {
          window.location.reload()
        }, 3000)
        
      } else {
        console.log('❌ Login test failed:', loginResult.message)
      }
      
    } catch (loginError) {
      console.log('❌ Login test error:', loginError.message)
    }
    
  } catch (error) {
    console.error('❌ Complete fix failed:', error)
    console.log('')
    console.log('💡 Manual steps to try:')
    console.log('1. Refresh the page')
    console.log('2. Clear browser cache (Ctrl+Shift+Delete)')
    console.log('3. Try the HTML fix tool')
    console.log('4. Check browser console for specific error messages')
  }
})()

console.log('🚀 Starting complete login fix...')
