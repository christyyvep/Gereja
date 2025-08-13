/**
 * Jemaat Service - CRUD Operations for Church Members
 * Handles all database operations for jemaat (church members) data
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Get all jemaat with their roles and status
 * @returns {Promise<Array>} Array of jemaat data
 */
export async function getAllJemaat() {
  try {
    console.log('🔍 [JemaatService] Loading all jemaat data...')
    
    const jemaatRef = collection(db, 'jemaat')
    const q = query(jemaatRef, orderBy('nama', 'asc'))
    const snapshot = await getDocs(q)
    
    const jemaatList = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      
      // Remove password for security
      delete data.password
      
      jemaatList.push({
        id: doc.id,
        ...data,
        // Ensure default values
        role: data.role || 'jemaat',
        isRegistered: data.isRegistered || false,
        sektor: data.sektor || '',
        status: data.status || '',
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        lastLoginAt: data.lastLoginAt || null
      })
    })
    
    console.log(`✅ [JemaatService] Loaded ${jemaatList.length} jemaat records`)
    return jemaatList
    
  } catch (error) {
    console.error('❌ [JemaatService] Error loading jemaat:', error)
    throw new Error('Gagal memuat data jemaat: ' + error.message)
  }
}

/**
 * Get jemaat by ID
 * @param {string} jemaatId - The jemaat document ID
 * @returns {Promise<Object|null>} Jemaat data or null if not found
 */
export async function getJemaatById(jemaatId) {
  try {
    console.log('🔍 [JemaatService] Getting jemaat by ID:', jemaatId)
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      console.log('ℹ️ [JemaatService] Jemaat not found:', jemaatId)
      return null
    }
    
    const data = jemaatDoc.data()
    
    // Remove password for security
    delete data.password
    
    const jemaatData = {
      id: jemaatDoc.id,
      ...data,
      role: data.role || 'jemaat',
      isRegistered: data.isRegistered || false
    }
    
    console.log('✅ [JemaatService] Jemaat found:', jemaatData.nama)
    return jemaatData
    
  } catch (error) {
    console.error('❌ [JemaatService] Error getting jemaat:', error)
    throw new Error('Gagal mendapatkan data jemaat: ' + error.message)
  }
}

/**
 * Get jemaat by name
 * @param {string} nama - The jemaat name
 * @returns {Promise<Object|null>} Jemaat data or null if not found
 */
export async function getJemaatByNama(nama) {
  try {
    console.log('🔍 [JemaatService] Getting jemaat by name:', nama)
    
    const jemaatRef = collection(db, 'jemaat')
    const q = query(jemaatRef, where('nama', '==', nama))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      console.log('ℹ️ [JemaatService] Jemaat not found by name:', nama)
      return null
    }
    
    const jemaatDoc = snapshot.docs[0]
    const data = jemaatDoc.data()
    
    // Remove password for security
    delete data.password
    
    const jemaatData = {
      id: jemaatDoc.id,
      ...data,
      role: data.role || 'jemaat',
      isRegistered: data.isRegistered || false
    }
    
    console.log('✅ [JemaatService] Jemaat found by name:', jemaatData.nama)
    return jemaatData
    
  } catch (error) {
    console.error('❌ [JemaatService] Error getting jemaat by name:', error)
    throw new Error('Gagal mendapatkan data jemaat: ' + error.message)
  }
}

/**
 * Create new jemaat record
 * @param {Object} jemaatData - The jemaat data to create
 * @returns {Promise<Object>} Created jemaat data with ID
 */
export async function createJemaat(jemaatData) {
  try {
    console.log('📝 [JemaatService] Creating new jemaat:', jemaatData.nama)
    
    // Validate required fields
    if (!jemaatData.nama) {
      throw new Error('Nama jemaat wajib diisi')
    }
    
    // Check if jemaat already exists
    const existing = await getJemaatByNama(jemaatData.nama)
    if (existing) {
      throw new Error('Jemaat dengan nama tersebut sudah ada')
    }
    
    // Prepare data for creation
    const newJemaatData = {
      ...jemaatData,
      role: jemaatData.role || 'jemaat',
      isRegistered: jemaatData.isRegistered || false,
      sektor: jemaatData.sektor || '',
      status: jemaatData.status || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null
    }
    
    // If password is provided, keep it (for admin creation)
    if (jemaatData.password) {
      newJemaatData.password = jemaatData.password
    }
    
    const jemaatRef = collection(db, 'jemaat')
    const docRef = await addDoc(jemaatRef, newJemaatData)
    
    // Get the created document to return complete data
    const createdJemaat = await getJemaatById(docRef.id)
    
    console.log('✅ [JemaatService] Jemaat created successfully:', createdJemaat.nama)
    return createdJemaat
    
  } catch (error) {
    console.error('❌ [JemaatService] Error creating jemaat:', error)
    throw new Error('Gagal menambah jemaat: ' + error.message)
  }
}

/**
 * Update jemaat record
 * @param {string} jemaatId - The jemaat document ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Updated jemaat data
 */
export async function updateJemaat(jemaatId, updateData) {
  try {
    console.log('📝 [JemaatService] Updating jemaat:', jemaatId)
    
    // Get current jemaat data
    const currentJemaat = await getJemaatById(jemaatId)
    if (!currentJemaat) {
      throw new Error('Jemaat tidak ditemukan')
    }
    
    // If name is being updated, check for duplicates
    if (updateData.nama && updateData.nama !== currentJemaat.nama) {
      const existing = await getJemaatByNama(updateData.nama)
      if (existing && existing.id !== jemaatId) {
        throw new Error('Jemaat dengan nama tersebut sudah ada')
      }
    }
    
    // Prepare update data
    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp()
    }
    
    // Remove fields that shouldn't be updated via this method
    delete updatePayload.id
    delete updatePayload.createdAt
    delete updatePayload.password // Password updates should use separate method
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    await updateDoc(jemaatRef, updatePayload)
    
    // Get updated document
    const updatedJemaat = await getJemaatById(jemaatId)
    
    console.log('✅ [JemaatService] Jemaat updated successfully:', updatedJemaat.nama)
    return updatedJemaat
    
  } catch (error) {
    console.error('❌ [JemaatService] Error updating jemaat:', error)
    throw new Error('Gagal mengupdate jemaat: ' + error.message)
  }
}

/**
 * Update jemaat role
 * @param {string} jemaatId - The jemaat document ID
 * @param {string} newRole - The new role to assign
 * @returns {Promise<Object>} Updated jemaat data
 */
export async function updateJemaatRole(jemaatId, newRole) {
  try {
    console.log('🔧 [JemaatService] Updating jemaat role:', jemaatId, 'to', newRole)
    
    const validRoles = ['jemaat', 'operator', 'gembala', 'admin']
    if (!validRoles.includes(newRole)) {
      throw new Error('Role tidak valid')
    }
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    await updateDoc(jemaatRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    })
    
    const updatedJemaat = await getJemaatById(jemaatId)
    
    console.log('✅ [JemaatService] Jemaat role updated successfully:', updatedJemaat.nama, 'is now', newRole)
    return updatedJemaat
    
  } catch (error) {
    console.error('❌ [JemaatService] Error updating jemaat role:', error)
    throw new Error('Gagal mengupdate role jemaat: ' + error.message)
  }
}

/**
 * Delete jemaat record
 * @param {string} jemaatId - The jemaat document ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteJemaat(jemaatId) {
  try {
    console.log('🗑️ [JemaatService] Deleting jemaat:', jemaatId)
    
    // Get jemaat data before deletion (for logging)
    const jemaatData = await getJemaatById(jemaatId)
    if (!jemaatData) {
      throw new Error('Jemaat tidak ditemukan')
    }
    
    // Check if trying to delete an admin/gembala (safety check)
    if (jemaatData.role === 'admin' || jemaatData.role === 'gembala') {
      console.warn('⚠️ [JemaatService] Attempting to delete admin/gembala:', jemaatData.nama)
      // Allow deletion but log warning
    }
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    await deleteDoc(jemaatRef)
    
    console.log('✅ [JemaatService] Jemaat deleted successfully:', jemaatData.nama)
    return true
    
  } catch (error) {
    console.error('❌ [JemaatService] Error deleting jemaat:', error)
    throw new Error('Gagal menghapus jemaat: ' + error.message)
  }
}

/**
 * Search jemaat by name or sektor
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching jemaat
 */
export async function searchJemaat(searchTerm) {
  try {
    console.log('🔍 [JemaatService] Searching jemaat:', searchTerm)
    
    if (!searchTerm) {
      return await getAllJemaat()
    }
    
    // Get all jemaat and filter locally (Firestore doesn't support case-insensitive search)
    const allJemaat = await getAllJemaat()
    
    const searchLower = searchTerm.toLowerCase()
    const results = allJemaat.filter(jemaat => 
      jemaat.nama.toLowerCase().includes(searchLower) ||
      (jemaat.sektor && jemaat.sektor.toLowerCase().includes(searchLower))
    )
    
    console.log(`✅ [JemaatService] Found ${results.length} matching jemaat`)
    return results
    
  } catch (error) {
    console.error('❌ [JemaatService] Error searching jemaat:', error)
    throw new Error('Gagal mencari jemaat: ' + error.message)
  }
}

/**
 * Get jemaat statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getJemaatStatistics() {
  try {
    console.log('📊 [JemaatService] Getting jemaat statistics...')
    
    const allJemaat = await getAllJemaat()
    
    const stats = {
      total: allJemaat.length,
      registered: allJemaat.filter(j => j.isRegistered).length,
      unregistered: allJemaat.filter(j => !j.isRegistered).length,
      admin: allJemaat.filter(j => j.role === 'admin').length,
      gembala: allJemaat.filter(j => j.role === 'gembala').length,
      operator: allJemaat.filter(j => j.role === 'operator').length,
      jemaat: allJemaat.filter(j => j.role === 'jemaat' || !j.role).length,
      bySector: {}
    }
    
    // Count by sector
    allJemaat.forEach(jemaat => {
      const sektor = jemaat.sektor || 'Tidak Ada Sektor'
      stats.bySector[sektor] = (stats.bySector[sektor] || 0) + 1
    })
    
    console.log('✅ [JemaatService] Statistics calculated:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ [JemaatService] Error getting statistics:', error)
    throw new Error('Gagal mendapatkan statistik jemaat: ' + error.message)
  }
}

/**
 * Batch update multiple jemaat records
 * @param {Array} updates - Array of {id, data} objects
 * @returns {Promise<boolean>} Success status
 */
export async function batchUpdateJemaat(updates) {
  try {
    console.log('📦 [JemaatService] Batch updating jemaat:', updates.length, 'records')
    
    if (updates.length === 0) {
      return true
    }
    
    const batch = writeBatch(db)
    
    updates.forEach(update => {
      const jemaatRef = doc(db, 'jemaat', update.id)
      batch.update(jemaatRef, {
        ...update.data,
        updatedAt: serverTimestamp()
      })
    })
    
    await batch.commit()
    
    console.log('✅ [JemaatService] Batch update completed successfully')
    return true
    
  } catch (error) {
    console.error('❌ [JemaatService] Error in batch update:', error)
    throw new Error('Gagal melakukan batch update: ' + error.message)
  }
}

/**
 * Check if jemaat name exists
 * @param {string} nama - The name to check
 * @param {string} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if exists
 */
export async function jemaatNameExists(nama, excludeId = null) {
  try {
    const existing = await getJemaatByNama(nama)
    
    if (!existing) {
      return false
    }
    
    // If excluding an ID (for updates), check if it's the same record
    if (excludeId && existing.id === excludeId) {
      return false
    }
    
    return true
    
  } catch (error) {
    console.error('❌ [JemaatService] Error checking name existence:', error)
    return false
  }
}

/**
 * Update last login timestamp for jemaat
 * @param {string} jemaatId - The jemaat document ID
 * @returns {Promise<boolean>} Success status
 */
export async function updateLastLogin(jemaatId) {
  try {
    console.log('🕒 [JemaatService] Updating last login for:', jemaatId)
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    await updateDoc(jemaatRef, {
      lastLoginAt: serverTimestamp()
    })
    
    console.log('✅ [JemaatService] Last login updated')
    return true
    
  } catch (error) {
    console.error('❌ [JemaatService] Error updating last login:', error)
    return false
  }
}

/**
 * Check if jemaat has password set
 * @param {string} jemaatId - Jemaat ID
 * @returns {Promise<boolean>} True if password exists
 */
export async function checkJemaatPassword(jemaatId) {
  try {
    console.log('🔍 [JemaatService] Checking password status for:', jemaatId)
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      throw new Error('Jemaat not found')
    }
    
    const data = jemaatDoc.data()
    const hasPassword = data.password && data.password.trim() !== ''
    
    console.log('✅ [JemaatService] Password status checked:', hasPassword)
    return hasPassword
    
  } catch (error) {
    console.error('❌ [JemaatService] Error checking password:', error)
    return false
  }
}

/**
 * Reset jemaat password
 * @param {string} jemaatId - Jemaat ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
export async function resetJemaatPassword(jemaatId, newPassword) {
  try {
    console.log('🔄 [JemaatService] Resetting password for:', jemaatId)
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }
    
    const jemaatRef = doc(db, 'jemaat', jemaatId)
    const jemaatDoc = await getDoc(jemaatRef)
    
    if (!jemaatDoc.exists()) {
      throw new Error('Jemaat not found')
    }
    
    // Update password and mark as registered if not already
    const updateData = {
      password: newPassword,
      isRegistered: true,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(jemaatRef, updateData)
    
    console.log('✅ [JemaatService] Password reset successfully')
    return true
    
  } catch (error) {
    console.error('❌ [JemaatService] Error resetting password:', error)
    throw error
  }
}

// Legacy function compatibility
export const getAllUsersWithRoles = getAllJemaat
