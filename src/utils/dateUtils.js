// utils/dateUtils.js - Helper functions untuk date manipulation
// Digunakan oleh announcement system dan komponen lainnya

/**
 * ⭐ Get today's date dalam format YYYY-MM-DD
 * @returns {string} Today's date
 */
export function getTodayString() {
    return new Date().toISOString().split('T')[0]
  }
  
  /**
   * ⭐ Get tomorrow's date dalam format YYYY-MM-DD
   * @param {string|Date} fromDate - Base date, default today
   * @returns {string} Tomorrow's date
   */
  export function getTomorrowString(fromDate = null) {
    const baseDate = fromDate ? new Date(fromDate) : new Date()
    const tomorrow = new Date(baseDate)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }
  
  /**
   * ⭐ Get yesterday's date dalam format YYYY-MM-DD
   * @param {string|Date} fromDate - Base date, default today
   * @returns {string} Yesterday's date
   */
  export function getYesterdayString(fromDate = null) {
    const baseDate = fromDate ? new Date(fromDate) : new Date()
    const yesterday = new Date(baseDate)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
  
  /**
   * ⭐ Get next N days dari tanggal tertentu
   * @param {number} days - Jumlah hari ke depan
   * @param {string|Date} fromDate - Base date, default today
   * @returns {Array<string>} Array of date strings
   */
  export function getNextDates(days = 7, fromDate = null) {
    const baseDate = fromDate ? new Date(fromDate) : new Date()
    const dates = []
    
    for (let i = 1; i <= days; i++) {
      const nextDate = new Date(baseDate)
      nextDate.setDate(baseDate.getDate() + i)
      dates.push(nextDate.toISOString().split('T')[0])
    }
    
    return dates
  }
  
  /**
   * ⭐ Format date ke bahasa Indonesia
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type: 'full', 'short', 'day'
   * @returns {string} Formatted date string
   */
  export function formatDateIndonesia(date, format = 'full') {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const dayName = days[dateObj.getDay()]
    const day = dateObj.getDate()
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    
    switch (format) {
      case 'full':
        return `${dayName}, ${day} ${month} ${year}`
      case 'short':
        return `${day} ${month} ${year}`
      case 'day':
        return dayName
      default:
        return `${dayName}, ${day} ${month} ${year}`
    }
  }
  
  /**
   * ⭐ Cek apakah tanggal adalah hari ini
   * @param {string|Date} date - Date to check
   * @returns {boolean} True jika today
   */
  export function isToday(date) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return dateString === getTodayString()
  }
  
  /**
   * ⭐ Cek apakah tanggal adalah besok
   * @param {string|Date} date - Date to check
   * @returns {boolean} True jika tomorrow
   */
  export function isTomorrow(date) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return dateString === getTomorrowString()
  }
  
  /**
   * ⭐ Cek apakah tanggal sudah lewat
   * @param {string|Date} date - Date to check
   * @returns {boolean} True jika sudah lewat
   */
  export function isPast(date) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return dateString < getTodayString()
  }
  
  /**
   * ⭐ Cek apakah tanggal akan datang
   * @param {string|Date} date - Date to check
   * @returns {boolean} True jika akan datang
   */
  export function isFuture(date) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return dateString > getTodayString()
  }
  
  /**
   * ⭐ Get relative date string (hari ini, besok, 3 hari lagi, dll)
   * @param {string|Date} date - Date to format
   * @returns {string} Relative date string
   */
  export function getRelativeDateString(date) {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    const today = getTodayString()
    const tomorrow = getTomorrowString()
    const yesterday = getYesterdayString()
    
    if (dateString === today) {
      return 'Hari ini'
    } else if (dateString === tomorrow) {
      return 'Besok'
    } else if (dateString === yesterday) {
      return 'Kemarin'
    } else {
      // Calculate difference in days
      const dateObj = new Date(dateString)
      const todayObj = new Date(today)
      const diffTime = dateObj - todayObj
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 0) {
        return `${diffDays} hari lagi`
      } else {
        return `${Math.abs(diffDays)} hari yang lalu`
      }
    }
  }
  
  /**
   * ⭐ Validate date string format (YYYY-MM-DD)
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True jika format valid
   */
  export function isValidDateString(dateString) {
    if (typeof dateString !== 'string') return false
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateString)) return false
    
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date) && date.toISOString().split('T')[0] === dateString
  }
  
  /**
   * ⭐ Convert various date formats ke YYYY-MM-DD
   * @param {string|Date} input - Input date
   * @returns {string} Normalized date string
   */
  export function normalizeDateString(input) {
    if (!input) return null
    
    if (typeof input === 'string') {
      // Jika sudah format YYYY-MM-DD
      if (isValidDateString(input)) return input
      
      // Try parse as Date
      const date = new Date(input)
      if (isNaN(date)) return null
      
      return date.toISOString().split('T')[0]
    }
    
    if (input instanceof Date) {
      return input.toISOString().split('T')[0]
    }
    
    return null
  }
  
  /**
   * ⭐ Format time string (HH:MM atau HH:MM-HH:MM)
   * @param {string} timeString - Time string to format
   * @returns {string} Formatted time string
   */
  export function formatTimeString(timeString) {
    if (!timeString) return ''
    
    // Jika format range (HH:MM-HH:MM)
    if (timeString.includes('-')) {
      const [start, end] = timeString.split('-')
      return `${start.trim()} - ${end.trim()}`
    }
    
    return timeString.trim()
  }
  
  /**
   * ⭐ Get date range array antara 2 tanggal
   * @param {string|Date} startDate - Start date
   * @param {string|Date} endDate - End date
   * @returns {Array<string>} Array of date strings
   */
  export function getDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates = []
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }
  
  /**
   * ⭐ Get current time dalam format HH:MM
   * @returns {string} Current time
   */
  export function getCurrentTimeString() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  /**
   * ⭐ Compare two time strings
   * @param {string} time1 - First time (HH:MM)
   * @param {string} time2 - Second time (HH:MM)
   * @returns {number} -1, 0, or 1 for comparison
   */
  export function compareTimeStrings(time1, time2) {
    if (!time1 || !time2) return 0
    
    // Extract start time jika format range
    const t1 = time1.split('-')[0].trim()
    const t2 = time2.split('-')[0].trim()
    
    return t1.localeCompare(t2)
  }
  
  /**
   * ⭐ Get week start and end dates (Senin - Minggu)
   * @param {string|Date} date - Reference date, default today
   * @returns {Object} {start: string, end: string}
   */
  export function getWeekDates(date = null) {
    const refDate = date ? new Date(date) : new Date()
    
    // Get Monday (start of week in Indonesia)
    const monday = new Date(refDate)
    const dayOfWeek = refDate.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Handle Sunday
    monday.setDate(refDate.getDate() + diff)
    
    // Get Sunday (end of week)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    }
  }
  
  /**
   * ⭐ Check if date is in current week
   * @param {string|Date} date - Date to check
   * @returns {boolean} True jika dalam minggu ini
   */
  export function isThisWeek(date) {
    const { start, end } = getWeekDates()
    const dateString = normalizeDateString(date)
    
    return dateString >= start && dateString <= end
  }
  
  /**
   * ⭐ Format timestamp to relative time (e.g., "2m", "3h", "1d", "today")
   * @param {Date|string|Object} timestamp - Timestamp to format
   * @returns {string} Formatted relative time
   */
  export function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Unknown'
    
    // Ensure timestamp is a Date object
    let date = timestamp
    if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    }
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp)
      return 'Unknown'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    // Handle future dates (shouldn't happen but just in case)
    if (diffMs < 0) {
      return 'Future'
    }
    
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    // Less than 1 minute
    if (diffSeconds < 60) {
      return 'Baru saja'
    }
    
    // Less than 1 hour
    if (diffMinutes < 60) {
      return `${diffMinutes}m`
    }
    
    // Less than 24 hours
    if (diffHours < 24) {
      return `${diffHours}h`
    }
    
    // Check if it's today (same calendar day)
    const today = new Date()
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear()
    
    if (isToday) {
      return 'Today'
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear()
    
    if (isYesterday) {
      return 'Yesterday'
    }
    
    // More than 1 day
    if (diffDays < 7) {
      return `${diffDays}d`
    }
    
    // More than 1 week
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks}w`
    }
    
    // More than 1 month
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months}mo`
    }
    
    // More than 1 year
    const years = Math.floor(diffDays / 365)
    return `${years}y`
  }

  /**
   * ⭐ Format timestamp to readable Indonesian format
   * @param {Date|string|Object} timestamp - Timestamp to format
   * @returns {string} Formatted date string
   */
  export function formatReadableDate(timestamp) {
    if (!timestamp) return 'Tanggal tidak valid'
    
    let date = timestamp
    if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    }
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    }
    
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid'
    }
    
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }