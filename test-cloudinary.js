// test-cloudinary.js
// Test koneksi ke Cloudinary dengan cloud name: df74ywsgg

const cloudinary = require('cloudinary').v2
require('dotenv').config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VUE_APP_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function testCloudinary() {
  try {
    console.log('🧪 Testing Cloudinary connection...')
    console.log('🌐 Cloud Name:', process.env.VUE_APP_CLOUDINARY_CLOUD_NAME)
    
    // Test API connection
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary connection successful!')
    console.log('📊 Status:', result.status)
    
    // Generate test URL
    const testUrl = cloudinary.url('myrajawali/test-image', {
      width: 400,
      height: 300,
      crop: 'fill'
    })
    console.log('🌐 Test URL:', testUrl)
    
    // Test upload URL (untuk admin nanti)
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.VUE_APP_CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('📤 Upload URL:', uploadUrl)
    
    console.log('\n🎉 Setup berhasil! Siap untuk next step.')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    // Debugging hints
    if (error.message.includes('Must supply api_key')) {
      console.log('💡 Fix: Cek VUE_APP_CLOUDINARY_API_KEY di .env')
    }
    if (error.message.includes('Must supply api_secret')) {
      console.log('💡 Fix: Cek CLOUDINARY_API_SECRET di .env') 
    }
    if (error.message.includes('cloud_name')) {
      console.log('💡 Fix: Cek VUE_APP_CLOUDINARY_CLOUD_NAME di .env')
    }
  }
}

testCloudinary()