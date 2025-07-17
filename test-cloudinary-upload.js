/**
 * Test Cloudinary Upload Configuration
 * Run this in browser console to verify upload_preset
 */

const CLOUDINARY_TEST_CONFIG = {
  cloudName: 'df74ywsgg',
  uploadPreset: 'myrajawali_app', // Must match Cloudinary settings
  apiUrl: 'https://api.cloudinary.com/v1_1/df74ywsgg/image/upload'
}

async function testCloudinaryUpload() {
  console.log('🧪 Testing Cloudinary Upload Configuration...')
  
  // Create a small test image (1x1 pixel PNG)
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  
  // Convert base64 to blob
  const response = await fetch(testImageData)
  const blob = await response.blob()
  
  const formData = new FormData()
  formData.append('file', blob, 'test.png')
  formData.append('upload_preset', CLOUDINARY_TEST_CONFIG.uploadPreset)
  formData.append('folder', 'myrajawali/test')
  
  console.log('📤 Uploading test image...')
  
  try {
    const uploadResponse = await fetch(CLOUDINARY_TEST_CONFIG.apiUrl, {
      method: 'POST',
      body: formData
    })
    
    console.log('📡 Response status:', uploadResponse.status)
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ Upload failed:', errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.error('❌ Error details:', errorJson)
        
        if (errorJson.error?.message?.includes('upload_preset')) {
          console.error('🚨 UPLOAD_PRESET ERROR: Please check Cloudinary settings')
          console.log('📋 Required steps:')
          console.log('1. Login to Cloudinary dashboard')
          console.log('2. Go to Settings > Upload')
          console.log('3. Add unsigned upload preset named: myrajawali_app')
          console.log('4. Enable unsigned uploads')
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response')
      }
      
      return false
    }
    
    const result = await uploadResponse.json()
    console.log('✅ Upload successful!')
    console.log('🖼️ Image URL:', result.secure_url)
    console.log('📁 Public ID:', result.public_id)
    
    return true
    
  } catch (error) {
    console.error('❌ Network error:', error)
    return false
  }
}

// Auto-run test if in browser
if (typeof window !== 'undefined') {
  window.testCloudinaryUpload = testCloudinaryUpload
  console.log('🧪 Cloudinary test ready. Run: testCloudinaryUpload()')
}

module.exports = { testCloudinaryUpload, CLOUDINARY_TEST_CONFIG }
