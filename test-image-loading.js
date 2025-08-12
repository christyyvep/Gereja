// Image Loading Fix untuk Cross-Device Compatibility
// Paste this in browser console to test image loading

(async function testImageLoading() {
  console.log('🖼️ Testing Image Loading Across Devices...')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check current Cloudinary URLs
    console.log('📡 Step 1: Testing current Cloudinary URLs...')
    
    const testUrls = [
      // Test renungan images with different transformations
      'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_fit,f_auto,q_auto/sample-renungan',
      'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_fill,f_auto,q_auto/sample-renungan',
      'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_scale,f_auto,q_auto/sample-renungan',
      
      // Test with different formats
      'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_fill,f_webp,q_auto/sample-renungan',
      'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_fill,f_jpg,q_auto/sample-renungan'
    ]
    
    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i]
      console.log(`🧪 Testing URL ${i + 1}: ${url}`)
      
      try {
        const response = await fetch(url, { method: 'HEAD' })
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        console.log(`   Content-Length: ${response.headers.get('content-length') || 'N/A'}`)
        console.log(`   Cache-Control: ${response.headers.get('cache-control') || 'N/A'}`)
        
        if (response.ok) {
          console.log(`   ✅ Image loads successfully`)
        } else {
          console.log(`   ❌ Image failed to load`)
        }
      } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`)
      }
      console.log('')
    }
    
    // Test 2: Check device capabilities
    console.log('📱 Step 2: Checking device capabilities...')
    
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'Not available'
    }
    
    console.log('Device Info:', deviceInfo)
    
    // Test 3: WebP support
    console.log('🎨 Step 3: Testing WebP support...')
    
    const webpSupport = await new Promise((resolve) => {
      const webp = new Image()
      webp.onload = webp.onerror = () => resolve(webp.height === 2)
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
    
    console.log(`WebP Support: ${webpSupport ? '✅ Supported' : '❌ Not supported'}`)
    
    // Test 4: Create test image elements
    console.log('🖼️ Step 4: Testing image element creation...')
    
    const testContainer = document.createElement('div')
    testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 200px;
      height: 120px;
      background: white;
      border: 2px solid #333;
      padding: 10px;
      z-index: 10000;
      font-size: 12px;
    `
    
    const testImg = document.createElement('img')
    testImg.style.cssText = `
      width: 100%;
      height: 80px;
      object-fit: cover;
      border: 1px solid #ccc;
    `
    
    const testLabel = document.createElement('div')
    testLabel.textContent = 'Testing image load...'
    testLabel.style.cssText = 'margin-top: 5px; font-size: 10px;'
    
    testContainer.appendChild(testImg)
    testContainer.appendChild(testLabel)
    document.body.appendChild(testContainer)
    
    // Test different URL formats
    const testImageUrl = webpSupport 
      ? 'https://res.cloudinary.com/df74ywsgg/image/upload/w_200,h_120,c_fill,f_webp,q_auto/sample-renungan'
      : 'https://res.cloudinary.com/df74ywsgg/image/upload/w_200,h_120,c_fill,f_jpg,q_auto/sample-renungan'
    
    testImg.onload = () => {
      testLabel.textContent = '✅ Image loaded successfully!'
      testLabel.style.color = 'green'
      console.log('✅ Test image loaded successfully in DOM')
    }
    
    testImg.onerror = () => {
      testLabel.textContent = '❌ Image failed to load'
      testLabel.style.color = 'red'
      console.log('❌ Test image failed to load in DOM')
    }
    
    testImg.src = testImageUrl
    console.log(`Testing image URL: ${testImageUrl}`)
    
    // Remove test container after 10 seconds
    setTimeout(() => {
      document.body.removeChild(testContainer)
      console.log('🧹 Test container removed')
    }, 10000)
    
    console.log('🎯 Image loading test completed!')
    console.log('💡 Recommendations:')
    console.log('   1. Use c_fill instead of c_fit for better coverage')
    console.log('   2. Use WebP format when supported')
    console.log('   3. Add proper fallbacks for failed images')
    console.log('   4. Consider lazy loading for better performance')
    
  } catch (error) {
    console.error('❌ Image loading test failed:', error)
  }
})()

console.log('🚀 Image loading test started...')
