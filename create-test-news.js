// Script untuk menambahkan test news dengan tanggal hari ini
// Sehingga announcements akan muncul di homepage

// Menggunakan Firebase Web SDK
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore')

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDxzjj7aAp_dKs0YEOhcKpJcpZmI0mXw7Y",
  authDomain: "rajawali-gpdi-kanonang.firebaseapp.com",
  databaseURL: "https://rajawali-gpdi-kanonang-default-rtdb.firebaseio.com",
  projectId: "rajawali-gpdi-kanonang",
  storageBucket: "rajawali-gpdi-kanonang.appspot.com",
  messagingSenderId: "501326056906",
  appId: "1:501326056906:web:d07d40fb45b96cf99f2b7b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createTestNews() {
  try {
    console.log('🎯 Creating test news for today...')
    
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Today:', today)
    
    // Test news dengan kegiatan hari ini
    const testNews = {
      title: "Ibadah Raya Hari Ini",
      content: "Mengundang seluruh jemaat untuk hadir dalam ibadah raya yang akan berlangsung hari ini. Mari bersama-sama memuji dan menyembah Tuhan.",
      summary: "Ibadah raya untuk seluruh jemaat",
      category: "ibadah",
      author: "Test Admin",
      
      // ✅ Field tanggal yang akan dicheck oleh announcement service
      date: today,           // Primary date field
      eventDate: today,      // Event date field
      activityDate: today,   // Activity date field
      
      // Additional info
      time: "19:00",
      location: "Gereja GPdI Rajawali Kanonang",
      
      // Publishing status
      isPublished: true,
      
      // Timestamps
      createdAt: new Date(),
      createdBy: "test-admin",
      
      // Optional fields
      attachLinks: [],
      priority: 1
    }
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'news'), testNews)
    console.log('✅ Test news created with ID:', docRef.id)
    
    console.log('🎯 Test data created successfully!')
    console.log('📱 Now check homepage - announcement should appear!')
    
  } catch (error) {
    console.error('❌ Error creating test news:', error)
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied. This is expected if you\'re not authenticated.')
      console.log('💡 Alternative solutions:')
      console.log('   1. Use the admin panel in the app to create news with today\'s date')
      console.log('   2. The fallback logic should now show recent published news')
      console.log('   3. Check browser console for debug info')
    }
  }
}

// Run the script
createTestNews()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
