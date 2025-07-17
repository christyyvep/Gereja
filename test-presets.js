/**
 * Quick Cloudinary Upload Test
 * Paste this in browser console to test upload presets
 */

const TEST_PRESETS = ['myrajawali_preset', 'myrajawali_app', 'ml_default'];

async function testUploadPresets() {
  console.log('🧪 Testing Cloudinary Upload Presets...');
  
  // Create tiny test image (1x1 pixel)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, 1, 1);
  
  canvas.toBlob(async (blob) => {
    for (const preset of TEST_PRESETS) {
      console.log(`\n🔄 Testing preset: ${preset}`);
      
      const formData = new FormData();
      formData.append('file', blob, 'test.png');
      formData.append('upload_preset', preset);
      formData.append('folder', 'myrajawali/test');
      
      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/df74ywsgg/image/upload', {
          method: 'POST',
          body: formData
        });
        
        console.log(`📡 ${preset}: Status ${response.status}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${preset}: SUCCESS!`);
          console.log(`🖼️ URL: ${result.secure_url}`);
          return preset; // Return successful preset
        } else {
          const error = await response.text();
          console.log(`❌ ${preset}: ${error.substring(0, 100)}...`);
        }
      } catch (err) {
        console.log(`❌ ${preset}: Network error -`, err.message);
      }
    }
    
    console.log('\n🚨 All presets failed! Check Cloudinary dashboard.');
  }, 'image/png');
}

// Auto-run
testUploadPresets();
