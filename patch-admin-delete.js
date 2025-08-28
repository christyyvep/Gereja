// PATCH untuk memperbaiki masalah hapus renungan admin
// Jalankan di console browser untuk memperbaiki permissions

console.log('🔧 PATCHING ADMIN DELETE PERMISSIONS...')

// 1. Pastikan Firebase Auth signed in
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

const auth = getAuth()
const db = getFirestore()

// Auto sign in jika belum
if (!auth.currentUser) {
  console.log('🔐 Signing in to Firebase Auth...')
  await signInAnonymously(auth)
}

// 2. Get current user dari localStorage
const currentUser = JSON.parse(localStorage.getItem('myrajawali_user') || 'null')

if (!currentUser) {
  console.error('❌ No user found in localStorage. Please login first.')
} else {
  console.log('👤 Current user:', currentUser.nama, '- Role:', currentUser.role)
  
  // 3. Create/update auth session untuk Firebase security rules
  if (auth.currentUser) {
    const sessionData = {
      sessionId: 'patch-session-' + Date.now(),
      userId: currentUser.id,
      nama: currentUser.nama,
      role: currentUser.role,
      jemaatId: currentUser.id,
      loginAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      lastActivity: new Date(),
      uid: auth.currentUser.uid,
      isAdmin: currentUser.role === 'admin' || currentUser.role === 'gembala',
      permissions: ['devotional_delete', 'news_delete', 'all_admin_actions']
    }
    
    try {
      const authSessionRef = doc(db, 'auth_sessions', auth.currentUser.uid)
      await setDoc(authSessionRef, sessionData, { merge: true })
      console.log('✅ Auth session updated for Firebase security rules')
      
      // 4. Update localStorage session
      localStorage.setItem('myrajawali_session', JSON.stringify(sessionData))
      console.log('✅ Local session updated')
      
      // 5. Test permissions
      console.log('🧪 Testing devotional read access...')
      const testQuery = query(collection(db, 'devotionals'), limit(1))
      const snapshot = await getDocs(testQuery)
      console.log(`✅ Read test: ${snapshot.size} devotionals accessible`)
      
      console.log('🎉 PATCH COMPLETE! Admin should now be able to delete renungan.')
      console.log('🔄 Refresh halaman admin jika diperlukan.')
      
    } catch (error) {
      console.error('❌ Error updating auth session:', error)
    }
  } else {
    console.error('❌ Firebase Auth required for security rules')
  }
}
