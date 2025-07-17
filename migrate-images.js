// Migration Script - Convert Base64 to Cloudinary URLs
// Jalankan script ini di browser console untuk convert data lama

console.log('🔄 Starting Base64 to Cloudinary Migration...')

async function migrateNewsImages() {
  try {
    // Import services
    const { getNews, updateNews } = await import('./src/services/news.js')
    
    console.log('📰 Fetching all news...')
    const newsList = await getNews(50) // Get all news
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const news of newsList) {
      console.log(`\n🔍 Checking news: ${news.title}`)
      
      // Check if images field exists and contains base64 data
      if (news.images) {
        const needsMigration = Object.values(news.images).some(url => 
          url && url.startsWith('data:image/')
        )
        
        if (needsMigration) {
          console.log(`❌ Found base64 data in: ${news.title}`)
          console.log('📦 Images:', Object.keys(news.images))
          
          // For now, just log what needs to be fixed
          // In production, you would upload these to Cloudinary
          migratedCount++
        } else {
          console.log(`✅ Already has proper URLs: ${news.title}`)
          skippedCount++
        }
      } else {
        console.log(`⚠️ No images field found: ${news.title}`)
        skippedCount++
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`- Total news: ${newsList.length}`)
    console.log(`- Needs migration: ${migratedCount}`)
    console.log(`- Already OK: ${skippedCount}`)
    
    if (migratedCount > 0) {
      console.log('\n⚠️ WARNING: Found news with base64 images!')
      console.log('These need to be re-uploaded through the admin panel to get proper Cloudinary URLs.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Helper function to check specific news
async function checkNewsImages(newsId) {
  try {
    const { getNewsById } = await import('./src/services/news.js')
    
    const news = await getNewsById(newsId)
    
    console.log('📰 News:', news.title)
    console.log('📦 Images:')
    
    if (news.images) {
      Object.entries(news.images).forEach(([type, url]) => {
        const isBase64 = url && url.startsWith('data:image/')
        const isCloudinary = url && url.includes('cloudinary.com')
        
        console.log(`- ${type}: ${isBase64 ? '❌ BASE64' : isCloudinary ? '✅ CLOUDINARY' : '⚠️ OTHER'} - ${url?.substring(0, 100)}...`)
      })
    } else {
      console.log('❌ No images field found')
    }
    
  } catch (error) {
    console.error('❌ Error checking news:', error)
  }
}

// Expose functions globally
window.migrateNewsImages = migrateNewsImages
window.checkNewsImages = checkNewsImages

console.log('🧪 Migration tools loaded!')
console.log('Usage:')
console.log('- migrateNewsImages() // Check all news')
console.log('- checkNewsImages("NEWS_ID") // Check specific news')
