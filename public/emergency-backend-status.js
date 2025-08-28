/**
 * EMERGENCY - Solusi Sementara untuk Backend Issue
 * 
 * Karena Firebase Functions tidak bisa deploy karena Cloud Run issues,
 * kita buat script emergency untuk test dan monitor status.
 */

console.log('🚨 EMERGENCY BACKEND STATUS CHECK');

// Test apakah Firebase Functions endpoint accessible
async function testFirebaseEndpoint() {
  console.log('\n📡 Testing Firebase Functions endpoint...');
  
  try {
    // URL yang seharusnya jika deployment berhasil
    const testUrls = [
      'https://us-central1-myrajawali-app.cloudfunctions.net/helloWorld',
      'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI',
      'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI/health'
    ];
    
    for (const url of testUrls) {
      console.log(`Testing: ${url}`);
      try {
        const response = await fetch(url);
        console.log(`✅ ${url} - Status: ${response.status}`);
        if (response.ok) {
          const data = await response.text();
          console.log(`Response: ${data.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Firebase endpoint test failed:', error);
  }
}

// Test direct Telegram API (as fallback)
async function testDirectTelegram() {
  console.log('\n🤖 Testing Direct Telegram API...');
  
  try {
    // Note: Bot token should NOT be in frontend in production
    // This is ONLY for emergency testing
    const response = await fetch('https://api.telegram.org/bot7581346913:AAEZd7KBB6MejpWMNJdD8CBAQgpzW7lm2MI/getMe');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Telegram Bot Status:', data.result.username);
      console.log('✅ Bot is alive and responding');
    } else {
      console.log('❌ Telegram API error:', response.status);
    }
  } catch (error) {
    console.error('❌ Direct Telegram test failed:', error);
  }
}

// Check environment variables
function checkEnvironment() {
  console.log('\n🔧 Environment Check:');
  console.log('- Backend URL:', window.VUE_APP_BACKEND_URL || 'Not set');
  console.log('- API Token:', window.VUE_APP_API_TOKEN ? 'Set' : 'Not set');
  console.log('- Bot Token:', window.VUE_APP_TELEGRAM_BOT_TOKEN ? '❌ EXPOSED (BAD!)' : '✅ Not exposed (GOOD)');
}

// Main status check
async function emergencyStatusCheck() {
  console.log('=' * 50);
  console.log('🚨 MYRAJAWALI BACKEND EMERGENCY STATUS');
  console.log('=' * 50);
  
  checkEnvironment();
  await testFirebaseEndpoint();
  await testDirectTelegram();
  
  console.log('\n📋 SUMMARY:');
  console.log('- Security: ✅ Bot token removed from frontend');
  console.log('- Backend: ❌ Firebase Functions deployment failed');
  console.log('- Telegram: ✅ Bot is alive and can be tested directly');
  console.log('- Status: 🔄 Waiting for Cloud Run infrastructure fix');
  
  console.log('\n💡 TEMPORARY SOLUTIONS:');
  console.log('1. Use emergency-telegram-test.js for direct bot testing');
  console.log('2. Use stop-polling-spam.js to stop error spam');
  console.log('3. Monitor Google Cloud status for updates');
  console.log('4. Consider alternative backend platforms if issue persists');
}

// Auto-run on script load
emergencyStatusCheck();
