// test-env.js
// Test sederhana untuk cek environment variables

require('dotenv').config()

console.log('🔍 Testing Environment Variables...')
console.log('📁 Current directory:', process.cwd())
console.log('')

// Test semua environment variables
console.log('🌐 Cloud Name:', process.env.VUE_APP_CLOUDINARY_CLOUD_NAME)
console.log('🔑 API Key:', process.env.VUE_APP_CLOUDINARY_API_KEY)
console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? '***HIDDEN***' : 'NOT SET')

console.log('')

// Cek apakah .env file ada
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env')
console.log('📄 .env file path:', envPath)
console.log('📄 .env file exists:', fs.existsSync(envPath))

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('📄 .env file content (first 100 chars):')
  console.log(envContent.substring(0, 100))
  console.log('')
  
  // Cek baris yang mengandung CLOUDINARY
  const cloudinaryLines = envContent.split('\n').filter(line => 
    line.includes('CLOUDINARY') && !line.startsWith('#')
  )
  console.log('☁️ Cloudinary lines in .env:')
  cloudinaryLines.forEach(line => console.log('  ', line))
}

console.log('')
console.log('💡 Tips:')
console.log('1. Pastikan tidak ada spasi sebelum/sesudah =')
console.log('2. Pastikan tidak ada kutip di nilai')  
console.log('3. Pastikan file .env di root folder')