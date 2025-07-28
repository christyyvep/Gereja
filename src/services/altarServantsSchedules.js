// services/altarServantsSchedules.js - Service untuk Jadwal Pelayan Altar

import { db } from './firebase'
import { 
  collection, 
  getDocs, 
  addDoc,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore'

const COLLECTION_NAME = 'altar_servants_schedules'

// =======================================
// 📋 KATEGORI IBADAH (dari schedules.js)
// =======================================

export const WORSHIP_CATEGORIES = [
  { value: 'doa-fajar', label: 'Doa Fajar' },
  { value: 'ibadah-minggu', label: 'Ibadah Minggu' },
  { value: 'pemahaman-alkitab', label: 'Pemahaman Alkitab' },
  { value: 'doa-puasa', label: 'Doa Puasa' },
  { value: 'pelprip', label: 'Pelayanan Pribadi' },
  { value: 'pelwap', label: 'Pelayanan Wanita' },
  { value: 'ibadah-umum', label: 'Ibadah Umum' },
  { value: 'kebaktian-khusus', label: 'Kebaktian Khusus' }
]

// =======================================
// 🏗️ TEMPLATE FACTORY - ALTAR SERVANTS
// =======================================

class AltarServantsTemplateFactory {
  
  /**
   * Generate template baru untuk jadwal pelayan altar
   * @param {Object} basicInfo - Info dasar dari admin
   * @returns {Object} Template jadwal pelayan altar
   */
  static createNewSchedule(basicInfo) {
    const now = new Date().toISOString()
    
    return {
      // Basic info
      jenisIbadah: basicInfo.jenisIbadah,
      tanggal: basicInfo.tanggal,
      description: basicInfo.description || '', // Support admin description
      
      // Pelayan info
      pelayananInfo: {
        pengkhotbah: basicInfo.pengkhotbah || '',
        worshipLeader: basicInfo.worshipLeader || '',
        singers: basicInfo.singers || '',
        music: basicInfo.music || '',
        tambourine: basicInfo.tambourine || '',
        banners: basicInfo.banners || '',
        multimedia: basicInfo.multimedia || ''
      },
      
      // Status
      status: 'active',
      isPublished: true,
      
      // Metadata
      createdAt: now,
      createdBy: basicInfo.adminId || 'admin',
      lastUpdated: now,
      updatedBy: basicInfo.adminId || 'admin',
      version: 1
    }
  }
}

// =======================================
// 🎯 CRUD OPERATIONS - ALTAR SERVANTS
// =======================================

/**
 * 📋 Get semua jadwal pelayan altar (untuk user)
 * @returns {Promise<Array>} Array jadwal pelayan altar
 */
export async function getAltarServantsSchedules() {
  try {
    console.log('🔍 [AltarServants] Mengambil jadwal pelayan altar...')
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    // Simplified query without compound indexes
    const querySnapshot = await getDocs(schedulesRef)
    
    if (querySnapshot.empty) {
      console.log('📋 [AltarServants] Collection kosong, returning empty array')
      return []
    }
    
    const schedules = []
    const allDocIds = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      allDocIds.push(doc.id) // Track all document IDs
      
      // Filter active dan published schedules di client side
      if (data.status === 'active' && data.isPublished === true) {
        const scheduleItem = {
          // Gunakan Firestore document ID sebagai ID utama
          id: doc.id,
          
          // Map field-field spesifik (tidak spread data untuk avoid custom id)
          jenisIbadah: data.jenisIbadah,
          tanggal: data.tanggal,
          status: data.status,
          isPublished: data.isPublished,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          lastUpdated: data.lastUpdated,
          updatedBy: data.updatedBy,
          version: data.version,
          
          // Ensure required properties exist
          title: getCategoryLabel(data.jenisIbadah) || 'Jadwal Pelayanan',
          description: data.description || data.specialNotes || '', // Support for admin description
          category: data.jenisIbadah, // Ensure category is set for compatibility
          
          // Ensure pelayananInfo exists
          pelayananInfo: data.pelayananInfo || {
            pengkhotbah: '',
            worshipLeader: '',
            singers: '',
            music: '',
            tambourine: '',
            banners: '',
            multimedia: ''
          },
          
          // Format untuk display
          displayDate: formatDateForDisplay(data.tanggal) || 'Tanggal tidak valid',
          categoryLabel: getCategoryLabel(data.jenisIbadah) || 'Kategori tidak diketahui',
          
          // Generate summary text
          summaryText: generateSummaryText(data) || 'Pelayanan belum ditentukan'
        }
        
        schedules.push(scheduleItem)
      }
    })
    
    // Sort by date di client side (newest first)
    schedules.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    
    console.log(`✅ [AltarServants] Berhasil memuat ${schedules.length} jadwal`)
    console.log(`🔍 [AltarServants] All document IDs in collection:`, allDocIds)
    console.log(`🔍 [AltarServants] Active/Published IDs:`, schedules.map(s => s.id))
    if (schedules.length > 0) {
      console.log('🔍 [AltarServants] Sample data:', schedules[0])
    }
    return schedules
    
  } catch (error) {
    console.error('❌ [AltarServants] Error mengambil jadwal:', error)
    
    // Handle specific Firestore errors
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log('📋 [AltarServants] Collection atau index belum ada, returning empty array')
      return []
    }
    
    throw error
  }
}

/**
 * 🎯 Get single jadwal pelayan altar by ID
 * @param {string} scheduleId - ID jadwal
 * @returns {Promise<Object>} Detail jadwal
 */
export async function getAltarServantsSchedule(scheduleId) {
  try {
    console.log(`🔍 [AltarServants] Mengambil detail jadwal: ${scheduleId}`)
    
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    const scheduleSnap = await getDoc(scheduleRef)
    
    if (scheduleSnap.exists()) {
      const data = scheduleSnap.data()
      console.log(`✅ [AltarServants] Document ditemukan: ${scheduleSnap.id}`)
      
      const result = {
        id: scheduleSnap.id,
        jenisIbadah: data.jenisIbadah,
        tanggal: data.tanggal,
        status: data.status,
        isPublished: data.isPublished,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        lastUpdated: data.lastUpdated,
        updatedBy: data.updatedBy,
        version: data.version,
        pelayananInfo: data.pelayananInfo || {},
        displayDate: formatDateForDisplay(data.tanggal),
        categoryLabel: getCategoryLabel(data.jenisIbadah),
        
        // Add properties required by DetailJadwal
        title: getCategoryLabel(data.jenisIbadah) || 'Jadwal Pelayanan',
        description: data.description || data.specialNotes || '',
        category: data.jenisIbadah
      }
      
      return result
    }
    
    console.log(`❌ [AltarServants] Document tidak ditemukan: ${scheduleId}`)
    throw new Error(`Jadwal tidak ditemukan: ${scheduleId}`)
    
  } catch (error) {
    console.error('❌ [AltarServants] Error mengambil detail jadwal:', error)
    console.error('❌ [AltarServants] Error code:', error.code)
    console.error('❌ [AltarServants] Error message:', error.message)
    throw error
  }
}

/**
 * ➕ Create jadwal pelayan altar baru (untuk admin)
 * @param {Object} scheduleData - Data jadwal baru
 * @returns {Promise<Object>} Jadwal yang berhasil dibuat
 */
export async function createAltarServantsSchedule(scheduleData) {
  try {
    console.log('🔄 [AltarServants] Membuat jadwal baru...')
    
    // Validate input
    validateScheduleData(scheduleData)
    
    // Generate template
    const newSchedule = AltarServantsTemplateFactory.createNewSchedule(scheduleData)
    
    // Save to database
    const schedulesRef = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(schedulesRef, newSchedule)
    
    console.log(`✅ [AltarServants] Jadwal berhasil dibuat: ${docRef.id}`)
    
    // Return dengan Firestore document ID saja
    return {
      id: docRef.id,
      jenisIbadah: newSchedule.jenisIbadah,
      tanggal: newSchedule.tanggal,
      status: newSchedule.status,
      isPublished: newSchedule.isPublished,
      pelayananInfo: newSchedule.pelayananInfo,
      createdAt: newSchedule.createdAt,
      createdBy: newSchedule.createdBy,
      lastUpdated: newSchedule.lastUpdated,
      updatedBy: newSchedule.updatedBy,
      version: newSchedule.version,
      displayDate: formatDateForDisplay(newSchedule.tanggal),
      categoryLabel: getCategoryLabel(newSchedule.jenisIbadah)
    }
    
  } catch (error) {
    console.error('❌ [AltarServants] Error membuat jadwal:', error)
    throw error
  }
}

/**
 * ✏️ Update jadwal pelayan altar (untuk admin)
 * @param {string} scheduleId - ID jadwal
 * @param {Object} updateData - Data yang akan diupdate
 * @returns {Promise<boolean>} Status update
 */
export async function updateAltarServantsSchedule(scheduleId, updateData) {
  try {
    console.log(`🔄 [AltarServants] Mengupdate jadwal: ${scheduleId}`)
    
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    
    const updatedData = {
      ...updateData,
      lastUpdated: new Date().toISOString(),
      updatedBy: updateData.adminId || 'admin',
      version: (updateData.version || 1) + 1
    }
    
    await updateDoc(scheduleRef, updatedData)
    
    console.log(`✅ [AltarServants] Jadwal berhasil diupdate: ${scheduleId}`)
    return true
    
  } catch (error) {
    console.error('❌ [AltarServants] Error mengupdate jadwal:', error)
    throw error
  }
}

/**
 * 🗑️ Delete jadwal pelayan altar (untuk admin)
 * @param {string} scheduleId - ID jadwal
 * @returns {Promise<boolean>} Status delete
 */
export async function deleteAltarServantsSchedule(scheduleId) {
  try {
    console.log(`🔄 [AltarServants] Menghapus jadwal: ${scheduleId}`)
    
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    
    // Soft delete: set status inactive instead of hard delete
    await updateDoc(scheduleRef, {
      status: 'deleted',
      isPublished: false,
      deletedAt: new Date().toISOString(),
      deletedBy: 'admin' // TODO: get from auth
    })
    
    console.log(`✅ [AltarServants] Jadwal berhasil dihapus: ${scheduleId}`)
    return true
    
  } catch (error) {
    console.error('❌ [AltarServants] Error menghapus jadwal:', error)
    throw error
  }
}

// =======================================
// 🛠️ HELPER FUNCTIONS
// =======================================

/**
 * Validate schedule data
 * @param {Object} data - Data to validate
 */
function validateScheduleData(data) {
  const required = ['jenisIbadah', 'tanggal']
  const missing = required.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Field wajib tidak ada: ${missing.join(', ')}`)
  }
  
  // Validate jenis ibadah
  const validCategories = WORSHIP_CATEGORIES.map(cat => cat.value)
  if (!validCategories.includes(data.jenisIbadah)) {
    throw new Error('Jenis ibadah tidak valid')
  }
  
  // Validate tanggal format
  if (!isValidDate(data.tanggal)) {
    throw new Error('Format tanggal tidak valid (gunakan YYYY-MM-DD)')
  }
}

/**
 * Check if date string is valid
 * @param {string} dateString - Date string to check
 * @returns {boolean} Is valid
 */
function isValidDate(dateString) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/)
}

/**
 * Format date untuk display
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
function formatDateForDisplay(dateString) {
  if (!dateString) return 'Tanggal tidak valid'
  
  try {
    const date = new Date(dateString)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${dayName}, ${day} ${month} ${year}`
  } catch (error) {
    return 'Tanggal tidak valid'
  }
}

/**
 * Get category label dari value
 * @param {string} categoryValue - Category value
 * @returns {string} Category label
 */
function getCategoryLabel(categoryValue) {
  if (!categoryValue) return 'Kategori tidak diketahui'
  
  const category = WORSHIP_CATEGORIES.find(cat => cat.value === categoryValue)
  return category ? category.label : categoryValue
}

/**
 * Generate summary text untuk card display
 * @param {Object} scheduleData - Schedule data
 * @returns {string} Summary text
 */
function generateSummaryText(scheduleData) {
  const pelayananInfo = scheduleData.pelayananInfo || {}
  const parts = []
  
  if (pelayananInfo.pengkhotbah) {
    parts.push(`Pengkhotbah: ${pelayananInfo.pengkhotbah}`)
  }
  
  if (pelayananInfo.worshipLeader) {
    parts.push(`Worship Leader: ${pelayananInfo.worshipLeader}`)
  }
  
  if (parts.length === 0) {
    return 'Pelayanan belum ditentukan'
  }
  
  return parts.slice(0, 2).join(' • ')
}

// =======================================
// 🧹 UTILITY FUNCTIONS - CLEANUP
// =======================================

/**
 * 🧹 Cleanup custom ID fields dari dokumen (utility function)
 * Menghapus field 'id' custom dari dalam dokumen jika ada
 * @returns {Promise<void>} Cleanup status
 */
export async function cleanupCustomIds() {
  try {
    console.log('🧹 [AltarServants] Memulai cleanup custom ID fields...')
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    const querySnapshot = await getDocs(schedulesRef)
    
    let cleanedCount = 0
    const cleanupPromises = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Cek apakah ada field 'id' di dalam dokumen
      if (data.id && data.id !== doc.id) {
        console.log(`🧹 [AltarServants] Menghapus custom ID dari dokumen: ${doc.id}`)
        
        // Buat update object tanpa field 'id' custom
        const cleanData = { ...data }
        delete cleanData.id // Hapus field 'id' custom
        
        const docRef = doc.ref
        cleanupPromises.push(
          updateDoc(docRef, cleanData).then(() => {
            cleanedCount++
            console.log(`✅ [AltarServants] Cleaned document: ${doc.id}`)
          })
        )
      }
    })
    
    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises)
      console.log(`✅ [AltarServants] Cleanup selesai: ${cleanedCount} dokumen dibersihkan`)
    } else {
      console.log('✅ [AltarServants] Tidak ada custom ID yang perlu dibersihkan')
    }
    
  } catch (error) {
    console.error('❌ [AltarServants] Error during cleanup:', error)
    throw error
  }
}

// =======================================
// 🔄 COMPATIBILITY EXPORTS
// =======================================

// Note: Main functions sudah di-export secara individual di atas
// Helper functions di-export di bawah (WORSHIP_CATEGORIES sudah di-export di atas)

export {
  // Helper functions
  validateScheduleData,
  formatDateForDisplay,
  getCategoryLabel
}
