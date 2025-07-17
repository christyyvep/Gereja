// Run this in browser console to test thumbnail mapping
console.log('🧪 Testing thumbnail mapping in browser...')

// Mock data sesuai Firebase  
const mockNews = {
  title: "TEST APING",
  thumbnails: {
    cardMobile: "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684255/myrajawali/thumbnails/news/cardMobile/1.jpg",
    cardDesktop: "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684262/myrajawali/thumbnails/news/cardDesktop/20211006_075026.jpg"
  }
}

// Size mapping
const sizeMapping = {
  'card-mobile': 'cardMobile',
  'card-desktop': 'cardDesktop', 
  'detail-mobile': 'detailMobile',
  'detail-desktop': 'detailDesktop'
}

function testThumbnailGeneration(news, requestedSize) {
  console.log(`\n🎯 Testing: ${requestedSize}`)
  
  const firebaseField = sizeMapping[requestedSize] || requestedSize
  console.log(`📍 Firebase field: ${firebaseField}`)
  
  const thumbnails = news.thumbnails || {}
  const result = thumbnails[firebaseField]
  
  if (result) {
    console.log(`✅ Found: ${result}`)
    return result
  } else {
    console.log(`❌ Not found, would use fallback`)
    return null
  }
}

// Test both sizes
const mobileResult = testThumbnailGeneration(mockNews, 'card-mobile')
const desktopResult = testThumbnailGeneration(mockNews, 'card-desktop')

console.log('\n📊 Summary:')
console.log('📱 Mobile:', mobileResult)
console.log('🖥️ Desktop:', desktopResult)

if (mobileResult && desktopResult && mobileResult !== desktopResult) {
  console.log('✅ SUCCESS: Different images for mobile and desktop!')
} else {
  console.log('❌ PROBLEM: Same images or missing data')
}

console.log('\n✅ Test complete!')
