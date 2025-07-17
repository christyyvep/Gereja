// Debug Navigation Script for Browser Console
// Paste this in browser console to test navigation

console.log('🧪 [Debug] Testing News Navigation...')

// Test 1: Check if router is available
function checkRouter() {
  const router = window.Vue?.config?.globalProperties?.$router
  if (router) {
    console.log('✅ [Debug] Router found:', router)
    return router
  } else {
    console.log('❌ [Debug] Router not found')
    return null
  }
}

// Test 2: Test direct navigation
function testNavigation(newsId) {
  const router = checkRouter()
  if (!router) return
  
  console.log(`🧪 [Debug] Testing navigation to: /news/${newsId}`)
  
  router.push(`/news/${newsId}`)
    .then(() => {
      console.log('✅ [Debug] Navigation successful!')
    })
    .catch(error => {
      console.error('❌ [Debug] Navigation failed:', error)
    })
}

// Test 3: Check news data
function checkNewsData() {
  // Try to get news data from Vue app
  const app = document.querySelector('#app').__vue__
  console.log('🧪 [Debug] App instance:', app)
  
  // Look for news data in current page
  if (app.$children) {
    const newsPage = app.$children.find(child => child.$options.name === 'NewsPage')
    if (newsPage) {
      console.log('✅ [Debug] NewsPage found:', newsPage)
      console.log('📰 [Debug] News data:', newsPage.news)
      return newsPage.news
    }
  }
  
  console.log('❌ [Debug] NewsPage not found')
  return null
}

// Test 4: Manual trigger navigation
function triggerNavigation() {
  const newsData = checkNewsData()
  if (newsData && newsData.length > 0) {
    const firstNews = newsData[0]
    console.log('🧪 [Debug] Triggering navigation for first news:', firstNews)
    testNavigation(firstNews.id)
  }
}

// Expose functions globally
window.debugNav = {
  checkRouter,
  testNavigation,
  checkNewsData,
  triggerNavigation
}

console.log('🧪 [Debug] Debug functions loaded!')
console.log('Usage:')
console.log('- debugNav.checkRouter()')
console.log('- debugNav.testNavigation("NEWS_ID")')
console.log('- debugNav.checkNewsData()')
console.log('- debugNav.triggerNavigation()')
