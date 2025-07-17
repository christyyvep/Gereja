// Script untuk menambahkan test news dengan thumbnails yang benar
// Untuk testing thumbnail card-mobile vs card-desktop

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore')

// Firebase config yang benar untuk MyRajawali
const firebaseConfig = {
  apiKey: "AIzaSyCfKagSo6AUtJ1GQqw0iBdMBeDpOpAuHUE",
  authDomain: "myrajawali-48c2e.firebaseapp.com",
  databaseURL: "https://myrajawali-48c2e-default-rtdb.firebaseio.com",
  projectId: "myrajawali-48c2e",
  storageBucket: "myrajawali-48c2e.appspot.com",
  messagingSenderId: "798990052580",
  appId: "1:798990052580:web:61b33de5c5f7c7c39e0825"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createTestNewsWithThumbnails() {
  try {
    console.log('🎯 Creating test news with proper thumbnails...')
    
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Today:', today)
    
    // Test news dengan thumbnails yang BERBEDA untuk mobile dan desktop
    const testNewsData = [
      {
        title: "TEST APING",
        content: "TEST APINGGGGG",
        summary: "Test news untuk memverifikasi thumbnail berbeda antara mobile dan desktop",
        category: "pengumuman",
        author: "Test Admin",
        
        // Tanggal
        date: today,
        publishDate: today,
        eventDate: today,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Status
        isPublished: true,
        status: "published",
        
        // 🎯 THUMBNAILS YANG BERBEDA - INI YANG PENTING!
        thumbnails: {
          // Untuk mobile (80x80) - gunakan ID yang berbeda
          "card-mobile": "cardMobile1",
          
          // Untuk desktop (1200x675) - gunakan ID yang berbeda 
          "card-desktop": "cardDesktop1",
          
          // Untuk detail pages
          "detail-mobile": "detailMobile1",
          "detail-desktop": "detailDesktop1"
        },
        
        // Untuk backward compatibility
        images: {
          "card-mobile": "cardMobile1",
          "card-desktop": "cardDesktop1",
          "detail-mobile": "detailMobile1", 
          "detail-desktop": "detailDesktop1"
        },
        
        // Legacy thumbnail (fallback)
        thumbnail: "legacyThumbnail1"
      },
      
      {
        title: "Ibadah Raya Minggu Ini",
        content: "Mengundang seluruh jemaat untuk hadir dalam ibadah raya yang penuh berkat.",
        summary: "Ibadah raya untuk seluruh jemaat dengan pujian dan penyembahan yang luar biasa",
        category: "ibadah",
        author: "Admin Gereja",
        
        date: today,
        publishDate: today,
        eventDate: today,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        isPublished: true,
        status: "published",
        
        // 🎯 THUMBNAILS YANG BERBEDA #2
        thumbnails: {
          "card-mobile": "cardMobile2",
          "card-desktop": "cardDesktop2", 
          "detail-mobile": "detailMobile2",
          "detail-desktop": "detailDesktop2"
        },
        
        images: {
          "card-mobile": "cardMobile2",
          "card-desktop": "cardDesktop2",
          "detail-mobile": "detailMobile2",
          "detail-desktop": "detailDesktop2"
        },
        
        thumbnail: "legacyThumbnail2"
      }
    ]
    
    // Tambahkan data ke Firebase
    for (let i = 0; i < testNewsData.length; i++) {
      const newsData = testNewsData[i]
      console.log(`📰 Adding news: ${newsData.title}`)
      
      const docRef = await addDoc(collection(db, 'news'), newsData)
      console.log(`✅ News added with ID: ${docRef.id}`)
      
      // Log thumbnails untuk verification
      console.log(`📱 Mobile thumbnail: ${newsData.thumbnails['card-mobile']}`)
      console.log(`🖥️ Desktop thumbnail: ${newsData.thumbnails['card-desktop']}`)
    }
    
    console.log('\n🎉 All test news created successfully!')
    console.log('📋 Summary:')
    console.log('- Mobile thumbnails: cardMobile1, cardMobile2')
    console.log('- Desktop thumbnails: cardDesktop1, cardDesktop2')
    console.log('- These should generate DIFFERENT Cloudinary URLs!')
    
  } catch (error) {
    console.error('❌ Error creating test news:', error)
  }
}

// Run the function
createTestNewsWithThumbnails()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
