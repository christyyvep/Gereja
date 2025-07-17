// src/utils/cloudinary.js - VERSI YANG DIPERBAIKI

export const CLOUDINARY_CONFIG = {
  // ⭐ KEEP original env variable structure (kalau sudah di-set)
  cloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME || 'df74ywsgg', // fallback
  apiKey: process.env.VUE_APP_CLOUDINARY_API_KEY,
  
  // ⭐ Upload preset for unsigned uploads (must match Cloudinary settings)
  uploadPreset: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET || 'myrajawali_preset', // Correct preset name
  
  // ⭐ SAFE: Keep original baseUrl construction
  baseUrl: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME 
    ? `https://res.cloudinary.com/${process.env.VUE_APP_CLOUDINARY_CLOUD_NAME}/image/upload`
    : 'https://res.cloudinary.com/df74ywsgg/image/upload',
  
  // Folder structure dengan UKURAN YANG BENAR
  folders: {
    church: 'myrajawali/church',           
    gembala: 'myrajawali/gembala',         
    dailyVerse: 'myrajawali/daily-verse',  
    featureIcons: 'myrajawali/icons/features', 
    
    // 🎯 PERBAIKAN: Proper folder structure untuk news
    news: {
      cardMobile: 'myrajawali/thumbnails/news/card-mobile',        // 80x80
      cardDesktop: 'myrajawali/thumbnails/news/card-desktop',      // 1200x675
      detailMobile: 'myrajawali/thumbnails/news/detail-mobile',    // 1200x675  
      detailDesktop: 'myrajawali/thumbnails/news/detail-desktop'   // 1435x498
    },
    jadwal: {
      cardMobile: 'myrajawali/thumbnails/jadwal/card-mobile',
      cardDesktop: 'myrajawali/thumbnails/jadwal/card-desktop',
      detailMobile: 'myrajawali/thumbnails/jadwal/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/jadwal/detail-desktop'
    },
    renungan: {
      cardMobile: 'myrajawali/thumbnails/renungan/card-mobile',
      cardDesktop: 'myrajawali/thumbnails/renungan/card-desktop',
      detailMobile: 'myrajawali/thumbnails/renungan/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/renungan/detail-desktop'
    }
  },
  
  // 🎯 SIZE TRANSFORMS dengan ukuran yang BENAR
  transforms: {
    'card-mobile': 'w_80,h_80,c_fill,f_auto,q_auto',           // 80x80 - HP di NewsPage
    'card-desktop': 'w_1200,h_675,c_fill,f_auto,q_auto',       // 1200x675 - Desktop di NewsPage  
    'detail-mobile': 'w_1200,h_675,c_fill,f_auto,q_auto',      // 1200x675 - HP di DetailNews
    'detail-desktop': 'w_1435,h_498,c_fill,f_auto,q_auto',     // 1435x498 - Desktop di DetailNews
    // Legacy support
    'large': 'w_1200,h_675,c_fill,f_auto,q_auto',
    'small': 'w_80,h_80,c_fill,f_auto,q_auto'
  }
}

// ⭐ KEEP original function unchanged
export function getCloudinaryImageUrl(folder, filename, version = null) {
  const versionStr = version ? `/v${version}` : ''
  return `${CLOUDINARY_CONFIG.baseUrl}${versionStr}/${folder}/${filename}`
}

// ⭐ SIMPLE: getNewsCloudinaryUrl yang MUDAH
export function getNewsCloudinaryUrl(filename, size = 'card-desktop') {
  try {
    console.log(`📰 [getNewsCloudinaryUrl] Processing: "${filename}", size: "${size}"`)
    
    // ✅ SIMPLE TRANSFORM: Cuma 2 ukuran aja
    let transform
    if (size === 'card-mobile') {
      transform = 'w_80,h_80,c_fill,f_auto,q_auto'  // 80x80 untuk mobile
    } else {
      transform = 'w_1200,h_675,c_fill,f_auto,q_auto'  // 1200x675 untuk desktop
    }
    
    console.log(`🎯 [getNewsCloudinaryUrl] Using transform: ${transform}`)
    
    // ✅ CLEAN FILENAME: Ambil public ID aja
    let publicId = filename
    
    // Kalau URL lengkap, extract public ID
    if (filename.includes('cloudinary.com')) {
      const urlParts = filename.split('/')
      publicId = urlParts[urlParts.length - 1].split('.')[0]
    } else if (filename.includes('.')) {
      // Kalau ada extension, hapus
      publicId = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    }
    
    console.log(`🧹 [getNewsCloudinaryUrl] Public ID: "${publicId}"`)
    
    // ✅ GENERATE URL: Base URL + transform + public ID
    const finalUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}`
    console.log(`🔗 [getNewsCloudinaryUrl] Final URL: ${finalUrl}`)
    
    return finalUrl
    
  } catch (error) {
    console.error('❌ [getNewsCloudinaryUrl] Error:', error)
    // Return placeholder jika gagal
    return `https://via.placeholder.com/${size === 'card-mobile' ? '80x80' : '1200x675'}`
  }
}

// ⭐ PERBAIKAN: getJadwalCloudinaryUrl yang BENAR
export function getJadwalCloudinaryUrl(filename, size = 'card-desktop') {
  try {
    console.log(`📅 [getJadwalCloudinaryUrl] Processing: ${filename}, size: ${size}`)
    
    // Get transform parameters
    const transform = CLOUDINARY_CONFIG.transforms[size] || CLOUDINARY_CONFIG.transforms['card-desktop']
    console.log(`🎯 Using transform: ${transform}`)
    
    // Get folder based on size
    const folder = CLOUDINARY_CONFIG.folders.jadwal[size] || CLOUDINARY_CONFIG.folders.jadwal.cardDesktop
    console.log(`📁 Using folder: ${folder}`)
    
    // Clean filename
    let cleanFilename = filename
    if (filename.includes('.')) {
      cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    }
    
    const directUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folder}/${cleanFilename}`
    console.log(`🔗 Generated Jadwal URL: ${directUrl}`)
    return directUrl
    
  } catch (error) {
    console.error('❌ Error in getJadwalCloudinaryUrl:', error)
    throw new Error(`Failed to generate Jadwal Cloudinary URL for ${filename}`)
  }
}

// ⭐ PERBAIKAN: getRenunganCloudinaryUrl yang BENAR
export function getRenunganCloudinaryUrl(filename, size = 'card-desktop') {
  try {
    console.log(`🙏 [getRenunganCloudinaryUrl] Processing: ${filename}, size: ${size}`)
    
    // Get transform parameters
    const transform = CLOUDINARY_CONFIG.transforms[size] || CLOUDINARY_CONFIG.transforms['card-desktop']
    console.log(`🎯 Using transform: ${transform}`)
    
    // Get folder based on size
    const folder = CLOUDINARY_CONFIG.folders.renungan[size] || CLOUDINARY_CONFIG.folders.renungan.cardDesktop
    console.log(`📁 Using folder: ${folder}`)
    
    // Clean filename
    let cleanFilename = filename
    if (filename.includes('.')) {
      cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    }
    
    const directUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folder}/${cleanFilename}`
    console.log(`🔗 Generated Renungan URL: ${directUrl}`)
    return directUrl
    
  } catch (error) {
    console.error('❌ Error in getRenunganCloudinaryUrl:', error)
    throw new Error(`Failed to generate Renungan Cloudinary URL for ${filename}`)
  }
}

// ⭐ PERBAIKAN: getGivingCloudinaryUrl yang BENAR
export function getGivingCloudinaryUrl(filename) {
  try {
    console.log(`💝 [getGivingCloudinaryUrl] Processing: ${filename}`)
    
    // Giving biasanya ga perlu resize, atau pakai default size
    const transform = 'w_1200,h_675,c_fill,f_auto,q_auto'
    const folder = 'myrajawali/thumbnails/giving'
    
    // Clean filename
    let cleanFilename = filename
    if (filename.includes('.')) {
      cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    }
    
    const directUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folder}/${cleanFilename}`
    console.log(`🔗 Generated Giving URL: ${directUrl}`)
    return directUrl
    
  } catch (error) {
    console.error('❌ Error in getGivingCloudinaryUrl:', error)
    throw new Error(`Failed to generate Giving Cloudinary URL for ${filename}`)
  }
}

// ⭐ MINIMAL CHANGE: Hanya tambah logic untuk gembala (KEEP original)
export function getChurchCloudinaryUrl(filename) {
  try {
    console.log(`🏛️ [getChurchCloudinaryUrl] Processing: ${filename}`)
    
    // ⭐ NEW: Detect gembala vs church
    let folder
    if (filename.includes('pdt-')) {
      folder = CLOUDINARY_CONFIG.folders.gembala
      console.log(`👨‍💼 Using gembala folder for: ${filename}`)
    } else {
      folder = CLOUDINARY_CONFIG.folders.church
      console.log(`🏛️ Using church folder for: ${filename}`)
    }
    
    // ⭐ KEEP original logic untuk extension
    if (!filename.includes('.')) {
      // Try common extensions
      const extensions = ['jpg', 'png', 'jpeg', 'webp']
      for (const ext of extensions) {
        const urlWithExt = getCloudinaryImageUrl(folder, `${filename}.${ext}`)
        console.log(`🔍 Trying: ${urlWithExt}`)
        return urlWithExt
      }
    }
    
    const url = getCloudinaryImageUrl(folder, filename)
    console.log(`🖼️ Final URL: ${url}`)
    return url
    
  } catch (error) {
    console.error('❌ Error getting church image:', error)
    // ⭐ IMPORTANT: Jangan throw error, return null
    console.log('🔄 Returning null for fallback to placeholder')
    return null
  }
}

// ⭐ KEEP original Daily Verse function
export function getDailyVerseCloudinaryUrl(filename) {
  try {
    console.log(`📖 [getDailyVerseCloudinaryUrl] Processing: ${filename}`)
    
    const folder = CLOUDINARY_CONFIG.folders.dailyVerse
    console.log(`📁 Using dailyVerse folder: ${folder}`)
    
    // ⭐ Cek apakah filename sudah ada extension
    if (!filename.includes('.')) {
      // Coba extension yang umum untuk daily verse
      const extensions = ['png', 'jpg', 'jpeg', 'webp']
      for (const ext of extensions) {
        const urlWithExt = getCloudinaryImageUrl(folder, `${filename}.${ext}`)
        console.log(`🔍 Trying Daily Verse: ${urlWithExt}`)
        return urlWithExt
      }
    }
    
    const url = getCloudinaryImageUrl(folder, filename)
    console.log(`🖼️ Final Daily Verse URL: ${url}`)
    return url
    
  } catch (error) {
    console.error('❌ Error getting daily verse image:', error)
    console.log('🔄 Returning null for fallback to placeholder')
    return null
  }
}

// ⭐ OPTIONAL: Feature Icons (kalau mau support Cloudinary juga)
export function getFeatureIconCloudinaryUrl(filename) {
  try {
    console.log(`🎯 [getFeatureIconCloudinaryUrl] Processing: ${filename}`)
    
    const folder = CLOUDINARY_CONFIG.folders.featureIcons
    const transform = 'w_48,h_48,c_fill,f_auto,q_auto' // Icon size
    
    // Clean filename
    let cleanFilename = filename
    if (filename.includes('.')) {
      cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '')
    }
    
    const directUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folder}/${cleanFilename}`
    console.log(`🔗 Generated Feature Icon URL: ${directUrl}`)
    return directUrl
    
  } catch (error) {
    console.error('❌ Error in getFeatureIconCloudinaryUrl:', error)
    console.log('🔄 Returning null for fallback to local assets')
    return null
  }
}

// ⭐ FUNCTION untuk test daily verse images
export function testDailyVerseImage(filename) {
  try {
    const url = getDailyVerseCloudinaryUrl(filename)
    console.log(`🧪 Testing daily verse image: ${filename}`)
    console.log(`🔗 URL: ${url}`)
    
    if (!url) {
      console.log(`❌ URL generation failed for ${filename}`)
      return null
    }
    
    const img = new Image()
    img.onload = () => {
      console.log(`✅ SUCCESS: ${filename} loaded!`)
    }
    img.onerror = () => {
      console.log(`❌ FAILED: ${filename} failed to load`)
    }
    img.src = url
    
    return url
  } catch (error) {
    console.error(`❌ Error testing ${filename}:`, error)
    return null
  }
}

// ⭐ FUNCTION untuk test semua daily verse
export function testAllDailyVerseImages() {
  console.log('📖 Testing all daily verse images...')
  
  const testImages = [
    'ayat1',
    'ayat2', 
    'ayat3',
    'ayat4',
    'ayat5'
  ]
  
  testImages.forEach(filename => {
    setTimeout(() => testDailyVerseImage(filename), 100)
  })
}

// ⭐ FUNCTION untuk test church images
export function testAllChurchImages() {
  console.log('🏛️ Testing all church images...')
  
  // ✅ SIMPLE VERSION: Langsung test beberapa file
  const imagesToTest = ['visi-gereja', 'tentang-gereja', 'misi-gereja']
  
  imagesToTest.forEach((filename, index) => {
    setTimeout(() => {
      try {
        const url = getChurchCloudinaryUrl(filename)
        console.log(`🧪 Testing church image ${index + 1}: ${filename}`)
        console.log(`🔗 URL: ${url}`)
      } catch (error) {
        console.error(`❌ Error testing ${filename}:`, error)
      }
    }, index * 200)
  })
}

// ⭐ NEW: Test functions untuk News dengan 4 ukuran
export function testNewsImages() {
  console.log('📰 Testing News images with all sizes...')
  
  const testImage = 'sample-news' // Ganti dengan nama file yang ada di Cloudinary
  const sizes = ['card-mobile', 'card-desktop', 'detail-mobile', 'detail-desktop']
  
  sizes.forEach((size, index) => {
    setTimeout(() => {
      try {
        const url = getNewsCloudinaryUrl(testImage, size)
        console.log(`🧪 Testing News ${size}: ${url}`)
        
        const img = new Image()
        img.onload = () => {
          console.log(`✅ SUCCESS: News ${size} loaded!`)
        }
        img.onerror = () => {
          console.log(`❌ FAILED: News ${size} failed to load`)
        }
        img.src = url
        
      } catch (error) {
        console.error(`❌ Error testing News ${size}:`, error)
      }
    }, index * 500)
  })
}

// === ADMIN AREA ===

/**
 * Upload single image to Cloudinary (manual tanpa preset)
 */
export async function uploadToCloudinary(file, type) {
  const folderMap = {
    cardMobile: 'myrajawali/thumbnails/news/card-mobile',
    cardDesktop: 'myrajawali/thumbnails/news/card-desktop',
    detailMobile: 'myrajawali/thumbnails/news/detail-mobile',
    detailDesktop: 'myrajawali/thumbnails/news/detail-desktop'
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset) // Use config
  formData.append('folder', folderMap[type])

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Upload failed')
  }

  const result = await response.json()
  return result.secure_url
}

// ⭐ Export test functions untuk console (UPDATE dengan semua functions)
if (typeof window !== 'undefined') {
  window.testNewsImages = testNewsImages
  window.testAllDailyVerseImages = testAllDailyVerseImages
  window.testAllChurchImages = testAllChurchImages
  window.getNewsCloudinaryUrl = getNewsCloudinaryUrl
  window.testAllCloudinaryFunctions = testAllCloudinaryFunctions
  window.testCloudinaryConnection = testCloudinaryConnection
  window.getCloudinaryUrlByType = getCloudinaryUrlByType
}

// ⭐ TAMBAHAN: Helper functions untuk generate URL dengan berbagai cara

/**
 * Generate Cloudinary URL dengan auto-detect extension
 */
export function generateCloudinaryUrl(folder, filename, transform = '') {
  const baseUrl = CLOUDINARY_CONFIG.baseUrl
  const transformStr = transform ? `/${transform}` : ''
  
  // Kalau filename sudah ada extension
  if (filename.includes('.')) {
    return `${baseUrl}${transformStr}/${folder}/${filename}`
  }
  
  // Kalau belum ada extension, coba yang umum
  // const extensions = ['jpg', 'png', 'jpeg', 'webp']
  
  // Return URL dengan extension pertama (jpg)
  return `${baseUrl}${transformStr}/${folder}/${filename}.jpg`
}

/**
 * Get Cloudinary URL untuk any content type dengan size
 */
export function getCloudinaryUrlByType(contentType, filename, size = 'card-desktop') {
  try {
    switch (contentType) {
      case 'news':
      case 'berita':
        return getNewsCloudinaryUrl(filename, size)
        
      case 'jadwal':
      case 'schedule':
        return getJadwalCloudinaryUrl(filename, size)
        
      case 'renungan':
      case 'devotional':
        return getRenunganCloudinaryUrl(filename, size)
        
      case 'giving':
      case 'persembahan':
        return getGivingCloudinaryUrl(filename)
        
      case 'church':
      case 'gereja':
        return getChurchCloudinaryUrl(filename)
        
      case 'daily-verse':
      case 'ayat':
        return getDailyVerseCloudinaryUrl(filename)
        
      case 'feature-icon':
        return getFeatureIconCloudinaryUrl(filename)
        
      default:
        console.warn(`Unknown content type: ${contentType}`)
        return null
    }
  } catch (error) {
    console.error(`Error getting Cloudinary URL for ${contentType}:`, error)
    return null
  }
}

/**
 * Batch upload multiple images to Cloudinary
 */
export async function uploadMultipleToCloudinary(files, type) {
  const results = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`⬆️ Uploading ${i + 1}/${files.length}: ${files[i].name}`)
      const url = await uploadToCloudinary(files[i], type)
      results.push({
        file: files[i].name,
        url: url,
        success: true
      })
      console.log(`✅ Uploaded: ${files[i].name}`)
    } catch (error) {
      console.error(`❌ Failed to upload ${files[i].name}:`, error)
      results.push({
        file: files[i].name,
        error: error.message,
        success: false
      })
    }
  }
  
  return results
}

/**
 * Upload dengan custom folder path
 */
export async function uploadToCustomFolder(file, customFolder) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', customFolder)
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    const result = await response.json()
    console.log(`✅ Uploaded to custom folder ${customFolder}:`, result.secure_url)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Upload to custom folder failed:`, error)
    throw error
  }
}

/**
 * Delete image from Cloudinary (requires API key)
 */
export async function deleteFromCloudinary(publicId) {
  // Note: This requires API secret, usually done from backend
  console.warn('⚠️ Delete operation should be done from backend for security')
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: CLOUDINARY_CONFIG.apiKey
        // api_secret is required but should be on backend
      })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('❌ Delete failed:', error)
    throw error
  }
}

/**
 * Get image info from Cloudinary
 */
export async function getImageInfo(publicId) {
  try {
    const url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}.json`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Image not found')
    }
    
    const info = await response.json()
    return info
  } catch (error) {
    console.error('❌ Get image info failed:', error)
    return null
  }
}

/**
 * Generate responsive image URLs untuk different devices
 */
export function getResponsiveUrls(folder, filename) {
  const baseFolder = folder
  const transforms = {
    mobile: 'w_400,h_300,c_fill,f_auto,q_auto,dpr_2.0',
    tablet: 'w_800,h_600,c_fill,f_auto,q_auto,dpr_1.5', 
    desktop: 'w_1200,h_675,c_fill,f_auto,q_auto,dpr_1.0',
    retina: 'w_1200,h_675,c_fill,f_auto,q_auto,dpr_2.0'
  }
  
  const urls = {}
  Object.keys(transforms).forEach(device => {
    urls[device] = generateCloudinaryUrl(baseFolder, filename, transforms[device])
  })
  
  return urls
}

/**
 * Generate srcset string untuk responsive images
 */
export function generateSrcSet(folder, filename) {
  const urls = getResponsiveUrls(folder, filename)
  
  return [
    `${urls.mobile} 400w`,
    `${urls.tablet} 800w`, 
    `${urls.desktop} 1200w`,
    `${urls.retina} 2400w`
  ].join(', ')
}

/**
 * Test connectivity ke Cloudinary
 */
export async function testCloudinaryConnection() {
  try {
    console.log('🧪 Testing Cloudinary connection...')
    
    // Test dengan sample image dari Cloudinary
    const testUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_100,h_100,c_fill/sample.jpg`
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    
    if (response.ok) {
      console.log('✅ Cloudinary connection successful!')
      return true
    } else {
      console.log('❌ Cloudinary connection failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Cloudinary connection error:', error)
    return false
  }
}

/**
 * Validate image before upload
 */
export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  const errors = []
  
  if (!validTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed: ${validTypes.join(', ')}`)
  }
  
  if (file.size > maxSize) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 10MB`)
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  }
}

/**
 * Comprehensive test untuk semua content types
 */
export function testAllCloudinaryFunctions() {
  console.log('🧪 Testing ALL Cloudinary functions...')
  
  // Test News
  console.log('\n📰 Testing News...')
  const newsSizes = ['card-mobile', 'card-desktop', 'detail-mobile', 'detail-desktop']
  newsSizes.forEach(size => {
    try {
      const url = getNewsCloudinaryUrl('sample-news', size)
      console.log(`✅ News ${size}: ${url}`)
    } catch (error) {
      console.log(`❌ News ${size}: ${error.message}`)
    }
  })
  
  // Test Jadwal
  console.log('\n📅 Testing Jadwal...')
  newsSizes.forEach(size => {
    try {
      const url = getJadwalCloudinaryUrl('sample-jadwal', size)
      console.log(`✅ Jadwal ${size}: ${url}`)
    } catch (error) {
      console.log(`❌ Jadwal ${size}: ${error.message}`)
    }
  })
  
  // Test Renungan
  console.log('\n🙏 Testing Renungan...')
  newsSizes.forEach(size => {
    try {
      const url = getRenunganCloudinaryUrl('sample-renungan', size)
      console.log(`✅ Renungan ${size}: ${url}`)
    } catch (error) {
      console.log(`❌ Renungan ${size}: ${error.message}`)
    }
  })
  
  // Test Church
  console.log('\n🏛️ Testing Church...')
  try {
    const url = getChurchCloudinaryUrl('tentang-gereja')
    console.log(`✅ Church: ${url}`)
  } catch (error) {
    console.log(`❌ Church: ${error.message}`)
  }
  
  // Test Daily Verse
  console.log('\n📖 Testing Daily Verse...')
  for (let i = 1; i <= 5; i++) {
    try {
      const url = getDailyVerseCloudinaryUrl(`ayat${i}`)
      console.log(`✅ Daily Verse ${i}: ${url}`)
    } catch (error) {
      console.log(`❌ Daily Verse ${i}: ${error.message}`)
    }
  }
  
  console.log('\n🎉 Testing completed!')
}

// ⭐ Export semua helper functions
// export {
//   getCloudinaryUrlByType,
//   uploadMultipleToCloudinary,
//   uploadToCustomFolder,
//   deleteFromCloudinary,
//   getImageInfo,
//   getResponsiveUrls,
//   generateSrcSet,
//   testCloudinaryConnection,
//   validateImageFile,
//   testAllCloudinaryFunctions
// }