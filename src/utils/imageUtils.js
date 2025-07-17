// Image Utils - Fixed version for MyRajawali

// Import Cloudinary functions
import {
  getNewsCloudinaryUrl,
  getDailyVerseCloudinaryUrl
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
    
    // Cek field-field yang mungkin berisi thumbnail
    const possibleFields = [
      'thumbnail',
      'thumbnails.cardDesktop', 
      'thumbnails.cardMobile',
      'image',
      'imageUrl'
    ]
    
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
    
    // ✅ RESIZE berdasarkan size yang diminta
    if (thumbnailUrl.startsWith('http')) {
      // Kalau sudah URL lengkap, apply resize
      try {
        return getNewsCloudinaryUrl(thumbnailUrl, size)
      } catch (error) {
        console.warn(`⚠️ [getNewsThumbnail] Resize failed, using original: ${error.message}`)
        return thumbnailUrl
      }
    } else {
      // Kalau cuma filename, transform via cloudinary
      try {
        return getNewsCloudinaryUrl(thumbnailUrl, size)
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

// Other thumbnail functions
export function getScheduleThumbnail(schedule, size = 'card-desktop') {
  return getPlaceholder(size, 'Schedule')
}

export function getDevotionalThumbnail(devotional, size = 'card-desktop') {
  return getPlaceholder(size, 'Devotional')
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
    
    const verseNum = (verseData && verseData.verseNumber) ? verseData.verseNumber : ((verseData && verseData.id) ? (verseData.id % 5) + 1 : 1)
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
    
    // Rotate between ayat1.png to ayat5.png (5 different verses)
    const verseNumber = (dayOfYear % 5) + 1
    
    console.log(`📅 [getTodaysDailyVerseNumber] Day of year: ${dayOfYear}, Verse: ${verseNumber}`)
    return verseNumber
  } catch (error) {
    console.error('❌ [getTodaysDailyVerseNumber] Error:', error)
    return 1 // Default to ayat1
  }
}

export function getSpecificDailyVerse(verseNumber) {
  try {
    if (verseNumber < 1 || verseNumber > 5) {
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
