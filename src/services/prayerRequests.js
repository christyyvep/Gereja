// src/services/prayerRequests.js - COMPLETELY FIXED VERSION

import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp
} from 'firebase/firestore'

const COLLECTION_NAME = 'prayer_requests'

/**
 * 🎯 SCHEMA BARU untuk Prayer Request:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   userId: string,
 *   userName: string,
 *   isAnonymous: boolean,
 *   isUrgent: boolean,
 *   
 *   // STATUS TRACKING
 *   status: 'waiting' | 'prayed' | 'answered' | 'closed',
 *   
 *   // ADMIN ACTIONS
 *   isPrayedByAdmin: boolean,
 *   prayedByAdminAt: Date,
 *   prayedByAdminId: string,
 *   adminNotes: string,
 *   
 *   // TESTIMONY
 *   hasTestimony: boolean,
 *   testimonies: [
 *     {
 *       id: string,
 *       content: string,
 *       createdAt: Date,
 *       createdBy: string
 *     }
 *   ],
 *   
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

/**
 * 📝 Tambah prayer request baru (untuk JEMAAT)
 */
export async function addPrayerRequest(prayerData, userId) {
  try {
    console.log('📝 [PrayerService] Adding prayer request:', prayerData)
    console.log('👤 [PrayerService] User ID:', userId)
    
    if (!prayerData || typeof prayerData !== 'object') {
      throw new Error('Data prayer request tidak valid')
    }

    // ⭐ VALIDASI SIMPLE: Cuma butuh description dan userId
    if (!prayerData.description && !prayerData.prayerText) {
      throw new Error('Deskripsi prayer request harus diisi')
    }

    if (!userId) {
      throw new Error('User ID harus diisi')
    }
    
    console.log('➕ [PrayerService] Adding new prayer request...')
    
    const prayerRequestsRef = collection(db, COLLECTION_NAME)
    
    // ⭐ HANDLE BOTH OLD AND NEW FORMAT
    const description = prayerData.description || prayerData.prayerText
    const title = prayerData.title || `Permintaan Doa - ${prayerData.category || 'Umum'}`
    
    // ⭐ SIMPLE DATA: Support both formats
    const newDoc = await addDoc(prayerRequestsRef, {
      title: title.trim(),
      description: description.trim(),
      category: prayerData.category || 'other',
      isAnonymous: Boolean(prayerData.isAnonymous),
      isUrgent: Boolean(prayerData.isUrgent),
      userId: userId,
      status: 'active',
      isPrayed: false,
      prayedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ [PrayerService] Prayer request added with ID:', newDoc.id)
    return newDoc.id
    
  } catch (error) {
    console.error('❌ [PrayerService] Error adding prayer request:', error)
    throw error
  }
}

/**
 * 🔍 Get prayer requests untuk user tertentu
 */
export async function getPrayerRequestsByUser(userId, limitCount = 10) {
  try {
    if (!userId) {
      throw new Error('User ID harus diisi')
    }
    
    console.log('🔍 [PrayerService] Fetching prayer requests for user:', userId)
    
    const prayerRequestsRef = collection(db, COLLECTION_NAME)
    const q = query(
      prayerRequestsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const prayerRequests = []
    
    // ⭐ KALAU EMPTY: Tidak masalah, return array kosong
    if (querySnapshot.empty) {
      console.log('ℹ️ [PrayerService] No prayer requests found for user:', userId)
      return [] // ✅ Return array kosong, bukan error
    }
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // ⭐ SAFETY CHECK: Validasi data dengan benar
      if (!data) {
        console.warn('❌ [PrayerService] Document has no data:', doc.id)
        return // Skip document kosong
      }
      
      // ⭐ SAFETY CHECK: Pastikan field penting ada
      if (!data.description && !data.title) {
        console.warn('❌ [PrayerService] Document missing description/title:', doc.id, data)
        return // Skip document yang tidak ada description
      }
      
      // ⭐ HANDLE TIMESTAMP: Aman dari error
      let createdAtISO
      try {
        const createdAt = data.createdAt?.toDate?.() || new Date()
        createdAtISO = createdAt.toISOString()
      } catch (timestampError) {
        console.warn('⚠️ [PrayerService] Invalid timestamp for doc:', doc.id, timestampError)
        createdAtISO = new Date().toISOString() // Fallback ke sekarang
      }
      
      // ⭐ BUILD SAFE OBJECT
      const safeData = {
        id: doc.id,
        title: (data.title || data.description || '').toString().trim() || 'No title',
        description: (data.description || '').toString().trim() || 'No description',
        userId: data.userId || userId,
        status: data.status || 'active',
        isPrayed: Boolean(data.isPrayed),
        prayedBy: Array.isArray(data.prayedBy) ? data.prayedBy : [],
        category: data.category || 'other',
        isAnonymous: Boolean(data.isAnonymous),
        isUrgent: Boolean(data.isUrgent),
        createdAt: createdAtISO
      }
      
      prayerRequests.push(safeData)
    })
    
    console.log(`✅ [PrayerService] Loaded ${prayerRequests.length} prayer requests for user:`, userId)
    return prayerRequests
    
  } catch (error) {
    console.error('❌ [PrayerService] Error getting user prayer requests:', error)
    
    // ⭐ GRACEFUL ERROR: Jangan throw error untuk hal sepele
    if (error.message.includes('permission-denied')) {
      console.warn('⚠️ [PrayerService] Permission denied, returning empty array')
      return [] // Return kosong daripada crash app
    }
    
    if (error.message.includes('offline')) {
      console.warn('⚠️ [PrayerService] Offline mode, returning empty array')
      return [] // Return kosong saat offline
    }
    
    // Untuk error serius, baru throw
    throw new Error(`Gagal memuat prayer requests: ${error.message}`)
  }
} // ⭐ FIXED: Tambah closing bracket yang hilang

/**
 * 🔍 Get ALL prayer requests (untuk public display di PrayerRequest.vue)
 */
export async function getPrayerRequests(limitCount = 10) {
  try {
    console.log('🔍 [PrayerService] Fetching all prayer requests...')
    
    const prayerRequestsRef = collection(db, COLLECTION_NAME)
    const q = query(
      prayerRequestsRef, 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const prayerRequests = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Convert Firestore Timestamp to JavaScript Date
      const createdAt = data.createdAt?.toDate?.() || new Date()
      
      prayerRequests.push({
        id: doc.id,
        ...data,
        createdAt: createdAt.toISOString() // Convert to ISO string
      })
    })
    
    console.log('✅ [PrayerService] Prayer requests loaded:', prayerRequests.length)
    return prayerRequests
    
  } catch (error) {
    console.error('❌ [PrayerService] Error getting prayer requests:', error)
    throw error
  }
}

/**
 * Mendapatkan satu prayer request berdasarkan ID
 * @param {string} id - ID prayer request
 * @returns {Promise<Object>} Data prayer request
 */
export async function getPrayerRequest(id) {
  try {
    if (!id) {
      throw new Error('ID prayer request harus diisi')
    }
    
    console.log('🔍 [PrayerService] Fetching prayer request ID:', id)
    
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Prayer request tidak ditemukan')
    }
    
    const data = docSnap.data()
    const createdAt = data.createdAt?.toDate?.() || new Date()

    const prayerRequest = {
      id: docSnap.id,
      ...data,
      createdAt: createdAt.toISOString()
    }
    
    console.log('✅ [PrayerService] Prayer request loaded:', prayerRequest.title)
    return prayerRequest
    
  } catch (error) {
    console.error('❌ [PrayerService] Error getting prayer request:', error)
    throw error
  }
}

/**
 * 📋 Get ALL prayer requests untuk ADMIN/GEMBALA
 */
export async function getAllPrayerRequestsForAdmin(limitCount = 50) {
  try {
    console.log('🔍 [PrayerService] Getting all prayer requests for admin...')
    
    const prayerRequestsRef = collection(db, COLLECTION_NAME)
    const q = query(
      prayerRequestsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const prayers = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const createdAt = data.createdAt?.toDate?.() || new Date()
      
      prayers.push({
        id: doc.id,
        ...data,
        createdAt: createdAt.toISOString(),
        statusText: getStatusText(data.status, data.isPrayedByAdmin),
        categoryIcon: getCategoryIcon(data.category)
      })
    })
    
    console.log('✅ [PrayerService] Admin prayers loaded:', prayers.length)
    return prayers
    
  } catch (error) {
    console.error('❌ [PrayerService] Error getting admin prayers:', error)
    throw error
  }
}

/**
 * 🙏 Admin tandai doa sudah didoakan
 */
export async function markPrayerAsPrayed(prayerId, adminId, adminNotes = '') {
  try {
    console.log('🙏 [PrayerService] Marking prayer as prayed:', prayerId)
    
    const prayerRef = doc(db, COLLECTION_NAME, prayerId)
    
    await updateDoc(prayerRef, {
      status: 'prayed',
      isPrayedByAdmin: true,
      prayedByAdminAt: serverTimestamp(),
      prayedByAdminId: adminId,
      adminNotes: adminNotes,
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ [PrayerService] Prayer marked as prayed')
    return true
    
  } catch (error) {
    console.error('❌ [PrayerService] Error marking prayer as prayed:', error)
    throw error
  }
}

/**
 * 📝 Tambah testimoni untuk prayer request
 */
export async function addTestimony(prayerId, testimonyContent, userId) {
  try {
    console.log('📝 [PrayerService] Adding testimony to prayer:', prayerId)
    
    // Get existing prayer data
    const prayerRef = doc(db, COLLECTION_NAME, prayerId)
    const prayerSnap = await getDoc(prayerRef)
    
    if (!prayerSnap.exists()) {
      throw new Error('Prayer request tidak ditemukan')
    }
    
    const prayerData = prayerSnap.data()
    const existingTestimonies = prayerData.testimonies || []
    
    // Create new testimony
    const newTestimony = {
      id: Date.now().toString(), // Simple ID
      content: testimonyContent,
      createdAt: new Date().toISOString(),
      createdBy: userId
    }
    
    // Add to testimonies array
    const updatedTestimonies = [...existingTestimonies, newTestimony]
    
    // Update prayer request
    await updateDoc(prayerRef, {
      testimonies: updatedTestimonies,
      hasTestimony: true,
      status: 'answered', // Auto update status ke answered
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ [PrayerService] Testimony added successfully')
    return true
    
  } catch (error) {
    console.error('❌ [PrayerService] Error adding testimony:', error)
    throw error
  }
}

/**
 * Toggle status "sudah didoakan" untuk prayer request
 * @param {string} prayerRequestId - ID prayer request
 * @param {string} userId - ID user yang mendoakan
 * @returns {Promise<boolean>} Success status
 */
export async function togglePrayerStatus(prayerRequestId, userId) {
  try {
    if (!prayerRequestId || !userId) {
      throw new Error('Prayer request ID dan user ID harus diisi')
    }
    
    console.log('🙏 [PrayerService] Toggling prayer status...')
    
    // Ambil data prayer request saat ini
    const prayerRequest = await getPrayerRequest(prayerRequestId)
    
    let prayedBy = prayerRequest.prayedBy || []
    let isPrayed = false
    
    // Check apakah user sudah pernah mendoakan
    if (prayedBy.includes(userId)) {
      // User sudah pernah mendoakan, remove dari list
      prayedBy = prayedBy.filter(id => id !== userId)
      console.log('❌ [PrayerService] User removed from prayer list')
    } else {
      // User belum pernah mendoakan, add ke list
      prayedBy.push(userId)
      console.log('✅ [PrayerService] User added to prayer list')
    }
    
    // Update status isPrayed berdasarkan apakah ada yang mendoakan
    isPrayed = prayedBy.length > 0
    
    // Update di Firebase
    const prayerRef = doc(db, COLLECTION_NAME, prayerRequestId)
    await updateDoc(prayerRef, {
      prayedBy: prayedBy,
      isPrayed: isPrayed,
      updatedAt: serverTimestamp()
    })
    
    return true
    
  } catch (error) {
    console.error('❌ [PrayerService] Error toggling prayer status:', error)
    throw error
  }
}

/**
 * 🏷️ Helper function untuk status text
 */
function getStatusText(status, isPrayedByAdmin) {
  switch (status) {
    case 'waiting':
      return 'Menunggu'
    case 'prayed':
      return 'Sudah Didoakan'
    case 'answered':
      return 'Dijawab'
    case 'closed':
      return 'Ditutup'
    default:
      return isPrayedByAdmin ? 'Sudah Didoakan' : 'Menunggu'
  }
}

/**
 * 🎨 Helper function untuk category icon
 */
function getCategoryIcon(category) {
  const icons = {
    'health': '🏥',
    'work': '💼',
    'family': '👨‍👩‍👧‍👦',
    'finances': '💰',
    'education': '🎓',
    'spiritual': '🙏',
    'relationship': '💕',
    'guidance': '🧭',
    'other': '📝'
  }
  return icons[category] || '🙏'
}

/**
 * 📊 Get prayer categories dengan icon
 */
export function getPrayerCategories() {
  return [
    { value: 'health', label: 'Kesehatan', icon: '🏥' },
    { value: 'work', label: 'Pekerjaan', icon: '💼' },
    { value: 'family', label: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
    { value: 'finances', label: 'Keuangan', icon: '💰' },
    { value: 'education', label: 'Pendidikan', icon: '🎓' },
    { value: 'spiritual', label: 'Spiritual', icon: '🙏' },
    { value: 'relationship', label: 'Hubungan', icon: '💕' },
    { value: 'other', label: 'Lainnya', icon: '📝' }
  ]
}