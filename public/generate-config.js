// Generated Configuration for MyRajawali Bot
// Chat ID: 5929124699 (Private chat dengan Anitha Gerungan)
// Bot: @MyRajawali_bot (GPdI Rajawali Kanonang)

// XOR Encryption untuk generate config
function xorEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Configuration object
const config = {
    botToken: "8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw",
    chatId: "5929124699"
};

// Generate obfuscated config
const jsonString = JSON.stringify(config);
const base64Encoded = btoa(jsonString);
const xorKey = 'MyRajawaliSecure2025';
const xorEncrypted = xorEncrypt(base64Encoded, xorKey);
const finalEncoded = btoa(xorEncrypted);

console.log('='.repeat(60));
console.log('🔔 TELEGRAM CONFIGURATION - MyRajawali Bot');
console.log('='.repeat(60));
console.log('Bot Name: GPdI Rajawali Kanonang');
console.log('Username: @MyRajawali_bot');
console.log('Chat ID: 5929124699 (Private chat)');
console.log('');
console.log('📝 COPY CODE BERIKUT KE telegramEnhancedService.js (baris ~45):');
console.log('');
console.log(`const encodedConfig = '${finalEncoded}'`);
console.log('');
console.log('🧪 TEST CODE (jalankan di browser console):');
console.log('');
console.log(`// Import service
import telegramService from './src/utils/telegramEnhancedService.js'

// Test basic notification
telegramService.notifyCustom('🧪 Test dari MyRajawali Bot - ${new Date().toLocaleTimeString()}').then(success => {
  console.log('Telegram test result:', success ? '✅ SUCCESS' : '❌ FAILED')
})

// Test login notification  
telegramService.notifyLogin({
  username: 'Test User Anitha',
  email: 'anitha@myrajawali.com',
  role: 'jemaat', 
  ip: '192.168.1.1'
}).then(success => {
  console.log('Login notification test:', success ? '✅ SUCCESS' : '❌ FAILED')
})`);
console.log('');
console.log('='.repeat(60));

// Output the final encoded config for easy copy
console.log('');
console.log('🔒 ENCODED CONFIG:');
console.log(finalEncoded);
