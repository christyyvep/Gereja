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
import { getUpcomingWorshipSchedules as getUpcomingSchedules } from './schedules'

const NEWS_COLLECTION = 'news'

/**
 * ⭐ MAIN FUNCTION - Get unified announcements dari schedules + news
 * Hanya menampilkan konten yang memiliki KEGIATAN/ACARA HARI INI
 * @param {number} limitCount - Maksimal announcements yang diambil
 * @returns {Promise<Array>} Array unified announcements
 */
export async function getUnifiedAnnouncements(limitCount = 8) {
  try {
    console.log('📢 [Announcement Service] Getting unified announcements for TODAY...')
    
    // 1. Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0] // "2025-07-07"
    console.log('📅 [Announcement Service] Today:', today)
    
    // 2. Ambil jadwal yang event-nya HARI INI (sudah benar)
    const todaySchedules = await getTodaySchedules(today)
    console.log(`📅 [Announcement Service] Found ${todaySchedules.length} schedules for today`)
    
    // 3. Ambil berita yang ada KEGIATAN/ACARA HARI INI (logic baru)
    const todayNews = await getTodayNews(today)
    console.log(`📰 [Announcement Service] Found ${todayNews.length} news with activities for today`)
    
    // 4. Transform ke format unified
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
      badge: 'Jadwal',
      badgeColor: getScheduleBadgeColor(schedule.category)
    }))
    
    const newsAnnouncements = todayNews.map(news => ({
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
      badge: 'Acara',
      badgeColor: getNewsBadgeColor(news.category),
      
      // Optional: thumbnail jika ada
      ...(news.thumbnail && { thumbnail: news.thumbnail })
    }))
    
    // 5. Gabungkan semua announcements
    const allAnnouncements = [
      ...scheduleAnnouncements,
      ...newsAnnouncements
    ]
    
    // 6. Sort berdasarkan priority dan waktu
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
    
    console.log(`📢 [Announcement Service] Today's activities: ${scheduleAnnouncements.length} schedules + ${newsAnnouncements.length} news = ${sortedAnnouncements.length} total announcements`)
    
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
 * ⭐ Get schedules yang event-nya HARI INI
 */
async function getTodaySchedules(today) {
  try {
    console.log('📅 [Announcement Service] Getting schedules for today:', today)
    
    // Gunakan fungsi yang sudah ada, tapi filter untuk hari ini saja
    const allUpcomingSchedules = await getUpcomingSchedules(today, 20)
    
    // Filter hanya yang event-nya hari ini
    const todaySchedules = allUpcomingSchedules.filter(schedule => {
      return schedule.date === today
    })
    
    console.log(`📅 [Announcement Service] Found ${todaySchedules.length} schedules for ${today}`)
    return todaySchedules
    
  } catch (error) {
    console.error('❌ [Announcement Service] Error getting today schedules:', error)
    return []
  }
}

/**
 * ⭐ Get news yang ada KEGIATAN/ACARA HARI INI
 */
async function getTodayNews(today) {
  try {
    console.log('📰 [Announcement Service] Getting news with activities for today:', today)
    
    const newsRef = collection(db, NEWS_COLLECTION)
    
    // Query dengan berbagai field tanggal kegiatan
    const queries = [
      query(newsRef, where('eventDate', '==', today)),
      query(newsRef, where('activityDate', '==', today)),
      query(newsRef, where('scheduleDate', '==', today)),
      query(newsRef, where('date', '==', today))
    ]
    
    const newsSet = new Set()
    
    // Execute semua queries
    for (const q of queries) {
      try {
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
          const newsData = {
            id: doc.id,
            ...doc.data()
          }
          newsSet.add(JSON.stringify(newsData))
        })
      } catch (queryError) {
        console.warn('⚠️ [Announcement Service] Query failed (normal jika field tidak ada):', queryError.message)
      }
    }
    
    // Convert Set kembali ke array
    const todayNews = Array.from(newsSet).map(item => JSON.parse(item))
    
    // Double check: filter manual
    const filteredNews = todayNews.filter(news => {
      const eventDate = news.eventDate || news.activityDate || news.scheduleDate || news.date
      const hasEventToday = eventDate === today
      
      if (hasEventToday) {
        console.log(`✅ [Announcement Service] News "${news.title}" has activity on ${today}`)
      }
      
      return hasEventToday
    })
    
    console.log(`📰 [Announcement Service] Found ${filteredNews.length} news with activities for ${today}`)
    return filteredNews
    
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