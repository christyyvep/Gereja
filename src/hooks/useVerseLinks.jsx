import React from 'react'
import { extractVerseReferences } from '../services/bibleApi'
import VerseLink from './VerseLink'

/**
 * Hook untuk mengkonversi teks yang mengandung referensi ayat
 * menjadi teks dengan link yang dapat diklik
 * @param {string} text - Teks yang akan diproses
 * @param {Object} options - Opsi kustomisasi
 * @returns {JSX.Element} Teks dengan referensi ayat yang dapat diklik
 */
export const useVerseLinks = (text, options = {}) => {
  const {
    linkClass = '',
    underline = true,
    highlightStyle = 'underline' // 'underline', 'highlight', 'border', 'icon'
  } = options

  if (!text || typeof text !== 'string') {
    return text
  }

  // Extract semua referensi ayat dari teks
  const references = extractVerseReferences(text)
  
  if (references.length === 0) {
    return text
  }

  // Split teks berdasarkan referensi dan buat element React
  let processedText = text
  let elements = []
  let lastIndex = 0

  references.forEach((reference, index) => {
    const refIndex = processedText.indexOf(reference, lastIndex)
    
    if (refIndex !== -1) {
      // Tambahkan teks sebelum referensi
      if (refIndex > lastIndex) {
        elements.push(processedText.substring(lastIndex, refIndex))
      }
      
      // Tambahkan VerseLink untuk referensi
      elements.push(
        <VerseLink
          key={`verse-${index}-${reference}`}
          reference={reference}
          className={`${linkClass} verse-link-${highlightStyle}`}
          underline={highlightStyle === 'underline' ? underline : false}
        >
          {reference}
        </VerseLink>
      )
      
      lastIndex = refIndex + reference.length
    }
  })

  // Tambahkan sisa teks setelah referensi terakhir
  if (lastIndex < processedText.length) {
    elements.push(processedText.substring(lastIndex))
  }

  return elements
}

/**
 * Komponen untuk automatically convert referensi ayat dalam teks
 * @param {Object} props - Props komponen
 * @param {string} props.text - Teks yang akan diproses
 * @param {string} props.className - CSS class untuk wrapper
 * @param {Object} props.linkOptions - Opsi untuk VerseLink
 */
export const AutoVerseLinks = ({ 
  text, 
  className = '', 
  linkOptions = {},
  as: Component = 'span'
}) => {
  const processedText = useVerseLinks(text, linkOptions)

  return (
    <Component className={className}>
      {processedText}
    </Component>
  )
}

/**
 * Utility function untuk detect apakah teks mengandung referensi ayat
 * @param {string} text - Teks yang akan dicek
 * @returns {boolean} True jika mengandung referensi ayat
 */
export const hasVerseReferences = (text) => {
  if (!text || typeof text !== 'string') {
    return false
  }
  
  const references = extractVerseReferences(text)
  return references.length > 0
}

/**
 * Utility function untuk mendapatkan semua referensi ayat dari teks
 * @param {string} text - Teks yang akan dianalisis
 * @returns {Array<string>} Array referensi ayat yang ditemukan
 */
export const getVerseReferencesFromText = (text) => {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  return extractVerseReferences(text)
}

export default { useVerseLinks, AutoVerseLinks, hasVerseReferences, getVerseReferencesFromText }
