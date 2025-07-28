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
    },
    giving: {
      detailMobile: 'myrajawali/thumbnails/giving/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/giving/detail-desktop'
    },
    church: {
      legacy: 'myrajawali/church',           // For legacy church images (visi, misi, etc)
      detailMobile: 'myrajawali/church/detail-mobile',
      detailDesktop: 'myrajawali/church/detail-desktop'
    }
  },
  
  // 🎯 SIZE TRANSFORMS dengan ukuran yang BENAR dan crop setting yang natural
  transforms: {
    'card-mobile': 'w_80,h_80,c_fit,f_auto,q_auto',           // 80x80 - HP di NewsPage
    'card-desktop': 'w_400,h_250,c_fit,f_auto,q_auto',        // 400x250 - Desktop di NewsPage  
    'detail-mobile': 'w_400,h_250,c_fit,f_auto,q_auto',       // 400x250 - HP di DetailNews
    'detail-desktop': 'w_800,h_450,c_fit,f_auto,q_auto',      // 800x450 - Desktop di DetailNews
    // Legacy support
    'large': 'w_400,h_250,c_fit,f_auto,q_auto',
    'small': 'w_80,h_80,c_fit,f_auto,q_auto'
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
    
    // ✅ SIMPLE TRANSFORM: Menggunakan c_fit untuk menghindari crop berlebihan
    let transform
    if (size === 'card-mobile') {
      transform = 'w_80,h_80,c_fit,f_auto,q_auto'  // 80x80 untuk mobile
    } else {
      transform = 'w_400,h_250,c_fit,f_auto,q_auto'  // 400x250 untuk desktop
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
    
    // ✅ GENERATE URL: Base URL + transform + public ID + cache busting
    const timestamp = Date.now()
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const finalUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}?v=${timestamp}&r=${randomSeed}`
    console.log(`🔗 [getNewsCloudinaryUrl] Final URL: ${finalUrl}`)
    
    return finalUrl
    
  } catch (error) {
    console.error('❌ [getNewsCloudinaryUrl] Error:', error)
    // Return placeholder jika gagal
    return `https://via.placeholder.com/${size === 'card-mobile' ? '80x80' : '1200x675'}`
  }
}

// ⭐ JADWAL CLOUDINARY URL FUNCTION - SIMPLIFIED
export function getJadwalCloudinaryUrl(filename, size = 'card-desktop', forceRefresh = false) {
  try {
    console.log(`📅 [getJadwalCloudinaryUrl] Processing: ${filename}, size: ${size}, forceRefresh: ${forceRefresh}`)
    
    // ✅ TRANSFORM MAPPING: Menggunakan c_fit untuk mencegah crop yang berlebihan
    let transform
    switch (size) {
      case 'card-mobile':
        transform = 'w_80,h_80,c_fit,f_auto,q_auto'  // 80x80 untuk mobile card
        break
      case 'card-desktop':
        transform = 'w_400,h_250,c_fit,f_auto,q_auto'  // 400x250 untuk desktop card
        break
      case 'detail-mobile':
        transform = 'w_400,h_250,c_fit,f_auto,q_auto'  // 400x250 untuk mobile detail
        break
      case 'detail-desktop':
        transform = 'w_800,h_450,c_fit,f_auto,q_auto'  // 800x450 untuk desktop detail
        break
      default:
        transform = 'w_400,h_250,c_fit,f_auto,q_auto'  // Default ke desktop card
    }
    
    console.log(`🎯 [getJadwalCloudinaryUrl] Using transform: ${transform}`)
    
    // ✅ FOLDER MAPPING: Sesuaikan dengan size
    const folderMap = {
      'card-mobile': CLOUDINARY_CONFIG.folders.jadwal.cardMobile,
      'card-desktop': CLOUDINARY_CONFIG.folders.jadwal.cardDesktop,
      'detail-mobile': CLOUDINARY_CONFIG.folders.jadwal.detailMobile,
      'detail-desktop': CLOUDINARY_CONFIG.folders.jadwal.detailDesktop
    }
    
    const folder = folderMap[size] || CLOUDINARY_CONFIG.folders.jadwal.cardDesktop
    console.log(`📁 [getJadwalCloudinaryUrl] Using folder: ${folder}`)
    
    // ✅ CLEAN FILENAME: Hapus extension
    let cleanFilename = filename
    if (filename.includes('.')) {
      cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    }
    
    console.log(`🧹 [getJadwalCloudinaryUrl] Clean filename: "${cleanFilename}"`)
    
    // ✅ GENERATE URL: Base URL + transform + folder + filename + cache busting
    let finalUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folder}/${cleanFilename}`
    
    // Add cache busting if needed
    if (forceRefresh) {
      const timestamp = Date.now()
      finalUrl += `?v=${timestamp}`
      console.log(`🔄 [getJadwalCloudinaryUrl] Added cache busting: v=${timestamp}`)
    }
    
    console.log(`🔗 [getJadwalCloudinaryUrl] Final URL: ${finalUrl}`)
    
    return finalUrl
    
  } catch (error) {
    console.error('❌ [getJadwalCloudinaryUrl] Error:', error)
    throw new Error(`Failed to generate Jadwal Cloudinary URL for ${filename}`)
  }
}

// ⭐ PERBAIKAN: getRenunganCloudinaryUrl yang BENAR
export function getRenunganCloudinaryUrl(filename, size = 'card-desktop') {
  try {
    console.log(`🙏 [getRenunganCloudinaryUrl] Processing: ${filename}, size: ${size}`)
    
    // ✅ HANDLE URL LENGKAP: Jika filename sudah URL lengkap dari upload, return as-is dengan transform
    if (filename && filename.startsWith('https://res.cloudinary.com/')) {
      console.log(`🔗 [getRenunganCloudinaryUrl] Full URL detected, extracting public ID...`)
      
      try {
        // Extract public ID dari URL
        const urlParts = filename.split('/')
        const uploadIndex = urlParts.findIndex(part => part === 'upload')
        
        if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
          // Skip transform part (v_xxxxx atau transformations)
          let publicIdPart = urlParts.slice(uploadIndex + 1).join('/')
          
          // Remove existing transformations if any
          if (publicIdPart.includes('/')) {
            const parts = publicIdPart.split('/')
            publicIdPart = parts[parts.length - 1] // Take the last part
          }
          
          // Remove extension
          const publicId = publicIdPart.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
          console.log(`📄 [getRenunganCloudinaryUrl] Extracted public ID: ${publicId}`)
          
          // Apply new transform
          const transform = CLOUDINARY_CONFIG.transforms[size] || CLOUDINARY_CONFIG.transforms['card-desktop']
          const resizedUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}`
          console.log(`🎯 [getRenunganCloudinaryUrl] Generated resized URL: ${resizedUrl}`)
          return resizedUrl
        }
        
        // Fallback: return original URL
        console.log(`⚠️ [getRenunganCloudinaryUrl] Could not extract public ID, returning original`)
        return filename
        
      } catch (error) {
        console.warn(`⚠️ [getRenunganCloudinaryUrl] URL parsing failed: ${error.message}`)
        return filename
      }
    }
    
    // ✅ HANDLE FILENAME: Process as filename
    console.log(`📄 [getRenunganCloudinaryUrl] Processing as filename...`)
    
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

// ⭐ PERBAIKAN: getGivingCloudinaryUrl untuk detail page only
export function getGivingCloudinaryUrl(filename, size = 'detail-desktop') {
  try {
    console.log(`💝 [getGivingCloudinaryUrl] Processing: ${filename}, size: ${size}`)
    
    // Map size ke yang ada untuk giving (hanya detail)
    let mappedSize = size
    if (size.includes('card')) {
      // Kalau ada yang request card, redirect ke detail
      mappedSize = size.includes('mobile') ? 'detail-mobile' : 'detail-desktop'
      console.log(`🔄 Mapping ${size} -> ${mappedSize} untuk giving`)
    }
    
    // Get transform parameters
    const transform = CLOUDINARY_CONFIG.transforms[mappedSize] || CLOUDINARY_CONFIG.transforms['detail-desktop']
    console.log(`🎯 Using transform: ${transform}`)
    
    // Get folder based on size
    const folder = CLOUDINARY_CONFIG.folders.giving[mappedSize] || CLOUDINARY_CONFIG.folders.giving.detailDesktop
    console.log(`📁 Using folder: ${folder}`)
    
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

// ⭐ PERBAIKAN: getChurchCloudinaryUrl untuk detail page only  
export function getChurchCloudinaryUrl(filename, size = 'detail-desktop') {
  try {
    console.log(`🏛️ [getChurchCloudinaryUrl] Processing: ${filename}, size: ${size}`)
    
    // ⭐ HARDCODED URLs untuk tentang-gereja (uploaded by user)
    if (filename === 'tentang-gereja' || filename === 'tentang-gereja.png') {
      if (size.includes('mobile') || size === 'detail-mobile' || size === 'card-mobile') {
        const mobileUrl = 'https://res.cloudinary.com/df74ywsgg/image/upload/v1753346300/myrajawali/church/detail-mobile/tentang-gereja.png'
        // ⭐ Add cache busting untuk force refresh
        const cacheBuster = `${mobileUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}`
        const finalMobileUrl = mobileUrl + cacheBuster
        console.log(`📱 Using hardcoded mobile URL: ${finalMobileUrl}`)
        return finalMobileUrl
      } else {
        const desktopUrl = 'https://res.cloudinary.com/df74ywsgg/image/upload/v1753346275/myrajawali/church/detail-desktop/tentang-gereja.png'
        // ⭐ Add cache busting untuk force refresh
        const cacheBuster = `${desktopUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}`
        const finalDesktopUrl = desktopUrl + cacheBuster
        console.log(`💻 Using hardcoded desktop URL: ${finalDesktopUrl}`)
        return finalDesktopUrl
      }
    }
    
    // ⭐ LEGACY URLs untuk visi-gereja & misi-gereja (ambil dari myrajawali/church)
    if (filename === 'visi-gereja' || filename === 'misi-gereja') {
      const legacyUrl = `https://res.cloudinary.com/df74ywsgg/image/upload/myrajawali/church/${filename}`
      console.log(`🏛️ Using legacy church URL: ${legacyUrl}`)
      return legacyUrl
    }
    
    // ⭐ Detect gembala vs church
    if (filename.includes('pdt-')) {
      // ✅ Gembala images masih menggunakan folder gembala
      const folderConfig = CLOUDINARY_CONFIG.folders.gembala
      console.log(`👨‍💼 Using gembala folder for: ${filename}`)
      
      // Clean filename - pastikan tidak ada double extension
      let cleanFilename = filename
      if (filename.includes('.')) {
        cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
      }
      
      // Try common extensions for gembala
      const extensions = ['jpg', 'png', 'jpeg', 'webp']
      for (const ext of extensions) {
        const urlWithExt = getCloudinaryImageUrl(folderConfig, `${cleanFilename}.${ext}`)
        console.log(`🔍 Trying gembala: ${urlWithExt}`)
        return urlWithExt
      }
      
      return getCloudinaryImageUrl(folderConfig, cleanFilename)
    } else {
      // ⭐ Church images - PRIORITASKAN folder detail
      // Map size ke yang ada untuk church (hanya detail)
      let mappedSize = size
      if (size.includes('card')) {
        // Kalau ada yang request card, redirect ke detail
        mappedSize = size.includes('mobile') ? 'detail-mobile' : 'detail-desktop'
        console.log(`🔄 Mapping ${size} -> ${mappedSize} untuk church`)
      }
      
      // Clean filename - pastikan tidak ada double extension
      let cleanFilename = filename
      if (filename.includes('.')) {
        cleanFilename = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
      }
      
      // ⭐ CONVERT kebab-case ke camelCase untuk key mapping
      let folderKey = mappedSize
      if (mappedSize === 'detail-mobile') folderKey = 'detailMobile'
      if (mappedSize === 'detail-desktop') folderKey = 'detailDesktop'
      
      // ⭐ PRIORITASKAN folder detail - generate URL langsung tanpa fallback
      if (CLOUDINARY_CONFIG.folders.church[folderKey]) {
        const folderConfig = CLOUDINARY_CONFIG.folders.church[folderKey]
        console.log(`🏛️ Using church ${mappedSize} folder: ${folderConfig}`)
        
        // Use transform for detail thumbnails
        const transform = CLOUDINARY_CONFIG.transforms[mappedSize] || CLOUDINARY_CONFIG.transforms['detail-desktop']
        console.log(`🎯 Using transform: ${transform}`)
        
        const directUrl = `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${folderConfig}/${cleanFilename}`
        console.log(`�️ Final church URL (prioritized detail): ${directUrl}`)
        return directUrl
      } else {
        // ⚠️ Fallback ke legacy hanya jika benar-benar tidak ada mapping detail
        console.warn(`⚠️ [getChurchCloudinaryUrl] No detail folder for ${mappedSize}, falling back to legacy`)
        const folderConfig = CLOUDINARY_CONFIG.folders.church.legacy
        const directUrl = getCloudinaryImageUrl(folderConfig, cleanFilename)
        console.log(`🖼️ Final church URL (legacy fallback): ${directUrl}`)
        return directUrl
      }
    }
    
  } catch (error) {
    console.error('❌ Error getting church image:', error)
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
    'ayat5',
    'ayat6',
    'ayat7',
    'ayat8',
    'ayat9',
    'ayat10'
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
export async function uploadToCloudinary(file, type, contentType = 'news') {
  // Support untuk berbagai content type
  const folderMaps = {
    news: {
      cardMobile: 'myrajawali/thumbnails/news/card-mobile',
      cardDesktop: 'myrajawali/thumbnails/news/card-desktop',
      detailMobile: 'myrajawali/thumbnails/news/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/news/detail-desktop'
    },
    renungan: {
      cardMobile: 'myrajawali/thumbnails/renungan/card-mobile',
      cardDesktop: 'myrajawali/thumbnails/renungan/card-desktop',
      detailMobile: 'myrajawali/thumbnails/renungan/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/renungan/detail-desktop'
    },
    jadwal: {
      cardMobile: 'myrajawali/thumbnails/jadwal/card-mobile',
      cardDesktop: 'myrajawali/thumbnails/jadwal/card-desktop',
      detailMobile: 'myrajawali/thumbnails/jadwal/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/jadwal/detail-desktop'
    },
    giving: {
      detailMobile: 'myrajawali/thumbnails/giving/detail-mobile',
      detailDesktop: 'myrajawali/thumbnails/giving/detail-desktop'
    }
  }

  // Auto-detect content type jika tidak disediakan
  if (contentType === 'news' && type && (
    type.includes('renungan') || 
    type.includes('devotional') ||
    (typeof window !== 'undefined' && window.location?.pathname?.includes('/renungan'))
  )) {
    contentType = 'renungan'
  }

  const folderMap = folderMaps[contentType]
  if (!folderMap || !folderMap[type]) {
    throw new Error(`Unsupported upload type: ${type} for content: ${contentType}`)
  }

  console.log(`📤 [uploadToCloudinary] Uploading ${contentType}/${type} to folder: ${folderMap[type]}`)

  // List of presets to try (fallback mechanism)
  const presetsToTry = [
    CLOUDINARY_CONFIG.uploadPreset,
    'ml_default',
    'unsigned_uploads',
    'default',
    'myrajawali_preset'
  ].filter(Boolean) // Remove undefined values

  let lastError = null

  // Try each preset until one works
  for (const preset of presetsToTry) {
    try {
      console.log(`🔧 [uploadToCloudinary] Trying preset: ${preset}`)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', preset)
      formData.append('folder', folderMap[type])

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
      console.log(`🌐 [uploadToCloudinary] Uploading to: ${uploadUrl}`)
      console.log(`📁 [uploadToCloudinary] Target folder: ${folderMap[type]}`)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      console.log(`📊 [uploadToCloudinary] Response status: ${response.status} with preset: ${preset}`)

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ [uploadToCloudinary] Upload successful with preset "${preset}":`, result.secure_url)
        return result.secure_url
      } else {
        const errorText = await response.text()
        console.warn(`⚠️ [uploadToCloudinary] Preset "${preset}" failed:`, errorText)
        
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || `Upload failed with status ${response.status}` }
        }
        
        lastError = error
        
        // If it's an API key error, don't try other presets
        if (errorText.includes('API key') || errorText.includes('Invalid API key')) {
          throw new Error(`API Key error: ${error.message}`)
        }
        
        // Continue to try next preset
        continue
      }
    } catch (fetchError) {
      console.warn(`⚠️ [uploadToCloudinary] Network/fetch error with preset "${preset}":`, fetchError)
      lastError = fetchError
      
      // If it's a network error, don't try other presets
      if (fetchError.message.includes('API key') || fetchError.message.includes('fetch')) {
        throw fetchError
      }
      
      // Continue to try next preset
      continue
    }
  }

  // If we get here, all presets failed
  console.error(`❌ [uploadToCloudinary] All presets failed. Last error:`, lastError)
  throw new Error(lastError?.message || 'All upload presets failed. Please check Cloudinary configuration.')
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
        return getGivingCloudinaryUrl(filename, size)
        
      case 'church':
      case 'gereja':
        return getChurchCloudinaryUrl(filename, size)
        
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
  for (let i = 1; i <= 10; i++) {
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

// ⭐ FORCE CLEAR CACHE FUNCTION
export function forceClearImageCache(imageUrl) {
  try {
    if (!imageUrl) return imageUrl
    
    // Remove old cache busters
    let cleanUrl = imageUrl.split('?')[0]
    
    // Add strong cache busters
    const timestamp = Date.now()
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const forceRefresh = `v=${timestamp}&r=${randomSeed}&cache=false`
    
    const finalUrl = `${cleanUrl}?${forceRefresh}`
    console.log(`🔄 [forceClearImageCache] Force refreshing: ${finalUrl}`)
    
    return finalUrl
    
  } catch (error) {
    console.error('❌ [forceClearImageCache] Error:', error)
    return imageUrl
  }
}