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

const COLLECTION_NAME = 'devotionals'

/**
 * Mendapatkan semua devotionals, diurutkan dari tanggal terbaru ke terlama
 * @param {number} limitCount - Jumlah maksimal devotionals yang diambil
 * @returns {Promise<Array>} Array devotionals
 */
export async function getDevotionals(limitCount = 10) {
  try {
    const devotionalsRef = collection(db, COLLECTION_NAME)
    const q = query(
      devotionalsRef, 
      orderBy('date', 'desc'), // Changed to desc for newest first
      limit(limitCount)
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
    console.error('Error getting devotionals:', error)
    throw error
  }
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
export async function deleteDevotional(id) {
  try {
    if (!id) {
      throw new Error('ID devotional harus diisi')
    }
    
    const devotionalRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(devotionalRef)
    
    return true
  } catch (error) {
    console.error('Error deleting devotional:', error)
    throw error
  }
}