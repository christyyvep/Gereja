# 🔔 TELEGRAM NOTIFICATION SETUP - MyRajawali

## 📋 OVERVIEW
Sistem notifikasi Telegram yang terintegrasi dengan MyRajawali untuk monitoring keamanan dan aktivitas login. API disimpan di frontend tetapi ter-obfuscate sehingga tidak mudah terlihat di browser inspector.

## ⚙️ SETUP INSTRUCTIONS

### Step 1: Buat Bot Telegram

1. Buka Telegram dan cari `@BotFather`
2. Kirim perintah `/newbot`
3. Ikuti instruksi untuk membuat bot baru
4. Simpan **Bot Token** yang diberikan (format: `1234567890:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Dapatkan Chat ID

**Untuk Group/Channel:**
1. Tambahkan bot ke group/channel
2. Beri izin admin untuk bot
3. Kirim pesan mention bot: `@namabot test`
4. Buka: `https://api.telegram.org/bot[BOT_TOKEN]/getUpdates`
5. Cari `"chat":{"id":-1001234567890}` - ini adalah Chat ID

**Untuk Private Chat:**
1. Start conversation dengan bot
2. Kirim pesan apapun
3. Buka: `https://api.telegram.org/bot[BOT_TOKEN]/getUpdates`
4. Cari `"chat":{"id":1234567890}` - ini adalah Chat ID

### Step 3: Generate Obfuscated Config

1. Buka file: `public/telegram-config-generator.html` di browser
2. Masukkan Bot Token dan Chat ID
3. Klik "Generate Obfuscated Config"
4. Copy kode yang dihasilkan

### Step 4: Update Service File

1. Buka `src/utils/telegramEnhancedService.js`
2. Ganti variabel `encodedConfig` dengan hasil generate (sekitar baris 45)
3. Pastikan XOR key sama: `MyRajawaliSecure2025`

### Step 5: Test Configuration

1. Buka browser console di aplikasi
2. Jalankan kode test yang dihasilkan dari generator
3. Cek apakah pesan test diterima di Telegram

## 🔒 SECURITY FEATURES

### Obfuscation Layers
1. **Base64 Encoding** - Encoding dasar
2. **XOR Encryption** - Enkripsi dengan key custom
3. **Double Base64** - Encoding kedua untuk obfuscation
4. **Dynamic URL Generation** - URL API dibuat dinamis
5. **Rate Limiting** - 1 menit cooldown antar notifikasi

### Keamanan Browser
- API key tidak terlihat dalam plaintext di source code
- Tidak mudah di-extract dari browser inspector
- Config ter-encode dalam multiple layers
- Failsafe jika config invalid

## 📱 NOTIFICATION TYPES

### 1. Login Success
```
🔐 MyRajawali - Login Success

👤 User: Nama User
📧 Email: email@example.com
🔧 Role: jemaat
🌐 IP: 192.168.1.1
🕒 Waktu: 27/08/2025 14:30:15
```

### 2. Failed Login
```
⚠️ MyRajawali - Failed Login

📧 Email: user@example.com
🌐 IP: 192.168.1.1
❌ Reason: Invalid password
🔢 Attempts: 3/5
🕒 Waktu: 27/08/2025 14:25:10
```

### 3. Security Alert
```
🚨 MyRajawali - Security Alert

⚠️ Alert: Multiple failed attempts
📧 Email: suspicious@email.com
🌐 IP: 192.168.1.100
📊 Details: 5 attempts in 10 minutes
🕒 Waktu: 27/08/2025 14:20:05
```

## 🛠️ INTEGRATION POINTS

### LoginPage.vue
- Success login notification
- Failed login notification
- Client IP detection

### auth-hybrid.js  
- Login success tracking
- Failed login tracking
- Security event logging

### Admin Actions (Future)
- User role changes
- Password resets
- System maintenance

## 📊 MONITORING & MAINTENANCE

### Rate Limiting
- 1 notification per minute
- Prevents spam
- Automatic cooldown

### Error Handling
- Non-blocking notifications
- Graceful fallback
- Console logging for debug

### Cleanup
- No persistent storage
- Stateless operation
- Memory efficient

## 🚀 USAGE EXAMPLES

### Manual Notification
```javascript
// Import service
import telegramService from '@/utils/telegramEnhancedService.js'

// Send custom notification
await telegramService.notifyCustom('Manual test from MyRajawali')

// Send login notification
await telegramService.notifyLogin({
  username: 'John Doe',
  email: 'john@example.com',
  role: 'jemaat',
  ip: '192.168.1.1'
})

// Send security alert
await telegramService.notifySecurityAlert({
  type: 'Suspicious Activity',
  email: 'suspect@example.com',
  ip: '192.168.1.100',
  details: 'Multiple failed login attempts'
})
```

### Integration in Components
```vue
<script>
import telegramService from '@/utils/telegramEnhancedService.js'

export default {
  methods: {
    async handleSensitiveAction() {
      try {
        // Your action here
        
        // Send notification
        await telegramService.notifyCustom('Sensitive action performed')
      } catch (error) {
        console.error('Action failed:', error)
      }
    }
  }
}
</script>
```

## ⚠️ IMPORTANT NOTES

1. **Security**: Jangan share bot token dengan siapapun
2. **Rate Limits**: Telegram API memiliki rate limit, service sudah handle ini
3. **Fallback**: Aplikasi tetap berfungsi meski Telegram gagal
4. **Monitoring**: Monitor console untuk error notifications
5. **Testing**: Gunakan generator tool untuk test konfigurasi

## 🔧 TROUBLESHOOTING

### Bot Token Invalid
- Pastikan format: `number:letters`
- Cek di @BotFather dengan `/mybots`

### Chat ID Salah
- Untuk group: pastikan dimulai dengan `-`
- Test dengan manual API call

### Notifications Tidak Diterima
- Cek console browser untuk errors
- Pastikan bot masih admin di group
- Test dengan generator tool

### Rate Limited
- Tunggu 1 menit antar test
- Cek cooldown di service

## 📞 SUPPORT

Jika ada masalah dengan setup Telegram:
1. Cek console browser untuk error details
2. Test dengan generator tool
3. Verifikasi bot token dan chat ID
4. Pastikan bot memiliki izin admin di group

---

*Setup by MyRajawali Development Team - August 2025*
