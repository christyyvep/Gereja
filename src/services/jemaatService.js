import { db } from './firebase-security.js'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore'
import CryptoJS from 'crypto-js'

/**
 * Service untuk mengelola data jemaat (Admin only)
 */

// Password hashing function
function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
  return salt.toString() + ':' + hash.toString()
}

/**
 * Get all jemaat data untuk admin
 * @returns {Promise<Array>} Array data jemaat
 */
export async function getAllJemaat() {
  try {
    const jemaatRef = collection(db, 'jemaat')
    const q = query(jemaatRef, orderBy('nama', 'asc'))
    const snapshot = await getDocs(q)
    
    const jemaatList = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      jemaatList.push({
        id: doc.id,
        ...data,
        // Hide password for security
        password: undefined
      })
    })
    
    return jemaatList
  } catch (error) {
    console.error('❌ Error getting jemaat data:', error)
    throw error
  }
}

/**
 * Get statistik jemaat
 * @returns {Promise<Object>} Statistik data
 */
export async function getJemaatStatistics() {
  try {
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    let totalJemaat = 0
    let totalPria = 0
    let totalWanita = 0
    let totalRegistered = 0
    let totalNotRegistered = 0
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      
      // Skip admin user dari statistik
      if (data.role === 'admin') return
      
      totalJemaat++
      
      // Hitung berdasarkan jenis kelamin
      if (data.jenisKelamin === 'Laki-laki' || data.jenisKelamin === 'Pria') {
        totalPria++
      } else if (data.jenisKelamin === 'Perempuan' || data.jenisKelamin === 'Wanita') {
        totalWanita++
      }
      
      // Hitung status registrasi
      if (data.isRegistered === true) {
        totalRegistered++
      } else {
        totalNotRegistered++
      }
    })
    
    return {
      totalJemaat,
      totalPria,
      totalWanita,
      totalRegistered,
      totalNotRegistered,
      percentageRegistered: totalJemaat > 0 ? ((totalRegistered / totalJemaat) * 100).toFixed(1) : 0
    }
  } catch (error) {
    console.error('❌ Error getting jemaat statistics:', error)
    throw error
  }
}

/**
 * Add new jemaat
 * @param {Object} jemaatData - Data jemaat baru
 * @returns {Promise<string>} ID document baru
 */
export async function addJemaat(jemaatData) {
  try {
    const jemaatRef = collection(db, 'jemaat')
    
    // Cek apakah nama sudah ada
    const existingQuery = query(jemaatRef, where('nama', '==', jemaatData.nama))
    const existingDocs = await getDocs(existingQuery)
    
    if (!existingDocs.empty) {
      throw new Error('Nama jemaat sudah ada dalam database')
    }
    
    // Prepare data dengan field yang sesuai dengan database
    const newJemaatData = {
      nama: jemaatData.nama || '',
      jenisKelamin: jemaatData.jenisKelamin || '',
      tanggalLahir: jemaatData.tanggalLahir || '',
      status: jemaatData.status || '', // Status pernikahan
      sektor: jemaatData.sektor || '',
      noTelp: jemaatData.noTelp || '',
      email: jemaatData.email || '',
      
      // Auth related fields
      password: jemaatData.password ? hashPassword(jemaatData.password) : null,
      isRegistered: jemaatData.password ? true : false,
      isActive: true,
      role: 'jemaat',
      
      // Metadata
      createdAt: serverTimestamp(),
      createdBy: 'admin',
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: 'admin',
      lastLogin: null,
      loginCount: 0
    }
    
    const docRef = await addDoc(jemaatRef, newJemaatData)
    console.log('✅ New jemaat added with ID:', docRef.id)
    
    return docRef.id
  } catch (error) {
    console.error('❌ Error adding jemaat:', error)
    throw error
  }
}

/**
 * Update jemaat data
 * @param {string} jemaatId - ID jemaat
 * @param {Object} updateData - Data yang akan diupdate
 * @returns {Promise<void>}
 */
export async function updateJemaat(jemaatId, updateData) {
  try {
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    
    // Prepare update data
    const updatedData = {
      ...updateData,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: 'admin'
    }
    
    // Hash password jika ada
    if (updateData.password) {
      updatedData.password = hashPassword(updateData.password)
      updatedData.isRegistered = true
      updatedData.passwordUpgradedAt = serverTimestamp()
      updatedData.passwordUpgradedFrom = 'admin'
    }
    
    await updateDoc(jemaatRef, updatedData)
    console.log('✅ Jemaat updated:', jemaatId)
    
  } catch (error) {
    console.error('❌ Error updating jemaat:', error)
    throw error
  }
}

/**
 * Delete jemaat
 * @param {string} jemaatId - ID jemaat
 * @returns {Promise<void>}
 */
export async function deleteJemaat(jemaatId) {
  try {
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    await deleteDoc(jemaatRef)
    console.log('✅ Jemaat deleted:', jemaatId)
    
  } catch (error) {
    console.error('❌ Error deleting jemaat:', error)
    throw error
  }
}

/**
 * Search jemaat by name
 * @param {string} searchTerm - Term pencarian
 * @returns {Promise<Array>} Array hasil pencarian
 */
export async function searchJemaat(searchTerm) {
  try {
    const jemaatRef = collection(db, 'jemaat')
    const snapshot = await getDocs(jemaatRef)
    
    const results = []
    const searchLower = searchTerm.toLowerCase()
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      const nama = (data.nama || '').toLowerCase()
      
      if (nama.includes(searchLower)) {
        results.push({
          id: doc.id,
          ...data,
          password: undefined // Hide password
        })
      }
    })
    
    return results.sort((a, b) => a.nama.localeCompare(b.nama))
  } catch (error) {
    console.error('❌ Error searching jemaat:', error)
    throw error
  }
}

/**
 * Get jemaat by registration status
 * @param {boolean} isRegistered - Status registrasi
 * @returns {Promise<Array>} Array jemaat
 */
export async function getJemaatByRegistrationStatus(isRegistered) {
  try {
    const jemaatRef = collection(db, 'jemaat')
    const q = query(
      jemaatRef, 
      where('isRegistered', '==', isRegistered),
      where('role', '!=', 'admin'),
      orderBy('nama', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const results = []
    
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
        password: undefined
      })
    })
    
    return results
  } catch (error) {
    console.error('❌ Error getting jemaat by registration status:', error)
    throw error
  }
}

export default {
  getAllJemaat,
  getJemaatStatistics,
  addJemaat,
  updateJemaat,
  deleteJemaat,
  searchJemaat,
  getJemaatByRegistrationStatus
}
