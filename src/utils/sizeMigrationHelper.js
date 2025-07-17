// src/utils/sizeMigrationHelper.js
// Helper untuk migrasi dari size lama ke size baru secara bertahap

import { THUMBNAIL_SIZES } from './imageUtils'

// ⭐ MAPPING SIZE LAMA KE BARU BERDASARKAN CONTEXT
export function migrateThumbnailSize(legacySize, context = 'card', device = 'auto') {
  // Auto-detect device jika tidak dispesifikasi
  if (device === 'auto') {
    device = window.innerWidth <= 768 ? 'mobile' : 'desktop'
  }
  
  // Mapping berdasarkan legacy size + context + device
  const migrationMap = {
    // Legacy 'small' mapping
    small: {
      card: {
        mobile: THUMBNAIL_SIZES.CARD_MOBILE,
        desktop: THUMBNAIL_SIZES.CARD_MOBILE
      },
      detail: {
        mobile: THUMBNAIL_SIZES.DETAIL_MOBILE,
        desktop: THUMBNAIL_SIZES.DETAIL_MOBILE
      }
    },
    
    // Legacy 'large' mapping  
    large: {
      card: {
        mobile: THUMBNAIL_SIZES.CARD_MOBILE,
        desktop: THUMBNAIL_SIZES.CARD_DESKTOP
      },
      detail: {
        mobile: THUMBNAIL_SIZES.DETAIL_MOBILE,
        desktop: THUMBNAIL_SIZES.DETAIL_DESKTOP
      }
    }
  }
  
  // Get mapped size
  const mappedSize = migrationMap[legacySize]?.[context]?.[device]
  
  // Fallback to legacy behavior if mapping not found
  if (!mappedSize) {
    console.warn(`Size migration: Unknown legacy size "${legacySize}", using fallback`)
    return device === 'mobile' ? THUMBNAIL_SIZES.CARD_MOBILE : THUMBNAIL_SIZES.CARD_DESKTOP
  }
  
  return mappedSize
}

// ⭐ SMART SIZE DETECTOR untuk component yang tidak specify context
export function detectSmartThumbnailSize(layout, device = 'auto') {
  // Auto-detect device
  if (device === 'auto') {
    device = window.innerWidth <= 768 ? 'mobile' : 'desktop'
  }
  
  // Smart mapping berdasarkan layout
  const smartMap = {
    'mobile-list': THUMBNAIL_SIZES.CARD_MOBILE,
    'desktop-grid': THUMBNAIL_SIZES.CARD_DESKTOP,
    'desktop-list': THUMBNAIL_SIZES.CARD_DESKTOP,
    'detail-mobile': THUMBNAIL_SIZES.DETAIL_MOBILE,
    'detail-desktop': THUMBNAIL_SIZES.DETAIL_DESKTOP
  }
  
  return smartMap[layout] || (device === 'mobile' ? THUMBNAIL_SIZES.CARD_MOBILE : THUMBNAIL_SIZES.CARD_DESKTOP)
}

// ⭐ COMPONENT WRAPPER untuk smooth migration
export function createThumbnailSizeProps(props) {
  const { size, layout, context } = props
  
  // Jika sudah menggunakan new size system, langsung return
  if (Object.values(THUMBNAIL_SIZES).includes(size)) {
    return size
  }
  
  // Jika masih legacy size, migrate berdasarkan context
  if (['small', 'large'].includes(size)) {
    const detectedContext = context || (layout?.includes('detail') ? 'detail' : 'card')
    return migrateThumbnailSize(size, detectedContext)
  }
  
  // Fallback: detect dari layout
  return detectSmartThumbnailSize(layout)
}

// ⭐ CONSTANTS untuk reference
export const LEGACY_SIZE_MAPPING = {
  // Legacy sizes yang masih didukung
  LEGACY_SMALL: 'small',
  LEGACY_LARGE: 'large',
  
  // Context types
  CONTEXT_CARD: 'card',
  CONTEXT_DETAIL: 'detail',
  
  // Device types  
  DEVICE_MOBILE: 'mobile',
  DEVICE_DESKTOP: 'desktop'
}

// ⭐ DEBUG HELPER
export function debugSizeMapping(legacySize, context, device) {
  const newSize = migrateThumbnailSize(legacySize, context, device)
  
  console.log(`📐 Size Migration Debug:`)
  console.log(`   Legacy: ${legacySize}`)
  console.log(`   Context: ${context}`)
  console.log(`   Device: ${device}`)
  console.log(`   New Size: ${newSize}`)
  
  return newSize
}