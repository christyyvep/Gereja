// utils/initAltarServantsData.js - Script untuk inisialisasi data jadwal pelayan altar

import { createAltarServantsSchedule } from '@/services/altarServantsSchedules'

/**
 * Data dummy untuk testing jadwal pelayan altar
 */
const dummySchedules = [
  {
    jenisIbadah: 'ibadah-minggu',
    tanggal: '2025-07-13', // Minggu depan
    pengkhotbah: 'Pdt. Fanny Potabuga',
    worshipLeader: 'Sarah Kumontoy',
    singers: 'Tim Vocal Utama',
    music: 'John Runtu (Piano), David Pesoth (Guitar)',
    tambourine: 'Maria Gerungan',
    banners: 'Tim Bendera Muda',
    multimedia: 'Alex Manoppo',
    adminId: 'admin_dummy'
  },
  {
    jenisIbadah: 'doa-fajar',
    tanggal: '2025-07-14', // Senin
    pengkhotbah: 'Pdt. Meity Gerungan Pesoth',
    worshipLeader: 'Daniel Kumontoy',
    singers: 'Grace Manoppo',
    music: 'Piano: Samuel Runtu',
    tambourine: 'Esther Pesoth',
    banners: '',
    multimedia: 'Michael Gerungan',
    adminId: 'admin_dummy'
  },
  {
    jenisIbadah: 'pemahaman-alkitab',
    tanggal: '2025-07-16', // Rabu
    pengkhotbah: 'Pdt. Fanny Potabuga',
    worshipLeader: 'Ruth Kumontoy',
    singers: 'Vocal PA',
    music: 'Keyboard: Joy Pesoth',
    tambourine: 'Helen Manoppo',
    banners: 'Tim Bendera PA',
    multimedia: 'Steven Runtu',
    adminId: 'admin_dummy'
  },
  {
    jenisIbadah: 'doa-puasa',
    tanggal: '2025-07-18', // Jumat
    pengkhotbah: 'Pdt. Meity Gerungan Pesoth',
    worshipLeader: 'Joshua Kumontoy',
    singers: 'Tim Puasa',
    music: 'Guitar: Mark Pesoth',
    tambourine: 'Rebecca Manoppo',
    banners: '',
    multimedia: 'Andrew Gerungan',
    adminId: 'admin_dummy'
  },
  {
    jenisIbadah: 'ibadah-minggu',
    tanggal: '2025-07-20', // Minggu depan
    pengkhotbah: 'Pdt. Fanny Potabuga',
    worshipLeader: 'Timothy Runtu',
    singers: 'Tim Vocal Muda',
    music: 'Piano: Lisa Kumontoy, Drum: Peter Pesoth',
    tambourine: 'Hannah Gerungan',
    banners: 'Tim Bendera Senior',
    multimedia: 'Jonathan Manoppo',
    adminId: 'admin_dummy'
  }
]

/**
 * Inisialisasi data jadwal pelayan altar ke Firebase
 * Function ini akan membuat data dummy untuk testing
 */
export async function initializeAltarServantsData() {
  try {
    console.log('🔄 [InitAltarServants] Memulai inisialisasi data jadwal pelayan altar...')
    
    let successCount = 0
    let errorCount = 0
    
    for (const scheduleData of dummySchedules) {
      try {
        console.log(`📝 [InitAltarServants] Membuat jadwal: ${scheduleData.jenisIbadah} - ${scheduleData.tanggal}`)
        
        await createAltarServantsSchedule(scheduleData)
        successCount++
        
        console.log(`✅ [InitAltarServants] Berhasil membuat jadwal: ${scheduleData.jenisIbadah}`)
        
      } catch (error) {
        console.error(`❌ [InitAltarServants] Gagal membuat jadwal ${scheduleData.jenisIbadah}:`, error)
        errorCount++
      }
    }
    
    console.log(`🎉 [InitAltarServants] Inisialisasi selesai!`)
    console.log(`✅ Berhasil: ${successCount} jadwal`)
    console.log(`❌ Gagal: ${errorCount} jadwal`)
    
    return {
      success: true,
      created: successCount,
      failed: errorCount,
      total: dummySchedules.length
    }
    
  } catch (error) {
    console.error('❌ [InitAltarServants] Error dalam inisialisasi data:', error)
    throw error
  }
}

/**
 * Helper function untuk clear semua data (untuk development/testing)
 * WARNING: Function ini akan menghapus semua data jadwal pelayan altar!
 */
export async function clearAllAltarServantsData() {
  try {
    console.log('⚠️ [InitAltarServants] PERHATIAN: Menghapus semua data jadwal pelayan altar...')
    
    // Import functions yang diperlukan
    const { getAltarServantsSchedules, deleteAltarServantsSchedule } = await import('@/services/altarServantsSchedules')
    
    // Get semua schedules
    const schedules = await getAltarServantsSchedules()
    
    console.log(`🗑️ [InitAltarServants] Menghapus ${schedules.length} jadwal...`)
    
    let deletedCount = 0
    
    for (const schedule of schedules) {
      try {
        await deleteAltarServantsSchedule(schedule.id)
        deletedCount++
        console.log(`🗑️ [InitAltarServants] Dihapus: ${schedule.categoryLabel}`)
      } catch (error) {
        console.error(`❌ [InitAltarServants] Gagal menghapus ${schedule.id}:`, error)
      }
    }
    
    console.log(`🎯 [InitAltarServants] Selesai menghapus ${deletedCount} jadwal`)
    
    return {
      success: true,
      deleted: deletedCount,
      total: schedules.length
    }
    
  } catch (error) {
    console.error('❌ [InitAltarServants] Error dalam menghapus data:', error)
    throw error
  }
}

/**
 * Function untuk development - reset data (hapus semua lalu buat ulang)
 */
export async function resetAltarServantsData() {
  try {
    console.log('🔄 [InitAltarServants] Memulai reset data...')
    
    // Hapus semua data lama
    await clearAllAltarServantsData()
    
    // Wait sebentar sebelum membuat data baru
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Buat data baru
    const result = await initializeAltarServantsData()
    
    console.log('🎉 [InitAltarServants] Reset data selesai!')
    
    return result
    
  } catch (error) {
    console.error('❌ [InitAltarServants] Error dalam reset data:', error)
    throw error
  }
}

// Export functions
export default {
  initializeAltarServantsData,
  clearAllAltarServantsData,
  resetAltarServantsData
}
