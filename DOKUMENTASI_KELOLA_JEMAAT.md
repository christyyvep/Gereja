# Fitur Kelola Data Jemaat - Admin

## Overview
Fitur ini memungkinkan admin untuk mengelola data anggota jemaat dengan lengkap, termasuk melihat, menambah, mengubah, dan menghapus data jemaat.

## Features

### 1. Dashboard Statistik
- **Total Jemaat**: Menampilkan jumlah total anggota jemaat
- **Total Pria**: Jumlah anggota jemaat berjenis kelamin laki-laki
- **Total Wanita**: Jumlah anggota jemaat berjenis kelamin perempuan  
- **Status Registrasi**: Menampilkan jumlah yang sudah registrasi dan persentasenya

### 2. Tabel Data Jemaat
Menampilkan data lengkap jemaat dalam bentuk tabel dengan kolom:
- Nama lengkap dengan avatar
- Jenis kelamin (dengan badge warna)
- Tanggal lahir
- Status pernikahan
- Sektor
- Nomor telepon
- Email
- Status registrasi (sudah/belum registrasi)
- Terakhir login
- Aksi (edit/hapus)

### 3. Pencarian dan Filter
- **Pencarian**: Cari jemaat berdasarkan nama
- **Filter**: 
  - Semua jemaat
  - Sudah registrasi
  - Belum registrasi
  - Pria saja
  - Wanita saja

### 4. Pagination
- Menampilkan 10 data per halaman
- Navigasi halaman dengan informasi total data

### 5. Tambah Jemaat Baru
Form dengan field:
- Nama lengkap (required)
- Jenis kelamin (required)
- Tanggal lahir
- Status pernikahan
- Sektor
- Nomor telepon
- Email
- Password (opsional - jika diisi, jemaat bisa login)

### 6. Edit Data Jemaat
- Edit semua field kecuali password (untuk keamanan)
- Password bisa diupdate jika diperlukan

### 7. Hapus Data Jemaat
- Konfirmasi sebelum menghapus
- Data yang dihapus tidak dapat dikembalikan

## Struktur Field Database

Berdasarkan analisis database Firestore, field yang digunakan:

```javascript
{
  nama: string,              // Nama lengkap
  jenisKelamin: string,      // "Laki-laki" atau "Perempuan"
  tanggalLahir: string,      // Format tanggal
  status: string,            // Status pernikahan
  sektor: string,            // Sektor jemaat
  noTelp: string,            // Nomor telepon
  email: string,             // Email address
  
  // Auth fields
  password: string,          // Hashed password (PBKDF2)
  isRegistered: boolean,     // Status registrasi
  isActive: boolean,         // Status aktif
  role: string,              // Default: "jemaat"
  
  // Metadata
  createdAt: timestamp,      // Waktu dibuat
  createdBy: string,         // Dibuat oleh siapa
  lastUpdated: timestamp,    // Terakhir diupdate
  lastUpdatedBy: string,     // Diupdate oleh siapa
  lastLogin: timestamp,      // Terakhir login
  loginCount: number         // Jumlah login
}
```

## Security

### Password Hashing
- Menggunakan PBKDF2 dengan 10,000 iterasi
- Salt random untuk setiap password
- Format: `salt:hash`

### Role-based Access
- Hanya admin yang bisa mengakses fitur ini
- Menggunakan `requireAdmin` guard di router
- Session monitoring untuk keamanan

### Data Validation
- Validasi required fields
- Cek duplikasi nama sebelum menambah data
- Sanitasi input form

## Files Created/Modified

### New Files:
1. `src/services/jemaatService.js` - Service untuk operasi CRUD jemaat
2. `src/views/admin/KelolaJemaat.vue` - Halaman utama kelola jemaat

### Modified Files:
1. `src/router/index.js` - Menambah route `/admin/kelola-jemaat`
2. `src/layouts/AdminLayout.vue` - Menambah menu navigasi

## Cara Menggunakan

### Akses Halaman
1. Login sebagai admin
2. Masuk ke admin panel
3. Klik menu "Kelola Data Jemaat" di sidebar

### Menambah Jemaat Baru
1. Klik tombol "Tambah Jemaat"
2. Isi form dengan data yang diperlukan
3. Jika ingin jemaat bisa login, isi field password
4. Klik "Tambah Jemaat"

### Edit Data Jemaat
1. Klik tombol edit (pencil icon) pada baris jemaat
2. Ubah data yang diperlukan
3. Klik "Update Data"

### Hapus Data Jemaat
1. Klik tombol hapus (trash icon) pada baris jemaat
2. Konfirmasi penghapusan
3. Data akan dihapus dari database

### Pencarian dan Filter
1. Gunakan search box untuk mencari berdasarkan nama
2. Gunakan dropdown filter untuk menyaring data
3. Data akan difilter secara real-time

## Toast Notifications
- Success: Operasi berhasil (hijau)
- Error: Operasi gagal (merah)  
- Warning: Peringatan (orange)
- Info: Informasi (biru)

## Responsive Design
- Mobile-friendly dengan tabel horizontal scroll
- Card layout untuk statistik di mobile
- Form responsive dengan grid layout

## Performance
- Lazy loading untuk data besar
- Client-side pagination
- Debounced search untuk performa
- Optimized Firebase queries
