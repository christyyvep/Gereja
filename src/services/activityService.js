// src/services/activityService.js
// Service untuk mengelola user dan admin activities

import { db } from './firebase'
import { 
  collection, 
  addDoc,
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot
} from 'firebase/firestore'

const USER_ACTIVITIES_COLLECTION = 'user_activities'
const ADMIN_ACTIVITIES_COLLECTION = 'admin_activities'

/**
 * Daftar aktivitas yang PENTING untuk admin monitoring
 * Akan di-filter hanya yang benar-benar perlu admin attention
 */
const IMPORTANT_USER_ACTIVITIES = [
  'prayer_request',       // Prayer request baru - butuh follow-up
  'laporan_submit',       // Laporan jemaat - butuh review/action
  'laporan_jemaat',       // Alias untuk laporan
  'news_read',           // User engagement dengan content
  'register',            // User baru - welcome needed
  'bookmark_add',        // Content engagement tracking
  // EXCLUDED: login, profile_update, renungan_read, jadwal_view (too noisy)
]

const IMPORTANT_ADMIN_ACTIVITIES = [
  'news_create',
  'news_update', 
  'news_delete',
  'devotional_create',
  'devotional_update',
  'devotional_delete',
  'schedule_create',
  'schedule_update',
  'schedule_delete',
  'prayer_status_update',
  'laporan_status_update'
]

/**
 * Log aktivitas user
 * @param {string} userId - ID user
 * @param {Object} activityData - Data aktivitas
 */
export async function logUserActivity(userId, activityData) {
  try {
    console.log('📊 [ActivityService] Starting user activity log...')
    console.log('📊 [ActivityService] User ID:', userId)
    console.log('📊 [ActivityService] Activity data:', activityData)
    
    if (!userId) {
      console.warn('⚠️ [ActivityService] No user ID provided, using fallback')
      userId = 'unknown_user_' + Date.now()
    }
    
    const activityRef = collection(db, USER_ACTIVITIES_COLLECTION)
    console.log('📊 [ActivityService] Collection reference created')
    
    const activityRecord = {
      userId: String(userId), // Ensure it's a string
      timestamp: new Date(), // Use regular Date instead of serverTimestamp for consistency
      createdAt: new Date(), // Additional timestamp field
      // FIXED: Only use userName from activityData, don't override with userStore
      userName: activityData.userName || getUserName(userId, null),
      ...activityData
    }
    console.log('📊 [ActivityService] Activity record prepared:', activityRecord)
    
    const docRef = await addDoc(activityRef, activityRecord)
    console.log('✅ [ActivityService] User activity logged with ID:', docRef.id)
    
    // Verify the document was created
    const { getDoc } = await import('firebase/firestore')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      console.log('✅ [ActivityService] Document verified in Firebase:', docSnap.data())
    } else {
      console.warn('⚠️ [ActivityService] Document not found after creation')
    }
    
  } catch (error) {
    console.error('❌ [ActivityService] Error logging user activity:', error)
    console.error('❌ [ActivityService] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    // Jangan throw error, activity log adalah optional
  }
}

/**
 * Log aktivitas admin
 * @param {string} adminId - ID admin
 * @param {Object} activityData - Data aktivitas
 */
export async function logAdminActivity(adminId, activityData) {
  try {
    const activityRef = collection(db, ADMIN_ACTIVITIES_COLLECTION)
    
    const activityRecord = {
      adminId: adminId,
      timestamp: new Date(),
      // Ensure adminName is available from the activity data or fallback
      adminName: getAdminName(adminId),
      ...activityData
    }
    
    await addDoc(activityRef, activityRecord)
    console.log('👨‍💼 [ActivityService] Admin activity logged:', activityData.action)
    
  } catch (error) {
    console.error('❌ [ActivityService] Error logging admin activity:', error)
    // Jangan throw error, activity log adalah optional
  }
}

/**
 * Mendapatkan recent activities (gabungan user dan admin) - FILTERED untuk aktivitas penting
 * @param {number} limitCount - Jumlah maksimal activities
 * @param {boolean} filterImportant - Filter hanya aktivitas penting (default: true)
 * @returns {Promise<Array>} Array activities
 */
export async function getRecentActivities(limitCount = 20, filterImportant = true) {
  try {
    console.log('🔍 [ActivityService] Fetching recent activities...', { limitCount, filterImportant })
    
    // Increase fetch limit when filtering to ensure we get enough important activities
    const fetchLimit = filterImportant ? limitCount * 3 : limitCount
    
    // Ambil user activities
    const userActivitiesRef = collection(db, USER_ACTIVITIES_COLLECTION)
    const userQuery = query(
      userActivitiesRef,
      orderBy('timestamp', 'desc'),
      limit(fetchLimit)
    )
    
    // Ambil admin activities  
    const adminActivitiesRef = collection(db, ADMIN_ACTIVITIES_COLLECTION)
    const adminQuery = query(
      adminActivitiesRef,
      orderBy('timestamp', 'desc'),
      limit(fetchLimit)
    )
    
    const [userSnapshot, adminSnapshot] = await Promise.all([
      getDocs(userQuery),
      getDocs(adminQuery)
    ])
    
    const activities = []
    
    // Process user activities (with filtering)
    userSnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Filter: only include important activities if filtering is enabled
      if (filterImportant && !isImportantActivity(data, 'user')) {
        console.log(`⏭️ Skipping unimportant user activity: ${data.action}`)
        return
      }
      
      activities.push({
        id: doc.id,
        type: 'user',
        activityType: data.action || 'unknown',
        text: formatUserActivityText(data),
        user: data.userName || data.userId,
        timestamp: data.timestamp?.toDate() || new Date(),
        category: 'user_action',
        priority: getActivityPriority(data, 'user'),
        ...data
      })
    })
    
    // Process admin activities (with filtering)
    adminSnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Filter: only include important activities if filtering is enabled
      if (filterImportant && !isImportantActivity(data, 'admin')) {
        console.log(`⏭️ Skipping unimportant admin activity: ${data.action}`)
        return
      }
      
      activities.push({
        id: doc.id,
        type: 'admin', 
        activityType: data.action || 'unknown',
        text: formatAdminActivityText(data),
        user: data.adminName || data.adminId,
        timestamp: data.timestamp?.toDate() || new Date(),
        category: 'admin_action',
        priority: getActivityPriority(data, 'admin'),
        ...data
      })
    })
    
    // Sort STRICTLY by timestamp (newest first) - priority is only for display formatting
    activities.sort((a, b) => {
      return b.timestamp - a.timestamp
    })
    
    // Return only the requested count
    const result = activities.slice(0, limitCount)
    
    console.log(`✅ [ActivityService] Loaded ${result.length} important activities (filtered from ${userSnapshot.size + adminSnapshot.size} total)`)
    return result
    
  } catch (error) {
    console.error('❌ [ActivityService] Error fetching activities:', error)
    return []
  }
}

/**
 * Setup real-time listener untuk activities - with filtering for important activities
 * @param {Function} callback - Callback function when data changes
 * @param {number} limitCount - Jumlah maksimal activities
 * @param {boolean} filterImportant - Filter hanya aktivitas penting (default: true)
 * @returns {Function} Unsubscribe function
 */
export function setupActivityListener(callback, limitCount = 20, filterImportant = true) {
  try {
    console.log('🔄 [ActivityService] Setting up real-time listener...', { limitCount, filterImportant })
    
    // Increase fetch limit when filtering
    const fetchLimit = filterImportant ? limitCount * 3 : limitCount
    
    const userActivitiesRef = collection(db, USER_ACTIVITIES_COLLECTION)
    const userQuery = query(
      userActivitiesRef,
      orderBy('timestamp', 'desc'),
      limit(fetchLimit)
    )
    
    const adminActivitiesRef = collection(db, ADMIN_ACTIVITIES_COLLECTION)
    const adminQuery = query(
      adminActivitiesRef,
      orderBy('timestamp', 'desc'),
      limit(fetchLimit)
    )
    
    let userActivities = []
    let adminActivities = []
    
    const updateCallback = () => {
      const combined = [...userActivities, ...adminActivities]
      
      // Sort STRICTLY by timestamp (newest first) - priority is only for display formatting
      combined.sort((a, b) => {
        return b.timestamp - a.timestamp
      })
      
      callback(combined.slice(0, limitCount))
    }
    
    // Listen to user activities
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      userActivities = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Filter: only include important activities if filtering is enabled
        if (filterImportant && !isImportantActivity(data, 'user')) {
          return
        }
        
        userActivities.push({
          id: doc.id,
          type: 'user',
          activityType: data.action || 'unknown',
          text: formatUserActivityText(data),
          user: data.userName || data.userId,
          timestamp: data.timestamp?.toDate() || new Date(),
          category: 'user_action',
          priority: getActivityPriority(data, 'user'),
          ...data
        })
      })
      updateCallback()
    })
    
    // Listen to admin activities
    const unsubscribeAdmin = onSnapshot(adminQuery, (snapshot) => {
      adminActivities = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Filter: only include important activities if filtering is enabled
        if (filterImportant && !isImportantActivity(data, 'admin')) {
          return
        }
        
        adminActivities.push({
          id: doc.id,
          type: 'admin',
          activityType: data.action || 'unknown', 
          text: formatAdminActivityText(data),
          user: data.adminName || data.adminId,
          timestamp: data.timestamp?.toDate() || new Date(),
          category: 'admin_action',
          priority: getActivityPriority(data, 'admin'),
          ...data
        })
      })
      updateCallback()
    })
    
    // Return combined unsubscribe function
    return () => {
      unsubscribeUser()
      unsubscribeAdmin()
      console.log('🔄 [ActivityService] Real-time listener unsubscribed')
    }
    
  } catch (error) {
    console.error('❌ [ActivityService] Error setting up listener:', error)
    return () => {} // Return empty function
  }
}

/**
 * Format text untuk user activity
 * @param {Object} data - Activity data
 * @returns {string} Formatted text
 */
function formatUserActivityText(data) {
  const userName = getUserName(data.userId, data.userName)
  const priority = getActivityPriority(data, 'user')
  const priorityIcon = getPriorityIcon(priority)
  
  switch (data.action) {
    case 'register':
      return `${priorityIcon} ${userName} mendaftar sebagai jemaat baru`
    case 'login':
      return `${userName} login ke aplikasi` // Won't show due to filter
    case 'profile_update':
    case 'profile_updated':
      return `${userName} memperbarui profil` // Won't show due to filter
    case 'prayer_request':
      return `${priorityIcon} ${userName} mengirim prayer request: "${data.title || 'Doa baru'}"`
    case 'laporan_submit':
      return `${priorityIcon} ${userName} mengirim laporan jemaat: "${data.title || 'Laporan Jemaat'}"`
    case 'laporan_jemaat':
      return `${priorityIcon} ${userName} mengirim laporan jemaat`
    case 'bookmark_add':
      return `${priorityIcon} ${userName} menambah bookmark renungan`
    case 'bookmark_remove':
      return `${userName} menghapus bookmark` // Won't show due to filter
    case 'renungan_read':
    case 'devotional_read':
      return `${userName} membaca renungan: "${data.title || 'Renungan'}"` // Won't show due to filter
    case 'jadwal_view':
      return `${userName} melihat jadwal ibadah` // Won't show due to filter
    case 'news_read':
      return `${priorityIcon} ${userName} membaca berita: "${data.title || 'Berita'}"`
    default:
      return `${userName} melakukan aktivitas: ${data.action || 'unknown'}`
  }
}

/**
 * Format text untuk admin activity  
 * @param {Object} data - Activity data
 * @returns {string} Formatted text
 */
function formatAdminActivityText(data) {
  const adminName = data.adminName || 'Admin'
  const priority = getActivityPriority(data, 'admin')
  const priorityIcon = getPriorityIcon(priority)
  
  switch (data.action) {
    case 'news_create':
      return `${priorityIcon} ${adminName} membuat berita baru: "${data.title || 'Berita'}"`
    case 'news_update':
      return `${priorityIcon} ${adminName} memperbarui berita: "${data.title || 'Berita'}"`
    case 'news_delete':
      return `${priorityIcon} ${adminName} menghapus berita: "${data.title || 'Berita'}"`
    case 'devotional_create':
      return `${priorityIcon} ${adminName} membuat renungan baru: "${data.title || 'Renungan'}"`
    case 'devotional_update':
      return `${priorityIcon} ${adminName} memperbarui renungan: "${data.title || 'Renungan'}"`
    case 'devotional_delete':
      return `${priorityIcon} ${adminName} menghapus renungan: "${data.title || 'Renungan'}"`
    case 'schedule_create':
      return `${priorityIcon} ${adminName} membuat jadwal baru: "${data.title || 'Jadwal'}"`
    case 'schedule_update':
      return `${priorityIcon} ${adminName} memperbarui jadwal: "${data.title || 'Jadwal'}"`
    case 'schedule_delete':
      return `${priorityIcon} ${adminName} menghapus jadwal: "${data.title || 'Jadwal'}"`
    case 'prayer_status_update':
      return `${priorityIcon} ${adminName} memperbarui status prayer request: "${data.title || 'Doa'}"`
    case 'prayer_respond':
      return `${priorityIcon} ${adminName} merespons prayer request: "${data.title || 'Doa'}"`
    case 'prayer_close':
      return `${priorityIcon} ${adminName} menutup prayer request yang sudah dijawab`
    case 'laporan_status_update':
      return `${priorityIcon} ${adminName} memperbarui status laporan: "${data.title || 'Laporan'}"`
    case 'laporan_process':
      return `${priorityIcon} ${adminName} memproses laporan jemaat: "${data.title || 'Laporan'}"`
    case 'laporan_approve':
      return `${priorityIcon} ${adminName} menyetujui laporan jemaat: "${data.title || 'Laporan'}"`
    case 'laporan_reject':
      return `${priorityIcon} ${adminName} menolak laporan jemaat: "${data.title || 'Laporan'}"`
    case 'user_role_change':
      return `${adminName} mengubah role user: ${data.targetUser || 'User'}`
    case 'report_process':
      return `${adminName} memproses laporan jemaat`
    case 'system_config':
      return `${adminName} mengubah konfigurasi sistem`
    default:
      return `${adminName} melakukan aktivitas: ${data.action || 'unknown'}`
  }
}

/**
 * Mendapatkan aktivitas berdasarkan user ID
 * @param {string} userId - ID user
 * @param {number} limitCount - Jumlah maksimal activities
 * @returns {Promise<Array>} Array user activities
 */
export async function getUserActivities(userId, limitCount = 50) {
  try {
    const activitiesRef = collection(db, USER_ACTIVITIES_COLLECTION)
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const activities = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      })
    })
    
    return activities
    
  } catch (error) {
    console.error('❌ [ActivityService] Error fetching user activities:', error)
    return []
  }
}

/**
 * Mendapatkan statistik aktivitas
 * @returns {Promise<Object>} Activity statistics
 */
export async function getActivityStats() {
  try {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Query untuk aktivitas hari ini
    const todayActivitiesRef = collection(db, USER_ACTIVITIES_COLLECTION)
    const todayQuery = query(
      todayActivitiesRef,
      where('timestamp', '>=', new Date(today.toDateString()))
    )
    
    // Query untuk aktivitas seminggu terakhir
    const weekActivitiesRef = collection(db, USER_ACTIVITIES_COLLECTION)
    const weekQuery = query(
      weekActivitiesRef,
      where('timestamp', '>=', weekAgo)
    )
    
    const [todaySnapshot, weekSnapshot] = await Promise.all([
      getDocs(todayQuery),
      getDocs(weekQuery)
    ])
    
    return {
      todayCount: todaySnapshot.size,
      weekCount: weekSnapshot.size,
      avgDaily: Math.round(weekSnapshot.size / 7)
    }
    
  } catch (error) {
    console.error('❌ [ActivityService] Error fetching activity stats:', error)
    return {
      todayCount: 0,
      weekCount: 0,
      avgDaily: 0
    }
  }
}

/**
 * Helper function to get user name from user store or fallback
 * @param {string} userId - User ID
 * @param {string} fallbackName - Fallback name from data
 * @returns {string} User name
 */
function getUserName(userId, fallbackName = null) {
  // Use fallback name if provided and it's a proper name (not generic)
  if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim() && 
      fallbackName !== 'User' && fallbackName !== 'user') {
    return fallbackName.trim()
  }
  
  // ⚠️ DON'T use userStore here as it might contain different user data
  // userStore contains currently logged in user, not the user who performed the activity
  // This was causing wrong names to appear (e.g., "Christy" instead of "Irene")
  
  // Final fallback: try to extract name from userId if it contains name info
  if (userId && userId !== 'unknown_user' && !userId.startsWith('unknown_user_') && 
      !userId.startsWith('demo-user') && userId !== 'User') {
    return userId
  }
  
  return 'User'
}

/**
 * Helper function to get admin name from user store or admin ID
 * @param {string} adminId - Admin ID
 * @returns {string} Admin name
 */
// Admin ID to Name mapping for proper display
const ADMIN_MAPPING = {
  'admin': 'Administrator',
  'christy': 'Christy Potabuga',
  'C-POT': 'Christy Potabuga',
  'admin_christy': 'Christy Potabuga',
  'irene': 'Irene',
  'admin_irene': 'Irene', 
  'super_admin': 'Super Admin',
  // Add more admin mappings as needed
}

function getAdminName(adminId) {
  if (!adminId) return 'Admin'
  
  // Check direct mapping first
  if (ADMIN_MAPPING[adminId]) {
    return ADMIN_MAPPING[adminId]
  }
  
  // Try to extract name from adminId if it contains name info
  if (adminId.includes('_')) {
    const namePart = adminId.split('_').pop()
    if (namePart && namePart !== 'admin') {
      // Capitalize first letter
      return namePart.charAt(0).toUpperCase() + namePart.slice(1)
    }
  }
  
  // If adminId looks like a name (not generic admin), use it
  if (adminId !== 'admin' && !adminId.startsWith('admin_') && adminId.length > 3) {
    return adminId
  }
  
  return 'Admin'
}

/**
 * Check if activity is important enough to show in admin dashboard
 * @param {Object} activityData - Activity data
 * @param {string} type - 'user' or 'admin'
 * @returns {boolean} True if activity is important
 */
function isImportantActivity(activityData, type = 'user') {
  const action = activityData.action || activityData.activityType || 'unknown'
  
  if (type === 'user') {
    return IMPORTANT_USER_ACTIVITIES.includes(action)
  } else if (type === 'admin') {
    return IMPORTANT_ADMIN_ACTIVITIES.includes(action)
  }
  
  return false
}

/**
 * Get priority level for activity (for sorting)
 * Higher priority = more important for admin attention
 * @param {Object} activityData - Activity data
 * @param {string} type - 'user' or 'admin'
 * @returns {number} Priority level (1-5, 5 = highest)
 */
function getActivityPriority(activityData, type = 'user') {
  const action = activityData.action || activityData.activityType || 'unknown'
  
  if (type === 'user') {
    switch (action) {
      case 'prayer_request':
        return 5 // Highest - needs follow-up
      case 'laporan_submit':
      case 'laporan_jemaat':
        return 4 // High - needs review
      case 'register':
        return 3 // Medium-high - welcome new user
      case 'news_read':
        return 2 // Medium - content engagement
      case 'bookmark_add':
        return 1 // Low - passive engagement
      default:
        return 1
    }
  } else if (type === 'admin') {
    switch (action) {
      case 'prayer_status_update':
      case 'laporan_status_update':
        return 5 // Highest - action taken
      case 'news_create':
      case 'devotional_create':
      case 'schedule_create':
        return 4 // High - new content
      case 'news_update':
      case 'devotional_update':
      case 'schedule_update':
        return 3 // Medium - content updates
      case 'news_delete':
      case 'devotional_delete':
      case 'schedule_delete':
        return 2 // Low-medium - removals
      default:
        return 1
    }
  }
  
  return 1
}

/**
 * Get priority icon for visual indication
 * @param {number} priority - Priority level (1-5)
 * @returns {string} Icon/emoji
 */
function getPriorityIcon(priority) {
  switch (priority) {
    case 5: return '🔥' // Highest priority - urgent
    case 4: return '⚡' // High priority - important  
    case 3: return '📌' // Medium-high priority
    case 2: return '📊' // Medium priority
    case 1: return '💭' // Low priority
    default: return '📋'
  }
}
