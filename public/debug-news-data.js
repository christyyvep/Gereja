// Debug script - jalankan di browser console di halaman NewsPage
// untuk melihat data thumbnail yang sebenarnya

console.log('🔍 Starting thumbnail debug...');

// Wait for Vue instance
setTimeout(() => {
  // Get Vue app instance
  const vueApp = document.querySelector('#app').__vue__ || 
                 document.querySelector('[data-v-app]').__vue__ ||
                 window.Vue;
  
  if (vueApp && vueApp.$children) {
    // Try to find NewsPage component
    function findComponent(components, name) {
      for (let comp of components) {
        if (comp.$options.name === name) return comp;
        if (comp.$children) {
          const found = findComponent(comp.$children, name);
          if (found) return found;
        }
      }
      return null;
    }
    
    const newsPage = findComponent(vueApp.$children, 'NewsPage');
    
    if (newsPage && newsPage.news) {
      console.log('📰 Found NewsPage with', newsPage.news.length, 'news items');
      
      newsPage.news.forEach((item, index) => {
        if (index < 3) { // Check first 3 items
          console.log(`\n📰 News ${index + 1}: ${item.title}`);
          console.log('- ID:', item.id);
          
          // Check thumbnails field
          if (item.thumbnails) {
            console.log('- Thumbnails object:', item.thumbnails);
            
            Object.keys(item.thumbnails).forEach(size => {
              console.log(`  - ${size}: ${item.thumbnails[size]}`);
            });
          } else {
            console.log('- ❌ No thumbnails field');
          }
          
          // Check images field  
          if (item.images) {
            console.log('- Images object:', item.images);
            
            Object.keys(item.images).forEach(size => {
              console.log(`  - ${size}: ${item.images[size]}`);
            });
          } else {
            console.log('- ❌ No images field');
          }
          
          // Check legacy thumbnail
          if (item.thumbnail) {
            console.log('- Legacy thumbnail:', item.thumbnail);
          }
          
          console.log('- All fields:', Object.keys(item));
        }
      });
    } else {
      console.log('❌ NewsPage component not found or no news data');
    }
  } else {
    console.log('❌ Vue app not found');
  }
}, 2000);

console.log('⏱️ Debug will run in 2 seconds...');
