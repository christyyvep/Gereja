// services/worshipSchedules.js - New simplified worship schedule system
import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  updateDoc, 
  query, 
  orderBy
} from 'firebase/firestore'

const COLLECTION_NAME = 'worship_schedules'

/**
 * 🎯 NEW MAIN FUNCTION - Get weekly worship overview (10 cards)
 * Mengambil 10 template worship dan generate info untuk minggu ini
 * @returns {Promise<Array>} Array 10 worship cards untuk minggu ini
 */
export async function getWeeklyWorshipOverview() {
  try {
    console.log(`📅 [Worship Service] Getting weekly worship overview...`)
    
    // 1. Ambil semua worship templates yang aktif
    const templates = await getWorshipTemplates()
    const activeTemplates = templates.filter(t => t.isActive)
    
    // 2. Calculate minggu ini
    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay() // 0 = Minggu
    startOfWeek.setDate(today.getDate() - dayOfWeek) // Mundur ke Minggu
    
    // 3. Generate unique card untuk setiap template
    const weeklyCards = []
    const processedTemplates = new Set() // Track templates yang sudah diproses
    
    for (const template of activeTemplates) {
      // Skip jika template sudah diproses
      if (processedTemplates.has(template.id)) continue
      
      // Generate card dan tambahkan ke hasil
      const card = generateWeeklyCard(template, startOfWeek)
      weeklyCards.push(card)
      processedTemplates.add(template.id)
    }
    
    // 4. Sort berdasarkan dayOfWeek, lalu time
    weeklyCards.sort((a, b) => {
      // Daily (Doa Fajar) selalu di atas
      if (a.dayOfWeek === 'daily' && b.dayOfWeek !== 'daily') return -1
      if (a.dayOfWeek !== 'daily' && b.dayOfWeek === 'daily') return 1
      if (a.dayOfWeek === 'daily' && b.dayOfWeek === 'daily') return 0
      
      // Sort berdasarkan hari, lalu waktu
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek
      }
      return compareTimeStrings(a.time, b.time)
    })
    
    console.log(`✅ [Worship Service] Generated ${weeklyCards.length} unique weekly worship cards`)
    return weeklyCards
    
  } catch (error) {
    console.error('❌ [Worship Service] Error getting weekly overview:', error)
    throw error
  }
}

/**
 * 🏗️ Generate weekly card dari template untuk minggu ini
 * @param {Object} template - Worship template
 * @param {Date} startOfWeek - Hari Minggu minggu ini
 * @returns {Object} Weekly worship card
 */
function generateWeeklyCard(template, startOfWeek) {
  // Calculate tanggal spesifik untuk ibadah ini minggu ini
  let worshipDate = null
  let dayName = ''
  
  if (template.dayOfWeek === 'daily') {
    // Doa Fajar - setiap hari
    dayName = 'Setiap Hari'
    worshipDate = null // Tidak ada tanggal spesifik
  } else {
    // Ibadah mingguan - hitung tanggal spesifiknya
    worshipDate = new Date(startOfWeek)
    worshipDate.setDate(startOfWeek.getDate() + template.dayOfWeek)
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    dayName = days[template.dayOfWeek]
  }
  
  // Get weekly override untuk tanggal ini (jika ada)
  const dateString = worshipDate ? worshipDate.toISOString().split('T')[0] : null
  const weeklyOverride = dateString ? (template.weeklyOverrides?.[dateString] || {}) : {}
  
  // Apply template variables
  const processedDescription = applyTemplateVariables(
    weeklyOverride.description || template.template?.description || template.description,
    {
      theme: weeklyOverride.theme || template.template?.defaultTheme || 'Berkat Tuhan',
      date: worshipDate ? formatDateIndonesian(dateString) : 'Setiap Hari',
      location: weeklyOverride.location || template.location
    }
  )
  
  // Build weekly card
  const card = {
    id: template.id,
    templateId: template.id,
    
    // Basic info
    title: weeklyOverride.title || template.title,
    description: processedDescription,
    category: template.category,
    
    // Schedule info
    dayOfWeek: template.dayOfWeek,
    dayName: dayName,
    date: dateString, // Tanggal spesifik (atau null untuk daily)
    time: weeklyOverride.time || template.time,
    location: weeklyOverride.location || template.location,
    
    // Additional info
    theme: weeklyOverride.theme || template.template?.defaultTheme || '',
    announcements: weeklyOverride.announcements || template.template?.announcements || [],
    
    // Display formatting
    scheduleText: generateScheduleText(dayName, worshipDate, weeklyOverride.time || template.time),
    
    // Metadata
    isWeeklyCard: true,
    weekStartDate: startOfWeek.toISOString().split('T')[0],
    source: 'weekly-overview'
  }
  
  return card
}

/**
 * 📝 Generate readable schedule text
 * @param {string} dayName - Nama hari (Minggu, Senin, dst)
 * @param {Date|null} date - Tanggal spesifik
 * @param {string} time - Waktu (HH:MM)
 * @returns {string} Text jadwal yang readable
 */
function generateScheduleText(dayName, date, time) {
  if (!date) {
    // Daily schedule
    return `${dayName} • ${time}`
  }
  
  // Weekly schedule
  const day = date.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = months[date.getMonth()]
  
  return `${dayName}, ${day} ${month} • ${time}`
}

/**
 * 🎯 Get schedules untuk range tanggal (untuk view mingguan/bulanan)
 * @param {string} startDate - Start date (YYYY-MM-DD) 
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array schedules dalam range
 */
export async function getWorshipSchedulesByDateRange(startDate, endDate) {
  try {
    const allSchedules = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Loop setiap tanggal dalam range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const daySchedules = await getWorshipSchedulesByDate(dateString)
      allSchedules.push(...daySchedules)
    }
    
    // Sort by date then time
    allSchedules.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return compareTimeStrings(a.time, b.time)
    })
    
    console.log(`📅 [Worship Service] Found ${allSchedules.length} schedules between ${startDate} and ${endDate}`)
    return allSchedules
    
  } catch (error) {
    console.error('❌ [Worship Service] Error getting schedules by range:', error)
    return []
  }
}

/**
 * 🎯 Get upcoming schedules (untuk homepage) - FIXED VERSION
 * @param {number} days - Number of days ke depan
 * @returns {Promise<Array>} Array upcoming schedules
 */
export async function getUpcomingWorshipSchedules(days = 7) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    const endDateString = endDate.toISOString().split('T')[0]
    
    console.log(`📅 [Worship Service] Getting upcoming schedules: ${today} to ${endDateString}`)
    
    return await getWorshipSchedulesByDateRange(today, endDateString)
  } catch (error) {
    console.error('❌ [Worship Service] Error getting upcoming schedules:', error)
    return []
  }
}

/**
 * 📋 Get semua worship templates (untuk admin)
 * @returns {Promise<Array>} Array worship templates
 */
export async function getWorshipTemplates() {
  try {
    const templatesRef = collection(db, COLLECTION_NAME)
    const q = query(templatesRef, orderBy('dayOfWeek', 'asc'))
    
    const querySnapshot = await getDocs(q)
    const templates = []
    
    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`📋 [Worship Service] Found ${templates.length} worship templates`)
    return templates
  } catch (error) {
    console.error('❌ [Worship Service] Error getting templates:', error)
    return []
  }
}

/**
 * 🏗️ Generate worship schedule dari template untuk tanggal tertentu
 * @param {Object} template - Worship template
 * @param {string} dateString - Target date (YYYY-MM-DD)
 * @returns {Object} Generated worship schedule
 */
function generateWorshipFromTemplate(template, dateString) {
  // Cek apakah ada weekly override untuk tanggal ini
  const weeklyOverride = template.weeklyOverrides?.[dateString] || {}
  
  // Apply template variables
  const processedDescription = applyTemplateVariables(
    weeklyOverride.description || template.template?.description || template.description,
    {
      theme: weeklyOverride.theme || template.template?.defaultTheme || 'Berkat Tuhan',
      date: formatDateIndonesian(dateString),
      location: weeklyOverride.location || template.location
    }
  )
  
  // Build final schedule
  const schedule = {
    id: `${template.id}_${dateString}`,
    templateId: template.id,
    
    // Basic info
    title: weeklyOverride.title || template.title,
    description: processedDescription,
    category: template.category,
    date: dateString,
    time: weeklyOverride.time || template.time,
    location: weeklyOverride.location || template.location,
    
    // Additional info
    announcements: weeklyOverride.announcements || template.template?.announcements || [],
    theme: weeklyOverride.theme || template.template?.defaultTheme || '',
    
    // Metadata
    isGenerated: true,
    generatedAt: new Date(),
    source: 'worship-template'
  }
  
  return schedule
}

/**
 * 🔧 Apply template variables ke string
 * @param {string} template - Template string dengan {variable}
 * @param {Object} variables - Variables untuk replace
 * @returns {string} Processed string
 */
function applyTemplateVariables(template, variables) {
  if (!template) return ''
  
  let result = template
  
  // Replace variables seperti {theme}, {date}, {location}
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`
    const value = variables[key] || ''
    result = result.replace(new RegExp(placeholder, 'g'), value)
  })
  
  // Clean up unreplaced placeholders
  result = result.replace(/{[^}]+}/g, '')
  
  return result.trim()
}

/**
 * 📅 Format tanggal ke bahasa Indonesia
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
function formatDateIndonesian(dateString) {
  const date = new Date(dateString)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

/**
 * ⏰ Compare time strings untuk sorting
 * @param {string} time1 - Time string (HH:MM)
 * @param {string} time2 - Time string (HH:MM)
 * @returns {number} Comparison result
 */
function compareTimeStrings(time1, time2) {
  // Handle range format (HH:MM-HH:MM) - ambil waktu mulai
  const t1 = (time1 || '00:00').split('-')[0].trim()
  const t2 = (time2 || '00:00').split('-')[0].trim()
  
  return t1.localeCompare(t2)
}

/**
 * 🎨 Get thumbnail berdasarkan kategori
 * @param {string} category - Category name
 * @returns {string} Thumbnail URL atau default
 */
export function getWorshipThumbnail(category) {
  const thumbnails = {
    'raya': '/images/thumbnails/ibadah-raya.jpg',
    'pelprap': '/images/thumbnails/pelprap.jpg',
    'pelprip': '/images/thumbnails/pelprip.jpg',
    'pelwap': '/images/thumbnails/pelwap.jpg',
    'sektor-anugerah': '/images/thumbnails/sektor-anugerah.jpg',
    'sektor-tesalonika': '/images/thumbnails/sektor-tesalonika.jpg',
    'pelnap': '/images/thumbnails/pelnap.jpg',
    'pendalaman-alkitab': '/images/thumbnails/pendalaman-alkitab.jpg',
    'doa-puasa': '/images/thumbnails/doa-puasa.jpg',
    'doa-fajar': '/images/thumbnails/doa-fajar.jpg'
  }
  
  return thumbnails[category] || '/images/thumbnails/default-worship.jpg'
}

// ===========================================
// 🔧 ADMIN FUNCTIONS - Untuk manage templates
// ===========================================

/**
 * 🛠️ Initialize default worship templates (run once)
 * Fungsi ini akan create 8 worship templates di Firebase
 */
export async function initializeDefaultWorshipTemplates() {
  try {
    console.log('🛠️ [Worship Service] Initializing default templates...')
    
    const defaultTemplates = [
      {
        id: 'worship_raya',
        title: 'Ibadah Raya',
        description: 'Ibadah utama jemaat setiap hari Minggu',
        category: 'raya',
        dayOfWeek: 0, // Minggu
        time: '09:00',
        location: 'Gedung Gereja Utama',
        isActive: true,
        template: {
          description: 'Ibadah Raya minggu ini dengan tema: {theme}. Mari bersama-sama memuji dan menyembah Tuhan.',
          defaultTheme: 'Kasih Karunia Tuhan',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_pelprap',
        title: 'Ibadah PELPRAP',
        description: 'Persekutuan Lanjut Usia Pria dan Wanita',
        category: 'pelprap',
        dayOfWeek: 0, // Minggu
        time: '07:00',
        location: 'Ruang PELPRAP',
        isActive: true,
        template: {
          description: 'Persekutuan khusus bagi para lansia dengan tema: {theme}',
          defaultTheme: 'Hikmat dan Berkat di Masa Senja',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_sektor_anugerah',
        title: 'Ibadah Sektor Anugerah',
        description: 'Ibadah persekutuan Sektor Anugerah',
        category: 'sektor-anugerah',
        dayOfWeek: 1, // Senin
        time: '19:00',
        location: 'Gedung Sektor Anugerah',
        isActive: true,
        template: {
          description: 'Persekutuan Sektor Anugerah dengan tema: {theme}',
          defaultTheme: 'Anugerah yang Melimpah',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_sektor_tesalonika',
        title: 'Ibadah Sektor Tesalonika',
        description: 'Ibadah persekutuan Sektor Tesalonika',
        category: 'sektor-tesalonika',
        dayOfWeek: 1, // Senin
        time: '19:30',
        location: 'Gedung Sektor Tesalonika',
        isActive: true,
        template: {
          description: 'Persekutuan Sektor Tesalonika dengan tema: {theme}',
          defaultTheme: 'Pengharapan yang Hidup',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_pelnap',
        title: 'Ibadah PELNAP',
        description: 'Persekutuan Lanjut Usia Naposo',
        category: 'pelnap',
        dayOfWeek: 3, // Rabu
        time: '18:00',
        location: 'Ruang PELNAP',
        isActive: true,
        template: {
          description: 'Persekutuan PELNAP dengan tema: {theme}',
          defaultTheme: 'Semangat Muda dalam Kristus',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_pendalaman_alkitab',
        title: 'Pendalaman Alkitab',
        description: 'Ibadah pendalaman firman Tuhan',
        category: 'pendalaman-alkitab',
        dayOfWeek: 4, // Kamis
        time: '19:00',
        location: 'Ruang Alkitab',
        isActive: true,
        template: {
          description: 'Pendalaman Alkitab dengan tema: {theme}. Mari menggali firman Tuhan lebih dalam.',
          defaultTheme: 'Firman yang Hidup',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_doa_puasa',
        title: 'Doa dan Puasa',
        description: 'Ibadah doa dan puasa bersama',
        category: 'doa-puasa',
        dayOfWeek: 5, // Jumat
        time: '18:00',
        location: 'Ruang Doa',
        isActive: true,
        template: {
          description: 'Ibadah doa dan puasa dengan fokus: {theme}',
          defaultTheme: 'Kuasa Doa dan Puasa',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_pelprip',
        title: 'Ibadah PELPRIP',
        description: 'Persekutuan Lanjut Usia Pria',
        category: 'pelprip',
        dayOfWeek: 6, // Sabtu
        time: '17:00',
        location: 'Ruang PELPRIP',
        isActive: true,
        template: {
          description: 'Persekutuan khusus bagi para pria lanjut usia dengan tema: {theme}',
          defaultTheme: 'Kekuatan dalam Persekutuan',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_pelwap',
        title: 'Ibadah PELWAP',
        description: 'Persekutuan Lanjut Usia Wanita',
        category: 'pelwap',
        dayOfWeek: 6, // Sabtu
        time: '15:00',
        location: 'Ruang PELWAP',
        isActive: true,
        template: {
          description: 'Persekutuan khusus bagi para wanita lanjut usia dengan tema: {theme}',
          defaultTheme: 'Kasih dan Kebijaksanaan',
          announcements: []
        },
        weeklyOverrides: {}
      },
      {
        id: 'worship_doa_fajar',
        title: 'Doa Membangunkan Fajar',
        description: 'Doa pagi setiap hari',
        category: 'doa-fajar',
        dayOfWeek: 'daily', // Setiap hari (special case)
        time: '05:00',
        location: 'Gedung Gereja Utama',
        isActive: true,
        template: {
          description: 'Doa membangunkan fajar: {theme}',
          defaultTheme: 'Memulai Hari Bersama Tuhan',
          announcements: []
        },
        weeklyOverrides: {}
      }
    ]
    
    for (const template of defaultTemplates) {
      await setDoc(doc(db, COLLECTION_NAME, template.id), {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Created template: ${template.title}`)
    }
    
    console.log('✅ [Worship Service] All default templates initialized!')
    return true
    
  } catch (error) {
    console.error('❌ [Worship Service] Error initializing templates:', error)
    throw error
  }
}

/**
 * 🛠️ Update worship template (untuk admin)
 * @param {string} templateId - Template ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateWorshipTemplate(templateId, updateData) {
  try {
    const templateRef = doc(db, COLLECTION_NAME, templateId)
    await updateDoc(templateRef, {
      ...updateData,
      updatedAt: new Date()
    })
    
    console.log(`✅ [Worship Service] Template updated: ${templateId}`)
    return true
  } catch (error) {
    console.error('❌ [Worship Service] Error updating template:', error)
    throw error
  }
}

/**
 * 🛠️ Update weekly override untuk tanggal spesifik (untuk admin)
 * @param {string} templateId - Template ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {Object} overrideData - Override data
 * @returns {Promise<boolean>} Success status
 */
export async function updateWeeklyOverride(templateId, date, overrideData) {
  try {
    const templateRef = doc(db, COLLECTION_NAME, templateId)
    
    const updateData = {
      [`weeklyOverrides.${date}`]: overrideData,
      updatedAt: new Date()
    }
    
    await updateDoc(templateRef, updateData)
    
    console.log(`✅ [Worship Service] Weekly override updated for ${date}`)
    return true
  } catch (error) {
    console.error('❌ [Worship Service] Error updating weekly override:', error)
    throw error
  }
}

/**
 * 🎯 Get single worship schedule by ID dan tanggal
 * @param {string} templateId - Template ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<Object>} Worship schedule
 */
export async function getWorshipSchedule(templateId, date) {
  try {
    const templates = await getWorshipTemplates()
    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error('Template tidak ditemukan')
    }
    
    return generateWorshipFromTemplate(template, date)
  } catch (error) {
    console.error('❌ [Worship Service] Error getting worship schedule:', error)
    throw error
  }
}

/**
 * 🎯 Get worship schedules untuk tanggal tertentu
 * @param {string} dateString - Target date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array schedules untuk tanggal tersebut
 */
async function getWorshipSchedulesByDate(dateString) {
  try {
    // Get all active templates
    const templates = await getWorshipTemplates()
    const schedules = []
    
    // Generate schedules from each active template
    for (const template of templates) {
      if (template.isActive) {
        // For daily templates (like Doa Fajar)
        if (template.dayOfWeek === 'daily') {
          schedules.push(generateWorshipFromTemplate(template, dateString))
          continue
        }
        
        // For weekly templates, check if it matches the day of week
        const targetDate = new Date(dateString)
        if (template.dayOfWeek === targetDate.getDay()) {
          schedules.push(generateWorshipFromTemplate(template, dateString))
        }
      }
    }
    
    // Sort by time
    schedules.sort((a, b) => compareTimeStrings(a.time, b.time))
    
    console.log(`📅 [Worship Service] Found ${schedules.length} schedules for ${dateString}`)
    return schedules
    
  } catch (error) {
    console.error('❌ [Worship Service] Error getting schedules by date:', error)
    return []
  }
}

// ===========================================
// 🔄 COMPATIBILITY - Wrapper untuk kode lama  
// ===========================================

/**
 * 🔄 Wrapper function untuk compatibility dengan kode lama
 * @param {string|Date} date - Target date
 * @returns {Promise<Array>} Array schedules
 */
export async function getSchedulesByDate(date) {
  try {
    // Convert date to YYYY-MM-DD format
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return await getWorshipSchedulesByDate(dateString)
  } catch (error) {
    console.error('❌ [Schedule Service] Error in getSchedulesByDate:', error)
    return []
  }
}

/**
 * 🔄 Wrapper function untuk getSchedules
 * @param {number} limitDays - Number of days to look ahead
 * @returns {Promise<Array} Array schedules
 */
export async function getSchedules(limitDays = 7) {
  try {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + limitDays)
    
    return await getWorshipSchedulesByDateRange(
      today.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  } catch (error) {
    console.error('❌ [Schedule Service] Error in getSchedules:', error)
    return []
  }
}

/**
 * Get schedules by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Filtered schedules
 */
export async function getSchedulesByCategory(category) {
  try {
    const schedules = await getWeeklyWorshipOverview()
    return schedules.filter(schedule => 
      schedule.category?.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedules by category:', error)
    return []
  }
}

/**
 * Get single schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Promise<Object>} Schedule data
 */
export async function getSchedule(id) {
  try {
    return await getWorshipSchedule(id)
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedule:', error)
    throw error
  }
}

/**
 * Legacy function for compatibility
 */
export async function getUpcomingSchedules(days = 7) {
  return await getUpcomingWorshipSchedules(days)
}