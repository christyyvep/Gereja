// services/announcements.js - Unified Announcement System (COMPLETE FIXED VERSION)
// Menggabungkan data dari schedules + news yang ada KEGIATAN HARI INI
// Fix: Semua ESLint errors, navigation ID, dan logic hari ini

import { db } from './firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore'

// Import services lain
import { getWeeklyWorshipOverview } from './schedules'
import { getNewsByDate } from './news'

const NEWS_COLLECTION = 'news'

// Helper functions removed - logic simplified to use existing news.js functions

/**
 * ⭐ MAIN FUNCTION - Get unified announcements dari schedules + news
 * Prioritas: 1) Kegiatan hari ini, 2) Recent published news sebagai fallback
 * @param {number} limitCount - Maksimal announcements yang diambil
 * @returns {Promise<Array>} Array unified announcements
 */
export async function getUnifiedAnnouncements(limitCount = 8) {
  try {
    console.log('📢 [Announcement Service] Getting unified announcements...')
    
    // 1. Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0] // "2025-07-23"
    console.log('📅 [Announcement Service] Today:', today)
    
    // 2. Ambil jadwal yang event-nya HARI INI (sudah benar)
    const todaySchedules = await getTodaySchedules(today)
    console.log(`📅 [Announcement Service] Found ${todaySchedules.length} schedules for today`)
    
    // 3. Ambil berita yang ada KEGIATAN/ACARA HARI INI (logic baru)
    const todayNews = await getTodayNews(today)
    console.log(`📰 [Announcement Service] Found ${todayNews.length} news with activities for today`)
    
    // ✅ 4. FALLBACK: Jika tidak ada kegiatan hari ini, ambil recent published news
    let fallbackNews = []
    if (todaySchedules.length === 0 && todayNews.length === 0) {
      console.log('📰 [Announcement Service] No activities today, getting recent published news as fallback...')
      fallbackNews = await getRecentPublishedNews(limitCount)
      console.log(`📰 [Announcement Service] Found ${fallbackNews.length} recent published news`)
    }
    
    // 5. Transform ke format unified
    const scheduleAnnouncements = todaySchedules.map(schedule => ({
      // ✅ ID untuk display (dengan prefix untuk uniqueness di homepage)
      id: `schedule_${schedule.id}`,
      
      // ✅ ID asli untuk navigation (TANPA prefix)
      originalId: schedule.id,
      type: 'schedule',
      sourceCollection: 'schedules',
      
      // Preview data
      title: schedule.title,
      desc: truncateText(schedule.description || '', 100),
      subtitle: formatScheduleSubtitle(schedule),
      preview: truncateText(schedule.description || '', 80),
      time: schedule.time,
      date: schedule.date,
      location: schedule.location,
      category: schedule.category || 'ibadah',
      
      // Navigation data
      navigateTo: `/jadwal/${schedule.id}`,
      detailPage: 'DetailJadwal',
      
      // Metadata
      source: 'schedules',
      priority: getSchedulePriority(schedule),
      createdAt: schedule.createdAt || new Date(),
      
      // Display info
      icon: getScheduleIcon(schedule.category),
      badge: 'Jadwal Hari Ini',
      badgeColor: getScheduleBadgeColor(schedule.category)
    }))
    
    const newsAnnouncements = (todayNews.length > 0 ? todayNews : fallbackNews).map(news => ({
      // ✅ ID untuk display (dengan prefix untuk uniqueness di homepage)
      id: `news_${news.id}`,
      
      // ✅ ID asli untuk navigation (TANPA prefix)
      originalId: news.id,
      type: 'news',
      sourceCollection: 'news',
      
      // Preview data
      title: news.title,
      desc: truncateText(news.summary || news.content || '', 100),
      subtitle: formatNewsSubtitle(news),
      preview: truncateText(news.summary || news.content || '', 80),
      
      // ✅ FIX: Map semua field date, time, location dari database
      date: news.date || news.eventDate || news.activityDate || news.scheduleDate,
      time: news.time,           // ← TAMBAH field time
      location: news.location,   // ← TAMBAH field location
      category: news.category || 'berita',
      
      // Navigation data
      navigateTo: `/news/${news.id}`,
      detailPage: 'DetailNews',
      
      // Metadata
      source: 'news',
      priority: getNewsPriority(news),
      createdAt: news.createdAt || new Date(),
      
      // Display info
      icon: getNewsIcon(news.category),
      badge: todayNews.length > 0 ? 'Acara Hari Ini' : 'Berita Terbaru',
      badgeColor: getNewsBadgeColor(news.category),
      
      // Optional: thumbnail jika ada
      ...(news.thumbnail && { thumbnail: news.thumbnail })
    }))
    
    // 6. Gabungkan semua announcements
    const allAnnouncements = [
      ...scheduleAnnouncements,
      ...newsAnnouncements
    ]
    
    // 7. Sort berdasarkan priority dan waktu
    const sortedAnnouncements = allAnnouncements
      .sort((a, b) => {
        // Priority tinggi dulu
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        
        // Kalau priority sama, yang ada waktu duluan
        if (a.time && !b.time) return -1
        if (!a.time && b.time) return 1
        if (a.time && b.time) {
          return a.time.localeCompare(b.time)
        }
        
        // Kalau sama semua, yang terbaru created
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB - dateA
      })
      .slice(0, limitCount)
    
    console.log(`📢 [Announcement Service] Final result: ${scheduleAnnouncements.length} schedules + ${newsAnnouncements.length} news = ${sortedAnnouncements.length} total announcements`)
    
    if (sortedAnnouncements.length > 0) {
      console.log('🔍 [Announcement Service] Sample announcement structure:', sortedAnnouncements[0])
    }
    
    return sortedAnnouncements
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error getting unified announcements:', error)
    throw error
  }
}

/**
 * ⭐ FALLBACK - Get recent published news untuk homepage
 */
async function getRecentPublishedNews(limitCount = 6) {
  try {
    console.log('📰 [Announcement Service] Getting recent published news...')
    
    const newsRef = collection(db, NEWS_COLLECTION)
    
    // Query untuk published news, diurutkan berdasarkan createdAt
    const recentNewsQuery = query(
      newsRef, 
      where('isPublished', '==', true)
      // Note: orderBy akan ditambah setelah data ter-load untuk menghindari composite index requirement
    )
    
    const querySnapshot = await getDocs(recentNewsQuery)
    
    const allPublishedNews = []
    querySnapshot.forEach((doc) => {
      const newsData = {
        id: doc.id,
        ...doc.data()
      }
      allPublishedNews.push(newsData)
    })
    
    // Sort manual berdasarkan createdAt (terbaru dulu)
    const sortedNews = allPublishedNews.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0)
      return dateB - dateA
    })
    
    const recentNews = sortedNews.slice(0, limitCount)
    
    console.log(`📰 [Announcement Service] Found ${recentNews.length} recent published news:`)
    recentNews.forEach(news => {
      console.log(`  - ${news.title} (${news.category || 'no-category'})`)
    })
    
    return recentNews
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error getting recent published news:', error)
    return []
  }
}

/**
 * ⭐ Get schedules yang event-nya HARI INI
 * Schedules menggunakan dayOfWeek (0-6), jadi kita perlu convert tanggal hari ini ke dayOfWeek
 */
async function getTodaySchedules(today) {
  try {
    console.log('📅 [Announcement Service] Getting schedules for today:', today)
    
    // Convert today string ke dayOfWeek number
    const todayDate = new Date(today)
    const todayDayOfWeek = todayDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    console.log('📅 [Announcement Service] Today dayOfWeek:', todayDayOfWeek, 
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayDayOfWeek])
    
    // Ambil semua published schedules
    const allSchedules = await getWeeklyWorshipOverview()
    
    // Filter schedules yang sesuai dengan hari ini atau daily
    const todaySchedules = allSchedules.filter(schedule => {
      // Include daily schedules (yang berlaku setiap hari)
      if (schedule.dayOfWeek === 'daily') {
        console.log(`✅ [Announcement Service] Daily schedule included: ${schedule.title}`)
        return true
      }
      
      // Include schedules yang sesuai dayOfWeek hari ini
      if (schedule.dayOfWeek === todayDayOfWeek) {
        console.log(`✅ [Announcement Service] Today schedule included: ${schedule.title} (dayOfWeek: ${schedule.dayOfWeek})`)
        return true
      }
      
      console.log(`❌ [Announcement Service] Schedule not for today: ${schedule.title} (dayOfWeek: ${schedule.dayOfWeek})`)
      return false
    })
    
    // Tambahkan field date untuk konsistensi dengan news
    const todaySchedulesWithDate = todaySchedules.map(schedule => ({
      ...schedule,
      date: today // Tambahkan field date agar konsisten
    }))
    
    console.log(`📅 [Announcement Service] Found ${todaySchedulesWithDate.length} schedules for ${today}`)
    return todaySchedulesWithDate
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error getting today schedules:', error)
    return []
  }
}

/**
 * ⭐ Get news yang ada KEGIATAN/ACARA HARI INI
 */
/**
 * ⭐ Get news yang ada KEGIATAN/ACARA HARI INI (SIMPLIFIED VERSION)
 * Menggunakan fungsi getNewsByDate yang sudah ada di news.js
 */
async function getTodayNews(today) {
  try {
    console.log('📰 [Announcement Service] Getting news with activities for today:', today)
    
    // Gunakan fungsi getNewsByDate yang sudah ada di news.js
    const todayNews = await getNewsByDate(today)
    
    console.log(`� [Announcement Service] Found ${todayNews.length} news with activities for ${today}`)
    
    if (todayNews.length > 0) {
      console.log('📰 [Announcement Service] Today news titles:')
      todayNews.forEach(news => {
        console.log(`  - ${news.title} (date: ${news.date})`)
      })
    }
    
    return todayNews
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error getting today news:', error)
    return []
  }
}

/**
 * ⭐ BACKWARD COMPATIBILITY - Support old getAnnouncements function
 */
export async function getAnnouncements(limitCount = 10) {
  try {
    console.log('🔄 [Announcement Service] Using backward compatibility mode...')
    
    // Get unified announcements (yang sudah filter hari ini)
    const unifiedAnnouncements = await getUnifiedAnnouncements(limitCount)
    
    // Transform to old format
    const oldFormatAnnouncements = unifiedAnnouncements.map(item => ({
      id: item.originalId,
      title: item.title,
      desc: item.desc || item.preview,
      category: item.category,
      icon: item.icon,
      date: item.date,
      time: item.time,
      location: item.location,
      type: item.type,
      source: item.source
    }))
    
    return oldFormatAnnouncements
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error in backward compatibility mode:', error)
    throw error
  }
}

// ===== HELPER FUNCTIONS =====

function formatScheduleSubtitle(schedule) {
  const parts = []
  if (schedule.time) parts.push(schedule.time)
  if (schedule.location) parts.push(schedule.location)
  return parts.join(' • ')
}

function formatNewsSubtitle(news) {
  const parts = []
  if (news.author) parts.push(`Oleh ${news.author}`)
  if (news.publishDate) {
    const date = new Date(news.publishDate.seconds ? news.publishDate.seconds * 1000 : news.publishDate)
    parts.push(formatDate(date))
  }
  return parts.join(' • ')
}

function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function getSchedulePriority(schedule) {
  if (schedule.category?.toLowerCase().includes('ibadah')) return 2
  
  const today = new Date().toISOString().split('T')[0]
  if (schedule.date === today) return 1
  
  return 3
}

function getNewsPriority(news) {
  const today = new Date().toISOString().split('T')[0]
  const eventDate = news.eventDate || news.activityDate || news.scheduleDate || news.date
  
  if (eventDate === today) {
    if (news.category?.toLowerCase().includes('ibadah')) return 1
    if (news.isUrgent || news.isPinned) return 1
    if (news.category?.toLowerCase().includes('urgent')) return 1
    return 2
  }
  
  return 3
}

function getScheduleIcon(category) {
  const icons = {
    'ibadah': '⛪',
    'pelprap': '🎵',
    'pemuda': '🎸',
    'anak': '🧸',
    'doa': '🙏',
    'fellowship': '🤝',
    'event': '📅',
    'meeting': '👥'
  }
  return icons[category?.toLowerCase()] || '📅'
}

function getNewsIcon(category) {
  const icons = {
    'pengumuman': '📢',
    'event': '🎉',
    'kegiatan': '📅',
    'info': 'ℹ️',
    'urgent': '🚨',
    'berita': '📰'
  }
  return icons[category?.toLowerCase()] || '📰'
}

function getScheduleBadgeColor(category) {
  const colors = {
    'ibadah': 'blue',
    'pelprap': 'purple', 
    'pemuda': 'green',
    'anak': 'yellow',
    'doa': 'indigo',
    'fellowship': 'pink',
    'event': 'orange',
    'meeting': 'gray'
  }
  return colors[category?.toLowerCase()] || 'blue'
}

function getNewsBadgeColor(category) {
  const colors = {
    'pengumuman': 'blue',
    'event': 'green',
    'kegiatan': 'purple',
    'info': 'gray',
    'urgent': 'red',
    'berita': 'blue'
  }
  return colors[category?.toLowerCase()] || 'blue'
}

function formatDate(date) {
  if (!date) return ''
  
  const options = { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(date))
}