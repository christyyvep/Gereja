// Test responsive thumbnail switching
// Run this in browser console after opening NewsPage

console.log('🔄 Testing responsive thumbnail switching...')

// Function to check current thumbnail URLs
function checkCurrentThumbnails() {
  const cards = document.querySelectorAll('.content-card')
  console.log(`Found ${cards.length} content cards`)
  
  cards.forEach((card, index) => {
    const img = card.querySelector('.thumbnail-img')
    if (img) {
      console.log(`Card ${index + 1}: ${img.src}`)
    }
  })
}

console.log('\n📱 Current state:')
console.log('Window width:', window.innerWidth)
checkCurrentThumbnails()

// Simulate window resize (you can also do this manually)
console.log('\n🔄 To test responsive behavior:')
console.log('1. Resize browser window to < 768px (mobile)')
console.log('2. Resize browser window to > 768px (desktop)')
console.log('3. Run checkCurrentThumbnails() again to see if URLs changed')

// Make checkCurrentThumbnails available globally
window.checkCurrentThumbnails = checkCurrentThumbnails
