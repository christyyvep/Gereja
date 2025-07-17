// Test script untuk mengecek announcements dan news di Firebase
// Check apakah ada news dengan tanggal hari ini yang seharusnya muncul di homepage

// Menggunakan Firebase Web SDK karena service account tidak tersedia
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore')

// Firebase config (from your app)
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

async function testTodayAnnouncements() {
  try {
    console.log('🔍 Testing today\'s announcements...\n')
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    console.log(`📅 Today: ${today}\n`)
    
    // 1. Check schedules for today
    console.log('📅 CHECKING SCHEDULES FOR TODAY:')
    const schedulesRef = collection(db, 'schedules')
    const schedulesSnapshot = await getDocs(query(schedulesRef, where('date', '==', today)))
    
    console.log(`Found ${schedulesSnapshot.size} schedules for today:`)
    schedulesSnapshot.forEach((doc) => {
      const schedule = doc.data()
      console.log(`  ✅ ${schedule.title} - ${schedule.date} ${schedule.time || ''}`)
    })
    console.log('')
    
    // 2. Check news with today's date (various date fields)
    console.log('📰 CHECKING NEWS FOR TODAY:')
    const newsRef = collection(db, 'news')
    
    // Check different date fields
    const dateFields = ['date', 'eventDate', 'activityDate', 'scheduleDate', 'publishDate']
    let totalNewsToday = 0
    const allTodayNews = new Set()
    
    for (const field of dateFields) {
      try {
        const snapshot = await getDocs(query(newsRef, where(field, '==', today)))
        console.log(`  Field "${field}": ${snapshot.size} news items`)
        
        snapshot.forEach((doc) => {
          const news = { id: doc.id, ...doc.data() }
          allTodayNews.add(JSON.stringify(news))
          console.log(`    ✅ ${news.title} (${field}: ${news[field]}, published: ${news.isPublished})`)
        })
        
        totalNewsToday += snapshot.size
      } catch (error) {
        console.log(`    ⚠️ Field "${field}" query failed: ${error.message}`)
      }
    }
    
    console.log(`\nTotal unique news for today: ${allTodayNews.size}`)
    console.log('')
    
    // 3. Check all published news (regardless of date)
    console.log('📰 ALL PUBLISHED NEWS:')
    const allNewsSnapshot = await getDocs(query(newsRef, where('isPublished', '==', true)))
    console.log(`Found ${allNewsSnapshot.size} published news items:`)
    
    allNewsSnapshot.forEach((doc) => {
      const news = doc.data()
      const relevantDate = news.date || news.eventDate || news.activityDate || news.scheduleDate || news.publishDate
      console.log(`  📰 ${news.title}`)
      console.log(`      Date: ${relevantDate} | Published: ${news.isPublished}`)
      console.log(`      Category: ${news.category || 'no category'}`)
      
      if (relevantDate === today) {
        console.log(`      🎯 THIS SHOULD APPEAR ON HOMEPAGE!`)
      }
      console.log('')
    })
    
    // 4. Summary
    console.log('📊 SUMMARY:')
    console.log(`  - Schedules today: ${schedulesSnapshot.size}`)
    console.log(`  - News with activities today: ${allTodayNews.size}`)
    console.log(`  - Total published news: ${allNewsSnapshot.size}`)
    
    if (schedulesSnapshot.size === 0 && allTodayNews.size === 0) {
      console.log(`\n❌ NO ACTIVITIES FOUND FOR TODAY (${today})`)
      console.log('This is why no announcements appear on homepage.')
      console.log('To test with announcements:')
      console.log('1. Create a news item with today\'s date in any date field')
      console.log('2. Set isPublished: true')
      console.log('3. Or create a schedule with today\'s date')
    } else {
      console.log(`\n✅ Found ${schedulesSnapshot.size + allTodayNews.size} activities for today`)
      console.log('These should appear on homepage as announcements.')
    }
    
  } catch (error) {
    console.error('❌ Error testing announcements:', error)
  }
}

// Run the test
testTodayAnnouncements()
  .then(() => {
    console.log('\n✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
