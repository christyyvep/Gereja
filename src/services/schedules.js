// services/schedules.js - Updated untuk unified structure (schedules collection dengan recurring support)
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
  where,
  limit 
} from 'firebase/firestore'

const COLLECTION_NAME = 'schedules'

/**
 * ⭐ MAIN - Get schedules untuk tanggal tertentu
 * Menggabungkan one-time schedules + generated dari recurring schedules
 * @param {string|Date} date - Target date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array schedules untuk tanggal tersebut
 */
export async function getSchedulesByDate(date) {
  try {
    if (!date) {
      throw new Error('Tanggal harus diisi')
    }
    
    // Normalize date format
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    
    console.log(`📅 [Schedule Service] Getting schedules for: ${dateString}`)
    
    // 1. Ambil one-time schedules untuk tanggal ini
    const oneTimeSchedules = await getOneTimeSchedulesByDate(dateString)
    
    // 2. Generate recurring schedules untuk tanggal ini  
    const recurringSchedules = await generateRecurringSchedulesForDate(dateString)
    
    // 3. Gabungkan dan sort
    const allSchedules = [
      ...oneTimeSchedules.map(schedule => ({
        ...schedule,
        source: 'one-time'
      })),
      ...recurringSchedules.map(schedule => ({
        ...schedule,
        source: 'recurring'
      }))
    ]
    
    // 4. Sort berdasarkan waktu
    const sortedSchedules = allSchedules.sort((a, b) => {
      return compareTimeStrings(a.time || '00:00', b.time || '00:00')
    })
    
    console.log(`📅 [Schedule Service] Found ${oneTimeSchedules.length} one-time + ${recurringSchedules.length} recurring = ${sortedSchedules.length} total`)
    
    return sortedSchedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedules by date:', error)
    throw error
  }
}

/**
 * ⭐ FIXED - Get one-time schedules untuk tanggal tertentu
 * Menggunakan query yang kompatibel dengan index yang ada
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {Promise<Array>} Array one-time schedules
 */
async function getOneTimeSchedulesByDate(dateString) {
  try {
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    // Query menggunakan index yang sudah ada: isActive, isRecurring, createdAt
    const q = query(
      schedulesRef,
      where('isActive', '==', true),
      where('isRecurring', '==', false),
      orderBy('createdAt', 'desc')  // ← Pakai index yang ada
    )
    
    const querySnapshot = await getDocs(q)
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Filter tanggal di JavaScript (bukan di Firebase query)
      if (data.date === dateString) {
        schedules.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    // Sort berdasarkan time di JavaScript
    schedules.sort((a, b) => {
      return compareTimeStrings(a.time || '00:00', b.time || '00:00')
    })
    
    console.log(`📅 [Schedule Service] Found ${schedules.length} one-time schedules for ${dateString}`)
    return schedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting one-time schedules:', error)
    return []
  }
}

/**
 * ⭐ Generate recurring schedules untuk tanggal tertentu
 * @param {string} targetDate - Target date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array generated schedules
 */
async function generateRecurringSchedulesForDate(targetDate) {
  try {
    // 1. Ambil semua recurring schedules yang aktif
    const recurringSchedules = await getActiveRecurringSchedules()
    
    // 2. Generate schedules untuk tanggal target
    const generatedSchedules = []
    
    for (const recurring of recurringSchedules) {
      if (shouldGenerateForDate(recurring, targetDate)) {
        const schedule = generateScheduleForDate(recurring, targetDate)
        generatedSchedules.push(schedule)
      }
    }
    
    return generatedSchedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error generating recurring schedules:', error)
    return []
  }
}

/**
 * ⭐ FIXED - Get all active recurring schedules
 * @returns {Promise<Array>} Array recurring schedules
 */
async function getActiveRecurringSchedules() {
  try {
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    // Query menggunakan index yang sudah ada
    const q = query(
      schedulesRef,
      where('isActive', '==', true),
      where('isRecurring', '==', true),
      orderBy('createdAt', 'desc')  // ← Pakai index yang ada
    )
    
    const querySnapshot = await getDocs(q)
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`📅 [Schedule Service] Found ${schedules.length} active recurring schedules`)
    return schedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting recurring schedules:', error)
    return []
  }
}

/**
 * ⭐ Check apakah recurring schedule harus generate untuk tanggal tertentu
 * @param {Object} recurring - Recurring schedule data
 * @param {string} targetDate - Target date (YYYY-MM-DD)
 * @returns {boolean} Should generate or not
 */
function shouldGenerateForDate(recurring, targetDate) {
  const pattern = recurring.recurrencePattern
  if (!pattern) return false
  
  const targetDateObj = new Date(targetDate)
  const startDate = new Date(pattern.startDate)
  
  // Check if target date is before start date
  if (targetDateObj < startDate) return false
  
  // Check if target date is after end date (if exists)
  if (pattern.endDate && targetDateObj > new Date(pattern.endDate)) return false
  
  // Check recurrence pattern
  switch (pattern.type) {
    case 'daily':
      return shouldGenerateDaily(pattern, startDate, targetDateObj)
    case 'weekly':
      return shouldGenerateWeekly(pattern, startDate, targetDateObj)
    case 'monthly':
      return shouldGenerateMonthly(pattern, startDate, targetDateObj)
    default:
      return false
  }
}

/**
 * ⭐ Check daily recurrence
 */
function shouldGenerateDaily(pattern, startDate, targetDate) {
  const interval = pattern.interval || 1
  const daysDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24))
  
  return daysDiff >= 0 && daysDiff % interval === 0
}

/**
 * ⭐ Check weekly recurrence
 */
function shouldGenerateWeekly(pattern, startDate, targetDate) {
  const interval = pattern.interval || 1
  const startDayOfWeek = startDate.getDay()
  const targetDayOfWeek = targetDate.getDay()
  
  // Check if same day of week
  if (startDayOfWeek !== targetDayOfWeek) return false
  
  // Check interval
  const weeksDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24 * 7))
  return weeksDiff >= 0 && weeksDiff % interval === 0
}

/**
 * ⭐ Check monthly recurrence
 */
function shouldGenerateMonthly(pattern, startDate, targetDate) {
  const interval = pattern.interval || 1
  const startDay = startDate.getDate()
  const targetDay = targetDate.getDate()
  
  // Check if same day of month
  if (startDay !== targetDay) return false
  
  // Check interval (simplified)
  const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (targetDate.getMonth() - startDate.getMonth())
  
  return monthsDiff >= 0 && monthsDiff % interval === 0
}

/**
 * ⭐ Generate single schedule dari recurring template untuk tanggal tertentu
 * @param {Object} recurring - Recurring schedule data
 * @param {string} targetDate - Target date (YYYY-MM-DD)
 * @returns {Object} Generated schedule
 */
function generateScheduleForDate(recurring, targetDate) {
  // Get daily override jika ada
  const dailyOverride = recurring.dailyOverrides?.[targetDate] || {}
  
  // Apply template dengan override
  const description = applyTemplate(recurring.template?.description || recurring.description || '', dailyOverride)
  const defaultInfo = applyTemplate(recurring.template?.defaultInfo || '', dailyOverride)
  
  // Build final schedule
  const schedule = {
    id: `recurring_${recurring.id}_${targetDate}`, // Unique ID
    title: recurring.title,
    date: targetDate,
    time: recurring.time,
    location: recurring.location,
    category: recurring.category,
    
    // Generated content
    description: description,
    additionalInfo: defaultInfo,
    
    // Metadata
    recurringId: recurring.id,
    isGenerated: true,
    generatedAt: new Date(),
    
    // Merge daily overrides
    ...dailyOverride
  }
  
  return schedule
}

/**
 * ⭐ Apply template dengan placeholder replacement
 * @param {string} template - Template string dengan {placeholder}
 * @param {Object} data - Data untuk replace placeholder
 * @returns {string} Processed template
 */
function applyTemplate(template, data) {
  let result = template
  
  // Replace placeholders like {leader}, {theme}, etc
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), data[key])
  })
  
  // Clean up unreplaced placeholders
  result = result.replace(/{[^}]+}/g, '')
  
  return result.trim()
}

/**
 * ⭐ Get upcoming schedules (one-time + recurring)
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {number} limitCount - Limit results
 * @returns {Promise<Array>} Array upcoming schedules
 */
export async function getUpcomingSchedules(fromDate, limitCount = 5) {
  try {
    if (!fromDate) {
      throw new Error('From date harus diisi')
    }
    
    console.log(`📅 [Schedule Service] Getting upcoming schedules from: ${fromDate}`)
    
    // Get upcoming untuk beberapa hari ke depan
    const allUpcoming = []
    const checkDays = 14 // Check 2 minggu ke depan
    
    for (let i = 0; i < checkDays && allUpcoming.length < limitCount; i++) {
      const checkDate = new Date(fromDate)
      checkDate.setDate(checkDate.getDate() + i)
      const dateString = checkDate.toISOString().split('T')[0]
      
      const daySchedules = await getSchedulesByDate(dateString)
      allUpcoming.push(...daySchedules)
    }
    
    // Sort dan limit
    const sortedUpcoming = allUpcoming
      .sort((a, b) => {
        // Sort by date first, then by time
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        return compareTimeStrings(a.time || '00:00', b.time || '00:00')
      })
      .slice(0, limitCount)
    
    console.log(`📅 [Schedule Service] Found ${sortedUpcoming.length} upcoming schedules`)
    return sortedUpcoming
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting upcoming schedules:', error)
    throw error
  }
}

/**
 * ⭐ Get schedules in date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array schedules dalam range
 */
export async function getSchedulesByDateRange(startDate, endDate) {
  try {
    if (!startDate || !endDate) {
      throw new Error('Start date dan end date harus diisi')
    }
    
    const allSchedules = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Loop setiap tanggal dalam range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const daySchedules = await getSchedulesByDate(dateString)
      allSchedules.push(...daySchedules)
    }
    
    // Sort by date then time
    const sortedSchedules = allSchedules.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return compareTimeStrings(a.time || '00:00', b.time || '00:00')
    })
    
    console.log(`📅 [Schedule Service] Found ${sortedSchedules.length} schedules between ${startDate} and ${endDate}`)
    return sortedSchedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedules by date range:', error)
    throw error
  }
}

/**
 * ⭐ Get schedules berdasarkan kategori
 * @param {string} category - Category filter
 * @param {number} days - Number of days to check
 * @returns {Promise<Array>} Array schedules dengan kategori tertentu
 */
export async function getSchedulesByCategory(category, days = 30) {
  try {
    if (!category) {
      throw new Error('Kategori harus diisi')
    }
    
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    const endDateString = endDate.toISOString().split('T')[0]
    
    // Get all schedules dalam range
    const allSchedules = await getSchedulesByDateRange(today, endDateString)
    
    // Filter by category
    const filteredSchedules = allSchedules.filter(schedule => 
      schedule.category?.toLowerCase() === category.toLowerCase()
    )
    
    console.log(`📅 [Schedule Service] Found ${filteredSchedules.length} schedules for category: ${category}`)
    return filteredSchedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedules by category:', error)
    throw error
  }
}

/**
 * ⭐ IMPROVED - Get schedules dengan error handling yang baik
 * @param {number} limitDays - Number of days to generate
 * @returns {Promise<Array>} Array all schedules
 */
export async function getSchedules(limitDays = 30) {
  try {
    console.log(`📅 [Schedule Service] Getting schedules for ${limitDays} days`)
    
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + limitDays)
    const endDateString = endDate.toISOString().split('T')[0]
    
    // Pakai fungsi yang sudah diperbaiki
    const schedules = await getSchedulesByDateRange(today, endDateString)
    
    console.log(`📅 [Schedule Service] Found ${schedules.length} schedules for ${limitDays} days`)
    return schedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedules:', error)
    
    // Fallback: ambil data dengan query paling sederhana
    console.log('🔄 [Schedule Service] Trying fallback query...')
    return await getSchedulesSafe(limitDays)
  }
}

/**
 * ⭐ SAFE FALLBACK - Get schedules dengan query sederhana
 * Fungsi backup yang aman untuk digunakan saat index bermasalah
 * @param {number} limitDays - Number of days to check
 * @returns {Promise<Array>} Array schedules
 */
export async function getSchedulesSafe(limitDays = 30) {
  try {
    console.log(`🔧 [Schedule Service] Using SAFE mode for ${limitDays} days`)
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    
    // Query paling sederhana - hanya ambil yang terbaru
    const q = query(
      schedulesRef,
      orderBy('createdAt', 'desc'),
      limit(100)  // Ambil 100 schedule terbaru
    )
    
    const querySnapshot = await getDocs(q)
    const allSchedules = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Filter hanya yang aktif
      if (data.isActive !== false) {
        allSchedules.push({
          id: doc.id,
          ...data,
          source: data.isRecurring ? 'recurring' : 'one-time'
        })
      }
    })
    
    // Filter schedules yang relevan (dalam range tanggal)
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + limitDays)
    
    const relevantSchedules = allSchedules.filter(schedule => {
      // Untuk one-time schedules, cek tanggalnya
      if (!schedule.isRecurring && schedule.date) {
        const scheduleDate = new Date(schedule.date)
        return scheduleDate >= today && scheduleDate <= endDate
      }
      
      // Untuk recurring schedules, tampilkan semua yang aktif
      if (schedule.isRecurring) {
        return true
      }
      
      return false
    })
    
    // Sort berdasarkan tanggal dan waktu
    relevantSchedules.sort((a, b) => {
      if (a.date && b.date) {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        // Kalau tanggal sama, sort berdasarkan waktu
        return compareTimeStrings(a.time || '00:00', b.time || '00:00')
      }
      
      // Kalau salah satu tidak ada tanggal, yang ada tanggal didahulukan
      if (a.date && !b.date) return -1
      if (!a.date && b.date) return 1
      
      // Kalau keduanya tidak ada tanggal, sort berdasarkan createdAt
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
    
    console.log(`✅ [Schedule Service] SAFE mode found ${relevantSchedules.length} schedules`)
    return relevantSchedules
    
  } catch (error) {
    console.error('❌ [Schedule Service] SAFE mode failed:', error)
    return []  // Return empty array jika semua gagal
  }
}

/**
 * ⭐ Get single schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Promise<Object>} Schedule data
 */
export async function getSchedule(id) {
  try {
    if (!id) {
      throw new Error('ID jadwal harus diisi')
    }
    
    // Check if this is a generated recurring schedule ID
    if (id.startsWith('recurring_')) {
      // Parse format: recurring_RECURRING_ID_DATE
      const parts = id.split('_')
      if (parts.length >= 3) {
        const date = parts[parts.length - 1]
        const daySchedules = await getSchedulesByDate(date)
        const schedule = daySchedules.find(s => s.id === id)
        
        if (!schedule) {
          throw new Error('Generated schedule tidak ditemukan')
        }
        
        return schedule
      }
    }
    
    // Regular schedule from database
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Jadwal tidak ditemukan')
    }

    return {
      id: docSnap.id,
      source: docSnap.data().isRecurring ? 'recurring-template' : 'one-time',
      ...docSnap.data()
    }
  } catch (error) {
    console.error('❌ [Schedule Service] Error getting schedule:', error)
    throw error
  }
}

/**
 * ⭐ ADMIN - Create new schedule (one-time atau recurring)
 * @param {Object} scheduleData - Schedule data
 * @returns {Promise<string>} Created schedule ID
 */
export async function addSchedule(scheduleData) {
  try {
    if (!scheduleData || typeof scheduleData !== 'object') {
      throw new Error('Data jadwal tidak valid')
    }

    if (!scheduleData.title) {
      throw new Error('Title jadwal harus diisi')
    }

    if (!scheduleData.time) {
      throw new Error('Waktu jadwal harus diisi')
    }

    // Validate based on type
    if (scheduleData.isRecurring) {
      if (!scheduleData.recurrencePattern) {
        throw new Error('Recurrence pattern harus diisi untuk recurring schedule')
      }
    } else {
      if (!scheduleData.date) {
        throw new Error('Tanggal harus diisi untuk one-time schedule')
      }
    }

    // Normalize data
    const normalizedData = {
      ...scheduleData,
      
      // Default values
      category: scheduleData.category || 'event',
      location: scheduleData.location || 'Gedung Gereja',
      description: scheduleData.description || '',
      isActive: scheduleData.isActive !== false, // Default true
      
      // Initialize fields untuk recurring
      ...(scheduleData.isRecurring && {
        template: scheduleData.template || {
          description: scheduleData.description || '',
          defaultInfo: '',
          closing: ''
        },
        dailyOverrides: scheduleData.dailyOverrides || {}
      }),
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: scheduleData.createdBy || 'admin'
    }
    
    const schedulesRef = collection(db, COLLECTION_NAME)
    const newDoc = await addDoc(schedulesRef, normalizedData)
    
    console.log(`✅ [Schedule Service] ${scheduleData.isRecurring ? 'Recurring' : 'One-time'} schedule created:`, newDoc.id)
    return newDoc.id
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error adding schedule:', error)
    throw error
  }
}

/**
 * ⭐ ADMIN - Update schedule
 * @param {string} id - Schedule ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateSchedule(id, updateData) {
  try {
    if (!id) {
      throw new Error('ID jadwal harus diisi')
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Data update tidak valid')
    }
    
    const scheduleRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(scheduleRef, {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: updateData.updatedBy || 'admin'
    })
    
    console.log('✅ [Schedule Service] Schedule updated:', id)
    return true
  } catch (error) {
    console.error('❌ [Schedule Service] Error updating schedule:', error)
    throw error
  }
}

/**
 * ⭐ ADMIN - Update daily override untuk recurring schedule
 * @param {string} recurringId - Recurring schedule ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {Object} overrideData - Override data
 * @returns {Promise<boolean>} Success status
 */
export async function updateDailyOverride(recurringId, date, overrideData) {
  try {
    const scheduleRef = doc(db, COLLECTION_NAME, recurringId)
    
    // Update daily override untuk tanggal spesifik
    const updateData = {
      [`dailyOverrides.${date}`]: overrideData,
      updatedAt: new Date()
    }
    
    await updateDoc(scheduleRef, updateData)
    
    console.log(`✅ [Schedule Service] Updated daily override for ${date}`)
    return true
    
  } catch (error) {
    console.error('❌ [Schedule Service] Error updating daily override:', error)
    throw error
  }
}

/**
 * ⭐ ADMIN - Delete schedule
 * @param {string} id - Schedule ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSchedule(id) {
  try {
    if (!id) {
      throw new Error('ID jadwal harus diisi')
    }
    
    const scheduleRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(scheduleRef)
    
    console.log('✅ [Schedule Service] Schedule deleted:', id)
    return true
  } catch (error) {
    console.error('❌ [Schedule Service] Error deleting schedule:', error)
    throw error
  }
}

/**
 * ⭐ UTILITY - Compare time strings untuk sorting
 * @param {string} time1 - Time string (HH:MM atau HH:MM-HH:MM)
 * @param {string} time2 - Time string (HH:MM atau HH:MM-HH:MM)
 * @returns {number} Comparison result
 */
function compareTimeStrings(time1, time2) {
  // Extract start time jika format range (HH:MM-HH:MM)
  const t1 = time1.split('-')[0].trim()
  const t2 = time2.split('-')[0].trim()
  
  return t1.localeCompare(t2)
}