// Test script untuk menguji jemaatService.js
// Jalankan di browser console setelah login sebagai admin

import { 
  getAllJemaat, 
  getJemaatStatistics, 
  addJemaat, 
  updateJemaat, 
  deleteJemaat,
  searchJemaat 
} from './src/services/jemaatService.js'

// Test data untuk menambah jemaat baru
const testJemaatData = [
  {
    nama: 'John Doe',
    jenisKelamin: 'Laki-laki',
    tanggalLahir: '1990-05-15',
    status: 'Menikah',
    sektor: 'Sektor 1',
    noTelp: '081234567890',
    email: 'john.doe@example.com',
    password: 'password123'
  },
  {
    nama: 'Jane Smith',
    jenisKelamin: 'Perempuan',
    tanggalLahir: '1985-08-20',
    status: 'Belum Menikah',
    sektor: 'Sektor 2',
    noTelp: '081234567891',
    email: 'jane.smith@example.com'
    // Tidak ada password = belum registrasi
  },
  {
    nama: 'Robert Johnson',
    jenisKelamin: 'Laki-laki',
    tanggalLahir: '1978-12-10',
    status: 'Menikah',
    sektor: 'Sektor 3',
    noTelp: '081234567892',
    email: 'robert.johnson@example.com',
    password: 'mypassword'
  }
]

// Fungsi test utama
async function testJemaatService() {
  console.log('🧪 Testing JemaatService...')
  
  try {
    // 1. Test statistik awal
    console.log('\n📊 Testing getJemaatStatistics...')
    const initialStats = await getJemaatStatistics()
    console.log('Initial statistics:', initialStats)
    
    // 2. Test get all jemaat
    console.log('\n👥 Testing getAllJemaat...')
    const allJemaat = await getAllJemaat()
    console.log(`Found ${allJemaat.length} jemaat members`)
    
    // 3. Test tambah jemaat baru
    console.log('\n➕ Testing addJemaat...')
    const addedIds = []
    
    for (const jemaatData of testJemaatData) {
      try {
        const newId = await addJemaat(jemaatData)
        addedIds.push(newId)
        console.log(`✅ Added ${jemaatData.nama} with ID: ${newId}`)
      } catch (error) {
        console.log(`❌ Failed to add ${jemaatData.nama}:`, error.message)
      }
    }
    
    // 4. Test statistik setelah tambah data
    console.log('\n📊 Testing statistics after adding data...')
    const newStats = await getJemaatStatistics()
    console.log('New statistics:', newStats)
    console.log(`Added ${newStats.totalJemaat - initialStats.totalJemaat} new members`)
    
    // 5. Test pencarian
    console.log('\n🔍 Testing searchJemaat...')
    const searchResults = await searchJemaat('John')
    console.log(`Search for "John" found ${searchResults.length} results:`)
    searchResults.forEach(result => {
      console.log(`- ${result.nama} (${result.jenisKelamin})`)
    })
    
    // 6. Test update jemaat (update yang pertama ditambah)
    if (addedIds.length > 0) {
      console.log('\n✏️ Testing updateJemaat...')
      const updateData = {
        noTelp: '081999888777',
        email: 'john.doe.updated@example.com'
      }
      
      await updateJemaat(addedIds[0], updateData)
      console.log(`✅ Updated jemaat with ID: ${addedIds[0]}`)
    }
    
    // 7. Test get all jemaat setelah update
    console.log('\n👥 Testing getAllJemaat after update...')
    const updatedJemaat = await getAllJemaat()
    const updatedMember = updatedJemaat.find(j => j.id === addedIds[0])
    if (updatedMember) {
      console.log('Updated member data:')
      console.log(`- Phone: ${updatedMember.noTelp}`)
      console.log(`- Email: ${updatedMember.email}`)
    }
    
    console.log('\n✅ All tests completed successfully!')
    
    // Return IDs untuk cleanup jika diperlukan
    return {
      addedIds,
      initialStats,
      newStats
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Fungsi untuk cleanup test data
async function cleanupTestData(addedIds = []) {
  console.log('\n🧹 Cleaning up test data...')
  
  for (const id of addedIds) {
    try {
      await deleteJemaat(id)
      console.log(`✅ Deleted jemaat with ID: ${id}`)
    } catch (error) {
      console.log(`❌ Failed to delete ID ${id}:`, error.message)
    }
  }
  
  console.log('✅ Cleanup completed!')
}

// Export untuk digunakan di console
window.testJemaatService = testJemaatService
window.cleanupTestData = cleanupTestData

console.log(`
🧪 JemaatService Test Script Loaded!

Available functions:
- testJemaatService() - Run all tests
- cleanupTestData(ids) - Clean up test data

Example usage:
const result = await testJemaatService()
// Run tests and see results
await cleanupTestData(result.addedIds)
// Clean up when done
`)

// Auto-run test jika diperlukan (uncomment line berikut)
// testJemaatService().then(result => {
//   console.log('Test completed with result:', result)
// })
