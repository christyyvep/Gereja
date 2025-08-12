// HYBRID Authentication Service - Custom Auth + Firebase Security
// LOGIN dengan NAMA + PASSWORD (hashed di Firestore)
// Enhanced security dengan rate limiting, session management, monitoring

import { 
  db, 
  logSecurityEvent
} from './firebase-security'
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import CryptoJS from 'crypto-js'

const COLLECTION_NAME = 'jemaat'

// ===== SECURITY CONFIGURATION =====
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  HASH_SALT_ROUNDS: 12
}

// ===== IN-MEMORY CACHE VARIABLES =====
// eslint-disable-next-line no-unused-vars
let userCache = null
// eslint-disable-next-line no-unused-vars
let lastActivityTime = null
// eslint-disable-next-line no-unused-vars
let sessionToken = null

// ===== PASSWORD HASHING FUNCTIONS =====

/**
 * Hash password menggunakan CryptoJS dengan salt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
  return salt.toString() + ':' + hash.toString()
}

/**
 * Verify password dengan hash yang tersimpan
 * @param {string} password - Plain text password
 * @param {string} storedHash - Hash yang tersimpan di database
 * @returns {boolean} True jika password cocok
 */
function verifyPassword(password, storedHash) {
  try {
    // 🆕 BACKWARD COMPATIBILITY: Handle plain text password (legacy)
    if (!storedHash.includes(':')) {
      console.log('🔄 [AuthHybrid] Legacy plain text password detected, comparing directly...')
      return password === storedHash
    }
    
    // Standard PBKDF2 hash verification
    const [salt, hash] = storedHash.split(':')
    const hashToVerify = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256/32,
      iterations: 10000
    })
    return hash === hashToVerify.toString()
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

// ===== RATE LIMITING FUNCTIONS =====

/**
 * Check dan update rate limiting untuk login attempts
 * @param {string} identifier - Username/IP untuk tracking
 * @returns {Promise<boolean>} True jika masih bisa login
 */
async function checkRateLimit(identifier) {
  try {
    const rateLimitKey = `rate_limit_${identifier}`
    const stored = localStorage.getItem(rateLimitKey)
    
    if (!stored) {
      // First attempt
      localStorage.setItem(rateLimitKey, JSON.stringify({
        attempts: 1,
        lastAttempt: Date.now(),
        lockedUntil: null
      }))
      return true
    }
    
    const rateLimitData = JSON.parse(stored)
    const now = Date.now()
    
    // Check if still locked
    if (rateLimitData.lockedUntil && now < rateLimitData.lockedUntil) {
      const remainingTime = Math.ceil((rateLimitData.lockedUntil - now) / 1000 / 60)
      throw new Error(`Akun terkunci. Coba lagi dalam ${remainingTime} menit`)
    }
    
    // Reset if lockout period passed
    if (rateLimitData.lockedUntil && now >= rateLimitData.lockedUntil) {
      localStorage.setItem(rateLimitKey, JSON.stringify({
        attempts: 1,
        lastAttempt: now,
        lockedUntil: null
      }))
      return true
    }
    
    // Check if too many attempts
    if (rateLimitData.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION
      localStorage.setItem(rateLimitKey, JSON.stringify({
        ...rateLimitData,
        lockedUntil
      }))
      throw new Error(`Terlalu banyak percobaan login. Akun dikunci selama 15 menit`)
    }
    
    return true
  } catch (error) {
    console.error('Rate limit check error:', error)
    throw error
  }
}

/**
 * Record failed login attempt
 * @param {string} identifier - Username/IP untuk tracking
 */
async function recordFailedAttempt(identifier) {
  try {
    const rateLimitKey = `rate_limit_${identifier}`
    const stored = localStorage.getItem(rateLimitKey)
    
    if (stored) {
      const rateLimitData = JSON.parse(stored)
      localStorage.setItem(rateLimitKey, JSON.stringify({
        ...rateLimitData,
        attempts: rateLimitData.attempts + 1,
        lastAttempt: Date.now()
      }))
    }
  } catch (error) {
    console.error('Error recording failed attempt:', error)
  }
}

/**
 * Clear rate limit on successful login
 * @param {string} identifier - Username/IP untuk tracking
 */
async function clearRateLimit(identifier) {
  try {
    const rateLimitKey = `rate_limit_${identifier}`
    localStorage.removeItem(rateLimitKey)
  } catch (error) {
    console.error('Error clearing rate limit:', error)
  }
}

// ===== SESSION MANAGEMENT =====

/**
 * Create secure session untuk user
 * @param {Object} userData - Data user yang login
 * @returns {Object} Session data
 */
function createSession(userData) {
  const sessionId = CryptoJS.lib.WordArray.random(128/8).toString()
  const expiresAt = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT
  
  const sessionData = {
    sessionId,
    userId: userData.id,
    nama: userData.nama,
    role: userData.role || 'jemaat',
    sektor: userData.sektor,
    status: userData.status,
    createdAt: Date.now(),
    expiresAt,
    lastActivity: Date.now()
  }
  
  // Store session
  localStorage.setItem('myrajawali_session', JSON.stringify(sessionData))
  localStorage.setItem('myrajawali_user', JSON.stringify({
    id: userData.id,
    nama: userData.nama,
    role: userData.role || 'jemaat',
    sektor: userData.sektor,
    status: userData.status,
    loginTime: new Date().toISOString()
  }))
  
  return sessionData
}

/**
 * Validate current session
 * @returns {Object|null} Session data if valid, null if invalid
 */
function validateSession() {
  try {
    const sessionData = localStorage.getItem('myrajawali_session')
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    const now = Date.now()
    
    // Check if session expired
    if (now > session.expiresAt) {
      localStorage.removeItem('myrajawali_session')
      localStorage.removeItem('myrajawali_user')
      return null
    }
    
    // Update last activity
    session.lastActivity = now
    localStorage.setItem('myrajawali_session', JSON.stringify(session))
    
    return session
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Register user baru dengan enhanced security
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @param {Object} userData - Data tambahan user
 * @returns {Promise<boolean>} Success status
 */
export async function registerUser(nama, password, userData = {}) {
  try {
    console.log('🔐 [AuthHybrid] Starting registration for:', nama)
    
    // 1. Input validation
    if (!nama || typeof nama !== 'string' || nama.trim().length < 2) {
      throw new Error('Nama harus diisi minimal 2 karakter')
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new Error('Password harus minimal 6 karakter')
    }
    
    const cleanNama = nama.trim()
    
    // 2. Check if name exists in database
    const nameExists = await checkJemaatNameExists(cleanNama)
    if (!nameExists) {
      throw new Error('Nama anda belum terdaftar, segera hubungi gembala/admin')
    }
    
    // 3. Get document reference
    const docId = await getJemaatDocId(cleanNama)
    const jemaatRef = doc(db, COLLECTION_NAME, docId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      throw new Error('Data jemaat tidak ditemukan')
    }
    
    const jemaatData = jemaatDoc.data()
    
    // 4. Check if already registered
    if (jemaatData.isRegistered === true) {
      throw new Error('Akun dengan nama ini sudah terdaftar')
    }
    
    // 5. Hash password
    console.log('🔐 [AuthHybrid] Hashing password...')
    const hashedPassword = hashPassword(password)
    
    // 6. Update user data dengan enhanced security
    await updateDoc(jemaatRef, {
      password: hashedPassword,
      isRegistered: true,
      tanggalLahir: userData.tanggalLahir,
      status: userData.status,
      sektor: userData.sektor,
      registeredAt: serverTimestamp(),
      
      // Enhanced security fields
      role: userData.role || 'jemaat',
      roleAssignedAt: serverTimestamp(),
      roleAssignedBy: 'registration',
      passwordMethod: 'pbkdf2_cryptojs',
      securityVersion: '2.0',
      lastPasswordChange: serverTimestamp()
    })
    
    // 7. Log security event
    await logSecurityEvent('registration_success', {
      nama: cleanNama,
      role: userData.role || 'jemaat',
      registrationMethod: 'hybrid_auth'
    })
    
    console.log(`✅ [AuthHybrid] Registration successful for ${cleanNama}`)
    return true
  } catch (error) {
    console.error('❌ [AuthHybrid] Registration error:', error)
    
    // Log failed registration
    await logSecurityEvent('registration_failed', {
      nama: nama,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    throw error
  }
}

/**
 * Login user dengan NAMA + PASSWORD (Enhanced Security)
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @returns {Promise<Object>} User data dan session
 */
export async function loginUser(nama, password) {
  try {
    console.log('🔐 [AuthHybrid] Starting login for:', nama)
    
    // 1. Input validation
    if (!nama || typeof nama !== 'string') {
      throw new Error('Nama harus diisi dengan benar')
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password harus diisi dengan benar')
    }
    
    const cleanNama = nama.trim()
    
    // 2. Check rate limiting
    console.log('🛡️ [AuthHybrid] Checking rate limiting...')
    await checkRateLimit(cleanNama)
    
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
        await recordFailedAttempt(cleanNama)
        await logSecurityEvent('login_failed', {
          nama: cleanNama,
          reason: 'user_not_found'
        })
        throw new Error(`Nama "${nama}" tidak ditemukan di database`)
      }
    }
    
    // 4. Check if user is registered
    if (!jemaatData.isRegistered) {
      await recordFailedAttempt(cleanNama)
      await logSecurityEvent('login_failed', {
        nama: cleanNama,
        reason: 'not_registered'
      })
      throw new Error('Akun belum terdaftar. Silakan daftar terlebih dahulu.')
    }
    
    // 4b. Check if password exists (allow empty for migration)
    if (!jemaatData.password) {
      await recordFailedAttempt(cleanNama)
      await logSecurityEvent('login_failed', {
        nama: cleanNama,
        reason: 'no_password'
      })
      throw new Error('Password belum di-set. Silakan register ulang atau hubungi admin.')
    }
    
    // 5. Verify password
    console.log('🔐 [AuthHybrid] Verifying password...')
    const isPasswordValid = verifyPassword(password, jemaatData.password)
    
    if (!isPasswordValid) {
      await recordFailedAttempt(cleanNama)
      await logSecurityEvent('login_failed', {
        nama: cleanNama,
        reason: 'invalid_password'
      })
      throw new Error('Password salah')
    }
    
    // 6. Clear rate limit on successful login
    await clearRateLimit(cleanNama)
    
    // 6b. 🆕 AUTO-UPGRADE: Hash plain text password for security
    if (!jemaatData.password.includes(':')) {
      console.log('🔄 [AuthHybrid] Auto-upgrading plain text password to PBKDF2 hash...')
      const hashedPassword = hashPassword(password)
      
      await updateDoc(jemaatDoc.ref, {
        password: hashedPassword,
        passwordUpgradedAt: serverTimestamp(),
        passwordUpgradedFrom: 'plain_text'
      })
      
      console.log('✅ [AuthHybrid] Password auto-upgraded to secure hash')
    }
    
    // 7. Update last login
    await updateDoc(jemaatDoc.ref, {
      lastLoginAt: serverTimestamp(),
      lastLoginIP: 'client', // Could be enhanced with real IP
      loginCount: (jemaatData.loginCount || 0) + 1
    })
    
    // 8. Create session
    const userData = {
      id: jemaatDoc.id,
      nama: jemaatData.nama,
      sektor: jemaatData.sektor,
      status: jemaatData.status,
      role: jemaatData.role || 'jemaat',
      tanggalLahir: jemaatData.tanggalLahir
    }
    
    const sessionData = createSession(userData)
    
    // 9. Log successful login
    await logSecurityEvent('login_success', {
      nama: cleanNama,
      role: userData.role,
      sessionId: sessionData.sessionId
    })
    
    console.log(`✅ [AuthHybrid] Login successful for ${cleanNama}`)
    
    return {
      success: true,
      user: userData,
      session: sessionData,
      message: 'Login berhasil'
    }
    
  } catch (error) {
    console.error('❌ [AuthHybrid] Login error:', error)
    throw error
  }
}

/**
 * Logout user dan clear session
 * @returns {Promise<boolean>} Success status
 */
export async function logoutUser() {
  try {
    console.log('🔐 [AuthHybrid] Logging out user...')
    
    // Get current session for logging
    const session = validateSession()
    
    // Clear session storage
    localStorage.removeItem('myrajawali_session')
    localStorage.removeItem('myrajawali_user')
    
    // Log logout event
    if (session) {
      await logSecurityEvent('logout', {
        nama: session.nama,
        sessionId: session.sessionId,
        sessionDuration: Date.now() - session.createdAt
      })
    }
    
    console.log('✅ [AuthHybrid] Logout successful')
    return true
  } catch (error) {
    console.error('❌ [AuthHybrid] Logout error:', error)
    return false
  }
}

/**
 * Get current user dari session
 * @returns {Object|null} User data if logged in
 */
export function getCurrentUser() {
  try {
    const session = validateSession()
    if (!session) return null
    
    const userData = localStorage.getItem('myrajawali_user')
    if (!userData) return null
    
    return JSON.parse(userData)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is logged in
 * @returns {boolean} Login status
 */
export function isLoggedIn() {
  const session = validateSession()
  return session !== null
}

/**
 * Check if user has specific role
 * @param {string} requiredRole - Role to check
 * @returns {boolean} Authorization status
 */
export function hasRole(requiredRole) {
  const user = getCurrentUser()
  if (!user) return false
  
  const userRole = user.role || 'jemaat'
  
  // Role hierarchy
  const roleHierarchy = {
    'superadmin': 4,
    'admin': 3,
    'pelayanan': 2,
    'jemaat': 1
  }
  
  const userLevel = roleHierarchy[userRole] || 1
  const requiredLevel = roleHierarchy[requiredRole] || 1
  
  return userLevel >= requiredLevel
}

// ===== UTILITY FUNCTIONS =====

/**
 * Find case-insensitive match untuk nama
 * @param {QuerySnapshot} snapshot - Firestore query snapshot
 * @param {string} nama - Nama yang dicari
 * @returns {QueryDocumentSnapshot|null} Matching document
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
 * Check if jemaat name exists in database
 * @param {string} nama - Nama yang akan dicek
 * @returns {Promise<boolean>} True if exists
 */
async function checkJemaatNameExists(nama) {
  try {
    const jemaatRef = collection(db, COLLECTION_NAME)
    
    // Try exact match
    const exactQuery = query(jemaatRef, where('nama', '==', nama))
    const exactSnapshot = await getDocs(exactQuery)
    
    if (!exactSnapshot.empty) {
      return true
    }
    
    // Fallback: case-insensitive search
    const allSnapshot = await getDocs(jemaatRef)
    const found = findCaseInsensitiveMatch(allSnapshot, nama)
    
    return found !== null
  } catch (error) {
    console.error('Error checking jemaat name:', error)
    throw error
  }
}

/**
 * Get document ID for jemaat name
 * @param {string} nama - Nama jemaat
 * @returns {Promise<string>} Document ID
 */
async function getJemaatDocId(nama) {
  try {
    const jemaatRef = collection(db, COLLECTION_NAME)
    
    // Try exact match
    const exactQuery = query(jemaatRef, where('nama', '==', nama))
    const exactSnapshot = await getDocs(exactQuery)
    
    if (!exactSnapshot.empty) {
      return exactSnapshot.docs[0].id
    }
    
    // Fallback: case-insensitive search
    const allSnapshot = await getDocs(jemaatRef)
    const found = findCaseInsensitiveMatch(allSnapshot, nama)
    
    if (found) {
      return found.id
    }
    
    throw new Error('Jemaat not found')
  } catch (error) {
    console.error('Error getting jemaat doc ID:', error)
    throw error
  }
}

// ===== EXISTING FUNCTIONS (for compatibility) =====

/**
 * Get all jemaat names for autocomplete
 * @returns {Promise<Array>} Array of jemaat names
 */
export async function getAllJemaatNames() {
  try {
    console.log('📋 [AuthHybrid] Getting all jemaat names...')
    
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
    
    console.log(`✅ [AuthHybrid] Found ${namesList.length} jemaat names`)
    return namesList
  } catch (error) {
    console.error('❌ [AuthHybrid] Error getting jemaat names:', error)
    throw error
  }
}

// Aliases for backward compatibility
export const loginJemaat = loginUser
export const registerJemaat = registerUser

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isLoggedIn,
  hasRole,
  getAllJemaatNames,
  // Backward compatibility
  loginJemaat,
  registerJemaat,
  checkJemaatNameExists
}

/**
 * Clear session paksa - untuk debugging atau reset
 * @returns {boolean} Success status
 */
export function clearSession() {
  try {
    console.log('🧹 [AuthHybrid] Force clearing all session data...')
    
    // Clear all auth-related localStorage
    localStorage.removeItem('myrajawali_session')
    localStorage.removeItem('myrajawali_user')
    localStorage.removeItem('user') // Legacy key
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('loginTimestamp')
    localStorage.removeItem('lastActivity')
    localStorage.removeItem('sessionExpiry')
    localStorage.removeItem('userSession')
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    
    // Clear sessionStorage as well
    sessionStorage.removeItem('myrajawali_session')
    sessionStorage.removeItem('myrajawali_user')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('sessionToken')
    sessionStorage.removeItem('loginTimestamp')
    sessionStorage.removeItem('lastActivity')
    sessionStorage.removeItem('sessionExpiry')
    sessionStorage.removeItem('userSession')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('currentUser')
    
    // Clear any rate limit data
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('rate_limit_')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear in-memory cache
    userCache = null
    lastActivityTime = null
    sessionToken = null
    
    console.log('✅ [AuthHybrid] Session cleared successfully')
    return true
  } catch (error) {
    console.error('❌ [AuthHybrid] Error clearing session:', error)
    return false
  }
}

/**
 * Force logout - complete session termination
 * @returns {Promise<boolean>} Success status
 */
export async function forceLogout() {
  try {
    console.log('🚪 [AuthHybrid] Force logout initiated...')
    
    // Clear session first
    clearSession()
    
    // Additional cleanup for any Firebase auth state
    try {
      // Clear any Firebase-related session if exists
      if (typeof window !== 'undefined' && window.firebase) {
        // This is a fallback - normally we don't use Firebase auth
        console.log('🔥 [AuthHybrid] Clearing Firebase auth state...')
        await window.firebase.auth().signOut()
      }
    } catch (firebaseError) {
      // Silent fail - Firebase might not be initialized
      console.log('ℹ️ [AuthHybrid] Firebase signout not needed or failed (expected)')
    }
    
    console.log('✅ [AuthHybrid] Force logout completed')
    return true
  } catch (error) {
    console.error('❌ [AuthHybrid] Error during force logout:', error)
    return false
  }
}
