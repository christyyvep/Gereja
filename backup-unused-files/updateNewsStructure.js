// updateNewsStructure.js - FIXED VERSION dengan import yang benar
// Jalankan sekali saja untuk menambah field baru ke semua document existing

// ⭐ FIXED IMPORTS
import { db } from '@/services/firebase'
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc,
  getDoc,      // ⭐ TAMBAH import ini
  deleteField  // ⭐ TAMBAH import ini
} from 'firebase/firestore'

/**
 * Script untuk menambahkan field baru ke semua document di collection news
 * Field yang ditambahkan:
 * - isEvent: boolean
 * - showInAnnouncement: boolean  
 * - priority: number
 * - eventEndDate: string (opsional)
 */
export async function updateAllNewsDocuments() {
  try {
    console.log('🚀 [UpdateScript] Memulai update struktur collection news...')
    
    // 1. Ambil semua documents dari collection news
    const newsRef = collection(db, 'news')
    const querySnapshot = await getDocs(newsRef)
    
    console.log(`📊 [UpdateScript] Ditemukan ${querySnapshot.size} documents`)
    
    let updatedCount = 0
    let errorCount = 0
    
    // 2. Loop setiap document dan update struktur
    for (const docSnapshot of querySnapshot.docs) {
      try {
        const docData = docSnapshot.data()
        const docId = docSnapshot.id
        
        console.log(`📝 [UpdateScript] Memproses document: ${docId}`)
        console.log(`   Title: ${docData.title || 'No title'}`)
        console.log(`   Category: ${docData.category || 'No category'}`)
        
        // 3. Tentukan nilai field baru berdasarkan kategori dan data existing
        const newFields = determineNewFields(docData)
        
        // 4. Update document dengan field baru
        const docRef = doc(db, 'news', docId)
        await updateDoc(docRef, newFields)
        
        console.log(`✅ [UpdateScript] Document ${docId} berhasil diupdate`)
        console.log(`   New fields:`, newFields)
        
        updatedCount++
        
        // Delay kecil untuk avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ [UpdateScript] Error updating document ${docSnapshot.id}:`, error)
        errorCount++
      }
    }
    
    // 5. Summary hasil update
    console.log('\n🎯 [UpdateScript] UPDATE SELESAI!')
    console.log(`✅ Berhasil diupdate: ${updatedCount} documents`)
    console.log(`❌ Gagal diupdate: ${errorCount} documents`)
    console.log(`📊 Total documents: ${querySnapshot.size}`)
    
    return {
      success: true,
      totalDocuments: querySnapshot.size,
      updatedCount,
      errorCount
    }
    
  } catch (error) {
    console.error('❌ [UpdateScript] Error dalam update process:', error)
    throw error
  }
}

/**
 * Fungsi untuk menentukan nilai field baru berdasarkan data existing
 * @param {Object} docData - Data document existing
 * @returns {Object} Field baru yang akan ditambahkan
 */
function determineNewFields(docData) {
  const category = docData.category?.toLowerCase() || ''
  const title = docData.title?.toLowerCase() || ''
  const hasScheduleInfo = docData.hasScheduleInfo || false
  
  // Default values
  let isEvent = false
  let showInAnnouncement = false
  let priority = 3
  let eventEndDate = null
  
  // Logic untuk menentukan isEvent berdasarkan kategori
  const eventCategories = ['event', 'birthday', 'ibadah', 'pelprap', 'pelatar', 'camping', 'retreat']
  const announcementCategories = ['announcement', 'pengumuman', 'info']
  
  if (eventCategories.some(cat => category.includes(cat) || title.includes(cat))) {
    isEvent = true
    showInAnnouncement = true
    priority = 1
  } else if (category.includes('birthday') || title.includes('birthday') || title.includes('ulang tahun')) {
    isEvent = true
    showInAnnouncement = true
    priority = 1
  } else if (hasScheduleInfo === true) {
    isEvent = true
    showInAnnouncement = true
    priority = 1
  } else if (announcementCategories.some(cat => category.includes(cat))) {
    isEvent = false
    showInAnnouncement = false
    priority = 2
  }
  
  // Untuk event multi-hari, coba deteksi dari content atau title
  if (isEvent && (title.includes('camp') || title.includes('retreat') || title.includes('perkemahan'))) {
    // Untuk event perkemahan, biasanya 2-3 hari
    if (docData.date) {
      const startDate = new Date(docData.date)
      startDate.setDate(startDate.getDate() + 2) // Tambah 2 hari
      eventEndDate = startDate.toISOString().split('T')[0]
    }
  }
  
  // Build object field baru
  const newFields = {
    isEvent,
    showInAnnouncement,
    priority,
    updatedAt: new Date(),
    updatedBy: 'AutoUpdateScript'
  }
  
  // Tambah eventEndDate jika ada
  if (eventEndDate) {
    newFields.eventEndDate = eventEndDate
  }
  
  return newFields
}

/**
 * Helper function untuk testing - update satu document saja
 * @param {string} docId - ID document yang mau ditest
 */
export async function updateSingleNewsDocument(docId) {
  try {
    console.log(`🧪 [TestUpdate] Testing update untuk document: ${docId}`)
    
    const docRef = doc(db, 'news', docId)
    const docSnapshot = await getDoc(docRef)  // ⭐ FIXED - sekarang getDoc sudah di-import
    
    if (!docSnapshot.exists()) {
      throw new Error(`Document ${docId} tidak ditemukan`)
    }
    
    const docData = docSnapshot.data()
    const newFields = determineNewFields(docData)
    
    await updateDoc(docRef, newFields)
    
    console.log(`✅ [TestUpdate] Document ${docId} berhasil diupdate`)
    console.log('   New fields:', newFields)
    
    return newFields
    
  } catch (error) {
    console.error(`❌ [TestUpdate] Error:`, error)
    throw error
  }
}

/**
 * Fungsi untuk rollback - hapus field yang ditambahkan (jika diperlukan)
 */
export async function rollbackNewsStructure() {
  try {
    console.log('🔄 [Rollback] Menghapus field baru dari semua documents...')
    
    const newsRef = collection(db, 'news')
    const querySnapshot = await getDocs(newsRef)
    
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(db, 'news', docSnapshot.id)
      
      // ⭐ FIXED - Hapus field yang ditambahkan
      await updateDoc(docRef, {
        isEvent: deleteField(),          // ⭐ FIXED - deleteField sudah di-import
        showInAnnouncement: deleteField(),
        priority: deleteField(),
        eventEndDate: deleteField(),
        updatedBy: deleteField()
      })
      
      console.log(`🗑️ [Rollback] Document ${docSnapshot.id} field dihapus`)
    }
    
    console.log('✅ [Rollback] Rollback selesai!')
    
  } catch (error) {
    console.error('❌ [Rollback] Error:', error)
    throw error
  }
}

// Export untuk digunakan di component Vue
export default {
  updateAllNewsDocuments,
  updateSingleNewsDocument,
  rollbackNewsStructure
}