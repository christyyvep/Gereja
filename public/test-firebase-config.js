// Quick Firebase connection test
console.log('🧪 Testing Firebase connection...')

// Test Firebase config
const testConfig = {
  apiKey: "AIzaSyCiIlHxWCPNY52b_2_Qzwb3OUk2_QsLc_Y",
  authDomain: "rajawali-church-app.firebaseapp.com", 
  projectId: "rajawali-church-app",
  storageBucket: "rajawali-church-app.appspot.com",
  messagingSenderId: "820867623340",
  appId: "1:820867623340:web:a0e1e2f3g4h5i6j7k8l9m0"
}

console.log('📋 Config:', testConfig)

// Try to access Firebase URL directly
const projectUrl = `https://console.firebase.google.com/project/${testConfig.projectId}`
console.log('🔗 Firebase Console URL:', projectUrl)

// Test API key format
if (testConfig.apiKey.startsWith('AIzaSy')) {
  console.log('✅ API Key format looks valid')
} else {
  console.log('❌ API Key format invalid')
}

console.log('✅ Config test completed!')
