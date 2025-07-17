// Firebase News Data Checker
// Run this in browser console to check actual news data

(async function checkFirebaseNewsData() {
  console.log('🔍 Checking Firebase News Data...')
  
  try {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js')
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js')
    
    // Firebase config (use your actual config)
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
    
    // Get news data
    console.log('📡 Fetching news from Firebase...')
    const newsRef = collection(db, 'news')
    const snapshot = await getDocs(newsRef)
    
    console.log(`📊 Found ${snapshot.size} news items`)
    
    snapshot.forEach((doc, index) => {
      const data = doc.data()
      console.log(`\n📰 News #${index + 1}: ${data.title}`)
      console.log('  ID:', doc.id)
      console.log('  Thumbnails:', data.thumbnails || 'NONE')
      console.log('  Images:', data.images || 'NONE')  
      console.log('  Legacy thumbnail:', data.thumbnail || 'NONE')
      
      // Check specific thumbnail sizes
      if (data.thumbnails) {
        console.log('  📱 card-mobile:', data.thumbnails['card-mobile'] || 'MISSING')
        console.log('  🖥️ card-desktop:', data.thumbnails['card-desktop'] || 'MISSING')
        console.log('  📱 detail-mobile:', data.thumbnails['detail-mobile'] || 'MISSING')
        console.log('  🖥️ detail-desktop:', data.thumbnails['detail-desktop'] || 'MISSING')
      }
    })
    
    console.log('\n✅ Firebase data check complete!')
    
  } catch (error) {
    console.error('❌ Error checking Firebase data:', error)
  }
})()
