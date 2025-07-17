// Test thumbnail mapping
console.log('🧪 Testing thumbnail mapping...')

// Mock data sesuai Firebase
const mockNews = {
  title: "TEST APING",
  thumbnails: {
    cardMobile: "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684255/myrajawali/thumbnails/news/cardMobile/1.jpg",
    cardDesktop: "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684262/myrajawali/thumbnails/news/cardDesktop/20211006_075026.jpg"
  }
}

// Size mapping yang seharusnya digunakan
const sizeMapping = {
  'card-mobile': 'cardMobile',
  'card-desktop': 'cardDesktop', 
  'detail-mobile': 'detailMobile',
  'detail-desktop': 'detailDesktop'
}

function testMapping(requestedSize) {
  const firebaseField = sizeMapping[requestedSize] || requestedSize
  const result = mockNews.thumbnails[firebaseField]
  
  console.log(`📱 ${requestedSize} -> ${firebaseField} -> ${result ? 'FOUND' : 'NOT FOUND'}`)
  if (result) {
    console.log(`   URL: ${result}`)
  }
}

console.log('📊 Testing all sizes:')
testMapping('card-mobile')    // Should find cardMobile
testMapping('card-desktop')   // Should find cardDesktop  
testMapping('detail-mobile')  // Should NOT find (fallback needed)
testMapping('detail-desktop') // Should NOT find (fallback needed)

console.log('\n✅ Mapping test complete!')
