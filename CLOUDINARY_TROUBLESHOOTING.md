# Troubleshooting Cloudinary Upload

## Problem: "Gagal upload cardMobile: Upload gagal"

### Possible Causes:
1. **Missing Upload Preset**: Cloudinary requires an upload_preset for unsigned uploads
2. **Invalid API Configuration**: Wrong cloud name or API endpoint
3. **File Size/Type Issues**: File too large or invalid type
4. **Network/CORS Issues**: Connection problems

### Solutions:

#### 1. Check Cloudinary Upload Preset
1. Login to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to **Settings > Upload**
3. Look for upload preset named: `myrajawali_app`
4. If not exists, create new unsigned upload preset:
   - Name: `myrajawali_app`
   - Mode: `unsigned`
   - Enable: ✅ Unsigned
   - Folder: `myrajawali/` (optional)
   - Save preset

#### 2. Test Upload Configuration
Run this in browser console:
```javascript
// Test basic upload preset
fetch('https://api.cloudinary.com/v1_1/df74ywsgg/image/upload', {
  method: 'POST',
  body: new FormData().append('upload_preset', 'myrajawali_app')
}).then(r => console.log('Status:', r.status))
```

#### 3. Check File Requirements
- **File Type**: Only images (image/*)
- **File Size**: Max 10MB
- **Format**: JPG, PNG, WebP, GIF

#### 4. Debug Current Upload
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try uploading image in admin
4. Check for error messages:
   - `❌ [NewsModal] Upload failed`
   - `❌ [NewsModal] Cloudinary error response`

#### 5. Manual Test Upload
```javascript
// Run in browser console
async function manualTestUpload() {
  // Create file input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'myrajawali_app')
    formData.append('folder', 'myrajawali/test')
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/df74ywsgg/image/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Status:', response.status)
      const result = await response.text()
      console.log('Response:', result)
      
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  input.click()
}

manualTestUpload()
```

### Current Configuration:
- **Cloud Name**: `df74ywsgg`
- **Upload Preset**: `myrajawali_app`
- **API Endpoint**: `https://api.cloudinary.com/v1_1/df74ywsgg/image/upload`
- **Folder Structure**: `myrajawali/thumbnails/news/{type}`

### Next Steps:
1. ✅ Fixed upload_preset configuration in code
2. ⏳ Verify upload_preset exists in Cloudinary dashboard
3. ⏳ Test upload in browser
4. ⏳ Re-upload news thumbnails if needed

### Emergency Fallback:
If Cloudinary upload fails, you can temporarily:
1. Upload images to other hosting (imgur, etc.)
2. Use direct URLs in thumbnail fields
3. Fix Cloudinary config later
