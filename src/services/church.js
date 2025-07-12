// src/services/churchService.js - ESLINT FIXED
import { db } from './firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  // updateDoc, // ⭐ REMOVED: tidak dipakai untuk sekarang
  serverTimestamp 
} from 'firebase/firestore'

const CHURCH_DOC_ID = 'gereja-rajawali-info'
const COLLECTION_NAME = 'church_info'

/**
 * Mendapatkan informasi gereja dari Firebase
 * @returns {Promise<Object>} Data informasi gereja
 */
export async function getChurchInformation() {
  try {
    console.log('🔍 [ChurchService] Fetching church information...')
    
    const churchRef = doc(db, COLLECTION_NAME, CHURCH_DOC_ID)
    const churchSnap = await getDoc(churchRef)
    
    if (churchSnap.exists()) {
      const data = churchSnap.data()
      console.log('✅ [ChurchService] Church info loaded from Firebase')
      return data
    } else {
      console.log('📝 [ChurchService] No church info found, returning default data')
      return getDefaultChurchInfo()
    }
    
  } catch (error) {
    console.error('❌ [ChurchService] Error getting church info:', error)
    
    // Return default data jika ada error
    console.log('🔄 [ChurchService] Returning default data due to error')
    return getDefaultChurchInfo()
  }
}

/**
 * Update informasi gereja (untuk admin)
 * @param {Object} churchData - Data gereja yang akan diupdate
 * @param {string} updatedBy - Siapa yang mengupdate (admin ID)
 * @returns {Promise<boolean>} Success status
 */
export async function updateChurchInformation(churchData, updatedBy = 'admin') {
  try {
    console.log('🔄 [ChurchService] Updating church information...')
    
    // Validasi data
    const validatedData = validateChurchData(churchData)
    
    const churchRef = doc(db, COLLECTION_NAME, CHURCH_DOC_ID)
    
    // Data yang akan disimpan
    const updateData = {
      ...validatedData,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: updatedBy,
      version: new Date().getTime() // Version untuk tracking changes
    }
    
    await setDoc(churchRef, updateData, { merge: true })
    
    console.log('✅ [ChurchService] Church info updated successfully')
    return true
    
  } catch (error) {
    console.error('❌ [ChurchService] Error updating church info:', error)
    throw error
  }
}

/**
 * Initialize church info dengan data default (untuk setup awal)
 * @returns {Promise<boolean>} Success status
 */
export async function initializeChurchInformation() {
  try {
    console.log('🚀 [ChurchService] Initializing church information...')
    
    const churchRef = doc(db, COLLECTION_NAME, CHURCH_DOC_ID)
    const churchSnap = await getDoc(churchRef)
    
    // Hanya initialize jika belum ada data
    if (!churchSnap.exists()) {
      const defaultData = {
        ...getDefaultChurchInfo(),
        createdAt: serverTimestamp(),
        createdBy: 'system',
        version: 1
      }
      
      await setDoc(churchRef, defaultData)
      console.log('✅ [ChurchService] Church info initialized with default data')
      return true
    } else {
      console.log('ℹ️ [ChurchService] Church info already exists, skipping initialization')
      return false
    }
    
  } catch (error) {
    console.error('❌ [ChurchService] Error initializing church info:', error)
    throw error
  }
}

/**
 * Get history perubahan informasi gereja (untuk admin)
 * TEMPORARILY DISABLED FOR DEVELOPMENT
 * @returns {Promise<Array>} Array history changes
 */
/*
export async function getChurchInfoHistory() {
  try {
    // TODO: Implementasi history tracking
    // Untuk sekarang return empty array
    console.log('📊 [ChurchService] Getting church info history...')
    return []
    
  } catch (error) {
    console.error('❌ [ChurchService] Error getting church history:', error)
    throw error
  }
}
*/

// ===== HELPER FUNCTIONS =====

/**
 * Mendapatkan data default gereja
 * @returns {Object} Default church data
 */
function getDefaultChurchInfo() {
  return {
    // Basic Info
    namaGereja: 'Gereja Rajawali',
    subtitle: 'Melayani dengan Kasih Kristus',
    
    // Sejarah
    sejarah: 'Gereja Rajawali didirikan dengan visi untuk menyebarkan kasih Kristus kepada seluruh jemaat dan masyarakat sekitar. Sejak awal berdiri, gereja ini telah menjadi rumah spiritual bagi banyak keluarga di wilayah Manado dan sekitarnya.',
    tahunBerdiri: '1995',
    
    // Visi & Misi
    visi: 'Menjadi gereja yang bertumbuh dalam kasih Kristus dan melayani dengan sukacita di tengah masyarakat.',
    misi: [
      'Memberitakan Injil kepada semua orang',
      'Membangun persekutuan yang kuat antar jemaat',
      'Melayani masyarakat dengan kasih Kristus',
      'Mendidik generasi muda dalam iman'
    ],
    
    // Kontak
    alamat: 'Jl. Sam Ratulangi No. 123, Wenang, Manado, Sulawesi Utara',
    telepon: '(0431) 123-4567',
    email: 'info@gerejarajawali.org',
    website: 'https://gerejarajawali.org',
    
    // Jadwal
    jadwalMinggu: '08:00 & 17:00 WITA',
    jadwalPelprap: '19:00 WITA',
    
    // Fasilitas
    fasilitas: [
      { nama: 'Ruang Ibadah Utama', icon: '⛪', deskripsi: 'Kapasitas 200 orang' },
      { nama: 'Ruang Anak', icon: '🧸', deskripsi: 'Untuk pelayanan anak' },
      { nama: 'Ruang Remaja', icon: '🎵', deskripsi: 'Untuk persekutuan remaja' },
      { nama: 'Dapur', icon: '🍽️', deskripsi: 'Untuk acara fellowship' },
      { nama: 'Parkir', icon: '🚗', deskripsi: 'Parkir mobil dan motor' },
      { nama: 'Sound System', icon: '🎤', deskripsi: 'Sistem audio modern' }
    ],
    
    // Struktur Organisasi
    strukturPengurus: [
      { nama: 'Pdt. John Doe', jabatan: 'Pendeta', kontak: 'john@gerejarajawali.org' },
      { nama: 'Jane Smith', jabatan: 'Ketua Majelis', kontak: 'jane@gerejarajawali.org' },
      { nama: 'Bob Wilson', jabatan: 'Sekretaris', kontak: 'bob@gerejarajawali.org' },
      { nama: 'Mary Johnson', jabatan: 'Bendahara', kontak: 'mary@gerejarajawali.org' },
      { nama: 'David Lee', jabatan: 'Koordinator Ibadah', kontak: 'david@gerejarajawali.org' },
      { nama: 'Sarah Brown', jabatan: 'Koordinator Anak', kontak: 'sarah@gerejarajawali.org' }
    ],
    
    // Media
    fotoGereja: 'gereja-utama.jpg',
    logoGereja: 'logo-gereja.png',
    
    // Social Media
    socialMedia: {
      facebook: '',
      instagram: '',
      youtube: '',
      whatsapp: ''
    }
  }
}

/**
 * Validasi data gereja sebelum disimpan
 * @param {Object} data - Data yang akan divalidasi
 * @returns {Object} Clean validated data
 */
function validateChurchData(data) {
  const validated = {}
  
  // Required fields
  const requiredFields = ['namaGereja', 'alamat', 'telepon']
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      throw new Error(`Field ${field} wajib diisi`)
    }
    validated[field] = data[field].trim()
  }
  
  // Optional text fields
  const textFields = ['subtitle', 'sejarah', 'visi', 'email', 'website', 'jadwalMinggu', 'jadwalPelprap']
  textFields.forEach(field => {
    if (data[field]) {
      validated[field] = data[field].trim()
    }
  })
  
  // Tahun berdiri validation
  if (data.tahunBerdiri) {
    const year = parseInt(data.tahunBerdiri)
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
      throw new Error('Tahun berdiri tidak valid')
    }
    validated.tahunBerdiri = data.tahunBerdiri
  }
  
  // Array fields
  if (data.misi && Array.isArray(data.misi)) {
    validated.misi = data.misi.filter(item => item && item.trim() !== '')
  }
  
  if (data.fasilitas && Array.isArray(data.fasilitas)) {
    validated.fasilitas = data.fasilitas.filter(item => item && item.nama)
  }
  
  if (data.strukturPengurus && Array.isArray(data.strukturPengurus)) {
    validated.strukturPengurus = data.strukturPengurus.filter(item => item && item.nama && item.jabatan)
  }
  
  // Social media
  if (data.socialMedia && typeof data.socialMedia === 'object') {
    validated.socialMedia = data.socialMedia
  }
  
  return validated
}

/**
 * Helper function untuk admin: Check apakah user bisa edit church info
 * TEMPORARILY DISABLED FOR DEVELOPMENT
 * @returns {boolean} Apakah user bisa edit
 */
/*
export function canEditChurchInfo() {
  // TODO: Implementasi permission check
  // Untuk sekarang, hanya admin yang bisa edit
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'admin'
}
*/

/**
 * Helper function: Get church data untuk display di UI
 * @returns {Promise<Object>} Formatted church data for UI
 */
export async function getChurchDisplayData() {
  try {
    const rawData = await getChurchInformation()
    
    // Transform data untuk UI components
    return {
      ...rawData,
      // Transform fasilitas untuk FeatureGrid
      facilitiesList: rawData.fasilitas?.map(f => ({
        name: f.nama,
        icon: f.icon,
        description: f.deskripsi
      })) || [],
      
      // Transform pengurus untuk FeatureGrid
      leadershipList: rawData.strukturPengurus?.map(p => ({
        name: p.nama,
        position: p.jabatan,
        contact: p.kontak
      })) || []
    }
    
  } catch (error) {
    console.error('❌ [ChurchService] Error getting display data:', error)
    throw error
  }
}