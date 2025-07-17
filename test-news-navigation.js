// Test News Navigation - Debug Script
// Run this in browser console to debug news navigation

console.log('🧪 Testing News Navigation...')

// Test 1: Check if news data has proper IDs
async function testNewsData() {
  try {
    // Import Firebase and news service
    const { getNews } = await import('./src/services/news.js')
    
    console.log('📰 Fetching news data...')
    const newsData = await getNews(5)
    
    console.log('✅ News data fetched:', newsData.length, 'items')
    
    newsData.forEach((news, index) => {
      console.log(`📄 News ${index + 1}:`, {
        id: news.id,
        title: news.title,
        hasId: !!news.id,
        idType: typeof news.id
      })
    })
    
    return newsData
  } catch (error) {
    console.error('❌ Error fetching news:', error)
    return []
  }
}

// Test 2: Check specific news ID
async function testNewsById(id) {
  try {
    const { getNewsById } = await import('./src/services/news.js')
    
    console.log(`🔍 Testing news ID: "${id}"`)
    const news = await getNewsById(id)
    
    console.log('✅ News found:', {
      id: news.id,
      title: news.title,
      category: news.category,
      hasContent: !!news.content
    })
    
    return news
  } catch (error) {
    console.error('❌ Error fetching news by ID:', error)
    return null
  }
}

// Test 3: Check router navigation
function testRouterNavigation(newsId) {
  const router = window.Vue?.config?.globalProperties?.$router
  
  if (!router) {
    console.error('❌ Router not found')
    return false
  }
  
  try {
    console.log(`🚀 Testing navigation to news ID: "${newsId}"`)
    
    router.push({
      name: 'DetailNews',
      params: { id: newsId }
    })
    
    console.log('✅ Navigation successful')
    return true
  } catch (error) {
    console.error('❌ Navigation error:', error)
    return false
  }
}

// Run tests
window.testNewsNavigation = {
  testNewsData,
  testNewsById,
  testRouterNavigation
}

console.log('🧪 Tests loaded! Use:')
console.log('- testNewsNavigation.testNewsData()')
console.log('- testNewsNavigation.testNewsById("YOUR_NEWS_ID")')
console.log('- testNewsNavigation.testRouterNavigation("YOUR_NEWS_ID")')
