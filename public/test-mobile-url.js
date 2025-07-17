// Test specific cardMobile URL
console.log('🧪 Testing cardMobile URL generation...')

const testURL = "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684255/myrajawali/thumbnails/news/cardMobile/1.jpg"

console.log('📍 Original URL:', testURL)
console.log('📍 Is Cloudinary URL?', testURL.startsWith('https://res.cloudinary.com'))

// Test if URL is accessible
console.log('🔍 Testing URL accessibility...')

const img = new Image()
img.onload = function() {
  console.log('✅ cardMobile URL is ACCESSIBLE')
  console.log('📐 Image dimensions:', this.naturalWidth, 'x', this.naturalHeight)
}
img.onerror = function() {
  console.log('❌ cardMobile URL is NOT ACCESSIBLE')
}
img.src = testURL

// Test cardDesktop for comparison
const testDesktopURL = "https://res.cloudinary.com/df74ywsgg/image/upload/v1752684262/myrajawali/thumbnails/news/cardDesktop/20211006_075026.jpg"

console.log('\n📍 Desktop URL:', testDesktopURL)

const img2 = new Image()
img2.onload = function() {
  console.log('✅ cardDesktop URL is ACCESSIBLE')
  console.log('📐 Image dimensions:', this.naturalWidth, 'x', this.naturalHeight)
}
img2.onerror = function() {
  console.log('❌ cardDesktop URL is NOT ACCESSIBLE')
}
img2.src = testDesktopURL
