# 🧪 PANDUAN TESTING AUTENTIKASI MYRAJAWALI

## Status Perbaikan Terkini ✅

### Masalah yang Sudah Diperbaiki:
1. ✅ **Loop Login**: User yang sudah login tidak lagi diarahkan kembali ke halaman login
2. ✅ **ESLint Errors**: Semua error terkait variabel yang tidak terpakai sudah diperbaiki
3. ✅ **Tampilan Admin**: Halaman KelolaJemaat.vue sudah responsif dan tidak terlalu lebar
4. ✅ **Route Guards**: Halaman login hanya bisa diakses jika user belum login
5. ✅ **Session Management**: Session management yang lebih robust dan aman
6. ✅ **Logout Process**: Proses logout yang benar-benar membersihkan session

### File yang Dimodifikasi:
- `src/services/auth-hybrid.js` - Service autentikasi utama
- `src/views/LoginPage.vue` - Halaman login dengan guard
- `src/views/AccountPage.vue` - Proses logout yang diperbaiki
- `src/views/admin/KelolaJemaat.vue` - Tampilan yang responsif
- `src/App.vue` - Session checking yang optimal
- `src/stores/userStore.js` - State management user
- `src/middleware/authGuard.js` - Route protection
- `src/main.js` - Debug tools

## Cara Testing Manual 🔍

### 1. Testing Basic Flow
```bash
# 1. Buka aplikasi di browser
http://localhost:8080

# 2. Cek console browser (F12) untuk melihat debug logs
```

### 2. Testing Login Protection
1. **Akses halaman login tanpa login**:
   - Buka `http://localhost:8080/login`
   - Harus bisa diakses

2. **Login dengan user valid**:
   - Masukkan nama dan password
   - Setelah login sukses, harus redirect ke home
   - Cek console untuk debug logs

3. **Coba akses login setelah login**:
   - Buka `http://localhost:8080/login` lagi
   - Harus redirect ke home (tidak bisa akses login)

### 3. Testing Admin Access
1. **Login sebagai admin**:
   - Login dengan akun admin
   - Akses `http://localhost:8080/admin`
   - Harus bisa masuk

2. **Login sebagai user biasa**:
   - Login dengan akun user
   - Akses `http://localhost:8080/admin`
   - Harus redirect atau ditolak

### 4. Testing Logout
1. **Logout normal**:
   - Klik logout di halaman Account
   - Harus redirect ke home
   - Session harus terhapus

2. **Coba akses protected route setelah logout**:
   - Akses `http://localhost:8080/admin`
   - Harus redirect ke login

## Testing dengan Console Browser 🛠️

### Script Testing Otomatis
1. Buka Developer Tools (F12)
2. Copy paste script dari `test-auth-scenarios.js`
3. Jalankan: `runAuthTests()`

### Script Helper Manual
1. Copy paste script dari `auth-test-helpers.js`
2. Gunakan command yang tersedia:

```javascript
// Cek status autentikasi saat ini
checkAuthState()

// Buat session test
createTestSession()                    // User biasa
createTestSession('admin', 'admin')    // Admin

// Test navigasi route
testRoute('/login')    // Test akses login
testRoute('/admin')    // Test akses admin

// Force logout
forceLogout()

// Run all tests
runAuthTests()
```

## Skenario Testing Komprehensif 📋

### Skenario 1: Fresh User (Belum Login)
```
1. Buka aplikasi → Harus di home
2. Akses /login → Harus bisa masuk
3. Akses /admin → Harus redirect ke login
4. Login dengan kredensial valid → Sukses login
5. Auto redirect ke home → Tidak loop ke login
```

### Skenario 2: User Sudah Login
```
1. Refresh browser → Session tetap ada
2. Akses /login → Harus redirect ke home
3. Akses protected routes → Harus bisa masuk
4. Logout → Session terhapus, redirect ke home
5. Akses protected routes → Redirect ke login
```

### Skenario 3: Session Expired
```
1. Login normal → Session dibuat
2. Manual hapus/corrupt session di localStorage
3. Akses protected route → Harus redirect ke login
4. Login ulang → Harus sukses
```

### Skenario 4: Multi-Tab Testing
```
1. Buka 2 tab aplikasi
2. Login di tab 1 → Tab 2 juga harus recognize login
3. Logout di tab 1 → Tab 2 juga harus logout (refresh)
```

## Monitoring & Debug 📊

### Console Debug Messages
- `🔐 [AuthHybrid]` - Auth service messages
- `👤 [UserStore]` - User state messages  
- `🛡️ [AuthGuard]` - Route guard messages
- `🏠 [App]` - App component messages

### LocalStorage Keys
- `myrajawali_session` - Session data
- `myrajawali_user` - User data
- `recentLogin` - Recent login flag (sessionStorage)

### Error Indicators
- ❌ Loop redirect ke login
- ❌ Bisa akses login setelah login
- ❌ Session tidak terhapus setelah logout
- ❌ Protected routes bisa diakses tanpa login

## Troubleshooting 🔧

### Problem: Masih loop ke login
**Solution:**
```javascript
// Clear all storage dan refresh
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Problem: Session tidak terhapus
**Solution:**
```javascript
// Force clear session
forceLogout()
```

### Problem: Route guard tidak bekerja
**Solution:**
```javascript
// Cek console untuk error messages
// Cek router configuration di browser devtools
```

## Expected Behavior ✅

### ✅ BENAR:
- User belum login → bisa akses `/login`
- User sudah login → redirect dari `/login` ke `/home`
- User logout → session terhapus, bisa akses `/login` lagi
- Admin → bisa akses semua routes
- User biasa → tidak bisa akses `/admin`

### ❌ SALAH:
- User sudah login → masih bisa akses `/login`
- User logout → session masih ada
- Protected routes → bisa diakses tanpa login
- Loop redirect yang tidak berakhir

## Status Development 📈

- ✅ Authentication flow sudah stabil
- ✅ Route guards sudah berfungsi
- ✅ Session management sudah robust
- ✅ UI/UX sudah responsive
- ✅ Error handling sudah komprehensif
- ✅ Debug tools tersedia

## Next Steps 🚀

1. **Performance Testing**: Test dengan load tinggi
2. **Security Testing**: Test dengan berbagai attack vectors
3. **Mobile Testing**: Test di berbagai device mobile
4. **Integration Testing**: Test dengan Firebase backend
5. **User Acceptance Testing**: Test dengan real users

---

**Catatan**: Semua testing sebaiknya dilakukan di environment development dulu sebelum di-deploy ke production.
