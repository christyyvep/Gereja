# 🤖 Setup Penerima Notifikasi Telegram

## 📍 Situasi Saat Ini
- **Penerima:** Anitha Gerungan (Private Chat)
- **Chat ID:** 5929124699
- **Status:** Semua login/logout masuk ke akun pribadi Anitha

## 🔄 Opsi Perubahan Penerima

### **OPSI 1: Grup Admin** ⭐ RECOMMENDED

#### Langkah Setup:
1. **Buat Grup Telegram Baru**
   - Nama: "MyRajawali Admin Alerts"
   - Tambahkan admin-admin yang perlu monitoring

2. **Invite Bot ke Grup**
   - Cari: @MyRajawali_bot
   - Tambahkan ke grup
   - Jadikan admin (opsional, untuk pastikan bisa kirim pesan)

3. **Dapatkan Group Chat ID**
   - Gunakan tool: `public/telegram-group-id.html`
   - Atau kirim pesan `/start` di grup
   - Chat ID grup biasanya dimulai dengan `-` (negatif)

4. **Update Konfigurasi**
   - Jalankan `quick-telegram-config.html`
   - Masukkan Chat ID grup yang baru
   - Update `telegramEnhancedService.js`

### **OPSI 2: Channel Broadcast**

#### Langkah Setup:
1. **Buat Channel Telegram**
   - Nama: "MyRajawali System Alerts"
   - Bisa public atau private

2. **Setup Bot sebagai Admin**
   - Tambahkan @MyRajawali_bot sebagai admin
   - Berikan permission "Post Messages"

3. **Dapatkan Channel Chat ID**
   - Format: `-100xxxxxxxxxx`
   - Gunakan tool yang sama untuk mendapatkan ID

### **OPSI 3: Multi-Target** (Advanced)

Kirim notifikasi ke beberapa tujuan sekaligus:
- Anitha (private)
- Grup admin
- Channel log

## 🛠️ Tools Yang Tersedia

### 1. **Group/Channel ID Finder**
```html
<!-- Akan dibuat: telegram-group-id.html -->
Tool untuk mendapatkan Chat ID grup/channel
```

### 2. **Multi-Target Config**
```javascript
// Konfigurasi multiple recipients
const targets = {
  admin: "5929124699",        // Anitha private
  group: "-1001234567890",    // Admin group
  channel: "-1009876543210"   // System channel
}
```

## 📝 Rekomendasi

**Untuk Gereja:** 
- **Grup Admin** paling cocok
- Semua pengurus dapat monitoring
- Diskusi langsung jika ada masalah
- History tetap tersimpan

**Setup yang Disarankan:**
1. Buat grup "MyRajawali Pengurus"
2. Invite semua pengurus/admin
3. Tambahkan bot sebagai admin
4. Update chat ID di konfigurasi

## 🚀 Action Items

**Pilih salah satu:**
- [ ] Setup Grup Admin (recommended)
- [ ] Setup Channel Broadcast  
- [ ] Tetap ke Anitha pribadi
- [ ] Setup Multi-Target (advanced)

**Setelah memilih, lakukan:**
1. Buat grup/channel
2. Invite @MyRajawali_bot
3. Dapatkan Chat ID baru
4. Update konfigurasi dengan tool
5. Test notifikasi

**Mau pilih yang mana?** 🤔
