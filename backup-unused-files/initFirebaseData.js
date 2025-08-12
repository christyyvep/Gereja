// utils/initFirebaseData.js - Script untuk initialize data worship schedules
import { initializeDefaultWorshipTemplates } from '@/services/schedules'

/**
 * 🚀 Initialize all Firebase data untuk worship schedules
 * Panggil function ini sekali aja untuk setup data
 */
export async function initializeWorshipData() {
  try {
    console.log('🚀 [Init] Starting Firebase data initialization...')
    
    // Create worship templates
    await initializeDefaultWorshipTemplates()
    
    console.log('✅ [Init] Firebase worship data initialized successfully!')
    
    // Return summary
    return {
      success: true,
      message: 'Data worship schedules berhasil dibuat di Firebase',
      templatesCreated: 10  // Update jadi 10 karena ada PELPRIP dan PELWAP
    }
    
  } catch (error) {
    console.error('❌ [Init] Error initializing Firebase data:', error)
    return {
      success: false,
      message: 'Gagal membuat data: ' + error.message,
      error: error
    }
  }
}

/**
 * 🧪 Test function untuk cek apakah data sudah ada
 */
export async function checkWorshipDataExists() {
  try {
    const { getWorshipTemplates } = await import('@/services/schedules')
    const templates = await getWorshipTemplates()
    
    return {
      exists: templates.length > 0,
      count: templates.length,
      templates: templates.map(t => ({
        id: t.id,
        title: t.title,
        day: getDayName(t.dayOfWeek),
        time: t.time
      }))
    }
  } catch (error) {
    console.error('❌ [Check] Error checking data:', error)
    return {
      exists: false,
      count: 0,
      error: error.message
    }
  }
}

/**
 * 📅 Helper function untuk convert dayOfWeek ke nama hari
 */
function getDayName(dayOfWeek) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return dayOfWeek === 'daily' ? 'Setiap Hari' : days[dayOfWeek] || 'Unknown'
}