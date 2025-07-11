// services/schedules.js - COMPLETE TEMPLATE CRUD SYSTEM
import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,  // eslint-disable-line no-unused-vars
  deleteDoc,  // eslint-disable-line no-unused-vars
  query, 
  where,      // eslint-disable-line no-unused-vars
  orderBy
} from 'firebase/firestore'

const COLLECTION_NAME = 'worship_schedules'

// =======================================
// 🎯 TEMPLATE FACTORY - AUTO GENERATE STRUCTURE
// =======================================

class TemplateFactory {
  
  // Generate template baru dengan structure yang consistent
  static createNewTemplate(basicInfo) {
    const now = new Date().toISOString()
    
    return {
      // Basic info dari admin input
      id: this.generateTemplateId(basicInfo.title),
      title: basicInfo.title,
      description: basicInfo.description || '',
      
      // Static info (setting dasar)
      staticInfo: {
        dayOfWeek: basicInfo.dayOfWeek,           // 0-6 atau 'daily'
        defaultTime: basicInfo.defaultTime,       // '08:00'
        location: basicInfo.location,             // 'Gedung Utama'
        category: basicInfo.category || 'ibadah-umum',
        isActive: true
      },
      
      // Dynamic content (yang bisa admin edit tiap minggu)
      dynamicContent: {
        currentTheme: basicInfo.initialTheme || 'Berkat Tuhan',
        currentWeekDate: this.getCurrentWeekDate(),
        
        weeklyUpdate: {
          theme: basicInfo.initialTheme || 'Berkat Tuhan',
          speaker: '',
          specialTime: null,          // null = pakai defaultTime
          announcements: [],
          specialNotes: '',
          isSpecialEvent: false
        }
      },
      
      // Template settings
      templateSettings: {
        allowTimeOverride: true,      // Boleh ganti waktu per minggu
        allowLocationOverride: false, // Lokasi tetap
        requireSpeaker: basicInfo.requireSpeaker || false,
        maxAnnouncements: 5
      },
      
      // Metadata
      createdAt: now,
      createdBy: basicInfo.adminId || 'system',
      lastUpdated: now,
      updatedBy: basicInfo.adminId || 'system',
      version: 1
    }
  }
  
  // Auto-generate ID dari title
  static generateTemplateId(title) {
    const cleaned = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')    // Remove special chars
      .replace(/\s+/g, '_')           // Space to underscore
      .substring(0, 30)               // Max 30 chars
    
    return `worship_${cleaned}_${Date.now().toString().slice(-6)}`
  }
  
  // Get current week date (untuk weekly templates)
  static getCurrentWeekDate() {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - dayOfWeek)
    return sunday.toISOString().split('T')[0]
  }
}

// =======================================
// 🛠️ ADMIN TEMPLATE MANAGER - CRUD OPERATIONS
// =======================================

class AdminTemplateManager {
  
  // CREATE: Tambah template baru
  static async createTemplate(templateData) {
    try {
      // Validate input
      this.validateTemplateData(templateData)
      
      // Generate template dengan factory
      const newTemplate = TemplateFactory.createNewTemplate(templateData)
      
      // Check if ID already exists
      const existingTemplate = await this.getTemplate(newTemplate.id)
      if (existingTemplate) {
        // Generate new ID if conflict
        newTemplate.id = TemplateFactory.generateTemplateId(templateData.title)
      }
      
      // Save to database
      await this.saveTemplate(newTemplate.id, newTemplate)
      
      console.log(`✅ New template created: ${newTemplate.id}`)
      return newTemplate
      
    } catch (error) {
      console.error('❌ Failed to create template:', error)
      throw error
    }
  }
  
  // READ: Get all templates untuk admin panel
  static async getAllTemplatesForAdmin() {
    try {
      const templates = await getWorshipTemplates()
      
      // Return dengan additional info untuk admin
      return templates.map(template => ({
        ...template,
        
        // Display info
        displayName: template.title,
        scheduleInfo: this.formatScheduleInfo(template),
        lastUpdateFormatted: this.formatDate(template.lastUpdated),
        isActive: template.staticInfo?.isActive !== false,
        
        // Stats
        hasAnnouncements: template.dynamicContent?.weeklyUpdate?.announcements?.length > 0,
        hasSpecialTime: template.dynamicContent?.weeklyUpdate?.specialTime !== null,
        
        // Actions available
        canEdit: true,
        canDelete: true,
        canDuplicate: true
      }))
      
    } catch (error) {
      console.error('❌ Failed to get templates:', error)
      throw error
    }
  }
  
  // UPDATE: Edit template content
  static async updateTemplate(templateId, updateData) {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }
      
      // Determine update type
      if (updateData.staticInfo) {
        // Update basic info (structure)
        await this.updateTemplateStructure(templateId, updateData)
      } else {
        // Update weekly content (normal admin edit)
        await this.updateWeeklyContent(templateId, updateData)
      }
      
      console.log(`✅ Template updated: ${templateId}`)
      return true
      
    } catch (error) {
      console.error('❌ Failed to update template:', error)
      throw error
    }
  }
  
  // UPDATE: Update template structure (admin advanced edit)
  static async updateTemplateStructure(templateId, structureData) {
    const template = await this.getTemplate(templateId)
    
    const updatedTemplate = {
      ...template,
      
      // Update basic info if provided
      ...(structureData.title && { title: structureData.title }),
      ...(structureData.description && { description: structureData.description }),
      
      // Update static info
      staticInfo: {
        ...template.staticInfo,
        ...structureData.staticInfo
      },
      
      // Update template settings if provided
      ...(structureData.templateSettings && {
        templateSettings: {
          ...template.templateSettings,
          ...structureData.templateSettings
        }
      }),
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin_current', // TODO: get from auth
      version: (template.version || 1) + 1
    }
    
    await this.saveTemplate(templateId, updatedTemplate)
  }
  
  // UPDATE: Update weekly content (normal admin edit)
  static async updateWeeklyContent(templateId, contentData) {
    const template = await this.getTemplate(templateId)
    
    const updatedTemplate = {
      ...template,
      dynamicContent: {
        ...template.dynamicContent,
        weeklyUpdate: {
          ...template.dynamicContent?.weeklyUpdate,
          ...contentData
        }
      },
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin_current' // TODO: get from auth
    }
    
    await this.saveTemplate(templateId, updatedTemplate)
  }
  
  // DELETE: Hapus template (soft delete)
  static async deleteTemplate(templateId) {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }
      
      // Soft delete: set inactive instead of hard delete
      const updatedTemplate = {
        ...template,
        staticInfo: {
          ...template.staticInfo,
          isActive: false
        },
        deletedAt: new Date().toISOString(),
        deletedBy: 'admin_current' // TODO: get from auth
      }
      
      await this.saveTemplate(templateId, updatedTemplate)
      
      console.log(`✅ Template deleted (soft): ${templateId}`)
      return true
      
    } catch (error) {
      console.error('❌ Failed to delete template:', error)
      throw error
    }
  }
  
  // DUPLICATE: Copy template dengan nama baru
  static async duplicateTemplate(templateId, newTitle) {
    try {
      const originalTemplate = await this.getTemplate(templateId)
      if (!originalTemplate) {
        throw new Error(`Template not found: ${templateId}`)
      }
      
      // Create new template based on original
      const duplicatedTemplate = {
        ...originalTemplate,
        id: TemplateFactory.generateTemplateId(newTitle),
        title: newTitle,
        createdAt: new Date().toISOString(),
        createdBy: 'admin_current', // TODO: get from auth
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin_current', // TODO: get from auth
        version: 1
      }
      
      await this.saveTemplate(duplicatedTemplate.id, duplicatedTemplate)
      
      console.log(`✅ Template duplicated: ${templateId} → ${duplicatedTemplate.id}`)
      return duplicatedTemplate
      
    } catch (error) {
      console.error('❌ Failed to duplicate template:', error)
      throw error
    }
  }
  
  // Helper: Get single template
  static async getTemplate(templateId) {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId)
      const templateSnap = await getDoc(templateRef)
      
      if (templateSnap.exists()) {
        return {
          id: templateSnap.id,
          ...templateSnap.data()
        }
      }
      return null
    } catch (error) {
      console.error('❌ Error getting template:', error)
      return null
    }
  }
  
  // Helper: Save template
  static async saveTemplate(templateId, templateData) {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId)
      await setDoc(templateRef, templateData)
      return true
    } catch (error) {
      console.error('❌ Error saving template:', error)
      throw error
    }
  }
  
  // Validation helper
  static validateTemplateData(data) {
    const required = ['title', 'dayOfWeek', 'defaultTime', 'location']
    const missing = required.filter(field => !data[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    
    // Validate dayOfWeek
    if (data.dayOfWeek !== 'daily' && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new Error('dayOfWeek must be 0-6 or "daily"')
    }
    
    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.defaultTime)) {
      throw new Error('defaultTime must be in HH:MM format')
    }
  }
  
  // Helper methods
  static formatScheduleInfo(template) {
    const { dayOfWeek, defaultTime } = template.staticInfo || {}
    
    if (dayOfWeek === 'daily') {
      return `Setiap hari, ${defaultTime}`
    }
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return `${days[dayOfWeek]}, ${defaultTime}`
  }
  
  static formatDate(isoString) {
    if (!isoString) return 'Tidak diketahui'
    return new Date(isoString).toLocaleString('id-ID')
  }
}

// =======================================
// 📅 CORE SCHEDULE FUNCTIONS (USER SIDE)
// =======================================

/**
 * 🎯 Get weekly worship overview (untuk user - main function)
 * @returns {Promise<Array>} Array worship cards untuk user
 */
export async function getWeeklyWorshipOverview() {
  try {
    console.log(`📅 [Worship Service] Getting weekly worship overview...`)
    
    // Ambil semua active templates
    const templates = await getWorshipTemplates()
    const activeTemplates = templates.filter(t => t.staticInfo?.isActive !== false)
    
    // Generate cards untuk user
    const weeklyCards = []
    
    for (const template of activeTemplates) {
      const card = generateUserCard(template)
      weeklyCards.push(card)
    }
    
    // Sort berdasarkan dayOfWeek, lalu time
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
    
    console.log(`✅ [Worship Service] Generated ${weeklyCards.length} worship cards`)
    return weeklyCards
    
  } catch (error) {
    console.error('❌ [Worship Service] Error getting weekly overview:', error)
    return []
  }
}

/**
 * 🏗️ Generate user card dari template - FIXED VERSION
 * @param {Object} template - Worship template
 * @returns {Object} User-friendly card
 */
function generateUserCard(template) {
  const dynamicContent = template.dynamicContent || {}
  const weeklyUpdate = dynamicContent.weeklyUpdate || {}
  const staticInfo = template.staticInfo || {}
  
  console.log(`🔧 [generateUserCard] Processing template: ${template.id}`, {
    hasTime: !!template.time,
    hasLocation: !!template.location,
    hasStaticInfo: !!staticInfo.defaultTime,
    template: template
  })
  
  return {
    // IDs
    id: template.id,
    templateId: template.id,
    
    // Basic info
    title: template.title,
    description: template.description || '',
    category: template.category || staticInfo.category || 'ibadah-umum',
    
    // ✅ FIXED: Schedule info - Ambil dari berbagai sumber dengan prioritas
    dayOfWeek: template.dayOfWeek || staticInfo.dayOfWeek,
    time: weeklyUpdate.specialTime || template.time || staticInfo.defaultTime,
    location: template.location || staticInfo.location,
    
    // ✅ FIXED: Dynamic content (fresh dari admin)
    theme: weeklyUpdate.theme || template.theme || dynamicContent.currentTheme || template.defaultTheme || 'Berkat Tuhan',
    speaker: weeklyUpdate.speaker || template.speaker || '',
    announcements: weeklyUpdate.announcements || template.announcements || [],
    specialNotes: weeklyUpdate.specialNotes || template.specialNotes || '',
    
    // ✅ FIXED: Display info
    scheduleText: generateScheduleText(template),
    lastUpdated: template.lastUpdated,
    
    // For ContentCard navigation (simple ID, no date needed!)
    detailUrl: `/jadwal/${template.id}`,
    
    // Metadata
    source: 'template-dynamic'
  }
}

/**
 * 📝 Generate readable schedule text - UPDATED VERSION
 * @param {Object} template - Template object
 * @returns {string} Text jadwal yang readable
 */
function generateScheduleText(template) {
  // ✅ FIXED: Try multiple sources for dayOfWeek and time
  const dayOfWeek = template.dayOfWeek || template.staticInfo?.dayOfWeek
  const defaultTime = template.time || template.staticInfo?.defaultTime
  const specialTime = template.dynamicContent?.weeklyUpdate?.specialTime
  const time = specialTime || defaultTime
  
  if (dayOfWeek === 'daily') {
    return `Setiap hari • ${time || '00:00'}`
  }
  
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = days[dayOfWeek] || 'Tidak diketahui'
  
  return `${dayName} • ${time || '00:00'}`
}

/**
 * 📋 Get semua worship templates (untuk internal use)
 * @returns {Promise<Array>} Array worship templates
 */
export async function getWorshipTemplates() {
  try {
    const templatesRef = collection(db, COLLECTION_NAME)
    const q = query(templatesRef, orderBy('createdAt', 'desc'))
    
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
 * 🎯 Get single worship schedule by template ID (untuk DetailJadwal)
 * @param {string} templateId - Template ID
 * @param {string} [_date] - Date (optional, for future use)
 * @returns {Promise<Object>} Worship schedule
 */
export async function getWorshipSchedule(templateId, _date = null) {  // eslint-disable-line no-unused-vars
  try {
    const template = await AdminTemplateManager.getTemplate(templateId)
    
    if (!template) {
      throw new Error(`Template tidak ditemukan: ${templateId}`)
    }
    
    console.log(`🎯 [getWorshipSchedule] Raw template data:`, template)
    
    // Return template dengan format yang sesuai untuk DetailJadwal
    const schedule = generateUserCard(template)
    
    console.log(`✅ [Worship Service] Generated schedule:`, schedule)
    return schedule
    
  } catch (error) {
    console.error('❌ [Worship Service] Error getting worship schedule:', error)
    throw error
  }
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

// =======================================
// 🔄 COMPATIBILITY WRAPPERS (untuk existing code)
// =======================================

/**
 * 🔄 Wrapper function untuk compatibility dengan kode lama
 * @param {string|Date} _date - Target date (unused for now)
 * @returns {Promise<Array>} Array schedules
 */
export async function getSchedulesByDate(_date) {  // eslint-disable-line no-unused-vars
  try {
    // Untuk saat ini, return semua active templates
    // Di masa depan bisa di-filter berdasarkan tanggal jika perlu
    return await getWeeklyWorshipOverview()
  } catch (error) {
    console.error('❌ [Schedule Service] Error in getSchedulesByDate:', error)
    return []
  }
}

/**
 * 🔄 Wrapper function untuk getSchedules
 * @param {number} [_limitDays=7] - Number of days to look ahead (unused for now)
 * @returns {Promise<Array>} Array schedules
 */
export async function getSchedules(_limitDays = 7) {  // eslint-disable-line no-unused-vars
  try {
    return await getWeeklyWorshipOverview()
  } catch (error) {
    console.error('❌ [Schedule Service] Error in getSchedules:', error)
    return []
  }
}

/**
 * Get schedules by category
 * @param {string} category - Category to filter by
 * @param {number} [_days=7] - Number of days to check (unused for now)
 * @returns {Promise<Array>} Filtered schedules
 */
export async function getSchedulesByCategory(category, _days = 7) {  // eslint-disable-line no-unused-vars
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
 * @param {number} [_days=7] - Number of days to look ahead (unused for now)
 * @returns {Promise<Array>} Array schedules
 */
export async function getUpcomingSchedules(_days = 7) {  // eslint-disable-line no-unused-vars
  return await getWeeklyWorshipOverview()
}

// =======================================
// 🎯 ADMIN EXPORTS (untuk admin panel)
// =======================================

// Export admin functions untuk admin panel
export const AdminAPI = {
  // CRUD Operations
  createTemplate: AdminTemplateManager.createTemplate.bind(AdminTemplateManager),
  getAllTemplatesForAdmin: AdminTemplateManager.getAllTemplatesForAdmin.bind(AdminTemplateManager),
  updateTemplate: AdminTemplateManager.updateTemplate.bind(AdminTemplateManager),
  updateWeeklyContent: AdminTemplateManager.updateWeeklyContent.bind(AdminTemplateManager),
  updateTemplateStructure: AdminTemplateManager.updateTemplateStructure.bind(AdminTemplateManager),
  deleteTemplate: AdminTemplateManager.deleteTemplate.bind(AdminTemplateManager),
  duplicateTemplate: AdminTemplateManager.duplicateTemplate.bind(AdminTemplateManager),
  
  // Utility functions
  getTemplate: AdminTemplateManager.getTemplate.bind(AdminTemplateManager),
  validateTemplateData: AdminTemplateManager.validateTemplateData.bind(AdminTemplateManager)
}

// =======================================
// 🎯 INITIALIZATION (untuk setup default templates)
// =======================================

/**
 * 🏗️ Initialize default templates (run once)
 * @returns {Promise<boolean>} Success status
 */
export async function initializeDefaultTemplates() {
  try {
    console.log('🏗️ [Worship Service] Initializing default templates...')
    
    const defaultTemplates = [
      {
        title: 'Doa Membangunkan Fajar',
        description: 'Doa pagi setiap hari',
        dayOfWeek: 'daily',
        defaultTime: '05:00',
        location: 'Gedung Gereja Utama',
        category: 'doa-fajar',
        initialTheme: 'Memulai Hari Bersama Tuhan'
      },
      {
        title: 'Ibadah Minggu Pagi',
        description: 'Ibadah umum hari Minggu',
        dayOfWeek: 0,
        defaultTime: '08:00',
        location: 'Gedung Gereja Utama',
        category: 'ibadah-minggu',
        initialTheme: 'Kasih Tuhan yang Sempurna',
        requireSpeaker: true
      },
      {
        title: 'Pemahaman Alkitab',
        description: 'Pemahaman Alkitab mingguan',
        dayOfWeek: 3,
        defaultTime: '19:00',
        location: 'Ruang Persekutuan',
        category: 'pemahaman-alkitab',
        initialTheme: 'Firman yang Hidup'
      },
      {
        title: 'Doa dan Puasa',
        description: 'Ibadah doa dan puasa bersama',
        dayOfWeek: 5,
        defaultTime: '18:00',
        location: 'Ruang Doa',
        category: 'doa-puasa',
        initialTheme: 'Kuasa Doa dan Puasa'
      },
      {
        title: 'Ibadah PELPRIP',
        description: 'Persekutuan Lanjut Usia Pria',
        dayOfWeek: 6,
        defaultTime: '17:00',
        location: 'Ruang PELPRIP',
        category: 'pelprip',
        initialTheme: 'Kekuatan dalam Persekutuan'
      },
      {
        title: 'Ibadah PELWAP',
        description: 'Persekutuan Lanjut Usia Wanita',
        dayOfWeek: 6,
        defaultTime: '15:00',
        location: 'Ruang PELWAP',
        category: 'pelwap',
        initialTheme: 'Kasih dan Kebijaksanaan'
      }
    ]
    
    for (const templateData of defaultTemplates) {
      const existingTemplate = await AdminTemplateManager.getTemplate(
        TemplateFactory.generateTemplateId(templateData.title)
      )
      
      if (!existingTemplate) {
        await AdminTemplateManager.createTemplate({
          ...templateData,
          adminId: 'system'
        })
        console.log(`✅ Created template: ${templateData.title}`)
      }
    }
    
    console.log('✅ [Worship Service] All default templates initialized!')
    return true
    
  } catch (error) {
    console.error('❌ [Worship Service] Error initializing templates:', error)
    throw error
  }
}