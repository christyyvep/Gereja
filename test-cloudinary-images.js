// test-cloudinary-images.js
// Test apakah gambar-gambar yang diupload bisa diakses dengan sistem 4 ukuran

require('dotenv').config()

console.log('🧪 Testing Cloudinary Image URLs (4 Sizes System)...')
console.log('🌐 Cloud Name:', process.env.VUE_APP_CLOUDINARY_CLOUD_NAME)
console.log('')

// Test gambar jadwal yang udah diupload
const jadwalImages = ['doa-fajar', 'pendalaman-alkitab', 'raya']
const sizes = ['card-mobile', 'card-desktop', 'detail-mobile', 'detail-desktop']

console.log('📅 Testing Jadwal Images with 4 Sizes:')
jadwalImages.forEach(imageName => {
  console.log(`\n📄 ${imageName}:`)
  sizes.forEach(size => {
    const url = `https://res.cloudinary.com/${process.env.VUE_APP_CLOUDINARY_CLOUD_NAME}/image/upload/myrajawali/thumbnails/jadwal/${size}/${imageName}`
    console.log(`  ${size}: ${url}`)
  })
})

console.log('\n🌐 Test URLs in Browser:')
console.log('Copy URL di atas dan buka di browser untuk cek apakah gambar muncul!')

console.log('\n💡 Expected Results:')
console.log('✅ card-desktop URLs should work (already uploaded)')
console.log('❌ card-mobile, detail-mobile, detail-desktop will show 404 (not uploaded yet)')

console.log('\n🎯 Available Test URLs (based on actual upload):')
jadwalImages.forEach(imageName => {
  const url = `https://res.cloudinary.com/${process.env.VUE_APP_CLOUDINARY_CLOUD_NAME}/image/upload/myrajawali/thumbnails/jadwal/card-desktop/${imageName}`
  console.log(`card-desktop/${imageName}: ${url}`)
})

console.log('\n📝 Next Steps:')
console.log('1. Test card-desktop URLs first (should work)')
console.log('2. Upload missing sizes (card-mobile, detail-mobile, detail-desktop)')  
console.log('3. Update imageUtils.js in project')
console.log('4. Test aplikasi dengan npm run serve')

console.log('\n🔧 Environment Check:')
console.log('Cloud Name:', process.env.VUE_APP_CLOUDINARY_CLOUD_NAME || 'NOT SET')
console.log('API Key:', process.env.VUE_APP_CLOUDINARY_API_KEY ? '***SET***' : 'NOT SET')
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET')