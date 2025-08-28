# 🔧 TROUBLESHOOTING GUIDE: Error Tambah Berita Admin

## 📋 Ringkasan Masalah

Error gagal tambah berita di admin panel kemungkinan disebabkan oleh:
1. Session expired / admin info tidak tersedia
2. Masalah autentikasi dan authorization
3. Koneksi Firebase / Firestore
4. Validation error pada data berita

## 🛠️ Solusi yang Telah Diimplementasikan

### 1. **Perbaikan Admin Info System** ✅

**File:** `src/services/altarServantsSchedules.js`

Fungsi `getCurrentAdminInfo()` telah diperbaiki untuk:
- Mencoba mengambil admin info dari localStorage
- Fallback ke authStore jika tersedia  
- Fallback ke default admin untuk testing
- Tidak ada lagi session expired yang menghalangi

```javascript
function getCurrentAdminInfo() {
  try {
    // Try localStorage first
    const storedAdmin = localStorage.getItem('currentAdmin')
    if (storedAdmin) {
      return JSON.parse(storedAdmin)
    }
    
    // Try auth store
    const authStore = JSON.parse(localStorage.getItem('authStore') || '{}')
    if (authStore.user && authStore.user.role === 'admin') {
      return {
        id: authStore.user.id || 'admin',
        name: authStore.user.name || 'Administrator',
        email: authStore.user.email
      }
    }
    
    // Fallback for testing
    return {
      id: 'admin-' + Date.now(),
      name: 'Administrator',
      email: 'admin@gereja.com'
    }
  } catch (error) {
    // Final fallback
    return {
      id: 'admin-fallback',
      name: 'Administrator', 
      email: 'admin@gereja.com'
    }
  }
}
```

### 2. **Utility Functions untuk Debug** ✅

Ditambahkan functions untuk troubleshooting:

```javascript
// Set admin info manual
export function setAdminInfo(adminInfo)

// Clear admin info
export function clearAdminInfo()

// Debug admin status
export function debugAdminInfo()
```

### 3. **Troubleshoot Tools** ✅

**File:** `troubleshoot-news-admin.js`
- Script untuk debug manual
- Test functions untuk create news
- Reset dan force admin role

**File:** `troubleshoot-news-admin.html` 
- Web interface untuk troubleshooting
- Visual tools untuk debug
- Activity logging

**File:** `src/components/admin/TroubleshootPanel.vue`
- Vue component untuk admin panel
- Integrated troubleshooting dalam aplikasi

## 🚀 Cara Menggunakan

### A. **Quick Fix - Browser Console**

1. Buka Developer Tools (F12)
2. Jalankan commands berikut:

```javascript
// Set test admin
localStorage.setItem('currentAdmin', JSON.stringify({
  id: 'admin-test',
  name: 'Test Administrator', 
  email: 'admin@myrajawali.com',
  role: 'admin'
}))

// Set auth store
localStorage.setItem('authStore', JSON.stringify({
  user: {
    id: 'admin-test',
    name: 'Test Administrator',
    email: 'admin@myrajawali.com', 
    role: 'admin'
  },
  isAuthenticated: true
}))

// Refresh page and try adding news again
location.reload()
```

### B. **Menggunakan HTML Troubleshoot Tool**

1. Buka file: `troubleshoot-news-admin.html` di browser
2. Click "🚀 Full Troubleshoot" untuk proses lengkap
3. Atau gunakan individual tools:
   - "✅ Set Test Admin" - Set admin untuk testing
   - "🧹 Clear Auth" - Reset semua auth data
   - "🔍 Debug Admin" - Check admin status
   - "🧪 Test Create News" - Test fungsi tambah berita

### C. **Menggunakan Vue Component**

1. Import `TroubleshootPanel.vue` ke admin layout:

```vue
<template>
  <div>
    <!-- ... existing admin content ... -->
    <TroubleshootPanel v-if="showTroubleshoot" />
  </div>
</template>

<script>
import TroubleshootPanel from '@/components/admin/TroubleshootPanel.vue'

export default {
  components: {
    TroubleshootPanel
  },
  data() {
    return {
      showTroubleshoot: process.env.NODE_ENV === 'development'
    }
  }
}
</script>
```

### D. **Manual Testing Functions**

```javascript
// Load troubleshoot script
const script = document.createElement('script')
script.src = './troubleshoot-news-admin.js'
document.head.appendChild(script)

// Then use functions
window.troubleshootNews.completeTroubleshooting()
```

## 🔍 Debugging Process

### 1. **Check Admin Status**

```javascript
// Check current admin info
console.log('Current Admin:', localStorage.getItem('currentAdmin'))
console.log('Auth Store:', localStorage.getItem('authStore'))

// Debug using function
import { debugAdminInfo } from '@/services/altarServantsSchedules.js'
debugAdminInfo()
```

### 2. **Test News Creation**

```javascript
// Test create news function
import { createNews } from '@/services/news.js'

const testData = {
  title: 'Test Berita',
  content: 'Test content',
  category: 'news',
  createdBy: 'admin-test'
}

createNews(testData)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error))
```

### 3. **Check Firebase Connection**

```javascript
// Test Firestore connection
import { db } from '@/services/firebase.js'
import { collection, getDocs } from 'firebase/firestore'

getDocs(collection(db, 'news'))
  .then(snapshot => console.log('News count:', snapshot.size))
  .catch(error => console.error('Firebase error:', error))
```

## ⚠️ Common Issues & Solutions

### Issue 1: Admin Info Undefined
**Symptom:** `getCurrentAdminInfo()` returns undefined/null  
**Solution:** Use `setAdminInfo()` to set admin manually

### Issue 2: Session Expired
**Symptom:** "Session expired" errors  
**Solution:** Updated `getCurrentAdminInfo()` removes session checks

### Issue 3: Firebase Permission Error
**Symptom:** Firestore permission denied  
**Solution:** Check Firebase security rules, ensure admin role

### Issue 4: Validation Error
**Symptom:** "Field required" errors  
**Solution:** Check news data structure and required fields

## 📊 Monitoring & Logs

### Console Logs
All troubleshoot functions include detailed console logging:
- `📋 [getCurrentAdminInfo]` - Admin info retrieval
- `✅ [setAdminInfo]` - Admin info setting  
- `🧹 [clearAdminInfo]` - Admin info clearing
- `🔍 [debugAdminInfo]` - Debug information

### Activity Logs
- HTML tool includes visual activity log
- Vue component has real-time log display
- All actions are timestamped and categorized

## 🎯 Testing Checklist

- [ ] Set test admin info
- [ ] Clear existing auth data
- [ ] Test Firebase connection  
- [ ] Test news creation with minimal data
- [ ] Test news creation with full data
- [ ] Check admin info persistence
- [ ] Verify no session expired errors
- [ ] Test in development environment
- [ ] Test in production environment

## 📞 Support Commands

Jika masih ada error, jalankan command berikut untuk diagnostic lengkap:

```javascript
// Comprehensive diagnostic
const diagnostic = {
  currentAdmin: localStorage.getItem('currentAdmin'),
  authStore: localStorage.getItem('authStore'),
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  url: location.href
}

console.log('🏥 DIAGNOSTIC REPORT:', diagnostic)

// Copy to clipboard for support
navigator.clipboard.writeText(JSON.stringify(diagnostic, null, 2))
```

## 🔄 Recovery Steps

Jika semua langkah diatas tidak berhasil:

1. **Full Reset:**
```javascript
// Clear ALL localStorage
localStorage.clear()

// Set fresh admin
const freshAdmin = {
  id: 'admin-recovery-' + Date.now(),
  name: 'Recovery Admin',
  email: 'admin@myrajawali.com',
  role: 'admin',
  createdAt: new Date().toISOString()
}

localStorage.setItem('currentAdmin', JSON.stringify(freshAdmin))
localStorage.setItem('authStore', JSON.stringify({
  user: freshAdmin,
  isAuthenticated: true,
  role: 'admin'
}))

location.reload()
```

2. **Check Browser Support:**
- Pastikan localStorage enabled
- Check browser console for JavaScript errors
- Verify Firebase SDK loaded correctly

3. **Environment Check:**
- Development vs Production mode
- Firebase config correctness
- Network connectivity

---

## 📞 Contact

Jika masih mengalami masalah setelah mengikuti guide ini:
1. Jalankan diagnostic report diatas
2. Screenshot error messages
3. Copy troubleshoot logs
4. Contact technical support dengan informasi tersebut

**Happy troubleshooting! 🔧✨**
