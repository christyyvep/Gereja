// services/schedules.js - UNIFIED SERVICE untuk Admin & User
import { db } from './firebase'
import { 
  collection, 
  getDocs, 
  addDoc,        // ➕ ADD untuk admin
  updateDoc,     // ✏️ UPDATE untuk admin  
  deleteDoc,     // 🗑️ DELETE untuk admin
  doc,           // 📄 GET single doc
  getDoc,        // 📄 GET single doc
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore'

const COLLECTION_NAME = 'worship_schedules'

// =======================================
// 🏷️ KATEGORI IBADAH (SHARED)
// =======================================

export const WORSHIP_CATEGORIES = [
  { value: 'doa-fajar', label: 'Doa Fajar' },
  { value: 'doa-puasa', label: 'Doa Puasa' },
  { value: 'pelnap', label: 'Pelnap' },
  { value: 'pelprap', label: 'Pelprap' },
  { value: 'pelwap', label: 'Pelwap' },
  { value: 'pelprip', label: 'Pelprip' },
  { value: 'pendalaman-alkitab', label: 'Pendalaman Alkitab' },
  { value: 'raya', label: 'Raya' },
  { value: 'sektor-anugerah', label: 'Sektor Anugerah' },
  { value: 'sektor-tesalonika', label: 'Sektor Tesalonika' }
]

// =======================================
// 📊 READ OPERATIONS (USER + ADMIN)
// =======================================

/**
 * 👥 USER FUNCTION: Get jadwal untuk jemaat (published only)
 * Ini function yang sudah ada, tetap sama
 */
export async function getWeeklyWorshipOverview() {
  try {
    console.log('📊 [Schedules] Getting weekly worship overview for users...')
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    // SIMPLIFIED QUERY: Hanya ambil published schedules, filter status di client
    const q = query(
      schedulesRef, 
      where('isPublished', '==', true),
      limit(20) // Ambil lebih banyak untuk filter di client
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      console.log('📋 [Schedules] No published schedules found for users')
      return []
    }
    
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // FILTER DI CLIENT: Hanya yang status active
      if (data.status !== 'active') {
        console.log(`⏭️ [Schedules] Skipping non-active schedule: ${doc.id}`)
        return
      }
      
      const scheduleItem = {
        id: doc.id,
        
        // User-focused fields
        title: data.title || data.theme || 'Jadwal Ibadah',
        category: data.category || 'ibadah-umum',
        dayOfWeek: data.dayOfWeek,
        time: data.time,
        location: data.location || 'Gedung Gereja Utama',
        theme: data.theme || data.title || 'Berkat Tuhan',
        speaker: data.speaker || '',
        description: data.specialNotes || '',
        
        // Display helpers
        categoryLabel: getCategoryLabel(data.category),
        dayLabel: getDayLabel(data.dayOfWeek),
        scheduleText: generateScheduleText(data),
        
        // Basic metadata  
        lastUpdated: data.lastUpdated,
        isPublished: data.isPublished,
        status: data.status
      }
      
      schedules.push(scheduleItem)
    })
    
    // Sort by dayOfWeek di client side
    schedules.sort((a, b) => {
      // Handle 'daily' as -1 untuk tampil pertama
      const aDaySort = a.dayOfWeek === 'daily' ? -1 : (typeof a.dayOfWeek === 'number' ? a.dayOfWeek : parseInt(a.dayOfWeek))
      const bDaySort = b.dayOfWeek === 'daily' ? -1 : (typeof b.dayOfWeek === 'number' ? b.dayOfWeek : parseInt(b.dayOfWeek))
      
      if (aDaySort !== bDaySort) {
        return aDaySort - bDaySort
      }
      return (a.time || '').localeCompare(b.time || '')
    })
    
    console.log(`✅ [Schedules] User schedules loaded: ${schedules.length}`)
    console.log('📋 [Schedules] Sample schedule:', schedules[0])
    return schedules
    
  } catch (error) {
    console.error('❌ [Schedules] Error getting user schedules:', error)
    console.error('❌ [Schedules] Error details:', {
      code: error.code,
      message: error.message
    })
    return []
  }
}

/**
 * 👨‍💼 ADMIN FUNCTION: Get semua jadwal untuk admin (including drafts)
 * Function baru untuk admin - bisa lihat semua data
 */
export async function getWorshipSchedules(includeUnpublished = false) {
  try {
    console.log('🔍 [Schedules] Getting schedules for admin...', { includeUnpublished })
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    let q
    if (includeUnpublished) {
      // Admin bisa lihat semua (published + unpublished)  
      q = query(schedulesRef, orderBy('lastUpdated', 'desc'))
    } else {
      // Admin lihat published only (same as user but with more fields)
      q = query(
        schedulesRef,
        where('isPublished', '==', true), 
        orderBy('lastUpdated', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      console.log('📋 [Schedules] No schedules found for admin')
      return []
    }
    
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      const scheduleItem = {
        id: doc.id,
        
        // Basic info (sama seperti user)
        title: data.title || 'Jadwal Tanpa Judul',
        category: data.category || 'ibadah-umum', 
        dayOfWeek: data.dayOfWeek,
        time: data.time,
        location: data.location || 'Gedung Gereja Utama',
        theme: data.theme || 'Berkat Tuhan',
        speaker: data.speaker || '',
        
        // Admin-specific fields (yang user tidak perlu)
        specialNotes: data.specialNotes || '',
        announcements: data.announcements || [],
        status: data.status || 'active',
        isPublished: data.isPublished !== false,
        isSpecialEvent: data.isSpecialEvent || false,
        
        // Metadata (penting untuk admin)
        createdAt: data.createdAt,
        createdBy: data.createdBy || 'system',
        lastUpdated: data.lastUpdated,
        updatedBy: data.updatedBy || 'system',
        version: data.version || 1,
        
        // Display helpers
        categoryLabel: getCategoryLabel(data.category),
        dayLabel: getDayLabel(data.dayOfWeek),
        lastUpdatedFormatted: formatDateForDisplay(data.lastUpdated),
        createdAtFormatted: formatDateForDisplay(data.createdAt)
      }
      
      schedules.push(scheduleItem)
    })
    
    console.log(`✅ [Schedules] Admin schedules loaded: ${schedules.length}`)
    return schedules
    
  } catch (error) {
    console.error('❌ [Schedules] Error getting admin schedules:', error)
    
    // Handle specific errors
    if (error.code === 'permission-denied') {
      throw new Error('Tidak memiliki akses untuk melihat jadwal')
    }
    
    throw new Error('Gagal mengambil data jadwal')
  }
}

/**
 * 🎯 SHARED FUNCTION: Get single schedule (user + admin)
 */
export async function getWorshipSchedule(scheduleId) {
  try {
    console.log(`🎯 [Schedules] Getting single schedule: ${scheduleId}`)
    
    if (!scheduleId) {
      throw new Error('Schedule ID tidak boleh kosong')
    }
    
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    const scheduleSnap = await getDoc(scheduleRef)
    
    if (!scheduleSnap.exists()) {
      throw new Error('Jadwal tidak ditemukan')
    }
    
    const data = scheduleSnap.data()
    
    // Return full data (admin bisa pakai semua, user pakai yang perlu aja)
    const result = {
      id: scheduleSnap.id,
      
      // Spread remaining data first
      ...data,
      
      // Override with normalized values (important: do this AFTER spread)
      title: data.title || data.theme || 'Jadwal Ibadah',
      category: data.category || 'ibadah-umum',
      dayOfWeek: data.dayOfWeek,
      time: data.time,
      location: data.location || 'Gedung Gereja Utama',
      theme: data.theme || data.title || 'Berkat Tuhan',
      speaker: data.speaker || '',
      description: data.specialNotes || data.description || '', // Prioritize specialNotes
      
      // Display helpers
      categoryLabel: getCategoryLabel(data.category),
      dayLabel: getDayLabel(data.dayOfWeek),
      scheduleText: generateScheduleText(data),
      lastUpdatedFormatted: formatDateForDisplay(data.lastUpdated),
      createdAtFormatted: formatDateForDisplay(data.createdAt)
    }
    
    console.log('✅ [Schedules] Single schedule loaded')
    return result
    
  } catch (error) {
    console.error('❌ [Schedules] Error getting single schedule:', error)
    throw error
  }
}

// =======================================
// ✏️ ADMIN WRITE OPERATIONS
// =======================================

/**
 * ➕ ADMIN ONLY: Create new schedule
 */
export async function createWorshipSchedule(scheduleData) {
  try {
    console.log('➕ [Schedules] Creating new schedule...', scheduleData)
    
    // Validate input
    validateScheduleInput(scheduleData)
    
    const now = new Date().toISOString()
    
    // Prepare data for database
    const newSchedule = {
      // Basic info
      title: scheduleData.title.trim(),
      category: scheduleData.category,
      dayOfWeek: scheduleData.dayOfWeek,
      time: scheduleData.time,
      location: scheduleData.location?.trim() || 'Gedung Gereja Utama',
      
      // Content
      theme: scheduleData.theme?.trim() || 'Berkat Tuhan',
      speaker: scheduleData.speaker?.trim() || '',
      specialNotes: scheduleData.specialNotes?.trim() || '',
      announcements: scheduleData.announcements || [],
      
      // Status
      status: 'active',
      isPublished: scheduleData.isPublished !== false,
      isSpecialEvent: scheduleData.isSpecialEvent || false,
      
      // Metadata
      createdAt: now,
      createdBy: scheduleData.adminId || 'admin',
      lastUpdated: now,
      updatedBy: scheduleData.adminId || 'admin',
      version: 1
    }
    
    // Save to database
    const schedulesRef = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(schedulesRef, newSchedule)
    
    console.log('✅ [Schedules] Schedule created with ID:', docRef.id)
    
    return {
      id: docRef.id,
      ...newSchedule
    }
    
  } catch (error) {
    console.error('❌ [Schedules] Error creating schedule:', error)
    
    if (error.message.includes('Validasi gagal')) {
      throw error
    }
    
    if (error.code === 'permission-denied') {
      throw new Error('Tidak memiliki akses untuk membuat jadwal')
    }
    
    throw new Error('Gagal membuat jadwal baru')
  }
}

/**
 * 📝 ADMIN ONLY: Update existing schedule
 */
export async function updateWorshipSchedule(scheduleId, updateData) {
  try {
    console.log(`📝 [Schedules] Updating schedule: ${scheduleId}`, updateData)
    
    if (!scheduleId) {
      throw new Error('Schedule ID tidak boleh kosong')
    }
    
    // Get existing data first
    const existingSchedule = await getWorshipSchedule(scheduleId)
    
    // Validate update data
    const mergedData = { ...existingSchedule, ...updateData }
    validateScheduleInput(mergedData)
    
    const now = new Date().toISOString()
    
    // Prepare update data
    const updatedData = {
      title: updateData.title?.trim() || existingSchedule.title,
      category: updateData.category || existingSchedule.category,
      dayOfWeek: updateData.dayOfWeek !== undefined ? updateData.dayOfWeek : existingSchedule.dayOfWeek,
      time: updateData.time || existingSchedule.time,
      location: updateData.location?.trim() || existingSchedule.location,
      theme: updateData.theme?.trim() || existingSchedule.theme,
      speaker: updateData.speaker?.trim() || existingSchedule.speaker,
      specialNotes: updateData.specialNotes?.trim() || existingSchedule.specialNotes,
      
      // Ensure status is active (important for user visibility)
      status: updateData.status || 'active',
      
      // Update metadata
      lastUpdated: now,
      updatedBy: updateData.adminId || existingSchedule.updatedBy,
      version: (existingSchedule.version || 1) + 1
    }
    
    // Handle optional fields
    if (updateData.isPublished !== undefined) {
      updatedData.isPublished = updateData.isPublished
    }
    
    if (updateData.isSpecialEvent !== undefined) {
      updatedData.isSpecialEvent = updateData.isSpecialEvent
    }
    
    if (updateData.status) {
      updatedData.status = updateData.status
    }
    
    // Update in database
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    await updateDoc(scheduleRef, updatedData)
    
    console.log('✅ [Schedules] Schedule updated successfully')
    
    return {
      id: scheduleId,
      ...existingSchedule,
      ...updatedData
    }
    
  } catch (error) {
    console.error('❌ [Schedules] Error updating schedule:', error)
    
    if (error.message.includes('Validasi gagal')) {
      throw error
    }
    
    if (error.message.includes('tidak ditemukan')) {
      throw error
    }
    
    if (error.code === 'permission-denied') {
      throw new Error('Tidak memiliki akses untuk mengupdate jadwal')
    }
    
    throw new Error('Gagal mengupdate jadwal')
  }
}

/**
 * 🗑️ ADMIN ONLY: Delete schedule
 */
export async function deleteWorshipSchedule(scheduleId) {
  try {
    console.log(`🗑️ [Schedules] Deleting schedule: ${scheduleId}`)
    
    if (!scheduleId) {
      throw new Error('Schedule ID tidak boleh kosong')
    }
    
    // Check if schedule exists first
    const existingSchedule = await getWorshipSchedule(scheduleId)
    
    if (!existingSchedule) {
      throw new Error('Jadwal tidak ditemukan')
    }
    
    // Delete from database
    const scheduleRef = doc(db, COLLECTION_NAME, scheduleId)
    await deleteDoc(scheduleRef)
    
    console.log('✅ [Schedules] Schedule deleted successfully')
    return true
    
  } catch (error) {
    console.error('❌ [Schedules] Error deleting schedule:', error)
    
    if (error.message.includes('tidak ditemukan')) {
      throw error
    }
    
    if (error.code === 'permission-denied') {
      throw new Error('Tidak memiliki akses untuk menghapus jadwal')
    }
    
    throw new Error('Gagal menghapus jadwal')
  }
}

// =======================================
// 🔄 LEGACY WRAPPER FUNCTIONS (untuk compatibility)
// =======================================

/**
 * Wrapper untuk getWeeklyWorshipOverview (backward compatibility)
 */
export async function getSchedules() {
  return await getWeeklyWorshipOverview()
}

/**
 * Get single schedule (alias)
 */
export async function getSchedule(id) {
  return await getWorshipSchedule(id)
}

/**
 * Get schedules by category
 */
export async function getSchedulesByCategory(category) {
  try {
    const schedules = await getWeeklyWorshipOverview()
    return schedules.filter(schedule => 
      schedule.category?.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('❌ [Schedules] Error getting schedules by category:', error)
    return []
  }
}

// =======================================
// 🛠️ HELPER FUNCTIONS
// =======================================

/**
 * Validate schedule input
 */
function validateScheduleInput(inputData) {
  const errors = []
  
  // Required fields
  if (!inputData.title || inputData.title.trim().length === 0) {
    errors.push('Judul jadwal harus diisi')
  } else if (inputData.title.trim().length < 3) {
    errors.push('Judul minimal 3 karakter')
  }
  
  if (!inputData.category) {
    errors.push('Kategori ibadah harus dipilih')
  }
  
  if (inputData.dayOfWeek === undefined || inputData.dayOfWeek === null) {
    errors.push('Hari ibadah harus dipilih')
  }
  
  if (!inputData.time) {
    errors.push('Waktu ibadah harus diisi')
  }
  
  // Validate category
  const validCategories = WORSHIP_CATEGORIES.map(c => c.value)
  if (inputData.category && !validCategories.includes(inputData.category)) {
    errors.push('Kategori ibadah tidak valid')
  }
  
  // Validate dayOfWeek
  const validDays = [0, 1, 2, 3, 4, 5, 6, 'daily']
  if (inputData.dayOfWeek !== undefined && !validDays.includes(inputData.dayOfWeek)) {
    errors.push('Hari ibadah tidak valid')
  }
  
  // Validate time format
  if (inputData.time && !/^\d{2}:\d{2}$/.test(inputData.time)) {
    errors.push('Format waktu harus HH:mm (contoh: 08:00)')
  }
  
  if (errors.length > 0) {
    throw new Error(`Validasi gagal: ${errors.join(', ')}`)
  }
}

/**
 * Get category label by value
 */
export function getCategoryLabel(categoryValue) {
  const category = WORSHIP_CATEGORIES.find(c => c.value === categoryValue)
  return category ? category.label : 'Tidak diketahui'
}

/**
 * Get day label
 */
function getDayLabel(dayOfWeek) {
  const dayLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  
  if (dayOfWeek === 'daily') {
    return 'Setiap Hari'
  }
  
  if (dayOfWeek >= 0 && dayOfWeek <= 6) {
    return dayLabels[dayOfWeek]
  }
  
  return 'Tidak diketahui'
}

/**
 * Generate schedule text for display
 */
function generateScheduleText(scheduleData) {
  const day = getDayLabel(scheduleData.dayOfWeek)
  const time = scheduleData.time || 'Waktu belum ditentukan'
  const location = scheduleData.location || 'Lokasi belum ditentukan'
  
  return `${day}, ${time} - ${location}`
}

/**
 * Format date for display
 */
function formatDateForDisplay(dateString) {
  if (!dateString) return 'Tidak diketahui'
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid date'
  }
}