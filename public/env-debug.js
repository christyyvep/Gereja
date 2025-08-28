/**
 * ENVIRONMENT VARIABLES DEBUG SCRIPT
 * Untuk troubleshoot masalah environment variables
 */

console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES')
console.log('='.repeat(50))

// Check window object for Vue environment variables
console.log('\n📋 Window Environment Variables:')
const windowEnvVars = Object.keys(window).filter(key => key.startsWith('VUE_APP_'))
console.log('Found', windowEnvVars.length, 'window env vars')
windowEnvVars.forEach(key => {
  const value = window[key]
  const display = key.includes('TOKEN') ? `${value?.substring(0, 10)}...` : value
  console.log(`   ${key}: ${display}`)
})

// TEMPORARY FIX: Manually set environment variables
console.log('\n🔧 APPLYING TEMPORARY FIX...')
window.VUE_APP_BACKEND_API_URL = 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI'
window.VUE_APP_API_TOKEN = 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'
console.log('✅ Manually set VUE_APP_BACKEND_API_URL')
console.log('✅ Manually set VUE_APP_API_TOKEN')

// Test backend connection
console.log('\n🧪 Testing Backend Connection...')
fetch('https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend connection successful:', data)
    console.log('\n🎯 NOW RUN INTEGRATION TEST:')
    console.log('fetch("/test-tahap3-integration.js").then(r=>r.text()).then(eval)')
  })
  .catch(error => {
    console.log('❌ Backend connection failed:', error)
  })
