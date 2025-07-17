// Simple test for restored functionality
console.log('🧪 Testing Restored Functions...')

// Test daily verse functions
try {
  const verseUrl = getDailyVerseUrl()
  console.log('✅ getDailyVerseUrl:', verseUrl)
} catch (error) {
  console.log('❌ getDailyVerseUrl error:', error.message)
}

try {
  const verseNumber = getTodaysDailyVerseNumber()
  console.log('✅ getTodaysDailyVerseNumber:', verseNumber)
} catch (error) {
  console.log('❌ getTodaysDailyVerseNumber error:', error.message)
}

// Test news thumbnail (should use cardDesktop for all cases now)
const mockNews = {
  title: "TEST APING",
  thumbnails: {
    cardDesktop: "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684262/myrajawali/thumbnails/news/cardDesktop/20211006_075026.jpg"
  }
}

try {
  const newsThumb = getNewsThumbnail(mockNews, 'card-desktop')
  console.log('✅ getNewsThumbnail:', newsThumb)
} catch (error) {
  console.log('❌ getNewsThumbnail error:', error.message)
}

console.log('✅ All tests completed!')
