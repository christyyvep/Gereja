# 🔧 Troubleshooting: Tidak Bisa Masuk Mode Admin

## Masalah yang Ditemukan

Dari screenshot yang diberikan, terlihat:
1. ✅ User sudah login (tombol "Admin" merah terlihat)
2. ❌ Halaman admin dashboard kosong/blank
3. ⚠️ Ada error di console terkait authGuard.js

## Penyebab Masalah

### 1. AuthGuard Configuration Error
File `src/middleware/authGuard.js` tidak memiliki konfigurasi `adminRoles` yang diperlukan.

**✅ SUDAH DIPERBAIKI:** Ditambahkan konfigurasi:
```javascript
const securityConfig = {
  adminRoles: ['admin', 'super_admin'],
  moderatorRoles: ['admin', 'super_admin', 'moderator']
}
```

### 2. Kemungkinan Session Issue
User mungkin login tetapi role tidak tersimpan dengan benar di localStorage.

### 3. Component Loading Issue
AdminDashboard component mungkin memiliki dependency yang belum ter-load.

## Solusi Step-by-Step

### Step 1: Restart Development Server
```bash
# Hentikan server (Ctrl+C) lalu jalankan ulang
cd "c:\S.KOM 2025\myrajawali-app"
npm run serve
```

### Step 2: Clear Browser Cache
1. Buka Developer Tools (F12)
2. Right-click pada refresh button
3. Pilih "Empty Cache and Hard Reload"

### Step 3: Debug Authentication Status
1. Buka Developer Tools (F12)
2. Go to Console tab
3. Copy dan paste script berikut:

```javascript
// Check current auth status
const userData = localStorage.getItem('myrajawali_user');
const sessionData = localStorage.getItem('myrajawali_session');

console.log('User Data:', userData);
console.log('Session Data:', sessionData);

if (userData) {
  const user = JSON.parse(userData);
  console.log('Current User Role:', user.role);
  console.log('Is Admin:', user.role === 'admin');
}
```

### Step 4: Manual Admin Login (Jika Diperlukan)
Jika masih tidak bisa masuk, gunakan quick fix di console:

```javascript
// Quick admin login
const adminUser = {
  userId: 'admin-001',
  nama: 'Administrator', 
  role: 'admin',
  email: 'admin@myrajawali.com',
  isActive: true
};

const session = {
  expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
  loginAt: Date.now(),
  userId: adminUser.userId
};

localStorage.setItem('myrajawali_user', JSON.stringify(adminUser));
localStorage.setItem('myrajawali_session', JSON.stringify(session));

// Reload page
window.location.reload();
```

### Step 5: Verify Database Admin User
1. Buka Firebase Console
2. Go to Firestore Database
3. Check collection `jemaat`
4. Pastikan ada user dengan:
   - `nama: "admin"` 
   - `role: "admin"`
   - `isActive: true`

### Step 6: Manual Database Fix (Jika Diperlukan)
Jika tidak ada admin user di database:

```javascript
// Run in console pada halaman app
import { db } from './src/services/firebase-security.js';
import { doc, setDoc } from 'firebase/firestore';

const adminData = {
  nama: 'admin',
  role: 'admin', 
  email: 'admin@myrajawali.com',
  isActive: true,
  isRegistered: true,
  password: 'hashed-password-here', // Use proper hash
  createdAt: new Date(),
  createdBy: 'system'
};

await setDoc(doc(db, 'jemaat', 'admin-001'), adminData);
console.log('Admin user created');
```

## Quick Access URLs

Setelah fix, coba akses langsung:
- Admin Dashboard: `http://localhost:8080/admin/dashboard`
- Kelola Jemaat: `http://localhost:8080/admin/kelola-jemaat`

## Test Script Files

Saya sudah membuat beberapa file helper:

1. **`test-admin-auth.js`** - Test authentication status
2. **`debug-auth.js`** - Debug auth functions
3. **`check-admin.js`** - Check admin user in database

Copy salah satu file dan jalankan di browser console untuk debugging.

## Expected Result

Setelah fix:
1. ✅ Login sebagai admin berhasil
2. ✅ Bisa mengakses `/admin/dashboard`
3. ✅ Menu sidebar admin muncul
4. ✅ Bisa mengakses "Kelola Data Jemaat"

## Jika Masih Bermasalah

1. **Check Console Errors**: Lihat error di F12 > Console
2. **Check Network Tab**: Pastikan tidak ada failed requests
3. **Restart Browser**: Tutup dan buka ulang browser
4. **Check Firestore Rules**: Pastikan admin punya akses read/write

## Kontak Support

Jika masih tidak bisa, berikan screenshot dari:
1. Browser console (F12 > Console)
2. Network tab saat load admin page
3. Application tab > LocalStorage content
