// src/services/prayerRequests.js - COMPLETELY FIXED VERSION

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
  where,
  serverTimestamp
} from 'firebase/firestore'
import { logUserActivity, logAdminActivity } from './activityService'

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

    // ⭐ VALIDASI IMPROVED: Support both formats  
    const description = prayerData.description || prayerData.prayerText || ''
    if (!description.trim()) {
      throw new Error('Permintaan doa tidak boleh kosong')
    }

    // ⭐ FALLBACK: Jika tidak ada userId, gunakan default
    const finalUserId = userId || 'demo-user'
    if (!userId) {
      console.warn('⚠️ [PrayerService] No user ID provided, using demo-user')
    }
    
    console.log('➕ [PrayerService] Adding new prayer request...')
    
    const prayerRequestsRef = collection(db, COLLECTION_NAME)
    
    // ⭐ HANDLE BOTH OLD AND NEW FORMAT
    const title = prayerData.title || `Permintaan Doa - ${prayerData.category || 'Umum'}`
    
    // ⭐ SIMPLE DATA: Support both formats
    const newDoc = await addDoc(prayerRequestsRef, {
      title: title.trim(),
      description: description.trim(),
      category: prayerData.category || 'other',
      isAnonymous: Boolean(prayerData.isAnonymous),
      isUrgent: Boolean(prayerData.isUrgent),
      userId: finalUserId,
      userName: prayerData.userName || 'User', // ⭐ ADDED: Save userName for admin display
      status: 'active',
      isPrayed: false,
      prayedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ [PrayerService] Prayer request added with ID:', newDoc.id)
    
    // Log user activity
    try {
      console.log('📊 [PrayerService] Attempting to log user activity...')
      
      // ⭐ IMPORTANT: Use userName from prayerData (sent from view) 
      // This should contain the actual user's name, not generic "User"
      const correctUserName = prayerData.userName && 
                              prayerData.userName !== 'User' && 
                              prayerData.userName.trim() 
                              ? prayerData.userName 
                              : null // Let activityService.getUserName() handle fallback
      
      const activityData = {
        action: 'prayer_request',
        title: title,
        category: prayerData.category || 'other',
        userName: correctUserName
      }
      console.log('📊 [PrayerService] Activity data:', activityData)
      console.log('📊 [PrayerService] User ID for activity:', finalUserId)
      console.log('📊 [PrayerService] User name for activity:', correctUserName)
      
      await logUserActivity(finalUserId, activityData)
      console.log('✅ [PrayerService] User activity logged successfully')
    } catch (activityError) {
      console.error('❌ [PrayerService] Activity logging failed:', activityError)
      console.error('❌ [PrayerService] Activity error details:', {
        message: activityError.message,
        code: activityError.code,
        stack: activityError.stack
      })
    }
    
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
 * 📖 Get prayer request by ID
 */
export async function getPrayerRequestById(prayerId) {
  try {
    if (!prayerId) {
      throw new Error('Prayer ID harus diisi')
    }
    
    console.log('🔍 [PrayerService] Getting prayer request by ID:', prayerId)
    
    const prayerDocRef = doc(db, COLLECTION_NAME, prayerId)
    const docSnap = await getDoc(prayerDocRef)
    
    if (!docSnap.exists()) {
      throw new Error('Prayer request tidak ditemukan')
    }
    
    const data = docSnap.data()
    
    // ⭐ HANDLE TIMESTAMP safely
    let createdAtISO
    try {
      const createdAt = data.createdAt?.toDate?.() || new Date()
      createdAtISO = createdAt.toISOString()
    } catch (timestampError) {
      console.warn('⚠️ [PrayerService] Invalid timestamp for doc:', prayerId)
      createdAtISO = new Date().toISOString()
    }
    
    // ⭐ BUILD SAFE OBJECT
    const prayerData = {
      id: docSnap.id,
      title: (data.title || data.description || '').toString().trim() || 'No title',
      description: (data.description || '').toString().trim() || 'No description',
      userId: data.userId || 'unknown',
      status: data.status || 'active',
      isPrayed: Boolean(data.isPrayed),
      prayedBy: Array.isArray(data.prayedBy) ? data.prayedBy : [],
      category: data.category || 'other',
      isAnonymous: Boolean(data.isAnonymous),
      isUrgent: Boolean(data.isUrgent),
      createdAt: createdAtISO
    }
    
    console.log('✅ [PrayerService] Prayer request found:', prayerData)
    return prayerData
    
  } catch (error) {
    console.error('❌ [PrayerService] Error getting prayer request:', error)
    throw error
  }
}

/**
 * ✏️ Update prayer request
 */
export async function updatePrayerRequest(prayerId, updateData) {
  try {
    if (!prayerId) {
      throw new Error('Prayer ID harus diisi')
    }
    
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Data update tidak valid')
    }
    
    console.log('✏️ [PrayerService] Updating prayer request:', prayerId, updateData)
    
    // ⭐ VALIDATION
    const description = updateData.description || updateData.prayerText || ''
    if (!description.trim()) {
      throw new Error('Permintaan doa tidak boleh kosong')
    }
    
    // ⭐ PREPARE UPDATE DATA
    const title = updateData.title || `Permintaan Doa - ${updateData.category || 'Umum'}`
    
    const docData = {
      title: title.trim(),
      description: description.trim(),
      category: updateData.category || 'other',
      isAnonymous: Boolean(updateData.isAnonymous),
      isUrgent: Boolean(updateData.isUrgent),
      updatedAt: serverTimestamp()
    }
    
    console.log('📄 [PrayerService] Update data:', docData)
    
    // ⭐ UPDATE: Update document in Firestore
    const prayerDocRef = doc(db, COLLECTION_NAME, prayerId)
    await updateDoc(prayerDocRef, docData)
    
    console.log('✅ [PrayerService] Prayer request updated successfully:', prayerId)
    return true
    
  } catch (error) {
    console.error('❌ [PrayerService] Error updating prayer request:', error)
    
    // ⭐ GRACEFUL ERROR: Handle different error types
    if (error.code === 'permission-denied') {
      throw new Error('Anda tidak memiliki izin untuk mengubah prayer request ini')
    }
    
    if (error.code === 'not-found') {
      throw new Error('Prayer request tidak ditemukan')
    }
    
    throw new Error(`Gagal memperbarui prayer request: ${error.message}`)
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
      
      // ⭐ ENHANCED: Better user name handling for backward compatibility
      const enhancedData = {
        id: doc.id,
        ...data,
        createdAt: createdAt.toISOString(),
        statusText: getStatusText(data.status, data.isPrayedByAdmin),
        categoryIcon: getCategoryIcon(data.category),
        // ⭐ FALLBACK: If no userName field, try to extract from userId or set default
        userName: data.userName || (
          data.userId && data.userId !== 'demo-user' && data.userId !== 'User' && 
          !data.userId.startsWith('unknown_user_') ? data.userId : null
        )
      }
      
      prayers.push(enhancedData)
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
    console.log('🙏 [PrayerService] Marking prayer as prayed:', { prayerId, adminId, adminNotes })
    
    // Validasi input
    if (!prayerId || !adminId) {
      throw new Error('Prayer ID dan Admin ID harus diisi')
    }
    
    const prayerRef = doc(db, COLLECTION_NAME, prayerId)
    
    const updateData = {
      status: 'prayed',
      isPrayedByAdmin: true,
      prayedByAdminAt: serverTimestamp(),
      prayedByAdminId: String(adminId), // Pastikan string
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp()
    }
    
    console.log('🔄 [PrayerService] Update data:', updateData)
    
    await updateDoc(prayerRef, updateData)
    
    console.log('✅ [PrayerService] Prayer marked as prayed successfully')
    
    // Log admin activity
    try {
      // Get prayer data untuk title
      const prayerDoc = await getDoc(prayerRef)
      const prayerData = prayerDoc.data()
      
      await logAdminActivity(adminId, {
        action: 'prayer_respond',
        title: prayerData?.title || 'Prayer Request',
        notes: adminNotes,
        targetPrayerId: prayerId
      })
    } catch (activityError) {
      console.warn('⚠️ [PrayerService] Could not log admin activity:', activityError)
    }
    
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
 * 🗑️ Delete prayer request
 */
export async function deletePrayerRequest(prayerId) {
  try {
    if (!prayerId) {
      throw new Error('Prayer ID harus diisi')
    }
    
    console.log('🗑️ [PrayerService] Deleting prayer request:', prayerId)
    
    // ⭐ DELETE: Remove document from Firestore
    const prayerDocRef = doc(db, COLLECTION_NAME, prayerId)
    await deleteDoc(prayerDocRef)
    
    console.log('✅ [PrayerService] Prayer request deleted successfully:', prayerId)
    return true
    
  } catch (error) {
    console.error('❌ [PrayerService] Error deleting prayer request:', error)
    
    // ⭐ GRACEFUL ERROR: Handle different error types
    if (error.code === 'permission-denied') {
      throw new Error('Anda tidak memiliki izin untuk menghapus prayer request ini')
    }
    
    if (error.code === 'not-found') {
      throw new Error('Prayer request tidak ditemukan')
    }
    
    throw new Error(`Gagal menghapus prayer request: ${error.message}`)
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