# Sistem Penjadwalan Otomatis Renungan Telegram (Smart Scheduling)

## 📋 Overview
Sistem smart scheduling yang memungkinkan admin untuk menjadwalkan pengiriman renungan ke Telegr## 🎯 Smart Flow Diagram

```
Admin Input: Renungan + Tanggal
              ↓
         Cek Tanggal
              ↓
    ┌─────────┬─────────┬─────────┐
    │ Hari Ini│Masa Depan│Masa Lalu│
    │         │         │         │
    ├─────────┼─────────┼─────────┤
    │Dialog   │Auto     │Archive  │
    │"Kirim   │Schedule │Only     │
    │Sekarang?"│00:00    │         │
    │         │         │         │
    │ ┌─────┐ │         │         │
    │ │ OK  │ │Background│         │
    │ └─────┘ │Scheduler │         │
    │ Kirim   │         │         │
    │ Sekarang│         │         │
    │         │ ↓       │         │
    │ ┌─────┐ │Jam 00:00│         │
    │ │Cancel│ │Process  │         │
    │ └─────┘ │& Send   │         │
    │Schedule │         │         │
    │         │         │         │
    └─────────┴─────────┴─────────┘
              ↓
        Update Status
```

## 📱 UI/UX Enhancementsnggal. Sistem ini cerdas dalam menangani berbagai skenario:

- 📤 **Hari Ini**: Langsung kirim sekarang (dengan konfirmasi)
- 📅 **Masa Depan**: Auto-schedule untuk jam 00:00 pada tanggal tersebut
- 📜 **Masa Lalu**: Simpan sebagai arsip saja

## 🚀 Fitur Smart Scheduling

### 1. Intelligent Date Handling
- ✅ **Hari Ini**: Dialog konfirmasi untuk kirim sekarang atau schedule nanti
- ✅ **Masa Depan**: Otomatis dijadwalkan untuk jam 00:00 pada tanggal tersebut
- ✅ **Masa Lalu**: Disimpan sebagai arsip tanpa kirim/schedule

### 2. Real-time Processing
- ✅ Background scheduler berjalan setiap menit
- ✅ Pemrosesan hanya pada jam 00:00-00:05 (window toleransi)
- ✅ Manual force processing untuk testing/admin

### 3. Enhanced UI Management
- ✅ Status visual di kolom "Telegram": 🕒 Terjadwal / Belum dijadwalkan
- ✅ Smart notifications berdasarkan skenario
- ✅ Manual schedule/unschedule controls

## 📱 UI/UX Changes

### Tabel Admin Renungan
```
| Judul | Ayat Alkitab | Tanggal | Telegram | Aksi |
|-------|--------------|---------|----------|------|
| ...   | ...          | ...     | 🕒 Terjadwal | [Edit][📅][📤][🗑️] |
| ...   | ...          | ...     | Belum dijadwalkan | [Edit][📅][📤][🗑️] |
```

### Tombol Aksi
- **📅 (Calendar)**: Jadwalkan kirim otomatis
- **📅❌ (CalendarX)**: Batalkan jadwal otomatis  
- **📤 (Send)**: Broadcast sekarang
- **✏️ (Edit)**: Edit renungan
- **🗑️ (Trash)**: Hapus renungan

## 🔧 Technical Implementation

### 1. Files Modified
- `src/views/admin/AdminRenungan.vue` - UI integration
- `src/services/telegramScheduler.js` - Core scheduling logic
- `src/services/telegramService.js` - Fixed polling conflicts

### 2. New Files Created
- `src/services/backgroundScheduler.js` - Background processing
- `scripts/run-telegram-scheduler.js` - Cron job script
- `run-telegram-scheduler.ps1` - Windows PowerShell script

### 3. Database Schema
```javascript
// Collection: telegram_scheduler
{
  id: "auto-generated",
  renunganData: {
    id: "renungan-id",
    title: "Judul Renungan",
    content: "Isi renungan...",
    verse: "Yohanes 3:16",
    date: "2025-08-28T00:00:00.000Z"
  },
  scheduledDate: "2025-08-28", // YYYY-MM-DD format
  status: "scheduled", // scheduled | completed | failed
  createdAt: "2025-08-28T10:30:00.000Z",
  processedAt: null,
  error: null
}
```

## 📋 Usage Guide

### Untuk Admin

#### 1. Membuat Renungan dengan Auto-Schedule
1. Klik "Tambah Renungan"
2. Isi form renungan dengan **tanggal yang diinginkan**
3. Klik "Simpan"
4. ✅ Renungan otomatis dijadwalkan untuk dikirim pada tanggal tersebut

#### 2. Mengelola Schedule Manual
1. Pada tabel renungan, lihat kolom "Telegram"
2. Untuk renungan belum dijadwalkan: Klik tombol 📅 (Calendar)
3. Untuk renungan sudah dijadwalkan: Klik tombol 📅❌ (CalendarX) untuk batalkan

#### 3. Broadcast Manual (Opsional)
1. Klik tombol 📤 (Send) untuk mengirim renungan sekarang juga
2. Ini terpisah dari sistem scheduling

### Untuk Developer/Server Admin

#### 1. Setup Background Scheduler (Development)
```javascript
// Di main.js atau App.vue
import backgroundScheduler from '@/services/backgroundScheduler'

// Start scheduler untuk development
if (process.env.NODE_ENV === 'development') {
  backgroundScheduler.start()
}
```

#### 2. Setup Cron Job (Production)
```bash
# Linux/Mac - Tambah ke crontab
# Jalankan setiap hari jam 8 pagi
0 8 * * * cd /path/to/myrajawali-app && node scripts/run-telegram-scheduler.js

# Windows Task Scheduler
# Jalankan run-telegram-scheduler.ps1 setiap hari jam 8 pagi
```

#### 3. Manual Testing
```bash
# Test scheduler manual
node scripts/run-telegram-scheduler.js

# atau PowerShell (Windows)
.\run-telegram-scheduler.ps1
```

## 🔧 Configuration

### Environment Variables
```env
# .env file
VUE_APP_TELEGRAM_BOT_TOKEN=your_bot_token_here
VUE_APP_FIREBASE_API_KEY=your_firebase_key
VUE_APP_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Scheduler Settings
```javascript
// src/services/backgroundScheduler.js
const checkInterval = 60000 // Check every 1 minute
```

## 🐛 Troubleshooting

### 1. Telegram API Conflicts
**Error**: "Conflict: terminated by other getUpdates request"
**Solution**: Polling dinonaktifkan secara default untuk mencegah conflict
```javascript
// telegramService.js - Polling disabled by default
async startPolling() {
  // ⚠️ Polling disabled to prevent conflicts
  return { success: false, message: 'Polling disabled' }
}
```

### 2. Schedule Tidak Jalan
**Check**:
1. Background scheduler running?
2. Cron job setup correctly?
3. Firebase permissions OK?
4. Environment variables loaded?

### 3. Auto-Schedule Gagal
**Behavior**: Renungan tersimpan tapi tidak dijadwalkan
**Solution**: Bisa dijadwalkan manual dengan tombol 📅

## 📊 Monitoring

### Background Scheduler Logs
```javascript
// Check scheduler status
import backgroundScheduler from '@/services/backgroundScheduler'
console.log(backgroundScheduler.getStatus())
```

### Manual Trigger
```javascript
// Trigger manual processing
await backgroundScheduler.triggerManual()
```

## 🎯 Flow Diagram

```
Admin Input Renungan + Tanggal
           ↓
    Auto-Schedule Created
           ↓
    Background Scheduler (setiap menit)
           ↓
    Check: Ada schedule untuk hari ini?
           ↓
    Process → Send ke Telegram
           ↓
    Update status: completed/failed
```

## ✅ Testing Checklist

- [ ] Buat renungan dengan tanggal → Auto-scheduled
- [ ] Manual schedule/unschedule → UI update
- [ ] Background scheduler running → Console logs
- [ ] Cron job script → Manual test
- [ ] Telegram sending → Message delivered
- [ ] Error handling → Graceful failure
- [ ] Firebase permissions → Read/write OK

## 📝 Next Steps

1. **Production Deployment**:
   - Setup cron job di server
   - Monitor logs untuk errors
   - Setup alerting untuk failures

2. **Enhanced Features** (Optional):
   - Admin dashboard untuk melihat schedule queue
   - Email notification jika pengiriman gagal
   - Retry mechanism untuk failed sends
   - Bulk schedule management

3. **Performance Optimization**:
   - Database indexing untuk schedule queries
   - Rate limiting untuk bulk operations
   - Caching untuk frequent queries
