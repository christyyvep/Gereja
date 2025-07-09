// src/utils/imageUtils.js - PRODUCTION VERSION
// Image utilities for handling thumbnails, icons, and media assets

// ⭐ NEWS THUMBNAILS
export const getNewsThumbnail = (news, size = 'large') => {
  const extensions = ['png', 'jpg', 'jpeg', 'webp']
  const sizeFolder = size === 'small' ? 'small' : 'large'
  
  // STEP 1: Try thumbnail field first
  if (news?.thumbnail && news.thumbnail.trim() !== '') {
    // Try dynamic require for thumbnail files
    for (const ext of extensions) {
      try {
        const thumbnailPath = require(`@/assets/thumbnails/news/${sizeFolder}/${news.thumbnail}.${ext}`)
        return thumbnailPath
      } catch (error) {
        continue
      }
    }
    
    // Static imports for known files
    try {
      if (news.thumbnail === 'favoredcamp') {
        return require('@/assets/thumbnails/news/large/favoredcamp.png')
      }
      // Add more static imports here as needed
    } catch (error) {
      // Continue to next fallback
    }
  }
  
  // STEP 2: Try category-based thumbnails
  if (news?.category && news.category.trim() !== '') {
    for (const ext of extensions) {
      try {
        const categoryPath = require(`@/assets/thumbnails/news/${sizeFolder}/${news.category}.${ext}`)
        return categoryPath
      } catch (error) {
        continue
      }
    }
  }
  
  // STEP 3: Return placeholder
  const category = news?.category || news?.thumbnail || 'news'
  const width = size === 'small' ? 80 : 400
  const height = size === 'small' ? 80 : 300
  
  return createPlaceholderDataUrl(
    getCategoryText(category, 'NEWS'), 
    width, 
    height, 
    getCategoryColor(category, '#2563eb')
  )
}

// ⭐ SCHEDULE/JADWAL THUMBNAILS
export const getScheduleThumbnail = (schedule, size = 'large') => {
  const extensions = ['png', 'jpg', 'jpeg', 'webp']
  const sizeFolder = size === 'small' ? 'small' : 'large'
  
  // Try category first
  if (schedule?.category) {
    for (const ext of extensions) {
      try {
        const categoryPath = require(`@/assets/thumbnails/jadwal/${sizeFolder}/${schedule.category}.${ext}`)
        return categoryPath
      } catch (error) {
        continue
      }
    }
  }
  
  // Try thumbnail field
  if (schedule?.thumbnail) {
    for (const ext of extensions) {
      try {
        const thumbnailPath = require(`@/assets/thumbnails/jadwal/${sizeFolder}/${schedule.thumbnail}.${ext}`)
        return thumbnailPath
      } catch (error) {
        continue
      }
    }
  }
  
  // Return placeholder
  const category = schedule?.category || 'jadwal'
  const width = size === 'small' ? 80 : 400
  const height = size === 'small' ? 80 : 300
  
  return createPlaceholderDataUrl(
    getCategoryText(category, 'JADWAL'), 
    width, 
    height, 
    getCategoryColor(category, '#41442A')
  )
}

// ⭐ DEVOTIONAL/RENUNGAN THUMBNAILS
export const getDevotionalThumbnail = (devotional, size = 'large') => {
  const extensions = ['png', 'jpg', 'jpeg', 'webp']
  const sizeFolder = size === 'small' ? 'small' : 'large'
  
  // Try category first
  if (devotional?.category) {
    for (const ext of extensions) {
      try {
        const categoryPath = require(`@/assets/thumbnails/devotionals/${sizeFolder}/${devotional.category}.${ext}`)
        return categoryPath
      } catch (error) {
        continue
      }
    }
  }
  
  // Try thumbnail field
  if (devotional?.thumbnail) {
    for (const ext of extensions) {
      try {
        const thumbnailPath = require(`@/assets/thumbnails/devotionals/${sizeFolder}/${devotional.thumbnail}.${ext}`)
        return thumbnailPath
      } catch (error) {
        continue
      }
    }
  }
  
  // Return placeholder
  const category = devotional?.category || 'renungan'
  const width = size === 'small' ? 80 : 400
  const height = size === 'small' ? 80 : 300
  
  return createPlaceholderDataUrl(
    getCategoryText(category, 'RENUNGAN'), 
    width, 
    height, 
    getCategoryColor(category, '#7c3aed')
  )
}

// ⭐ GIVING/PERSEMBAHAN THUMBNAILS - SUPER SIMPLIFIED!
export const getGivingThumbnail = (giving, size = 'large') => {
  const extensions = ['png', 'jpg', 'jpeg', 'webp']
  
  // LANGSUNG CARI giving.* di folder giving/ (tanpa subfolder large/small)
  for (const ext of extensions) {
    try {
      const givingPath = require(`@/assets/thumbnails/giving/giving.${ext}`)
      return givingPath
    } catch (error) {
      continue
    }
  }
  
  // Return placeholder jika file tidak ditemukan
  const width = size === 'small' ? 80 : 400
  const height = size === 'small' ? 80 : 300
  
  return createPlaceholderDataUrl(
    'GIVING', 
    width, 
    height, 
    getCategoryColor('giving', '#10b981')
  )
}

// ⭐ FEATURE ICONS
export const getFeatureIconUrl = (iconName) => {
  const iconMapping = {
    'News': 'news',
    'Jadwal': 'jadwal', 
    'Giving': 'giving',
    'Tentang Gereja': 'tentang-gereja',
    'Renungan': 'renungan',
    'Prayer Request': 'prayer'
  }
  
  const iconFile = iconMapping[iconName] || iconName.toLowerCase().replace(/\s+/g, '')
  const extensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
  
  for (const ext of extensions) {
    try {
      const iconPath = require(`@/assets/icons/features/${iconFile}.${ext}`)
      return iconPath
    } catch (error) {
      continue
    }
  }
  
  return createEmojiDataUrl(getEmojiForFeature(iconName), 40)
}

// ⭐ DAILY VERSE
export const getDailyVerseUrl = (ayatNumber = null) => {
  let ayatIndex = ayatNumber
  
  if (!ayatIndex) {
    const today = new Date()
    const dayOfMonth = today.getDate()
    const totalAyatFiles = 5
    ayatIndex = ((dayOfMonth - 1) % totalAyatFiles) + 1
  }
  
  try {
    const ayatPath = require(`@/assets/daily-verse/ayat${ayatIndex}.png`)
    return ayatPath
  } catch (error) {
    for (let i = 1; i <= 5; i++) {
      if (i === ayatIndex) continue
      try {
        const fallbackPath = require(`@/assets/daily-verse/ayat${i}.png`)
        return fallbackPath
      } catch (error) {
        continue
      }
    }
    return createPlaceholderDataUrl('AYAT', 300, 200, '#7c3aed')
  }
}

// ⭐ UNIVERSAL THUMBNAIL GETTER - UPDATED!
export const getThumbnail = (category, item, size = 'large') => {
  if (category === 'news' || category === 'berita') {
    return getNewsThumbnail(item, size)
  } else if (category === 'schedule' || category === 'jadwal') {
    return getScheduleThumbnail(item, size)
  } else if (category === 'devotional' || category === 'renungan') {
    return getDevotionalThumbnail(item, size)
  } else if (category === 'giving' || category === 'persembahan') {
    return getGivingThumbnail(item, size)
  } else {
    return getScheduleThumbnail(item, size)
  }
}

// ⭐ ABOUT THUMBNAIL
/**
 * Get thumbnail for about/profile pages
 * @param {Object} data - Data object
 * @param {string} size - Size variant (small/large)
 * @returns {string} URL of the thumbnail
 */
export function getAboutThumbnail(data, size = 'small') {
  try {
    // If data has thumbnail URL, use it
    if (data?.thumbnailUrl) {
      return data.thumbnailUrl
    }
    
    // Default thumbnail based on size
    const defaultPath = `/assets/thumbnails/about/${size}/about.png`
    return defaultPath
  } catch (error) {
    console.error('❌ Error getting about thumbnail:', error)
    return '/assets/thumbnails/about/small/about.png'
  }
}

// ⭐ HELPER FUNCTIONS
const getEmojiForFeature = (iconName) => {
  const emojiMap = {
    'News': '📰', 'Jadwal': '📅', 'Giving': '💝',
    'Tentang Gereja': '📖', 'Renungan': '🙏', 'Prayer Request': '🤲',
    'news': '📰', 'jadwal': '📅', 'giving': '💝', 
    'tentang-gereja': '📖', 'renungan': '🙏', 'prayer': '🤲'
  }
  return emojiMap[iconName] || emojiMap[iconName?.toLowerCase()] || '❓'
}

const getCategoryText = (category, defaultText) => {
  const textMap = {
    'birthday': 'ULTAH', 'service': 'IBADAH', 'ibadah': 'IBADAH',
    'pelprap': 'PELPRAP', 'event': 'EVENT', 'pelatar': 'PELATAR',
    'pengumuman': 'INFO', 'kasih': 'KASIH', 'iman': 'IMAN',
    'pengharapan': 'HARAPAN', 'doa': 'DOA', 'news': 'NEWS',
    'jadwal': 'JADWAL', 'renungan': 'RENUNGAN', 'undangan': 'UNDANGAN',
    'favoredcamp': 'CAMP', 'camp': 'CAMP', 'perkemahan': 'CAMP',
    'giving': 'GIVING', 'persembahan': 'GIVING'
  }
  return textMap[category?.toLowerCase()] || defaultText
}

const getCategoryColor = (category, defaultColor) => {
  const colorMap = {
    'birthday': '#ec4899', 'service': '#f59e0b', 'ibadah': '#f59e0b', 
    'pelprap': '#10b981', 'event': '#3b82f6', 'pelatar': '#8b5cf6',
    'pengumuman': '#6366f1', 'kasih': '#f43f5e', 'iman': '#06b6d4',
    'pengharapan': '#84cc16', 'doa': '#a855f7', 'news': '#2563eb',
    'jadwal': '#41442A', 'renungan': '#7c3aed', 'undangan': '#8b5cf6',
    'favoredcamp': '#41442A', 'camp': '#41442A', 'perkemahan': '#41442A',
    'giving': '#10b981', 'persembahan': '#10b981'
  }
  return colorMap[category?.toLowerCase()] || defaultColor
}

const createEmojiDataUrl = (emoji, size = 40) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, size, size)
    
    ctx.font = `${size * 0.6}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, size / 2, size / 2)
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error creating emoji data URL:', error)
    return createPlaceholderDataUrl('?', size, size)
  }
}

const createPlaceholderDataUrl = (text, width, height, bgColor = '#41442A', textColor = 'white') => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    
    // Text
    const fontSize = Math.min(width, height) / 8
    ctx.font = `bold ${fontSize}px 'Inter', Arial, sans-serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error creating placeholder:', error)
    // Ultimate fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM0MTQ0MkEiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TkVXUzwvdGV4dD48L3N2Zz4='
  }
}