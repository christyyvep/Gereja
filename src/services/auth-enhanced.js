/* eslint-disable */
// Enhanced Custom Authentication Service with Firebase Security
// IMPORTANT: This is ENHANCED CUSTOM AUTH, NOT Full Firebase Auth
// - Users still login with NAMA (not email)
// - User data stored in Firestore 'jemaat' collection  
// - Enhanced with bcrypt, rate limiting, and security monitoring
// - Backward compatible with existing system

import { 
  db, 
  functions, 
  securityConfig, 
  validatePassword, 
  checkPasswordStrength,
  checkRateLimit,
  handleFirebaseError,
  logSecurityEvent,
  updateSessionActivity
} from './firebase-security'
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

const COLLECTION_NAME = 'jemaat'

// ===== FIREBASE FUNCTIONS CALLABLE =====
const hashPasswordFunction = httpsCallable(functions, 'hashPassword')
const verifyPasswordFunction = httpsCallable(functions, 'verifyPassword')
const checkLoginAttemptsFunction = httpsCallable(functions, 'checkLoginAttempts')
const recordFailedLoginFunction = httpsCallable(functions, 'recordFailedLogin')
const updateUserRoleFunction = httpsCallable(functions, 'updateUserRole')

// ===== EXISTING FUNCTIONS (Enhanced) =====

/**
 * Mendapatkan semua nama jemaat untuk fitur autocomplete
 * @returns {Promise<Array>} Array berisi data nama jemaat
 */
export async function getAllJemaatNames() {
  try {
    console.log('📋 [AuthService] Getting all jemaat names...')
    
    const jemaatRef = collection(db, COLLECTION_NAME)
    const querySnapshot = await getDocs(jemaatRef)
    
    const namesList = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.nama) {
        namesList.push({
          id: doc.id,
          nama: data.nama,
          sektor: data.sektor || null,
          status: data.status || null,
          isRegistered: data.isRegistered || false
        })
      }
    })
    
    // Sort alphabetically
    namesList.sort((a, b) => a.nama.localeCompare(b.nama))
    
    console.log(`✅ [AuthService] Retrieved ${namesList.length} jemaat names`)
    return namesList
  } catch (error) {
    console.error('❌ [AuthService] Error getting jemaat names:', error)
    throw error
  }
}

/**
 * Mengecek apakah nama jemaat ada di database
 * @param {string} nama - Nama yang akan dicek
 * @returns {Promise<boolean>} True jika nama ditemukan
 */
export async function checkJemaatExists(nama) {
  try {
    console.log('🔍 [AuthService] Checking if jemaat exists:', nama)
    
    const jemaatRef = collection(db, COLLECTION_NAME)
    const q = query(jemaatRef, where('nama', '==', nama.trim()))
    const querySnapshot = await getDocs(q)
    
    const exists = !querySnapshot.empty
    console.log(`${exists ? '✅' : '❌'} [AuthService] Jemaat exists:`, exists)
    
    return exists
  } catch (error) {
    console.error('❌ [AuthService] Error checking jemaat existence:', error)
    return false
  }
}

/**
 * Mendapatkan document ID berdasarkan nama jemaat
 * @param {string} nama - Nama jemaat
 * @returns {Promise<string>} Document ID
 */
export async function getJemaatDocId(nama) {
  try {
    const jemaatRef = collection(db, COLLECTION_NAME)
    const q = query(jemaatRef, where('nama', '==', nama.trim()))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      throw new Error(`Jemaat dengan nama "${nama}" tidak ditemukan`)
    }
    
    return querySnapshot.docs[0].id
  } catch (error) {
    console.error('❌ [AuthService] Error getting jemaat doc ID:', error)
    throw error
  }
}

// ===== ENHANCED REGISTRATION dengan Firebase Functions =====

/**
 * Registrasi jemaat baru dengan Firebase Functions security
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @param {Object} userData - Data tambahan user
 * @returns {Promise<boolean>} Success status
 */
export async function registerJemaat(nama, password, userData) {
  try {
    console.log('🔐 [AuthService] Starting enhanced registration for:', nama)
    
    // 1. Input validation
    if (!nama || !password) {
      throw new Error('Nama dan password harus diisi')
    }
    
    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter')
    }
    
    if (!userData || typeof userData !== 'object') {
      throw new Error('Data user tidak valid')
    }
    
    // 2. Cek apakah nama exists
    const nameExists = await checkJemaatExists(nama)
    if (!nameExists) {
      throw new Error('Nama anda belum terdaftar, segera hubungi gembala/admin')
    }
    
    // 3. Get document reference
    const docId = await getJemaatDocId(nama)
    const jemaatRef = doc(db, COLLECTION_NAME, docId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      throw new Error('Data jemaat tidak ditemukan')
    }
    
    const jemaatData = jemaatDoc.data()
    
    // 4. Cek apakah sudah terdaftar
    if (jemaatData.isRegistered === true) {
      throw new Error('Akun dengan nama ini sudah terdaftar')
    }
    
    // 5. ✨ ENHANCED: Hash password dengan Firebase Functions (bcrypt)
    console.log('🔐 [AuthService] Hashing password with Firebase Functions...')
    const hashResult = await hashPasswordFunction({ password })
    const encryptedPassword = hashResult.data.hashedPassword
    
    // 6. Update data jemaat dengan enhanced security
    await updateDoc(jemaatRef, {
      password: encryptedPassword,
      isRegistered: true,
      tanggalLahir: userData.tanggalLahir,
      status: userData.status,
      sektor: userData.sektor,
      registeredAt: new Date(),
      
      // Enhanced security fields
      role: userData.role || 'jemaat',
      roleAssignedAt: new Date(),
      roleAssignedBy: 'registration',
      passwordMethod: 'bcrypt_firebase_functions', // Track hashing method
      securityVersion: '2.0' // Track security version
    })
    
    console.log(`✅ [AuthService] Enhanced registration successful for ${nama} with bcrypt security`)
    return true
  } catch (error) {
    console.error('❌ [AuthService] Registration error:', error)
    
    // Enhanced error handling
    if (error.code === 'functions/unavailable') {
      throw new Error('Layanan keamanan tidak tersedia. Silakan coba lagi nanti.')
    } else if (error.code === 'functions/internal') {
      throw new Error('Terjadi kesalahan sistem. Silakan hubungi administrator.')
    }
    
    throw error
  }
}

// ===== ENHANCED LOGIN dengan Rate Limiting =====

/**
 * Login jemaat dengan enhanced security
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @returns {Promise<Object>} Data user yang login
 */
export async function loginJemaat(nama, password) {
  try {
    console.log('🔐 [AuthService] Starting enhanced login for:', nama)
    
    // 1. Input validation
    if (!nama || typeof nama !== 'string') {
      throw new Error('Nama harus diisi dengan benar')
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password harus diisi dengan benar')
    }
    
    const cleanNama = nama.trim()
    
    // 2. ✨ ENHANCED: Check rate limiting
    console.log('🛡️ [AuthService] Checking rate limiting...')
    try {
      await checkLoginAttemptsFunction({ identifier: cleanNama })
      console.log('✅ [AuthService] Rate limit check passed')
    } catch (rateLimitError) {
      console.warn('⚠️ [AuthService] Rate limit exceeded:', rateLimitError.message)
      throw new Error(rateLimitError.message)
    }
    
    // 3. Find user in database
    const jemaatRef = collection(db, COLLECTION_NAME)
    let jemaatDoc = null
    let jemaatData = null
    
    // Try exact match first
    const exactQuery = query(jemaatRef, where('nama', '==', cleanNama))
    const exactSnapshot = await getDocs(exactQuery)
    
    if (!exactSnapshot.empty) {
      jemaatDoc = exactSnapshot.docs[0]
      jemaatData = jemaatDoc.data()
    } else {
      // Fallback: case-insensitive search
      const allSnapshot = await getDocs(jemaatRef)
      const foundDoc = findCaseInsensitiveMatch(allSnapshot, cleanNama)
      
      if (foundDoc) {
        jemaatDoc = foundDoc
        jemaatData = foundDoc.data()
      }
      
      if (!jemaatDoc) {
        // Record failed attempt for rate limiting
        try {
          await recordFailedLoginFunction({ identifier: cleanNama })
        } catch (recordError) {
          console.warn('⚠️ [AuthService] Failed to record login attempt:', recordError)
        }
        throw new Error(`Nama "${nama}" tidak ditemukan di database`)
      }
    }
    
    // 4. Verify login with enhanced security
    const loginResult = await verifyAndLoginEnhanced(jemaatDoc, jemaatData, password, cleanNama)
    
    console.log(`✅ [AuthService] Enhanced login successful for ${cleanNama}`)
    return loginResult
    
  } catch (error) {
    console.error('❌ [AuthService] Login error:', error)
    
    // Enhanced error handling
    if (error.code === 'functions/unavailable') {
      throw new Error('Layanan keamanan tidak tersedia. Silakan coba lagi nanti.')
    }
    
    throw error
  }
}

// ===== ENHANCED VERIFICATION FUNCTION =====

/**
 * Verifikasi dan proses login dengan enhanced security
 * @param {Object} jemaatDoc - Document jemaat
 * @param {Object} jemaatData - Data jemaat
 * @param {string} password - Password
 * @param {string} identifier - Identifier untuk rate limiting
 * @returns {Promise<Object>} Data user yang login
 */
async function verifyAndLoginEnhanced(jemaatDoc, jemaatData, password, identifier) {
  try {
    // 1. Cek status registrasi
    if (!jemaatData.isRegistered) {
      await recordFailedLoginFunction({ identifier })
      throw new Error('Akun belum terdaftar. Silakan registrasi terlebih dahulu.')
    }
    
    // 2. ✨ ENHANCED: Verify password dengan Firebase Functions
    console.log('🔐 [AuthService] Verifying password with Firebase Functions...')
    
    let isPasswordValid = false
    
    // Check password method untuk backward compatibility
    if (jemaatData.passwordMethod === 'bcrypt_firebase_functions') {
      // New bcrypt method via Firebase Functions
      const verifyResult = await verifyPasswordFunction({
        password,
        hashedPassword: jemaatData.password
      })
      isPasswordValid = verifyResult.data.isValid
    } else {
      // Legacy SHA256 method (untuk backward compatibility)
      console.log('⚠️ [AuthService] Using legacy SHA256 verification')
      const CryptoJS = (await import('crypto-js')).default
      const encryptedPassword = CryptoJS.SHA256(password).toString()
      isPasswordValid = (jemaatData.password === encryptedPassword)
      
      // TODO: Migrate legacy passwords to bcrypt in background
    }
    
    if (!isPasswordValid) {
      // Record failed attempt
      await recordFailedLoginFunction({ identifier })
      throw new Error('Password tidak sesuai')
    }
    
    // 3. Handle role assignment
    let userRole = jemaatData.role || 'jemaat'
    let needsRoleUpdate = false
    
    if (!jemaatData.role) {
      console.log(`🔧 [AuthService] User ${jemaatData.nama} belum ada role, setting default 'jemaat'`)
      needsRoleUpdate = true
      userRole = 'jemaat'
    }
    
    // 4. Update role di Firebase jika diperlukan
    if (needsRoleUpdate) {
      try {
        await updateDoc(jemaatDoc.ref, {
          role: 'jemaat',
          roleAssignedAt: new Date(),
          roleAssignedBy: 'auto_assignment'
        })
        console.log(`✅ [AuthService] Role default berhasil disimpan untuk ${jemaatData.nama}`)
      } catch (updateError) {
        console.warn('⚠️ [AuthService] Gagal update role ke Firebase:', updateError)
      }
    }
    
    // 5. Return enhanced user data
    const userData = {
      id: jemaatDoc.id,
      ...jemaatData,
      role: userRole,
      lastLoginAt: new Date(),
      securityVersion: jemaatData.securityVersion || '1.0'
    }
    
    // Remove password untuk keamanan
    delete userData.password
    
    console.log(`✅ [AuthService] Enhanced login berhasil untuk ${userData.nama} dengan role: ${userData.role}`)
    return userData
    
  } catch (error) {
    console.error('❌ [AuthService] Enhanced verification error:', error)
    throw error
  }
}

// ===== ENHANCED ROLE MANAGEMENT =====

/**
 * Update role user dengan Firebase Functions security (khusus admin)
 * @param {string} userId - ID user yang akan diupdate
 * @param {string} newRole - Role baru
 * @param {string} adminUserId - ID admin yang melakukan update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserRole(userId, newRole, adminUserId) {
  try {
    console.log(`🔄 [AuthService] Updating user ${userId} role to ${newRole} by admin ${adminUserId}`)
    
    // Use Firebase Functions untuk secure role update
    await updateUserRoleFunction({
      userId,
      newRole,
      adminUserId
    })
    
    console.log(`✅ [AuthService] User ${userId} role berhasil diupdate ke ${newRole}`)
    return true
    
  } catch (error) {
    console.error('❌ [AuthService] Error updating user role:', error)
    
    if (error.code === 'functions/permission-denied') {
      throw new Error('Hanya admin yang dapat mengubah role user')
    } else if (error.code === 'functions/invalid-argument') {
      throw new Error('Role tidak valid')
    }
    
    throw error
  }
}

// ===== EXISTING FUNCTIONS (Keep as is) =====

/**
 * Logout jemaat
 * @returns {Promise<boolean>} Success status
 */
export async function logoutJemaat(forgetMe = false) {
  try {
    const currentUser = localStorage.getItem('user')
    
    if (currentUser && !forgetMe) {
      const userData = JSON.parse(currentUser)
      
      if (userData.rememberMe) {
        console.log('🔄 [AuthService] User has Remember Me enabled, preserving for auto-login')
        
        const rememberedUserData = {
          ...userData,
          isRemembered: true,
          loggedOutAt: new Date().getTime()
        }
        
        localStorage.setItem('rememberedUser', JSON.stringify(rememberedUserData))
        console.log('✅ [AuthService] User data saved for auto-login')
      }
    }
    
    localStorage.removeItem('user')
    
    if (forgetMe) {
      localStorage.removeItem('rememberedUser')
      console.log('🗑️ [AuthService] All user data cleared (forget me)')
    }
    
    return true
  } catch (error) {
    console.error('❌ [AuthService] Error during logout:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('rememberedUser')
    return false
  }
}

/**
 * Check if there's a remembered user for auto-login
 * @returns {Object|null} Remembered user data or null
 */
export function getRememberedUser() {
  try {
    const mainUser = localStorage.getItem('user')
    if (mainUser) {
      const userData = JSON.parse(mainUser)
      
      if (userData.rememberMe && userData.rememberExpiry) {
        const now = new Date().getTime()
        if (now < userData.rememberExpiry) {
          console.log('✅ [AuthService] Found valid remembered user in main storage:', userData.nama)
          return userData
        } else {
          console.log('⏰ [AuthService] Remember period expired for main user, clearing data')
          localStorage.removeItem('user')
        }
      }
    }
    
    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser)
      
      const now = new Date().getTime()
      if (userData.rememberExpiry && now < userData.rememberExpiry) {
        console.log('✅ [AuthService] Found valid remembered user in legacy storage:', userData.nama)
        return userData
      } else {
        console.log('⏰ [AuthService] Remember period expired for legacy user, clearing data')
        localStorage.removeItem('rememberedUser')
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ [AuthService] Error getting remembered user:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('rememberedUser')
    return null
  }
}

/**
 * Clear remembered user (for manual forget)
 */
export function forgetRememberedUser() {
  localStorage.removeItem('rememberedUser')
  console.log('🗑️ [AuthService] Remembered user cleared')
}

/**
 * Auto-login with remembered user
 * @param {Object} rememberedUser - Remembered user data
 * @returns {Promise<Object>} User data
 */
export async function autoLoginRememberedUser(rememberedUser) {
  try {
    console.log('🔄 [AuthService] Auto-login with remembered user:', rememberedUser.nama)
    
    const loginData = {
      ...rememberedUser,
      autoLoggedIn: true,
      autoLoginAt: new Date().getTime()
    }
    
    localStorage.setItem('user', JSON.stringify(loginData))
    return loginData
  } catch (error) {
    console.error('❌ [AuthService] Auto-login failed:', error)
    localStorage.removeItem('rememberedUser')
    throw error
  }
}

/**
 * Mendapatkan data jemaat yang sedang login
 * @returns {Promise<Object|null>} Data user atau null
 */
export async function getCurrentJemaat() {
  try {
    const userDataString = localStorage.getItem('user')
    
    if (!userDataString) {
      return null
    }
    
    const userData = JSON.parse(userDataString)
    
    if (!userData.nama) {
      localStorage.removeItem('user')
      return null
    }
    
    if (userData.rememberExpiry) {
      const now = new Date().getTime()
      if (now >= userData.rememberExpiry) {
        console.log('⏰ [AuthService] User session expired, clearing data')
        localStorage.removeItem('user')
        return null
      }
    }
    
    console.log('✅ [AuthService] Current user valid:', userData.nama, userData.rememberMe ? '(remembered)' : '(session)')
    return userData
  } catch (error) {
    console.error('❌ [AuthService] Error getting current jemaat:', error)
    localStorage.removeItem('user')
    return null
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Mencari match case-insensitive dari snapshot
 * @param {Object} snapshot - Firestore snapshot
 * @param {string} nama - Nama yang dicari
 * @returns {Object|null} Document yang ditemukan atau null
 */
function findCaseInsensitiveMatch(snapshot, nama) {
  const lowerNama = nama.toLowerCase()
  
  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (data.nama && data.nama.toLowerCase() === lowerNama) {
      return doc
    }
  }
  
  return null
}

/**
 * Get all users with their roles (untuk admin)
 * @returns {Promise<Array>} Array users dengan role info
 */
export async function getAllUsersWithRoles() {
  try {
    const jemaatRef = collection(db, COLLECTION_NAME)
    const querySnapshot = await getDocs(jemaatRef)
    
    const users = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.nama) {
        const userData = { ...data }
        delete userData.password
        
        users.push({
          id: doc.id,
          ...userData,
          role: data.role || 'jemaat'
        })
      }
    })
    
    users.sort((a, b) => a.nama.localeCompare(b.nama))
    
    console.log(`📊 [AuthService] Loaded ${users.length} users with roles`)
    return users
    
  } catch (error) {
    console.error('❌ [AuthService] Error getting users with roles:', error)
    throw error
  }
}

/**
 * Get user role by ID (helper function)
 * @param {string} userId - User ID
 * @returns {Promise<string>} User role
 */
export async function getUserRole(userId) {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data().role || 'jemaat'
    } else {
      throw new Error('User tidak ditemukan')
    }
  } catch (error) {
    console.error('❌ [AuthService] Error getting user role:', error)
    throw error
  }
}
