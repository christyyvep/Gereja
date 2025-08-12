# 👥 Kelola Data Jemaat - Panduan Penggunaan

## 🚀 Akses Fitur

1. **Login sebagai Admin**
   - Gunakan akun admin untuk masuk ke aplikasi
   - Role admin diperlukan untuk mengakses fitur ini

2. **Masuk ke Admin Panel**
   - Setelah login, navigasi ke admin panel
   - Klik menu "Kelola Data Jemaat" di sidebar

## 📊 Dashboard Statistik

Di bagian atas halaman, Anda akan melihat 4 card statistik:

- **Total Jemaat**: Jumlah keseluruhan anggota jemaat
- **Pria**: Jumlah anggota berjenis kelamin laki-laki
- **Wanita**: Jumlah anggota berjenis kelamin perempuan  
- **Sudah Registrasi**: Jumlah dan persentase yang sudah bisa login

## 🔍 Pencarian dan Filter

### Pencarian
- Gunakan search box untuk mencari jemaat berdasarkan nama
- Ketik nama yang dicari, hasil akan muncul secara real-time

### Filter
Gunakan dropdown filter untuk menyaring data:
- **Semua Jemaat**: Tampilkan semua data
- **Sudah Registrasi**: Hanya yang sudah punya akun login
- **Belum Registrasi**: Hanya yang belum bisa login
- **Pria**: Hanya anggota laki-laki
- **Wanita**: Hanya anggota perempuan

## ➕ Menambah Jemaat Baru

1. Klik tombol **"Tambah Jemaat"**
2. Isi form dengan data lengkap:
   - **Nama Lengkap** *(wajib)*
   - **Jenis Kelamin** *(wajib)*
   - **Tanggal Lahir**
   - **Status Pernikahan**
   - **Sektor**
   - **Nomor Telepon**
   - **Email**
   - **Password** *(opsional)*

3. **Catatan Password**:
   - Jika diisi: Jemaat bisa login ke aplikasi
   - Jika kosong: Jemaat hanya tercatat, belum bisa login

4. Klik **"Tambah Jemaat"** untuk menyimpan

## ✏️ Edit Data Jemaat

1. Klik tombol **edit** (ikon pensil) pada baris jemaat
2. Form akan terbuka dengan data yang sudah terisi
3. Ubah data yang diperlukan
4. **Password**: 
   - Kosongkan jika tidak ingin mengubah
   - Isi jika ingin memberikan/mengubah akses login
5. Klik **"Update Data"** untuk menyimpan

## 🗑️ Menghapus Data Jemaat

1. Klik tombol **hapus** (ikon tong sampah) pada baris jemaat
2. Akan muncul konfirmasi penghapusan
3. Baca nama jemaat yang akan dihapus
4. Klik **"Ya, Hapus"** untuk mengonfirmasi

⚠️ **Peringatan**: Data yang dihapus tidak dapat dikembalikan!

## 📋 Informasi Tabel

### Kolom yang Ditampilkan:
- **#**: Nomor urut
- **Nama**: Nama lengkap dengan avatar
- **Jenis Kelamin**: Badge dengan warna (biru=pria, pink=wanita)
- **Tanggal Lahir**: Format Indonesia (DD/MM/YYYY)
- **Status**: Status pernikahan
- **Sektor**: Sektor jemaat
- **No. Telepon**: Nomor kontak
- **Email**: Alamat email
- **Status Registrasi**: 
  - 🟢 **Sudah Registrasi**: Bisa login
  - 🟡 **Belum Registrasi**: Belum bisa login
- **Terakhir Login**: Waktu login terakhir
- **Aksi**: Tombol edit dan hapus

### Pagination
- Menampilkan 10 data per halaman
- Navigasi dengan tombol panah
- Informasi halaman dan total data

## 🔒 Keamanan

### Password
- Menggunakan enkripsi PBKDF2 yang aman
- Salt unik untuk setiap password
- Tidak pernah ditampilkan dalam bentuk plain text

### Hak Akses
- Hanya admin yang bisa mengakses fitur ini
- Session monitoring untuk keamanan ekstra
- Auto-logout jika session tidak valid

### Validasi Data
- Nama wajib diisi dan tidak boleh duplikat
- Jenis kelamin wajib dipilih
- Format email dan nomor telepon divalidasi

## 📱 Responsive Design

Fitur ini dapat digunakan di:
- **Desktop**: Tampilan penuh dengan tabel lengkap
- **Tablet**: Layout responsif dengan scroll horizontal
- **Mobile**: Optimized untuk layar kecil

## 🔔 Notifikasi

Sistem akan memberikan notifikasi untuk:
- ✅ **Berhasil**: Operasi sukses (warna hijau)
- ❌ **Error**: Operasi gagal (warna merah)
- ⚠️ **Warning**: Peringatan (warna orange)
- ℹ️ **Info**: Informasi (warna biru)

## 🐛 Troubleshooting

### Jika Data Tidak Muncul
1. Pastikan koneksi internet stabil
2. Refresh halaman (F5)
3. Cek apakah login masih valid
4. Hubungi administrator sistem

### Jika Tidak Bisa Menambah Data
1. Pastikan nama tidak duplikat
2. Isi semua field yang wajib (*)
3. Cek format email yang valid
4. Coba refresh dan ulangi

### Jika Error saat Login Jemaat
1. Pastikan password sudah diset
2. Cek status "Sudah Registrasi" di tabel
3. Reset password jika perlu melalui edit data

## 📞 Support

Jika mengalami masalah atau butuh bantuan:
- Hubungi administrator sistem
- Cek dokumentasi teknis di `DOKUMENTASI_KELOLA_JEMAAT.md`
- Laporkan bug atau saran perbaikan

---

*Fitur ini dibuat untuk memudahkan administrasi data jemaat dengan interface yang user-friendly dan keamanan yang terjamin.*
