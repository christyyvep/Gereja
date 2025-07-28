// services/news.js - Fixed dengan backward compatibility
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
  where
} from 'firebase/firestore'
import { logAdminActivity, logUserActivity } from './activityService'

const COLLECTION_NAME = 'news'

/**
 * Mendapatkan semua news, diurutkan dari yang terbaru
 * @param {number} limitCount - Jumlah maksimal news yang diambil
 * @returns {Promise<Array>} Array news
 */
export async function getNews(limitCount = 10) {
  try {
    const newsRef = collection(db, COLLECTION_NAME)
    const q = query(
      newsRef, 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const news = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      news.push({
        id: doc.id,
        ...data,
        
        // ⭐ SAFE FIELD HANDLING - Pastikan field baru ada dengan default values
        date: data.date || null, // Tanggal kegiatan
        time: data.time || null, // Waktu kegiatan
        location: data.location || null, // Lokasi kegiatan
        priority: data.priority || 3, // Default priority sedang
        showInAnnouncement: data.showInAnnouncement || false,
        isEvent: data.isEvent || false,
        attachLinks: data.attachLinks || [], // Array link tambahan
        thumbnails: data.thumbnails || {}, // Object thumbnails
        tags: data.tags || [], // Array tags
        author: data.author || 'Tim Redaksi',
        source: data.source || 'Admin',
        views: data.views || 0
      })
    })
    
    return news
  } catch (error) {
    console.error('Error getting news:', error)
    throw error
  }
}

/**
 * ⭐ NEW - Mendapatkan news berdasarkan tanggal (untuk announcement system)
 * @param {string} date - Tanggal dalam format YYYY-MM-DD
 * @returns {Promise<Array>} Array news yang eventDate = date dan isEvent = true
 */
export async function getNewsByDate(date) {
  try {
    if (!date) {
      throw new Error('Tanggal harus diisi')
    }
    
    const newsRef = collection(db, COLLECTION_NAME)
    const q = query(
      newsRef, 
      where('date', '==', date),
      where('isEvent', '==', true),
      where('showInAnnouncement', '==', true),
      orderBy('priority', 'asc'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const news = []
    
    querySnapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        source: 'news', // ⭐ Tambah source identifier
        ...doc.data()
      })
    })
    
    console.log(`📰 [News Service] Found ${news.length} news events for date: ${date}`)
    return news
  } catch (error) {
    console.error('Error getting news by date:', error)
    throw error
  }
}

/**
 * Mendapatkan satu news berdasarkan ID dengan field lengkap
 * @param {string} id - ID news
 * @returns {Promise<Object>} Data news
 */
export async function getNewsById(id) {
  try {
    if (!id) {
      throw new Error('ID news harus diisi')
    }
    
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('News tidak ditemukan')
    }

    const data = docSnap.data()
    
    return {
      id: docSnap.id,
      ...data,
      
      // ⭐ SAFE FIELD HANDLING untuk DetailNews
      date: data.date || null,
      time: data.time || null,
      location: data.location || null,
      priority: data.priority || 3,
      showInAnnouncement: data.showInAnnouncement || false,
      isEvent: data.isEvent || false,
      attachLinks: data.attachLinks || [],
      thumbnails: data.thumbnails || {},
      tags: data.tags || [],
      author: data.author || 'Tim Redaksi',
      source: data.source || 'Admin',
      views: data.views || 0
    }
  } catch (error) {
    console.error('Error getting news by ID:', error)
    throw error
  }
}

/**
 * Mendapatkan news berdasarkan kategori
 * @param {string} category - Kategori news
 * @returns {Promise<Array>} Array news
 */
export async function getNewsByCategory(category) {
  try {
    if (!category) {
      throw new Error('Kategori harus diisi')
    }
    
    const newsRef = collection(db, COLLECTION_NAME)
    const q = query(
      newsRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const news = []
    
    querySnapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return news
  } catch (error) {
    console.error('Error getting news by category:', error)
    throw error
  }
}

/**
 * ⭐ AUTO-DETECT FIELDS - Mendeteksi field otomatis berdasarkan konten
 */
function autoDetectNewsFields(newsData) {
  const category = newsData.category?.toLowerCase() || ''
  const title = newsData.title?.toLowerCase() || ''
  const content = newsData.content?.toLowerCase() || ''
  
  // Default values
  let isEvent = false
  let showInAnnouncement = false
  let priority = 3
  
  // ⭐ EVENT CATEGORIES
  const eventCategories = [
    'event', 'ibadah', 'pelprap', 'pelatar', 'birthday', 
    'ulang_tahun', 'camping', 'retreat', 'seminar', 'workshop',
    'kegiatan', 'acara'
  ]
  
  // ⭐ EVENT KEYWORDS
  const eventKeywords = [
    'ibadah', 'pelprap', 'pelatar', 'birthday', 'ulang tahun',
    'camp', 'camping', 'retreat', 'seminar', 'workshop', 'acara',
    'kegiatan', 'event', 'pertemuan', 'gathering', 'favored'
  ]
  
  // ⭐ ANNOUNCEMENT CATEGORIES 
  const announcementCategories = ['announcement', 'pengumuman']
  
  // ⭐ HIGH PRIORITY KEYWORDS
  const highPriorityKeywords = ['penting', 'urgent', 'segera', 'darurat']
  
  // Logic detection
  const isEventCategory = eventCategories.some(cat => category.includes(cat))
  const hasEventKeyword = eventKeywords.some(keyword => 
    title.includes(keyword) || content.includes(keyword)
  )
  const isAnnouncementCategory = announcementCategories.some(cat => category.includes(cat))
  const hasHighPriorityKeyword = highPriorityKeywords.some(keyword => 
    title.includes(keyword) || content.includes(keyword)
  )
  const hasDateAndTime = newsData.date && newsData.time
  
  // ⭐ EVENT DETECTION
  if (isEventCategory || hasEventKeyword || hasDateAndTime) {
    isEvent = true
    showInAnnouncement = true
    priority = 2 // Tinggi untuk event
  }
  
  // ⭐ ANNOUNCEMENT DETECTION
  if (isAnnouncementCategory) {
    isEvent = false
    showInAnnouncement = true
    priority = 1 // Sangat tinggi untuk pengumuman
  }
  
  // ⭐ HIGH PRIORITY DETECTION
  if (hasHighPriorityKeyword) {
    showInAnnouncement = true
    priority = 1 // Sangat tinggi
  }
  
  return {
    isEvent,
    showInAnnouncement,
    priority
  }
}

/**
 * Detect schedule info dari content
 */
function detectScheduleInfo(content) {
  const scheduleKeywords = [
    'jam', 'pukul', 'waktu', 'tanggal', 'hari', 'minggu',
    'jadwal', 'acara', 'agenda', 'pelaksanaan', 'dimulai',
    'berakhir', 'durasi', 'tempat', 'lokasi', 'venue'
  ]
  
  const lowerContent = content.toLowerCase()
  return scheduleKeywords.some(keyword => lowerContent.includes(keyword))
}

/**
 * Create news baru dengan field lengkap
 * @param {Object} newsData - Data news
 * @returns {Promise<Object>} Created news object with ID
 */
export async function createNews(newsData) {
  try {
    console.log('🔍 [createNews] Received data:', newsData)
    
    if (!newsData.title || !newsData.title.trim()) {
      throw new Error('Title harus diisi')
    }

    if (!newsData.summary || !newsData.summary.trim()) {
      throw new Error('Summary harus diisi')
    }

    if (!newsData.category || !newsData.category.trim()) {
      throw new Error('Category harus diisi')
    }

    // ⭐ AUTO-DETECTION untuk field baru
    const autoDetectedFields = autoDetectNewsFields(newsData)

    const enrichedData = {
      // ⭐ BASIC FIELDS
      title: newsData.title.trim(),
      category: newsData.category.trim(), 
      summary: newsData.summary.trim(),
      content: newsData.content || newsData.summary.trim(),
      
      // ⭐ DATE FIELDS
      publishDate: newsData.publishDate || new Date(),
      date: newsData.date || null,
      time: newsData.time || null,
      location: newsData.location || null,
      
      // ⭐ DISPLAY SETTINGS
      priority: newsData.priority ?? autoDetectedFields.priority,
      showInAnnouncement: newsData.showInAnnouncement ?? autoDetectedFields.showInAnnouncement,
      isEvent: newsData.isEvent ?? autoDetectedFields.isEvent,
      
      // ⭐ MEDIA
      thumbnail: newsData.thumbnail || null,
      thumbnails: newsData.thumbnails || {},
      
      // ⭐ ADDITIONAL FIELDS
      author: newsData.author || 'Tim Redaksi',
      source: newsData.source || 'Admin',
      tags: Array.isArray(newsData.tags) ? newsData.tags : [],
      attachLinks: Array.isArray(newsData.attachLinks) ? newsData.attachLinks : [],
      views: 0,
      
      // ⭐ SYSTEM FIELDS
      hasScheduleInfo: detectScheduleInfo(newsData.summary || newsData.content || ''),
      isPublished: true,
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: newsData.createdBy || 'Admin'
    }
    
    console.log('✅ [createNews] Enriched data:', enrichedData)
    
    const newsRef = collection(db, 'news')
    const docRef = await addDoc(newsRef, enrichedData)
    
    console.log('🎉 [createNews] News created with ID:', docRef.id)
    
    // Log admin activity
    try {
      await logAdminActivity(enrichedData.createdBy || 'admin', {
        action: 'news_create',
        title: enrichedData.title,
        category: enrichedData.category
      })
    } catch (activityError) {
      console.warn('⚠️ [createNews] Could not log activity:', activityError)
    }
    
    return {
      id: docRef.id,
      ...enrichedData
    }
  } catch (error) {
    console.error('❌ [createNews] Error:', error)
    throw error
  }
}

/**
 * ⭐ BACKWARD COMPATIBILITY - Alias untuk addNews (yang lama)
 * @param {Object} newsData - Data news baru
 * @returns {Promise<string>} ID news yang baru dibuat
 */
export async function addNews(newsData) {
  try {
    if (!newsData || typeof newsData !== 'object') {
      throw new Error('Data news tidak valid')
    }

    if (!newsData.title) {
      throw new Error('Title news harus diisi')
    }

    if (!newsData.summary) {
      throw new Error('Summary news harus diisi')
    }

    if (!newsData.category) {
      throw new Error('Category news harus diisi')
    }
    
    // ⭐ AUTO-DETECTION dan DEFAULT VALUES
    const autoDetectedFields = autoDetectNewsFields(newsData)
    
    // ⭐ ENRICHED DATA dengan field baru
    const enrichedData = {
      ...newsData,
      
      // ⭐ CONTENT dari summary jika tidak ada content
      content: newsData.content || newsData.summary,
      
      // Field baru dengan priority: manual input > auto-detection > default
      isEvent: newsData.isEvent ?? autoDetectedFields.isEvent,
      showInAnnouncement: newsData.showInAnnouncement ?? autoDetectedFields.showInAnnouncement,
      priority: newsData.priority ?? autoDetectedFields.priority,
      date: newsData.date || null,
      time: newsData.time || null,
      location: newsData.location || null,
      author: newsData.author || 'Tim Redaksi',
      source: newsData.source || 'Admin',
      tags: Array.isArray(newsData.tags) ? newsData.tags : [],
      attachLinks: Array.isArray(newsData.attachLinks) ? newsData.attachLinks : [],
      thumbnails: newsData.thumbnails || {},
      views: 0,
      
      // Auto-detect showInAnnouncement berdasarkan priority/isEvent
      hasScheduleInfo: detectScheduleInfo(newsData.summary || newsData.content || ''),
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: newsData.createdBy || 'system'
    }
    
    const newsRef = collection(db, COLLECTION_NAME)
    const newDoc = await addDoc(newsRef, enrichedData)
    
    console.log('✅ [News Service] News added with ID:', newDoc.id)
    console.log('   Auto-detected fields:', autoDetectedFields)
    
    return newDoc.id
  } catch (error) {
    console.error('Error adding news:', error)
    throw error
  }
}

/**
 * ⭐ UPDATED - Mengupdate news dengan support field baru
 * @param {string} id - ID news
 * @param {Object} updateData - Data yang akan diupdate
 * @returns {Promise<boolean>} Success status
 */
export async function updateNews(id, updateData) {
  try {
    if (!id) {
      throw new Error('ID news harus diisi')
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Data update tidak valid')
    }
    
    // Get existing data untuk merge dan activity logging
    const existingNews = await getNewsById(id)
    
    // ⭐ Re-run auto-detection jika ada perubahan signifikan
    let enrichedUpdateData = { ...updateData }
    
    if (updateData.title || updateData.content || updateData.category) {
      const mergedData = { ...existingNews, ...updateData }
      
      // Re-detect fields jika belum ada manual input
      const autoDetected = autoDetectNewsFields(mergedData)
      
      // Update dengan auto-detection jika field belum di-set manual
      if (updateData.isEvent === undefined && existingNews.isEvent === undefined) {
        enrichedUpdateData.isEvent = autoDetected.isEvent
      }
      if (updateData.showInAnnouncement === undefined && existingNews.showInAnnouncement === undefined) {
        enrichedUpdateData.showInAnnouncement = autoDetected.showInAnnouncement
      }
      if (updateData.priority === undefined && existingNews.priority === undefined) {
        enrichedUpdateData.priority = autoDetected.priority
      }
    }
    
    const newsRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(newsRef, {
      ...enrichedUpdateData,
      updatedAt: new Date(),
      updatedBy: updateData.updatedBy || 'system'
    })
    
    console.log('✅ [News Service] News updated:', id)
    
    // Log admin activity
    try {
      await logAdminActivity(updateData.updatedBy || 'admin', {
        action: 'news_update',
        title: updateData.title || existingNews.title,
        category: updateData.category || existingNews.category
      })
    } catch (activityError) {
      console.warn('⚠️ [updateNews] Could not log activity:', activityError)
    }
    
    return true
  } catch (error) {
    console.error('Error updating news:', error)
    throw error
  }
}

/**
 * Menghapus news (untuk admin)
 * @param {string} id - ID news yang akan dihapus
 * @returns {Promise<boolean>} Success status
 */
export async function deleteNews(id, adminId = 'admin') {
  try {
    if (!id) {
      throw new Error('ID news harus diisi')
    }
    
    // Get news data before deletion for activity log
    const newsRef = doc(db, COLLECTION_NAME, id)
    const newsDoc = await getDoc(newsRef)
    const newsData = newsDoc.data()
    
    await deleteDoc(newsRef)
    
    console.log('✅ [News Service] News deleted:', id)
    
    // Log admin activity
    try {
      await logAdminActivity(adminId, {
        action: 'news_delete',
        title: newsData?.title || 'Deleted News',
        category: newsData?.category || 'unknown'
      })
    } catch (activityError) {
      console.warn('⚠️ [deleteNews] Could not log activity:', activityError)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting news:', error)
    throw error
  }
}

/**
 * ⭐ NEW - Mendapatkan upcoming news events (untuk fallback jika hari ini kosong)
 * @param {string} fromDate - Tanggal mulai pencarian (YYYY-MM-DD)
 * @param {number} limitCount - Limit hasil
 * @returns {Promise<Array>} Array news events yang akan datang
 */
export async function getUpcomingNewsEvents(fromDate, limitCount = 5) {
  try {
    if (!fromDate) {
      throw new Error('From date harus diisi')
    }
    
    const newsRef = collection(db, COLLECTION_NAME)
    const q = query(
      newsRef, 
      where('date', '>=', fromDate),
      where('isEvent', '==', true),
      where('showInAnnouncement', '==', true),
      orderBy('date', 'asc'),
      orderBy('priority', 'asc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const news = []
    
    querySnapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        source: 'news',
        ...doc.data()
      })
    })
    
    console.log(`📰 [News Service] Found ${news.length} upcoming news events from: ${fromDate}`)
    return news
  } catch (error) {
    console.error('Error getting upcoming news events:', error)
    throw error
  }
}

/**
 * Get news detail dan log user activity
 * @param {string} id - ID news
 * @param {string} userId - ID user yang membaca (optional)
 * @param {string} userName - Nama user (optional)
 * @returns {Promise<Object>} News detail
 */
export async function getNewsDetailWithActivity(id, userId = null, userName = null) {
  const newsDetail = await getNewsById(id)
  
  // Log user activity jika userId tersedia
  if (userId) {
    try {
      await logUserActivity(userId, {
        action: 'news_read',
        title: newsDetail.title,
        category: newsDetail.category,
        userName: userName || 'User'
      })
    } catch (activityError) {
      console.warn('⚠️ [getNewsDetail] Could not log user activity:', activityError)
    }
  }
  
  return newsDetail
}