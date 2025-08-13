// Image Utils - Fixed version for MyRajawali

// Import Cloudinary functions
import {
  getNewsCloudinaryUrl,
  getDailyVerseCloudinaryUrl,
  getJadwalCloudinaryUrl,
  getGivingCloudinaryUrl,
  getChurchCloudinaryUrl,
  getRenunganCloudinaryUrl
} from './cloudinary'

// ✅ NEWS THUMBNAIL FUNCTION - SIMPLE VERSION  
export function getNewsThumbnail(news, size = 'card-desktop') {
  try {
    console.log(`🎯 [getNewsThumbnail] Processing "${news?.title || 'Unknown'}" for size "${size}"`)

    if (!news) {
      console.warn('⚠️ [getNewsThumbnail] No news object provided')
      return getPlaceholder(size, 'News')
    }

    // ✅ SIMPLE: Cari thumbnail dari berbagai field yang mungkin ada
    let thumbnailUrl = null
    
    // Cari thumbnail pertama yang ada
    if (news.thumbnail) {
      thumbnailUrl = news.thumbnail
    } else if (news.thumbnails?.cardDesktop) {
      thumbnailUrl = news.thumbnails.cardDesktop
    } else if (news.thumbnails?.cardMobile) {
      thumbnailUrl = news.thumbnails.cardMobile
    } else if (news.image) {
      thumbnailUrl = news.image
    } else if (news.imageUrl) {
      thumbnailUrl = news.imageUrl
    }
    
    console.log(`📁 [getNewsThumbnail] Found thumbnail:`, thumbnailUrl)
    
    if (!thumbnailUrl) {
      console.warn(`⚠️ [getNewsThumbnail] No thumbnail found, using placeholder`)
      return getPlaceholder(size, 'News')
    }
    
    // ✅ RESIZE berdasarkan size yang diminta tanpa excessive cache busting
    if (thumbnailUrl.startsWith('http')) {
      // Kalau sudah URL lengkap, apply resize
      try {
        const resizedUrl = getNewsCloudinaryUrl(thumbnailUrl, size)
        // Smart cache busting - hanya jika diperlukan
        return resizedUrl
      } catch (error) {
        console.warn(`⚠️ [getNewsThumbnail] Resize failed, using original: ${error.message}`)
        return thumbnailUrl
      }
    } else {
      // Kalau cuma filename, transform via cloudinary
      try {
        const transformedUrl = getNewsCloudinaryUrl(thumbnailUrl, size)
        // Smart cache busting - minimal dan hanya jika diperlukan
        return transformedUrl
      } catch (error) {
        console.warn(`⚠️ [getNewsThumbnail] Transform failed: ${error.message}`)
        return getPlaceholder(size, 'News')
      }
    }

  } catch (error) {
    console.error('❌ [getNewsThumbnail] Critical error:', error)
    return getPlaceholder(size, 'News')
  }
}

// ✅ SCHEDULE THUMBNAIL FUNCTION - FULL CLOUDINARY INTEGRATION
export function getScheduleThumbnail(schedule, size = 'card-desktop') {
  try {
    console.log(`📅 [getScheduleThumbnail] Processing "${schedule?.title}" (category: ${schedule?.category}) for size "${size}"`)

    if (!schedule || !schedule.category) {
      console.warn('⚠️ [getScheduleThumbnail] No schedule or category provided')
      return getPlaceholder(size, 'Schedule')
    }

    // 🎯 DAFTAR KATEGORI YANG DIDUKUNG CLOUDINARY
    const supportedCategories = [
      'raya', 'pelprap', 'doa-fajar', 'doa-puasa', 'pelnap',
      'pelwap', 'pelprip', 'pendalaman-alkitab', 'sektor-anugerah', 'sektor-tesalonika'
    ]

    // 🚀 SEMUA KATEGORI MENGGUNAKAN CLOUDINARY URL dengan force refresh untuk development
    if (supportedCategories.includes(schedule.category)) {
      console.log(`🎯 [getScheduleThumbnail] Category "${schedule.category}" detected - using Cloudinary URL`)
      
      try {
        // 🔄 OPTIMIZED: Hapus force refresh untuk production performance
        const forceRefresh = false // Changed from true to false
        const cloudinaryUrl = getJadwalCloudinaryUrl(schedule.category, size, forceRefresh)
        console.log(`✅ [getScheduleThumbnail] Generated Cloudinary URL: ${cloudinaryUrl}`)
        return cloudinaryUrl
      } catch (cloudinaryError) {
        console.warn(`⚠️ [getScheduleThumbnail] Cloudinary failed for ${schedule.category}: ${cloudinaryError.message}`)
        // Fallback ke placeholder dengan warna yang sesuai
        return getPlaceholderForSchedule(schedule.category, size)
      }
    }

    // 🎯 KATEGORI TIDAK DIKENAL → PLACEHOLDER
    console.warn(`⚠️ [getScheduleThumbnail] Unknown category: ${schedule.category}`)
    return getPlaceholderForSchedule(schedule.category, size)

  } catch (error) {
    console.error('❌ [getScheduleThumbnail] Critical error:', error)
    return getPlaceholder(size, 'Schedule')
  }
}

// ✅ HELPER: Generate placeholder berdasarkan ukuran yang tepat
function getPlaceholderForSize(size, text, bgColor = '#cccccc', textColor = '#333333') {
  let width, height
  
  // ✅ MAPPING SIZE yang tepat sesuai Cloudinary structure
  switch (size) {
    case 'card-mobile':
      width = 80
      height = 80
      break
    case 'card-desktop':
      width = 400
      height = 250
      break
    case 'detail-mobile':
      width = 400  // Untuk mobile detail, gunakan ukuran yang cukup besar
      height = 250
      break
    case 'detail-desktop':
      width = 800  // Untuk desktop detail, gunakan ukuran yang lebih besar
      height = 450
      break
    // Legacy support
    case 'small':
      width = 80
      height = 80
      break
    case 'large':
      width = 400
      height = 250
      break
    default:
      width = 400
      height = 250
  }
  
  return `https://via.placeholder.com/${width}x${height}/${bgColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodeURIComponent(text)}`
}

// ✅ HELPER: Generate placeholder untuk kategori jadwal
function getPlaceholderForSchedule(category, size) {
  const categoryMappings = {
    'raya': { color: '#F7DC6F', text: 'Ibadah Raya', shortText: 'IR' },
    'doa-fajar': { color: '#FF6B6B', text: 'Doa Fajar', shortText: 'DF' },
    'doa-puasa': { color: '#4ECDC4', text: 'Doa Puasa', shortText: 'DP' },
    'pelnap': { color: '#45B7D1', text: 'Pelnap', shortText: 'PN' },
    'pelwap': { color: '#FFEAA7', text: 'Pelwap', shortText: 'PW' },
    'pelprip': { color: '#DDA0DD', text: 'Pelprip', shortText: 'PR' },
    'pendalaman-alkitab': { color: '#98D8C8', text: 'Pendalaman Alkitab', shortText: 'PA' },
    'sektor-anugerah': { color: '#BB8FCE', text: 'Sektor Anugerah', shortText: 'SA' },
    'sektor-tesalonika': { color: '#85C1E9', text: 'Sektor Tesalonika', shortText: 'ST' }
  }
  
  const mapping = categoryMappings[category] || { color: '#cccccc', text: 'Unknown Category', shortText: '?' }
  
  // Untuk mobile, gunakan text pendek; untuk desktop/detail, gunakan text panjang
  const isMobile = size === 'card-mobile'
  const displayText = isMobile ? mapping.shortText : mapping.text
  
  console.log(`🔍 [getPlaceholderForSchedule] Category: "${category}" → Size: ${size} → Text: "${displayText}" → Color: ${mapping.color}`)
  
  return getPlaceholderForSize(size, displayText, mapping.color, '#FFFFFF')
}

export function getDevotionalThumbnail(devotional, size = 'card-desktop') {
  try {
    console.log(`🙏 [getDevotionalThumbnail] Processing "${devotional?.title || 'Unknown'}" for size "${size}"`)

    if (!devotional) {
      console.warn('⚠️ [getDevotionalThumbnail] No devotional object provided')
      return getPlaceholder(size, 'Devotional')
    }

    // ✅ CARI THUMBNAIL dari berbagai field yang mungkin ada
    let thumbnailUrl = null
    
    // Cari thumbnail pertama yang ada
    if (devotional.thumbnail) {
      thumbnailUrl = devotional.thumbnail
    } else if (devotional.thumbnails?.cardDesktop) {
      thumbnailUrl = devotional.thumbnails.cardDesktop
    } else if (devotional.thumbnails?.cardMobile) {
      thumbnailUrl = devotional.thumbnails.cardMobile
    } else if (devotional.thumbnails?.detailDesktop) {
      thumbnailUrl = devotional.thumbnails.detailDesktop
    } else if (devotional.thumbnails?.detailMobile) {
      thumbnailUrl = devotional.thumbnails.detailMobile
    } else if (devotional.image) {
      thumbnailUrl = devotional.image
    } else if (devotional.imageUrl) {
      thumbnailUrl = devotional.imageUrl
    }
    
    console.log(`📁 [getDevotionalThumbnail] Found thumbnail:`, thumbnailUrl)
    
    if (!thumbnailUrl) {
      console.warn(`⚠️ [getDevotionalThumbnail] No thumbnail found, using placeholder`)
      return getPlaceholder(size, 'Devotional')
    }
    
    // ✅ RESIZE berdasarkan size yang diminta tanpa excessive cache busting
    if (thumbnailUrl.startsWith('http')) {
      // Kalau sudah URL lengkap, apply resize
      try {
        const resizedUrl = getRenunganCloudinaryUrl(thumbnailUrl, size)
        // Smart cache - tidak perlu cache busting berlebihan
        return resizedUrl
      } catch (error) {
        console.warn(`⚠️ [getDevotionalThumbnail] Resize failed, using original: ${error.message}`)
        return thumbnailUrl
      }
    } else {
      // Kalau cuma filename, transform via cloudinary
      try {
        const transformedUrl = getRenunganCloudinaryUrl(thumbnailUrl, size)
        // Smart cache - minimal dan optimal
        return transformedUrl
      } catch (error) {
        console.warn(`⚠️ [getDevotionalThumbnail] Transform failed: ${error.message}`)
        return getPlaceholder(size, 'Devotional')
      }
    }

  } catch (error) {
    console.error('❌ [getDevotionalThumbnail] Critical error:', error)
    return getPlaceholder(size, 'Devotional')
  }
}

// 🎯 GIVING THUMBNAIL FUNCTION - FULL CLOUDINARY INTEGRATION
export function getGivingThumbnail(giving, size = 'card-desktop') {
  try {
    console.log(`💝 [getGivingThumbnail] Processing "${giving?.title || 'Unknown'}" for size "${size}"`)
    
    if (!giving) {
      console.warn('⚠️ [getGivingThumbnail] No giving object provided')
      return getPlaceholder(size, 'Giving')
    }
    
    // 🎯 GUNAKAN CLOUDINARY untuk Giving
    try {
      const cloudinaryUrl = getGivingCloudinaryUrl('giving', size)
      console.log(`✅ [getGivingThumbnail] Generated Cloudinary URL: ${cloudinaryUrl}`)
      return cloudinaryUrl
    } catch (cloudinaryError) {
      console.warn(`⚠️ [getGivingThumbnail] Cloudinary failed: ${cloudinaryError.message}`)
      return getPlaceholder(size, 'Giving')
    }
    
  } catch (error) {
    console.error('❌ [getGivingThumbnail] Critical error:', error)
    return getPlaceholder(size, 'Giving')
  }
}

// 🎯 ABOUT/CHURCH THUMBNAIL FUNCTION - FULL CLOUDINARY INTEGRATION
export function getAboutThumbnail(about, size = 'card-desktop') {
  try {
    console.log(`ℹ️ [getAboutThumbnail] Processing "${about?.title || about?.contentType || 'Unknown'}" for size "${size}"`)
    
    if (!about) {
      console.warn('⚠️ [getAboutThumbnail] No about object provided')
      return getPlaceholder(size, 'About')
    }
    
    // 🎯 DETECT content type dan gunakan Cloudinary yang sesuai
    if (about.contentType === 'church' || about.title === 'Tentang Gereja') {
      try {
        // ⭐ Map legacy size ke detail size yang benar
        let mappedSize = size
        if (size === 'large') {
          mappedSize = 'detail-desktop'
        } else if (size === 'small') {
          mappedSize = 'detail-mobile'
        }
        
        const cloudinaryUrl = getChurchCloudinaryUrl('tentang-gereja', mappedSize)
        console.log(`✅ [getAboutThumbnail] Generated Church Cloudinary URL (${size} -> ${mappedSize}): ${cloudinaryUrl}`)
        return cloudinaryUrl
      } catch (cloudinaryError) {
        console.warn(`⚠️ [getAboutThumbnail] Church Cloudinary failed: ${cloudinaryError.message}`)
        return getPlaceholder(size, 'About')
      }
    }
    
    // 🎯 Default fallback
    return getPlaceholder(size, 'About')
    
  } catch (error) {
    console.error('❌ [getAboutThumbnail] Critical error:', error)
    return getPlaceholder(size, 'About')
  }
}

// Daily verse function
export function getDailyVerseThumbnail(verseData, size = 'card-desktop') {
  try {
    if (verseData && verseData.images && verseData.images[size]) {
      return getDailyVerseCloudinaryUrl(verseData.images[size], size)
    }
    
    if (verseData && verseData.thumbnail) {
      return getDailyVerseCloudinaryUrl(verseData.thumbnail, size)
    }
    
    const verseNum = (verseData && verseData.verseNumber) ? verseData.verseNumber : ((verseData && verseData.id) ? (verseData.id % 10) + 1 : 1)
    const assetFilename = `ayat${verseNum}.png`
    return getDailyVerseCloudinaryUrl(assetFilename, size)
    
  } catch (error) {
    console.error('❌ [getDailyVerseThumbnail] Error:', error)
    return getPlaceholder(size, 'Daily Verse')
  }
}

// Daily verse utility functions for HomePage
export function getDailyVerseUrl() {
  try {
    const verseNumber = getTodaysDailyVerseNumber()
    const filename = `ayat${verseNumber}.png`
    return getDailyVerseCloudinaryUrl(filename, 'card-desktop')
  } catch (error) {
    console.error('❌ [getDailyVerseUrl] Error:', error)
    return getPlaceholder('card-desktop', 'Daily Verse')
  }
}

export function getTodaysDailyVerseNumber() {
  try {
    // Get today's date and create a consistent rotation
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
    
    // Rotate between ayat1.png to ayat10.png (10 different verses)
    const verseNumber = (dayOfYear % 10) + 1
    
    console.log(`📅 [getTodaysDailyVerseNumber] Day of year: ${dayOfYear}, Verse: ${verseNumber}`)
    return verseNumber
  } catch (error) {
    console.error('❌ [getTodaysDailyVerseNumber] Error:', error)
    return 1 // Default to ayat1
  }
}

export function getSpecificDailyVerse(verseNumber) {
  try {
    if (verseNumber < 1 || verseNumber > 10) {
      console.warn(`⚠️ [getSpecificDailyVerse] Invalid verse number: ${verseNumber}, using 1`)
      verseNumber = 1
    }
    
    const filename = `ayat${verseNumber}.png`
    return getDailyVerseCloudinaryUrl(filename, 'card-desktop')
  } catch (error) {
    console.error('❌ [getSpecificDailyVerse] Error:', error)
    return getPlaceholder('card-desktop', 'Daily Verse')
  }
}

// Placeholder function
export function getPlaceholder(size = 'card-desktop', label = 'Image') {
  const dimensions = {
    'card-mobile': { width: 80, height: 80 },
    'card-desktop': { width: 400, height: 300 },
    'detail-mobile': { width: 400, height: 300 },
    'detail-desktop': { width: 600, height: 400 }
  }
  
  const dim = dimensions[size] || dimensions['card-desktop']
  
  // Create SVG placeholder
  const svg = `<svg width="${dim.width}" height="${dim.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${dim.width}" height="${dim.height}" fill="#f0f0f0"/>
    <text x="${dim.width/2}" y="${dim.height/2}" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`
  
  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`
  } catch (error) {
    // Fallback if btoa fails
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
}

// Export additional utility functions
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url)
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) !== null
  } catch {
    return false
  }
}

export function extractFilenameFromUrl(url) {
  try {
    const urlParts = url.split('/')
    let filename = urlParts[urlParts.length - 1]
    
    // Remove query parameters
    if (filename.includes('?')) {
      filename = filename.split('?')[0]
    }
    
    // Remove file extension for Cloudinary
    if (filename.includes('.')) {
      filename = filename.split('.')[0]
    }
    
    return filename
  } catch (error) {
    console.error('❌ [extractFilenameFromUrl] Error:', error)
    return null
  }
}

// Feature icon function for FeatureBox component
export function getFeatureIconUrl(featureName) {
  try {
    // Map feature names to icon filenames
    const iconMapping = {
      'News': 'news.png',
      'Jadwal': 'jadwal.png',
      'Tentang Gereja': 'tentang-gereja.png',
      'Renungan': 'renungan.png',
      'Prayer Request': 'prayer.png',
      'Giving': 'giving.png',
      'Alkitab': 'alkitab.png'
    }
    
    const iconFilename = iconMapping[featureName] || 'news.png'
    
    // Return the filename only, FeatureBox will handle the require
    console.log(`[getFeatureIconUrl] ${featureName} -> ${iconFilename}`)
    return iconFilename
    
  } catch (error) {
    console.error('Error getting feature icon:', error)
    return 'news.png'
  }
}
