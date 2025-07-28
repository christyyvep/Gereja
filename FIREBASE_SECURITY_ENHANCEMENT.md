# FIREBASE SECURITY ENHANCEMENT
**Untuk Custom Authentication MyRajawali**

## 🎯 **Pendekatan Hybrid: Custom Auth + Firebase Security**

### **Opsi 1: Firebase Functions untuk Password Security**

```javascript
// File: functions/index.js (Firebase Functions)
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const bcrypt = require('bcrypt')

admin.initializeApp()
const db = admin.firestore()

// ===== PASSWORD SECURITY FUNCTIONS =====

// Function untuk hash password dengan Firebase security
exports.hashPassword = functions.https.onCall(async (data, context) => {
  const { password } = data
  
  // Validate input
  if (!password || password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Password minimal 6 karakter')
  }
  
  try {
    // Hash dengan bcrypt (lebih secure dari SHA256)
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    console.log('🔐 Password hashed successfully')
    return { hashedPassword }
  } catch (error) {
    console.error('❌ Error hashing password:', error)
    throw new functions.https.HttpsError('internal', 'Gagal mengenkripsi password')
  }
})

// Function untuk verify password
exports.verifyPassword = functions.https.onCall(async (data, context) => {
  const { password, hashedPassword } = data
  
  if (!password || !hashedPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'Password dan hash diperlukan')
  }
  
  try {
    const isValid = await bcrypt.compare(password, hashedPassword)
    
    console.log('🔍 Password verification:', isValid ? 'SUCCESS' : 'FAILED')
    return { isValid }
  } catch (error) {
    console.error('❌ Error verifying password:', error)
    throw new functions.https.HttpsError('internal', 'Gagal memverifikasi password')
  }
})

// ===== ADMIN SECURITY FUNCTIONS =====

// Secure role update (hanya admin yang bisa)
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User harus login')
  }
  
  const { userId, newRole, adminUserId } = data
  const validRoles = ['jemaat', 'gembala', 'admin']
  
  if (!validRoles.includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', `Role tidak valid: ${newRole}`)
  }
  
  try {
    // Verify admin permission
    const adminDoc = await db.collection('jemaat').doc(adminUserId).get()
    if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Hanya admin yang dapat mengubah role')
    }
    
    // Update user role
    await db.collection('jemaat').doc(userId).update({
      role: newRole,
      roleAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleAssignedBy: adminUserId
    })
    
    console.log(`✅ Role updated: ${userId} → ${newRole} by ${adminUserId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error updating role:', error)
    throw new functions.https.HttpsError('internal', 'Gagal mengupdate role')
  }
})

// ===== RATE LIMITING =====

// Rate limiting untuk login attempts
exports.checkLoginAttempts = functions.https.onCall(async (data, context) => {
  const { identifier } = data // nama atau IP
  const maxAttempts = 5
  const lockoutTime = 15 * 60 * 1000 // 15 menit
  
  try {
    const attemptsRef = db.collection('login_attempts').doc(identifier)
    const attemptsDoc = await attemptsRef.get()
    
    if (attemptsDoc.exists) {
      const data = attemptsDoc.data()
      const now = Date.now()
      
      // Check if still in lockout period
      if (data.lockedUntil && now < data.lockedUntil) {
        const remainingTime = Math.ceil((data.lockedUntil - now) / 1000 / 60)
        throw new functions.https.HttpsError(
          'permission-denied', 
          `Akun terkunci. Coba lagi dalam ${remainingTime} menit`
        )
      }
      
      // Reset if lockout period expired
      if (data.lockedUntil && now >= data.lockedUntil) {
        await attemptsRef.update({
          attempts: 0,
          lockedUntil: admin.firestore.FieldValue.delete()
        })
      }
      
      return { allowed: true, attempts: data.attempts || 0 }
    }
    
    return { allowed: true, attempts: 0 }
  } catch (error) {
    if (error.code) throw error // Re-throw HttpsError
    throw new functions.https.HttpsError('internal', 'Error checking login attempts')
  }
})

// Record failed login attempt
exports.recordFailedLogin = functions.https.onCall(async (data, context) => {
  const { identifier } = data
  const maxAttempts = 5
  const lockoutTime = 15 * 60 * 1000
  
  try {
    const attemptsRef = db.collection('login_attempts').doc(identifier)
    const attemptsDoc = await attemptsRef.get()
    
    let attempts = 1
    if (attemptsDoc.exists) {
      attempts = (attemptsDoc.data().attempts || 0) + 1
    }
    
    const updateData = {
      attempts: attempts,
      lastAttempt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    // Lock account if max attempts reached
    if (attempts >= maxAttempts) {
      updateData.lockedUntil = Date.now() + lockoutTime
    }
    
    await attemptsRef.set(updateData, { merge: true })
    
    return { attempts, locked: attempts >= maxAttempts }
  } catch (error) {
    console.error('❌ Error recording failed login:', error)
    throw new functions.https.HttpsError('internal', 'Error recording login attempt')
  }
})
```

### **Implementasi di Client (MyRajawali):**

```javascript
// File: src/services/auth.js
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app)
const hashPasswordFunction = httpsCallable(functions, 'hashPassword')
const verifyPasswordFunction = httpsCallable(functions, 'verifyPassword')

// Enhanced registration dengan Firebase security
export async function registerJemaat(nama, password, userData) {
  try {
    // 1. Validasi input (sama seperti sebelum)
    if (!nama || !password) {
      throw new Error('Nama dan password harus diisi')
    }

    // 2. Cek nama exists (sama seperti sebelum)
    const nameExists = await checkJemaatExists(nama)
    if (!nameExists) {
      throw new Error('Nama anda belum terdaftar, segera hubungi gembala/admin')
    }
    
    // 3. ENHANCED: Hash password dengan Firebase Functions
    const hashResult = await hashPasswordFunction({ password })
    const encryptedPassword = hashResult.data.hashedPassword
    
    // 4. Update data di Firestore
    await updateDoc(jemaatRef, {
      password: encryptedPassword,
      isRegistered: true,
      role: userData.role || 'jemaat',
      registeredAt: new Date(),
      passwordMethod: 'bcrypt_firebase' // Track hashing method
    })
    
    return true
  } catch (error) {
    throw error
  }
}

// Enhanced login dengan Firebase security
export async function loginJemaat(nama, password) {
  try {
    // 1-3. Same validation dan user finding
    const jemaatData = await findUserData(nama)
    
    // 4. ENHANCED: Verify password dengan Firebase Functions
    const verifyResult = await verifyPasswordFunction({ 
      password, 
      hashedPassword: jemaatData.password 
    })
    
    if (!verifyResult.data.isValid) {
      throw new Error('Password tidak sesuai')
    }
    
    // 5. Return user data (same as before)
    return await processUserLogin(jemaatData)
  } catch (error) {
    throw error
  }
}
```

## 🔐 **Opsi 2: Firebase Auth + Custom Data Structure**

Pakai Firebase Auth untuk security, tapi maintain custom data structure:

```javascript
// File: src/services/hybridAuth.js
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const auth = getAuth()

// Registration: Firebase Auth + Custom Firestore
export async function hybridRegisterJemaat(nama, password, userData) {
  try {
    // 1. Check if nama exists in custom collection
    const nameExists = await checkJemaatExists(nama)
    if (!nameExists) {
      throw new Error('Nama anda belum terdaftar')
    }
    
    // 2. Create Firebase Auth user (email generated from nama)
    const email = `${nama.toLowerCase().replace(/\s+/g, '')}@myrajawali.local`
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // 3. Update display name
    await updateProfile(firebaseUser, { displayName: nama })
    
    // 4. Update custom Firestore document with Firebase UID
    const docId = await getJemaatDocId(nama)
    await updateDoc(doc(db, 'jemaat', docId), {
      firebaseUID: firebaseUser.uid,
      email: email,
      isRegistered: true,
      registeredAt: new Date(),
      authMethod: 'firebase_custom_hybrid',
      ...userData
    })
    
    return { firebaseUser, customData: userData }
  } catch (error) {
    throw error
  }
}

// Login: Firebase Auth + Custom Data
export async function hybridLoginJemaat(nama, password) {
  try {
    // 1. Get custom user data first
    const customUserData = await getCustomUserData(nama)
    if (!customUserData || !customUserData.email) {
      throw new Error('User not found')
    }
    
    // 2. Login dengan Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      customUserData.email, 
      password
    )
    
    // 3. Combine Firebase user dengan custom data
    const userData = {
      id: customUserData.id,
      firebaseUID: userCredential.user.uid,
      nama: customUserData.nama,
      role: customUserData.role,
      sektor: customUserData.sektor,
      // Firebase security data
      email: userCredential.user.email,
      emailVerified: userCredential.user.emailVerified,
      lastLoginAt: new Date()
    }
    
    return userData
  } catch (error) {
    throw error
  }
}
```

## 🔐 **Opsi 3: Firebase Security Rules + Custom Auth**

Pakai Firestore Security Rules untuk database protection:

```javascript
// File: firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Custom function untuk check admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/jemaat/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Custom function untuk check user ownership
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Jemaat collection rules
    match /jemaat/{userId} {
      // User can read own data
      allow read: if isOwner(userId);
      
      // Admin can read all
      allow read: if isAdmin();
      
      // User can update own profile (excluding sensitive fields)
      allow update: if isOwner(userId) && 
                    !('role' in request.resource.data) &&
                    !('password' in request.resource.data);
      
      // Only admin can update roles
      allow update: if isAdmin();
    }
    
    // Admin only collections
    match /admin_activities/{docId} {
      allow read, write: if isAdmin();
    }
    
    // User activities (users can create, admin can read all)
    match /user_activities/{docId} {
      allow create: if request.auth != null;
      allow read: if isAdmin() || isOwner(resource.data.userId);
    }
  }
}
```

## 🛡️ **Opsi 4: Firebase App Check untuk Security**

Tambahkan App Check untuk melindungi dari abuse:

```javascript
// File: src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const app = initializeApp(firebaseConfig)

// Initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
})

export { app, appCheck }
```

## 📊 **Perbandingan Opsi:**

| **Opsi** | **Kelebihan** | **Kekurangan** | **Effort** |
|----------|---------------|----------------|------------|
| **Hybrid Functions** | Security terbaik, minimal change | Butuh Firebase Functions | Medium |
| **Firebase Auth + Custom** | Built-in security, email management | Major refactor needed | High |
| **Security Rules** | Database protection, real-time | Custom auth tetap vulnerable | Low |
| **App Check** | Abuse protection, easy setup | Hanya proteksi dari bot | Very Low |

## 🎯 **Rekomendasi Implementation:**

### **Phase 1: Quick Win (App Check + Security Rules)**
```javascript
// Minimal effort, immediate security improvement
// 1. Setup App Check
// 2. Implement Firestore Security Rules
// 3. Keep existing custom auth
```

### **Phase 2: Password Enhancement (Firebase Functions)**
```javascript
// Medium effort, significant security boost
// 1. Deploy Firebase Functions untuk bcrypt
// 2. Migrate SHA256 → bcrypt gradually
// 3. Keep custom auth flow
```

### **Phase 3: Full Migration (Optional)**
```javascript
// High effort, enterprise-grade security
// 1. Migrate to Firebase Auth
// 2. Maintain custom data structure
// 3. Hybrid approach untuk backward compatibility
```

**Pilihan terbaik untuk MyRajawali: Mulai dengan Phase 1 (App Check + Security Rules), lalu Phase 2 (Firebase Functions untuk password) jika perlu security yang lebih ketat.**
