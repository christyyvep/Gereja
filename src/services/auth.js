import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import CryptoJS from 'crypto-js'

const COLLECTION_NAME = 'jemaat'

/**
 * Mendapatkan semua nama jemaat untuk fitur autocomplete
 * @returns {Promise<Array>} Array berisi data nama jemaat
 */
export async function getAllJemaatNames() {
  try {
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
    
    return namesList
  } catch (error) {
    console.error('Error getting jemaat names:', error)
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
    if (!nama || typeof nama !== 'string') {
      return false
    }

    const cleanNama = nama.trim()
    const jemaatRef = collection(db, COLLECTION_NAME)
    
    // Coba exact match dulu
    const exactQuery = query(jemaatRef, where('nama', '==', cleanNama))
    const exactSnapshot = await getDocs(exactQuery)
    
    if (!exactSnapshot.empty) {
      return true
    }
    
    // Fallback: case-insensitive search
    const allSnapshot = await getDocs(jemaatRef)
    const foundMatch = findCaseInsensitiveMatch(allSnapshot, cleanNama)
    
    return !!foundMatch
  } catch (error) {
    console.error('Error checking jemaat exists:', error)
    throw error
  }
}

/**
 * Mendapatkan document ID berdasarkan nama jemaat
 * @param {string} nama - Nama jemaat
 * @returns {Promise<string>} Document ID
 */
export async function getJemaatDocId(nama) {
  try {
    if (!nama || typeof nama !== 'string') {
      throw new Error('Nama parameter tidak valid')
    }

    const cleanNama = nama.trim()
    const jemaatRef = collection(db, COLLECTION_NAME)
    
    // Coba exact match dulu
    const exactQuery = query(jemaatRef, where('nama', '==', cleanNama))
    const exactSnapshot = await getDocs(exactQuery)
    
    if (!exactSnapshot.empty) {
      return exactSnapshot.docs[0].id
    }
    
    // Fallback: case-insensitive search
    const allSnapshot = await getDocs(jemaatRef)
    const foundDoc = findCaseInsensitiveMatch(allSnapshot, cleanNama)
    
    if (foundDoc) {
      return foundDoc.id
    }
    
    throw new Error(`Nama "${nama}" tidak ditemukan di database`)
  } catch (error) {
    console.error('Error getting jemaat doc ID:', error)
    throw error
  }
}

/**
 * Registrasi jemaat baru
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @param {Object} userData - Data tambahan user
 * @returns {Promise<boolean>} Success status
 */
export async function registerJemaat(nama, password, userData) {
  try {
    if (!nama || !password) {
      throw new Error('Nama dan password harus diisi')
    }

    if (!userData || typeof userData !== 'object') {
      throw new Error('Data user tidak valid')
    }
    
    // Cek apakah nama exists
    const nameExists = await checkJemaatExists(nama)
    if (!nameExists) {
      throw new Error('Nama anda belum terdaftar, segera hubungi gembala/admin')
    }
    
    const docId = await getJemaatDocId(nama)
    const jemaatRef = doc(db, COLLECTION_NAME, docId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      throw new Error('Data jemaat tidak ditemukan')
    }
    
    const jemaatData = jemaatDoc.data()
    
    // Cek apakah sudah terdaftar
    if (jemaatData.isRegistered === true) {
      throw new Error('Akun dengan nama ini sudah terdaftar')
    }
    
    const encryptedPassword = CryptoJS.SHA256(password).toString()
    

    // Update data jemaat Include role in registration
    await updateDoc(jemaatRef, {
      password: encryptedPassword,
      isRegistered: true,
      tanggalLahir: userData.tanggalLahir,
      status: userData.status,
      sektor: userData.sektor,
      registeredAt: new Date(),
      
      role: userData.role || 'jemaat', // Default role untuk user baru
      roleAssignedAt: new Date(),
      roleAssignedBy: 'registration'
    })
    
    console.log(`✅ [Auth] Registrasi berhasil untuk ${nama} dengan role: ${userData.role || 'jemaat'}`)
    
    
    return true
  } catch (error) {
    console.error('Error registering jemaat:', error)
    throw error
  }
}

/**
 * Login jemaat
 * @param {string} nama - Nama jemaat
 * @param {string} password - Password
 * @returns {Promise<Object>} Data user yang login
 */
export async function loginJemaat(nama, password) {
  try {
    // Validasi input
    if (!nama || typeof nama !== 'string') {
      throw new Error('Nama harus diisi dengan benar')
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password harus diisi dengan benar')
    }

    const jemaatRef = collection(db, COLLECTION_NAME)
    const cleanNama = nama.trim()
    
    // Coba exact match dulu
    const exactQuery = query(jemaatRef, where('nama', '==', cleanNama))
    const exactSnapshot = await getDocs(exactQuery)
    
    let jemaatDoc = null
    let jemaatData = null
    
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
        throw new Error(`Nama "${nama}" tidak ditemukan di database`)
      }
    }
    
    return await verifyAndLogin(jemaatDoc, jemaatData, password)
  } catch (error) {
    console.error('Error logging in jemaat:', error)
    throw error
  }
}

/**
 * Logout jemaat
 * @returns {Promise<boolean>} Success status
 */
export async function logoutJemaat(forgetMe = false) {
  try {
    const currentUser = localStorage.getItem('user')
    
    if (currentUser && !forgetMe) {
      const userData = JSON.parse(currentUser)
      
      // Check if user wants to be remembered
      if (userData.rememberMe) {
        console.log('🔄 [Auth] User has Remember Me enabled, preserving for auto-login')
        
        // Move current user data to remembered user
        const rememberedUserData = {
          ...userData,
          isRemembered: true,
          loggedOutAt: new Date().getTime()
        }
        
        localStorage.setItem('rememberedUser', JSON.stringify(rememberedUserData))
        console.log('✅ [Auth] User data saved for auto-login')
      }
    }
    
    // Always clear current session
    localStorage.removeItem('user')
    
    // If forgetMe is true, also clear remembered user
    if (forgetMe) {
      localStorage.removeItem('rememberedUser')
      console.log('🗑️ [Auth] All user data cleared (forget me)')
    }
    
    return true
  } catch (error) {
    console.error('❌ [Auth] Error during logout:', error)
    // Fallback: clear everything on error
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
    // First check main user storage (from LoginPage)
    const mainUser = localStorage.getItem('user')
    if (mainUser) {
      const userData = JSON.parse(mainUser)
      
      // Check if this user has remember me enabled and not expired
      if (userData.rememberMe && userData.rememberExpiry) {
        const now = new Date().getTime()
        if (now < userData.rememberExpiry) {
          console.log('✅ [Auth] Found valid remembered user in main storage:', userData.nama)
          return userData
        } else {
          console.log('⏰ [Auth] Remember period expired for main user, clearing data')
          localStorage.removeItem('user')
        }
      }
    }
    
    // Fallback: check separate rememberedUser storage (legacy)
    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser)
      
      const now = new Date().getTime()
      if (userData.rememberExpiry && now < userData.rememberExpiry) {
        console.log('✅ [Auth] Found valid remembered user in legacy storage:', userData.nama)
        return userData
      } else {
        console.log('⏰ [Auth] Remember period expired for legacy user, clearing data')
        localStorage.removeItem('rememberedUser')
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ [Auth] Error getting remembered user:', error)
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
  console.log('🗑️ [Auth] Remembered user cleared')
}

/**
 * Auto-login with remembered user
 * @param {Object} rememberedUser - Remembered user data
 * @returns {Promise<Object>} User data
 */
export async function autoLoginRememberedUser(rememberedUser) {
  try {
    console.log('🔄 [Auth] Auto-login with remembered user:', rememberedUser.nama)
    
    // Restore user session
    const loginData = {
      ...rememberedUser,
      autoLoggedIn: true,
      autoLoginAt: new Date().getTime()
    }
    
    // Save to current session
    localStorage.setItem('user', JSON.stringify(loginData))
    
    return loginData
  } catch (error) {
    console.error('❌ [Auth] Auto-login failed:', error)
    // Clear remembered user on auto-login failure
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
    
    // Validasi data
    if (!userData.nama) {
      localStorage.removeItem('user') // Clear invalid data
      return null
    }
    
    // Check if user data has expired (untuk yang tidak remember me)
    if (userData.rememberExpiry) {
      const now = new Date().getTime()
      if (now >= userData.rememberExpiry) {
        console.log('⏰ [Auth] User session expired, clearing data')
        localStorage.removeItem('user')
        return null
      }
    }
    
    console.log('✅ [Auth] Current user valid:', userData.nama, userData.rememberMe ? '(remembered)' : '(session)')
    return userData
  } catch (error) {
    console.error('❌ [Auth] Error getting current jemaat:', error)
    localStorage.removeItem('user') // Clear corrupted data
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
  let foundDoc = null
  
  snapshot.forEach((doc) => {
    const data = doc.data()
    if (data.nama && data.nama.toLowerCase().trim() === nama.toLowerCase()) {
      foundDoc = doc
    }
  })
  
  return foundDoc
}

/**
 * Verifikasi dan proses login dengan role handling
 * @param {Object} jemaatDoc - Document jemaat
 * @param {Object} jemaatData - Data jemaat
 * @param {string} password - Password
 * @returns {Promise<Object>} Data user yang login
 */
async function verifyAndLogin(jemaatDoc, jemaatData, password) {
  // Cek apakah sudah terdaftar
  if (!jemaatData.isRegistered) {
    throw new Error('Akun belum terdaftar. Silakan registrasi terlebih dahulu.')
  }
  
  // Verifikasi password
  const encryptedPassword = CryptoJS.SHA256(password).toString()
  
  if (jemaatData.password !== encryptedPassword) {
    throw new Error('Password tidak sesuai')
  }
  
  // Handle role
  let userRole = jemaatData.role || 'jemaat'
  let needsRoleUpdate = false
  
  // Jika belum ada role di database, set default dan update
  if (!jemaatData.role) {
    console.log(`🔧 [Auth] User ${jemaatData.nama} belum ada role, setting default 'jemaat'`)
    needsRoleUpdate = true
    userRole = 'jemaat'
  }
  
  // Update role di Firebase jika diperlukan
  if (needsRoleUpdate) {
    try {
      await updateDoc(jemaatDoc.ref, {
        role: 'jemaat',
        roleAssignedAt: new Date(),
        roleAssignedBy: 'auto_assignment'
      })
      
      console.log(`✅ [Auth] Role default berhasil disimpan untuk ${jemaatData.nama}`)
      
    } catch (updateError) {
      console.warn('⚠️ [Auth] Gagal update role ke Firebase, menggunakan default:', updateError)
    }
  }
  
  // Return data jemaat (hapus password untuk keamanan)
  const userData = {
    id: jemaatDoc.id,
    ...jemaatData,
    role: userRole
  }
  
  // Hapus password untuk keamanan
  delete userData.password
  
  console.log(`✅ [Auth] Login berhasil untuk ${userData.nama} dengan role: ${userData.role}`)
  
  return userData
}

// src/services/auth.js - TAMBAH di akhir file

/**
 * Update role user (khusus admin)
 * @param {string} userId - ID user yang akan diupdate
 * @param {string} newRole - Role baru
 * @param {string} adminUserId - ID admin yang melakukan update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserRole(userId, newRole, adminUserId) {
  try {
    if (!userId || !newRole) {
      throw new Error('User ID dan role harus diisi')
    }
    
    // UPDATED: Add 'gembala' role for pastoral access
    const validRoles = ['jemaat', 'gembala', 'admin']
    if (!validRoles.includes(newRole)) {
      throw new Error(`Role tidak valid. Harus salah satu dari: ${validRoles.join(', ')}`)
    }
    
    console.log(`🔄 [Auth] Updating user ${userId} role to ${newRole}`)
    
    const userRef = doc(db, COLLECTION_NAME, userId)
    
    // Cek apakah user exists
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      throw new Error('User tidak ditemukan')
    }
    
    // Update role
    await updateDoc(userRef, {
      role: newRole,
      roleAssignedAt: new Date(),
      roleAssignedBy: adminUserId || 'admin'
    })
    
    console.log(`✅ [Auth] User ${userId} role berhasil diupdate ke ${newRole}`)
    return true
    
  } catch (error) {
    console.error('❌ [Auth] Error updating user role:', error)
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
    if (!userId) {
      throw new Error('User ID harus diisi')
    }
    
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      throw new Error('User tidak ditemukan')
    }
    
    const userData = userDoc.data()
    return userData.role || 'jemaat'
    
  } catch (error) {
    console.error('Error getting user role:', error)
    throw error
  }
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
        // Hapus password untuk keamanan
        const userData = { ...data }
        delete userData.password
        
        users.push({
          id: doc.id,
          ...userData,
          role: data.role || 'jemaat' // Ensure role exists
        })
      }
    })
    
    // Sort by name
    users.sort((a, b) => a.nama.localeCompare(b.nama))
    
    console.log(`📊 [Auth] Loaded ${users.length} users with roles`)
    return users
    
  } catch (error) {
    console.error('Error getting users with roles:', error)
    throw error
  }
}