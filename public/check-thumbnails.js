// Test script untuk mengecek thumbnail data di console browser
// Jalankan di halaman NewsPage

console.log('🔍 Checking thumbnail data...');

// Wait for page to load
setTimeout(() => {
  // Try to find news data
  const debugInfo = document.querySelector('.news-grid, .news-list');
  
  if (debugInfo) {
    console.log('📰 Found news container');
    
    // Look for ContentCard components in Vue devtools or DOM
    const cards = document.querySelectorAll('.content-card');
    console.log(`📰 Found ${cards.length} news cards`);
    
    // Check if we can access Vue instances
    if (window.Vue || window.$nuxt || document.querySelector('#app').__vue__) {
      console.log('✅ Vue detected, checking data...');
      
      // Simple manual check
      console.log('📝 To manually check thumbnail data:');
      console.log('1. Open Vue DevTools');
      console.log('2. Find NewsPage component');
      console.log('3. Check news[0].thumbnails or news[0].images');
      console.log('4. Look for card-mobile vs card-desktop URLs');
      
    } else {
      console.log('❌ Cannot access Vue data directly');
    }
    
    // Check network tab for image requests
    console.log('🌐 Check Network tab for image requests:');
    console.log('- Look for requests to res.cloudinary.com');
    console.log('- card-mobile should request w_80,h_80');
    console.log('- card-desktop should request w_1200,h_675');
    
  } else {
    console.log('❌ News container not found');
  }
  
  // Check current window size
  console.log(`📱 Current window: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`📱 Device type: ${window.innerWidth >= 768 ? 'Desktop' : 'Mobile'}`);
  
}, 2000);

console.log('⏱️ Test will run in 2 seconds...');
