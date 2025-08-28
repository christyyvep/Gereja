# SISTEM BROADCAST TELEGRAM MYRAJAWALI - DOKUMENTASI LENGKAP

## 📋 OVERVIEW
Sistem integrasi Telegram untuk MyRajawali yang memungkinkan admin mengirim renungan harian secara otomatis ke jemaat Telegram yang sudah di-approve. Jemaat harus mendaftar terlebih dahulu dan menunggu approval admin sebelum bisa menerima broadcast renungan.

## 🤖 BOT INFORMATION
- **Bot Name:** GPdI Rajawali Kanonang
- **Username:** @MyRajawali_bot  
- **Token:** 8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw

## 🔄 ALUR SISTEM

### 1. REGISTRASI JEMAAT
1. Jemaat kirim `/start` ke bot @MyRajawali_bot
2. Bot auto-registrasi jemaat dengan status "pending_approval"
3. Data disimpan di Firebase collection `telegram_registrations`
4. Jemaat mendapat pesan bahwa registrasi sedang diproses admin

### 2. APPROVAL ADMIN
1. Admin masuk ke panel Admin Telegram (`/admin/telegram`)
2. Melihat list registrasi pending
3. Admin approve/reject registrasi
4. Jemaat yang di-approve mendapat notifikasi dan mulai bisa terima renungan

### 3. BROADCAST RENUNGAN
1. Admin buat/edit renungan di panel Admin Renungan (`/admin/renungan`)
2. Admin klik tombol "Broadcast ke Telegram" 📤
3. Sistem kirim renungan ke semua jemaat yang statusnya "approved"
4. Admin dapat laporan berapa jemaat yang berhasil/gagal menerima

## 📁 FILE STRUCTURE

### Core Services
```
src/services/
├── simpleTelegramRegistration.js  # Handle registrasi & approval jemaat
├── telegramService.js             # Handle broadcast renungan ke jemaat approved  
├── webhook-handler.js             # Handle webhook bot untuk auto-registrasi
└── firebase.js                    # Firebase config
```

### Admin Panels
```
src/views/admin/
├── AdminTelegram.vue              # Panel approval jemaat Telegram
└── AdminRenungan.vue              # Panel kelola renungan + tombol broadcast
```

### Test Files
```
public/
├── test-telegram-broadcast.html   # Testing sistem broadcast lengkap
└── quick-telegram-config.html     # Generator config bot (tidak diperlukan lagi)
```

## 🗄️ DATABASE STRUCTURE

### Collection: `telegram_registrations`
```javascript
{
  id: "auto-generated",
  telegramUserId: "123456789",        // Telegram user ID
  telegramUsername: "username",       // @username (optional)
  telegramFirstName: "John",          // First name
  telegramLastName: "Doe",            // Last name (optional)
  status: "pending_approval",         // "pending_approval" | "approved" | "rejected"
  registeredAt: Timestamp,            // Tanggal registrasi
  approvedAt: Timestamp,              // Tanggal approval (if approved)
  approvedBy: "admin-uid",            // UID admin yang approve
  rejectedAt: Timestamp,              // Tanggal rejection (if rejected)
  rejectedBy: "admin-uid"             // UID admin yang reject
}
```

### Collection: `admin_notifications` (optional)
```javascript
{
  type: "new_telegram_registration",
  telegramUser: { id, username, firstName, lastName },
  message: "Pendaftaran baru: John Doe (@username)",
  status: "unread",
  timestamp: Timestamp
}
```

## 🔧 SETUP & DEPLOYMENT

### 1. Environment Variables
Update file `.env`:
```env
VUE_APP_TELEGRAM_BOT_TOKEN=8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw
VUE_APP_TELEGRAM_CHAT_ID=5929124699
```

### 2. Firebase Rules
Pastikan Firestore rules mengizinkan read/write ke collection `telegram_registrations`:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /telegram_registrations/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Bot Webhook Setup
Ada 2 cara setup bot:

#### Option A: Webhook (Production)
1. Deploy webhook handler ke server/Firebase Functions
2. Set webhook URL ke `https://your-server.com/webhook/telegram`
3. Jalankan setup webhook

#### Option B: Polling (Development)
- Bot akan polling updates secara berkala
- Tidak perlu webhook URL
- Lebih simple untuk development

## 🧪 TESTING

### 1. Manual Testing
Gunakan file `test-telegram-broadcast.html`:
```bash
# Buka di browser
http://localhost:8080/test-telegram-broadcast.html

# Test steps:
1. Test Bot Connection ✅
2. Add Test User 👤
3. Check Registrations 📋
4. Approve Test User ✅
5. Test Broadcast Renungan 📤
```

### 2. Real User Testing
1. Buat grup test atau chat dengan bot
2. Kirim `/start` ke @MyRajawali_bot
3. Admin approve di panel `/admin/telegram`
4. Test broadcast dari panel `/admin/renungan`

## 📱 ADMIN PANELS

### Panel Admin Telegram (`/admin/telegram`)
**Features:**
- ✅ View statistik: pending, approved, total registrasi
- 📋 List semua registrasi pending untuk approval
- ✅ Approve registrasi dengan 1 klik
- ❌ Reject registrasi dengan konfirmasi
- 👥 View semua jemaat yang sudah approved
- 🧪 Test broadcast manual

**Access:** Admin & Gembala only

### Panel Admin Renungan (`/admin/renungan`)
**New Features:**
- 📤 Tombol "Broadcast ke Telegram" di setiap renungan
- ⏳ Loading state saat broadcasting
- ✅ Konfirmasi sebelum broadcast
- 📊 Laporan hasil broadcast (berhasil/gagal)

**Access:** Admin, Gembala, Operator

## 🔒 SECURITY & PERMISSIONS

### Role Access
```javascript
// Admin Telegram Panel
requireAdmin: ['admin', 'gembala']

// Broadcast Renungan Button  
requireManagement: ['admin', 'gembala', 'operator']
```

### Bot Token Security
- Bot token disimpan di environment variables
- Tidak hardcode di code
- Client-side menggunakan backend API (opsional)

## 📈 MONITORING & ANALYTICS

### Broadcast Logs
Setiap broadcast dicatat di collection `message_logs`:
```javascript
{
  messageType: 'broadcast',
  message: 'Renungan: Kasih Allah...',
  targetCount: 25,
  successCount: 23,
  failedCount: 2,
  timestamp: Timestamp,
  broadcastResults: [
    { telegramUserId: '123', nama: 'John', status: 'success' },
    { telegramUserId: '456', nama: 'Jane', status: 'failed', error: 'User blocked bot' }
  ]
}
```

### Success Metrics
- **Registration Rate:** Pending vs Approved ratio
- **Broadcast Success:** Success/Failed ratio per broadcast
- **User Engagement:** Active users receiving broadcasts

## ⚡ PERFORMANCE OPTIMIZATION

### Rate Limiting
- Minimum 50ms delay antar pesan
- Maximum 30 messages/second
- Process dalam chunks 25 users
- Auto-retry failed messages (3x)

### Error Handling
- Graceful failure: terus broadcast ke user lain meski ada yang error
- Detailed error logging untuk debugging
- User-friendly error messages untuk admin

## 🔄 MAINTENANCE

### Regular Tasks
1. **Monitor registrasi baru** - Check admin panel weekly
2. **Review broadcast logs** - Check success rates monthly  
3. **Clean rejected users** - Archive old rejected registrations
4. **Bot health check** - Test bot connection regularly

### Troubleshooting
```javascript
// Debug registrations
await simpleTelegramRegistration.debugRegistrations()

// Test bot connection
await telegramService.testBotConnection()

// Manual broadcast test
await telegramService.sendBroadcastToAllJemaat('Test message')
```

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Update .env dengan bot token yang benar
- [ ] Test bot connection di development
- [ ] Test auto-registrasi dengan akun test
- [ ] Test approval flow di admin panel
- [ ] Test broadcast renungan end-to-end

### Post-deployment  
- [ ] Setup webhook (jika menggunakan webhook)
- [ ] Test registrasi dengan user real
- [ ] Monitor error logs
- [ ] Announce bot ke jemaat
- [ ] Train admin cara approve/reject

## 📞 SUPPORT

### Common Issues
1. **Bot tidak merespon /start**
   - Check bot token di .env
   - Check webhook URL
   - Check Firebase connection

2. **Broadcast gagal**
   - Check approved users count
   - Check rate limiting
   - Check individual user errors

3. **Admin panel tidak load**
   - Check user role permissions
   - Check Firebase rules
   - Check network connection

### Debug Commands
```javascript
// Browser console debug commands
simpleTelegramRegistration.debugRegistrations()
telegramService.testBotConnection()  
telegramService.sendBroadcastToAllJemaat('Debug test')
```

---

## 📝 CHANGELOG

### Version 1.0 (August 2025)
- ✅ Auto-registrasi jemaat dengan /start
- ✅ Admin panel untuk approval jemaat
- ✅ Broadcast renungan ke jemaat approved
- ✅ Rate limiting dan error handling
- ✅ Complete admin UI dengan statistik
- ✅ Testing tools dan documentation

### Planned Features (Future)
- 📅 Scheduled broadcast (otomatis setiap hari)
- 📊 Analytics dashboard  
- 🔔 Admin notification untuk registrasi baru
- 📱 Mobile admin app integration
- 🌐 Multi-language support

---
*Dokumentasi ini dibuat untuk MyRajawali Telegram Broadcast System v1.0*
