import { db } from './firebase'
import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore'
import { logUserActivity } from './activityService'

/**
 * Update user profile dengan history tracking untuk admin
 * @param {string} userId - ID user yang akan diupdate
 * @param {Object} newProfileData - Data profile baru
 * @param {string} updatedBy - Siapa yang mengupdate (user sendiri atau admin)
 * @returns {Promise} Result status
 */
export async function updateUserProfile(userId, newProfileData, updatedBy = 'user') {
  try {
    console.log('🔄 [ProfileService] Starting profile update...', { userId, newProfileData })
    
    // STEP 1: Ambil data profile lama untuk history
    const userRef = doc(db, 'jemaat', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      throw new Error('User tidak ditemukan di database')
    }
    
    const oldProfileData = userSnap.data()
    console.log('📋 [ProfileService] Old profile data:', oldProfileData)
    
    // STEP 2: Deteksi perubahan yang terjadi
    const changes = detectChanges(oldProfileData, newProfileData)
    console.log('🔍 [ProfileService] Detected changes:', changes)
    
    if (changes.length === 0) {
      console.log('ℹ️ [ProfileService] No changes detected, skipping update')
      return { success: true, message: 'Tidak ada perubahan yang terdeteksi' }
    }
    
    // STEP 3: Update profile di collection utama
    const updateData = {
      ...newProfileData,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: updatedBy
    }
    
    await updateDoc(userRef, updateData)
    console.log('✅ [ProfileService] Profile updated in main collection')
    
    // STEP 4: Simpan history untuk admin tracking
    await saveProfileHistory(userId, {
      oldData: oldProfileData,
      newData: newProfileData,
      changes: changes,
      updatedBy: updatedBy,
      updatedAt: serverTimestamp(),
      userAgent: navigator.userAgent || 'Unknown',
      ipAddress: 'Unknown' // Nanti bisa ditambahkan IP detection
    })
    
    console.log('✅ [ProfileService] Profile history saved')
    
    // STEP 5: Log activity untuk admin dashboard
    await logUserActivity(userId, {
      action: 'profile_updated',
      details: `User mengubah ${changes.length} field profile`,
      changes: changes,
      userName: newProfileData.nama || oldProfileData.nama || userId, // Add userName from profile data
      timestamp: serverTimestamp()
    })
    
    return { 
      success: true, 
      message: 'Profile berhasil diupdate',
      changesCount: changes.length 
    }
    
  } catch (error) {
    console.error('❌ [ProfileService] Error updating profile:', error)
    throw error
  }
}

/**
 * Deteksi perubahan antara data lama dan baru
 * @param {Object} oldData - Data lama
 * @param {Object} newData - Data baru
 * @returns {Array} Array perubahan
 */
function detectChanges(oldData, newData) {
  const changes = []
  const trackableFields = ['nama', 'tanggalLahir', 'status', 'sektor', 'jenisKelamin', 'noTelp']
  
  trackableFields.forEach(field => {
    const oldValue = oldData[field] || ''
    const newValue = newData[field] || ''
    
    if (oldValue !== newValue) {
      changes.push({
        field: field,
        fieldLabel: getFieldLabel(field),
        oldValue: oldValue,
        newValue: newValue,
        changeType: oldValue === '' ? 'added' : newValue === '' ? 'removed' : 'modified'
      })
    }
  })
  
  return changes
}

/**
 * Get human readable field label
 * @param {string} fieldName - Field name
 * @returns {string} Human readable label
 */
function getFieldLabel(fieldName) {
  const labels = {
    nama: 'Nama',
    tanggalLahir: 'Tanggal Lahir',
    status: 'Status Pernikahan',
    sektor: 'Sektor',
    jenisKelamin: 'Jenis Kelamin',
    noTelp: 'Nomor Telepon'
  }
  return labels[fieldName] || fieldName
}

/**
 * Simpan history perubahan profile untuk admin
 * @param {string} userId - ID user
 * @param {Object} historyData - Data history
 */
async function saveProfileHistory(userId, historyData) {
  try {
    const historyRef = collection(db, 'profile_history')
    
    const historyRecord = {
      userId: userId,
      userName: historyData.oldData.nama || 'Unknown User',
      ...historyData
    }
    
    await addDoc(historyRef, historyRecord)
    console.log('📝 [ProfileService] History record saved')
    
  } catch (error) {
    console.error('❌ [ProfileService] Error saving history:', error)
    // Jangan throw error, history adalah optional
  }
}

/**
 * Get profile history untuk admin (untuk melihat perubahan)
 * @param {string} userId - ID user
 * @param {number} limit - Limit records
 * @returns {Promise} Array history records
 */
export async function getProfileHistory(userId, limit = 10) {
  try {
    const { query, orderBy, where, getDocs, limit: firestoreLimit } = await import('firebase/firestore')
    
    const historyRef = collection(db, 'profile_history')
    const q = query(
      historyRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      firestoreLimit(limit)
    )
    
    const querySnapshot = await getDocs(q)
    const history = []
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return history
    
  } catch (error) {
    console.error('❌ [ProfileService] Error getting profile history:', error)
    throw error
  }
}