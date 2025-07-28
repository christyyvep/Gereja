import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore'
import { logAdminActivity, logUserActivity } from './activityService'

const COLLECTION_NAME = 'devotionals'

/**
 * Mendapatkan semua devotionals, diurutkan dari tanggal terbaru ke terlama
 * @param {number} limitCount - Jumlah maksimal devotionals yang diambil
 * @param {boolean} includeScheduled - Include renungan yang dijadwalkan untuk masa depan (untuk admin)
 * @returns {Promise<Array>} Array devotionals
 */
export async function getDevotionals(limitCount = 10, includeScheduled = false) {
  try {
    const devotionalsRef = collection(db, COLLECTION_NAME)
    
    let q
    if (includeScheduled) {
      // Untuk admin: ambil semua renungan termasuk yang dijadwalkan
      q = query(
        devotionalsRef, 
        orderBy('date', 'desc'), 
        limit(limitCount)
      )
    } else {
      // Untuk user: hanya tampilkan renungan yang sudah waktunya (hari ini atau sebelumnya)
      const todayString = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
      q = query(
        devotionalsRef,
        where('date', '<=', todayString), // Hanya ambil renungan dengan tanggal <= hari ini
        orderBy('date', 'desc'),
        limit(limitCount)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const devotionals = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      devotionals.push({
        id: doc.id,
        ...data
      })
    })
    
    console.log(`📅 [Devotionals] ${includeScheduled ? 'Admin' : 'User'} devotionals loaded: ${devotionals.length}`)
    if (!includeScheduled) {
      console.log(`📅 [Devotionals] Today filter: <= ${new Date().toISOString().split('T')[0]}`)
    }
    
    return devotionals
  } catch (error) {
    console.error('Error getting devotionals:', error)
    throw error
  }
}

/**
 * Mendapatkan semua devotionals untuk admin (termasuk yang dijadwalkan)
 * @param {number} limitCount - Jumlah maksimal devotionals yang diambil
 * @returns {Promise<Array>} Array devotionals
 */
export async function getDevotionalsForAdmin(limitCount = 100) {
  return getDevotionals(limitCount, true)
}

/**
 * Mendapatkan satu devotional berdasarkan ID
 * @param {string} id - ID devotional
 * @returns {Promise<Object>} Data devotional
 */
export async function getDevotional(id) {
  try {
    if (!id) {
      throw new Error('ID devotional harus diisi')
    }
    
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Devotional tidak ditemukan')
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    }
  } catch (error) {
    console.error('Error getting devotional:', error)
    throw error
  }
}

/**
 * Mendapatkan devotionals berdasarkan kategori
 * @param {string} category - Kategori devotional
 * @returns {Promise<Array>} Array devotionals
 */
export async function getDevotionalsByCategory(category) {
  try {
    if (!category) {
      throw new Error('Kategori harus diisi')
    }
    
    const devotionalsRef = collection(db, COLLECTION_NAME)
    const q = query(
      devotionalsRef, 
      where('category', '==', category),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const devotionals = []
    
    querySnapshot.forEach((doc) => {
      devotionals.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return devotionals
  } catch (error) {
    console.error('Error getting devotionals by category:', error)
    throw error
  }
}

/**
 * Mendapatkan devotionals untuk tanggal tertentu
 * @param {string|Date} date - Tanggal devotional
 * @returns {Promise<Array>} Array devotionals
 */
export async function getDevotionalsByDate(date) {
  try {
    if (!date) {
      throw new Error('Tanggal harus diisi')
    }
    
    const devotionalsRef = collection(db, COLLECTION_NAME)
    const q = query(
      devotionalsRef, 
      where('date', '==', date),
      orderBy('createdAt', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const devotionals = []
    
    querySnapshot.forEach((doc) => {
      devotionals.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return devotionals
  } catch (error) {
    console.error('Error getting devotionals by date:', error)
    throw error
  }
}

/**
 * Menambahkan devotional baru (untuk admin)
 * @param {Object} devotionalData - Data devotional baru
 * @returns {Promise<string>} ID devotional yang baru dibuat
 */
export async function addDevotional(devotionalData) {
  try {
    if (!devotionalData || typeof devotionalData !== 'object') {
      throw new Error('Data devotional tidak valid')
    }

    if (!devotionalData.title) {
      throw new Error('Title devotional harus diisi')
    }
    
    const devotionalsRef = collection(db, COLLECTION_NAME)
    const newDoc = await addDoc(devotionalsRef, {
      ...devotionalData,
      createdAt: new Date()
    })
    
    // Log admin activity
    try {
      await logAdminActivity(devotionalData.createdBy || 'admin', {
        action: 'devotional_create',
        title: devotionalData.title,
        category: devotionalData.category || 'harian'
      })
    } catch (activityError) {
      console.warn('⚠️ [addDevotional] Could not log activity:', activityError)
    }
    
    return newDoc.id
  } catch (error) {
    console.error('Error adding devotional:', error)
    throw error
  }
}

/**
 * Mengupdate devotional (untuk admin)
 * @param {string} id - ID devotional
 * @param {Object} updateData - Data yang akan diupdate
 * @returns {Promise<boolean>} Success status
 */
export async function updateDevotional(id, updateData) {
  try {
    if (!id) {
      throw new Error('ID devotional harus diisi')
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Data update tidak valid')
    }
    
    const devotionalRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(devotionalRef, {
      ...updateData,
      updatedAt: new Date()
    })
    
    // Log admin activity
    try {
      await logAdminActivity(updateData.updatedBy || 'admin', {
        action: 'devotional_update',
        title: updateData.title || 'Devotional',
        category: updateData.category || 'harian'
      })
    } catch (activityError) {
      console.warn('⚠️ [updateDevotional] Could not log activity:', activityError)
    }
    
    return true
  } catch (error) {
    console.error('Error updating devotional:', error)
    throw error
  }
}

/**
 * Menghapus devotional (untuk admin)
 * @param {string} id - ID devotional yang akan dihapus
 * @returns {Promise<boolean>} Success status
 */
export async function deleteDevotional(id, adminId = 'admin') {
  try {
    if (!id) {
      throw new Error('ID devotional harus diisi')
    }
    
    // Get devotional data before deletion for activity log
    const devotionalRef = doc(db, COLLECTION_NAME, id)
    const devotionalDoc = await getDoc(devotionalRef)
    const devotionalData = devotionalDoc.data()
    
    await deleteDoc(devotionalRef)
    
    // Log admin activity
    try {
      await logAdminActivity(adminId, {
        action: 'devotional_delete',
        title: devotionalData?.title || 'Deleted Devotional',
        category: devotionalData?.category || 'harian'
      })
    } catch (activityError) {
      console.warn('⚠️ [deleteDevotional] Could not log activity:', activityError)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting devotional:', error)
    throw error
  }
}

/**
 * Mendapatkan renungan untuk hari ini
 * @returns {Promise<Array>} Array devotionals untuk hari ini
 */
export async function getTodayDevotionals() {
  try {
    const todayString = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    
    const devotionalsRef = collection(db, COLLECTION_NAME)
    const q = query(
      devotionalsRef,
      where('date', '==', todayString),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const devotionals = []
    
    querySnapshot.forEach((doc) => {
      devotionals.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`📅 [Devotionals] Today's devotionals (${todayString}):`, devotionals.length)
    return devotionals
  } catch (error) {
    console.error('Error getting today devotionals:', error)
    throw error
  }
}

/**
 * Get devotional detail dan log user activity
 * @param {string} id - ID devotional
 * @param {string} userId - ID user yang membaca (optional)
 * @param {string} userName - Nama user (optional)
 * @returns {Promise<Object>} Devotional detail
 */
export async function getDevotionalWithActivity(id, userId = null, userName = null) {
  const devotionalDetail = await getDevotional(id)
  
  // Log user activity jika userId tersedia
  if (userId) {
    try {
      await logUserActivity(userId, {
        action: 'renungan_read',
        title: devotionalDetail.title,
        category: devotionalDetail.category || 'harian',
        userName: userName || 'User'
      })
    } catch (activityError) {
      console.warn('⚠️ [getDevotionalWithActivity] Could not log user activity:', activityError)
    }
  }
  
  return devotionalDetail
}