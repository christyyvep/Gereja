import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtGgShLr_s_gqqDGhOEPmh5VfwZUJDHeY",
  authDomain: "myrajawali-app.firebaseapp.com",
  projectId: "myrajawali-app",
  storageBucket: "myrajawali-app.appspot.com",
  messagingSenderId: "414682263250",
  appId: "1:414682263250:web:a0e1e2f3g4h5i6j7k8l9m0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)

// Ensure collections exist
async function ensureCollectionsExist() {
  try {
    console.log('🔍 [Firebase] Checking Firebase connection...')
    console.log('🔍 [Firebase] Project ID:', firebaseConfig.projectId)
    
    // Test news collection specifically
    const newsRef = collection(db, 'news')
    const newsSnapshot = await getDocs(newsRef)
    
    console.log('📰 [Firebase] News collection check:', {
      exists: !newsSnapshot.empty,
      size: newsSnapshot.size,
      projectId: firebaseConfig.projectId
    })
    
    if (newsSnapshot.empty) {
      console.warn('⚠️ [Firebase] News collection is empty!')
    } else {
      console.log('✅ [Firebase] News collection has', newsSnapshot.size, 'documents')
      
      // Log first news item for debugging
      const firstDoc = newsSnapshot.docs[0]
      if (firstDoc) {
        console.log('🔍 [Firebase] First news item:', {
          id: firstDoc.id,
          title: firstDoc.data().title,
          hasImages: !!firstDoc.data().images,
          hasThumbnails: !!firstDoc.data().thumbnails
        })
      }
    }
    
  } catch (error) {
    console.error('❌ [Firebase] Connection error:', error)
    console.error('❌ [Firebase] Error details:', {
      code: error.code,
      message: error.message,
      projectId: firebaseConfig.projectId
    })
  }
}

// Run collection check
ensureCollectionsExist()

export { app, auth, db }