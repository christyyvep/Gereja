// Test script untuk menguji fungsi link di DetailNews
// Jalankan di browser console saat berada di halaman DetailNews

console.log('🧪 Testing Link Functions...')

// Simulasi data link dalam berbagai format
const testLinks = [
  // Format 1: String URL
  "https://example.com",
  "https://google.com",
  
  // Format 2: Object dengan description
  {
    url: "https://facebook.com",
    description: "Facebook Page"
  },
  {
    url: "https://instagram.com", 
    description: "Instagram Account"
  },
  
  // Format 3: Object tanpa description
  {
    url: "https://youtube.com"
  },
  {
    url: "https://twitter.com"
  },
  
  // Format 4: Invalid/empty
  "",
  null,
  undefined,
  {
    url: ""
  },
  {
    description: "No URL provided"
  }
]

// Test functions (copy dari DetailNews.vue)
function getLinkUrl(link) {
  if (typeof link === 'string') {
    return link.trim()
  }
  
  if (typeof link === 'object' && link !== null) {
    return link.url || link.link || link.href || ''
  }
  
  return ''
}

function getLinkText(link, index) {
  if (typeof link === 'string') {
    return `Link ${index + 1}`
  }
  
  if (typeof link === 'object' && link !== null) {
    const text = link.description || link.title || link.name || link.label || link.text
    if (text && text.trim()) {
      return text.trim()
    }
    
    const url = link.url || link.link || link.href
    if (url) {
      try {
        const domain = new URL(url).hostname.replace('www.', '')
        return domain || `Link ${index + 1}`
      } catch {
        return `Link ${index + 1}`
      }
    }
  }
  
  return `Link ${index + 1}`
}

function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false
  try {
    new URL(string)
    return true
  } catch {
    if (string.includes('.') && !string.includes(' ')) {
      return true
    }
    return false
  }
}

function getValidLinks(attachLinks) {
  if (!attachLinks || !Array.isArray(attachLinks)) {
    return []
  }
  
  return attachLinks.filter(link => {
    if (!link) return false
    
    if (typeof link === 'string') {
      return link.trim().length > 0 && isValidUrl(link.trim())
    }
    
    if (typeof link === 'object') {
      const url = link.url || link.link || link.href
      return url && typeof url === 'string' && url.trim().length > 0 && isValidUrl(url.trim())
    }
    
    return false
  })
}

// Run tests
console.log('📝 Test Results:')
console.log('================')

testLinks.forEach((link, index) => {
  console.log(`\nTest ${index + 1}:`, link)
  console.log('- URL:', getLinkUrl(link))
  console.log('- Text:', getLinkText(link, index))
  console.log('- Valid:', getValidLinks([link]).length > 0)
})

console.log('\n🎯 Valid Links Summary:')
const validLinks = getValidLinks(testLinks)
validLinks.forEach((link, index) => {
  console.log(`${index + 1}. "${getLinkText(link, index)}" -> ${getLinkUrl(link)}`)
})

console.log(`\n✅ Total valid links: ${validLinks.length} out of ${testLinks.length}`)
