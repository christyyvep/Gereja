// Enhanced Firebase configuration with Functions
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

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
const functions = getFunctions(app)

// ===== FIREBASE APP CHECK SETUP =====
// Initialize App Check untuk proteksi abuse
let appCheck = null
try {
  // Note: Ganti dengan reCAPTCHA site key yang sebenarnya
  // Get from: https://console.cloud.google.com/security/recaptcha
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeHZ-4UAAAAAGCGNHk5-0_Wc8xFqnF5i2e6l7xD'), // Example key
    isTokenAutoRefreshEnabled: true
  })
  console.log('✅ [Firebase] App Check initialized')
} catch (error) {
  console.warn('⚠️ [Firebase] App Check failed to initialize:', error)
}

// ===== DEVELOPMENT SETUP =====
if (process.env.NODE_ENV === 'development') {
  // Connect to Functions emulator in development
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('🔧 [Firebase] Connected to Functions emulator')
  } catch (error) {
    console.log('ℹ️ [Firebase] Functions emulator not available, using production')
  }
}

// ===== CONNECTION TEST =====
async function ensureCollectionsExist() {
  try {
    console.log('🔍 [Firebase] Checking Firebase connection...')
    console.log('🔍 [Firebase] Project ID:', firebaseConfig.projectId)
    
    // Test connection dengan App Check
    const jemaatRef = collection(db, 'jemaat')
    const jemaatSnapshot = await getDocs(jemaatRef)
    
    console.log('👥 [Firebase] Jemaat collection check:', {
      exists: !jemaatSnapshot.empty,
      size: jemaatSnapshot.size,
      projectId: firebaseConfig.projectId,
      appCheckEnabled: !!appCheck
    })
    
    // Test news collection
    const newsRef = collection(db, 'news')
    const newsSnapshot = await getDocs(newsRef)
    
    console.log('📰 [Firebase] News collection check:', {
      exists: !newsSnapshot.empty,
      size: newsSnapshot.size
    })
    
    if (jemaatSnapshot.empty) {
      console.warn('⚠️ [Firebase] Jemaat collection is empty!')
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

export { app, auth, db, functions, appCheck }
