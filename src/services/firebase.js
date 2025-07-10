import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtGgShLr_s_qgq0GhOEPmh5VfwZUJDHeY",
  authDomain: "myrajawali-app.firebaseapp.com",
  projectId: "myrajawali-app",
  storageBucket: "myrajawali-app.firebasestorage.app",
  messagingSenderId: "414682263250",
  appId: "1:414682263250:web:34750949198ce982da470b",
  measurementId: "G-527RS6C1S5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)

// Ensure collections exist
async function ensureCollectionsExist() {
  try {
    console.log('🔍 [Firebase] Checking required collections...')
    
    // Check streaks collection
    const streaksRef = collection(db, 'streaks')
    const streaksSnapshot = await getDocs(streaksRef)
    
    if (streaksSnapshot.empty) {
      console.log('📝 [Firebase] Creating streaks collection...')
      // Collection will be created automatically when first document is added
    } else {
      console.log('✅ [Firebase] Streaks collection exists')
    }
    
  } catch (error) {
    console.error('❌ [Firebase] Error checking collections:', error)
  }
}

// Run collection check
ensureCollectionsExist()

export { app, auth, db }