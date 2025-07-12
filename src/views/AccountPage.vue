<!-- AccountPage.vue - Halaman Profile User dengan UI yang Diperbaiki -->
<template>
  <div class="account-container">
    
    <!-- === DESKTOP LAYOUT (≥769px) === -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />
      
      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Desktop Profile Header -->
        <div class="desktop-profile-header">
          <div class="desktop-avatar">
            <span class="desktop-avatar-text">{{ userInitial }}</span>
          </div>
          <div class="desktop-profile-info" @click="goToProfileDetail">
            <h1 class="desktop-profile-name">{{ userName }}</h1>
            <p class="desktop-profile-subtitle">Lihat dan edit profile</p>
          </div>
        </div>
        
        <!-- Desktop Content Grid -->
        <div class="desktop-content-grid">
          <!-- Menu Section - Full Width -->
          <div class="desktop-menu-section-full">
            <h2 class="section-title">Pengaturan & Bantuan</h2>
            <div class="desktop-menu-grid">
              
              <!-- Menu Item -->
              <div class="desktop-menu-item" @click="goToScheduleSettings">
                <div class="desktop-menu-icon">
                  <Calendar class="menu-icon-svg" />
                </div>
                <h3 class="desktop-menu-title">Jadwal Pelayan Altar</h3>
                <p class="desktop-menu-desc">Lihat jadwal pelayanan Anda</p>
              </div>
              
              <!-- Menu Item -->
              <div class="desktop-menu-item" @click="goToReportsHelp">
                <div class="desktop-menu-icon">
                  <HelpCircle class="menu-icon-svg" />
                </div>
                <h3 class="desktop-menu-title">Laporan dan Bantuan</h3>
                <p class="desktop-menu-desc">Buat laporan atau minta bantuan</p>
              </div>
              
              <!-- Logout Item -->
              <div class="desktop-menu-item logout-item" @click="showLogoutModal">
                <div class="desktop-menu-icon logout-icon">
                  <LogOut class="menu-icon-svg" />
                </div>
                <h3 class="desktop-menu-title">Keluar</h3>
                <p class="desktop-menu-desc">Keluar dari akun Anda</p>
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- === MOBILE LAYOUT (≤768px) === -->
    <div class="mobile-layout">
      <div class="account-wrapper">
        
        <!-- Header Profile dengan Gradient -->
        <div class="profile-header" @click="goToProfileDetail">
          <div class="profile-avatar">
            <span class="avatar-text">{{ userInitial }}</span>
          </div>
          <h1 class="profile-name">{{ userName }}</h1>
          <p class="profile-subtitle">Lihat dan edit Profil</p>
        </div>

        <!-- Konten Profile -->
        <div class="profile-content">

          <!-- Daftar Menu Utama -->
          <div class="menu-container">
            
            <!-- Menu Jadwal Pelayan Altar -->
            <div class="menu-item" @click="goToScheduleSettings">
              <div class="menu-icon">
                <Calendar class="icon" />
              </div>
              <div class="menu-text">
                <div class="menu-title">Jadwal Pelayan Altar</div>
                <div class="menu-desc">Lihat jadwal pelayanan Anda</div>
              </div>
              <div class="menu-arrow">
                <ChevronRight class="arrow-icon" />
              </div>
            </div>

            <!-- Menu Laporan dan Bantuan -->
            <div class="menu-item" @click="goToReportsHelp">
              <div class="menu-icon">
                <HelpCircle class="icon" />
              </div>
              <div class="menu-text">
                <div class="menu-title">Laporan dan Bantuan</div>
                <div class="menu-desc">Buat laporan atau minta bantuan</div>
              </div>
              <div class="menu-arrow">
                <ChevronRight class="arrow-icon" />
              </div>
            </div>

            <!-- Menu Logout -->
            <div class="menu-item logout-item" @click="showLogoutModal">
              <div class="menu-icon logout-icon">
                <LogOut class="icon" />
              </div>
              <div class="menu-text">
                <div class="menu-title">Keluar</div>
                <div class="menu-desc">Keluar dari akun Anda</div>
              </div>
              <div class="menu-arrow">
                <ChevronRight class="arrow-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Navigation Bar -->
        <BottomNavbar forceActiveRoute="/account" />
      </div>
    </div>

    <!-- Modal Konfirmasi Logout -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="hideLogoutModal">
      <div class="modal-content" @click.stop>
        
        <!-- Header modal dengan icon dan judul -->
        <div class="modal-header">
          <LogOut class="modal-icon" />
          <h3>Keluar dari Akun?</h3>
        </div>
        
        <!-- Pesan konfirmasi -->
        <p class="modal-message">
          Apakah kamu yakin ingin keluar dari akun <strong>{{ userName }}</strong>?
          <br><br>
          Data streak dan bookmark akan tetap tersimpan untuk login berikutnya.
        </p>
        
        <!-- Tombol aksi modal -->
        <div class="modal-actions">
          <button class="cancel-btn" @click="hideLogoutModal">
            Batal
          </button>
          <button 
            class="logout-confirm-btn" 
            @click="confirmLogout" 
            :disabled="isLoggingOut"
          >
            <span v-if="isLoggingOut">Keluar...</span>
            <span v-else>Ya, Keluar</span>
          </button>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import BottomNavbar from '@/components/BottomNavbar.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import { LogOut, ChevronRight, Calendar, HelpCircle } from 'lucide-vue-next'

export default {
  name: 'AccountPage',
  
  components: {
    BottomNavbar,
    DesktopNavbar,
    BreadcrumbDesktop,
    LogOut,
    ChevronRight,
    Calendar,
    HelpCircle
  },
  
  data() {
    return {
      // State untuk mengontrol tampilan modal logout
      showLogoutConfirm: false,
      // State untuk menunjukkan proses logout sedang berjalan
      isLoggingOut: false,
      // Breadcrumb items untuk desktop
      breadcrumbItems: [
        { text: 'Profile', to: '/account', active: true }
      ]
    }
  },
  
  computed: {
    // Mendapatkan akses ke user store (data user global)
    userStore() {
      return useUserStore()
    },
    
    // Mendapatkan nama user dari store
    userName() {
      return this.userStore.namaUser
    },
    
    // Mendapatkan huruf pertama nama untuk avatar
    userInitial() {
      return this.userName.charAt(0).toUpperCase()
    }
  },
  
  methods: {
    
    // === NAVIGATION METHODS ===
    
    /**
     * Navigasi ke halaman detail profile
     * User bisa edit nama, foto, dll di sini
     */
    goToProfileDetail() {
      this.$router.push('/detail-profile')
    },

    /**
     * Menu Jadwal Pelayan Altar
     * Saat ini masih dalam pengembangan
     */
    goToScheduleSettings() {
      this.showNotification('Fitur Jadwal Pelayan Altar sedang dalam pengembangan', 'info')
    },
    
    /**
     * Menu Laporan dan Bantuan
     * Saat ini masih dalam pengembangan
     */
    goToReportsHelp() {
      this.showNotification('Fitur Laporan dan Bantuan sedang dalam pengembangan', 'info')
    },

    // === LOGOUT METHODS ===
    
    /**
     * Menampilkan modal konfirmasi logout
     */
    showLogoutModal() {
      this.showLogoutConfirm = true
    },
    
    /**
     * Menyembunyikan modal logout dan reset state
     */
    hideLogoutModal() {
      this.showLogoutConfirm = false
      this.isLoggingOut = false
    },
    
    /**
     * Proses logout sesungguhnya
     * Menghapus data user dan kembali ke halaman login
     */
    async confirmLogout() {
      // Prevent double click saat proses logout
      if (this.isLoggingOut) return
      
      try {
        // Set state loading
        this.isLoggingOut = true
        
        // Panggil fungsi logout dari store (hapus data user)
        this.userStore.logout()
        
        // Tutup modal
        this.hideLogoutModal()
        
        // Redirect ke halaman login
        await this.$router.replace('/')
        
      } catch (error) {
        // Jika ada error, tetap logout dan redirect
        this.userStore.logout()
        await this.$router.replace('/')
      } finally {
        // Reset loading state
        this.isLoggingOut = false
      }
    },

    // === UTILITY METHODS ===
    
    /**
     * Menampilkan notifikasi ke user
     * @param {string} message - Pesan yang akan ditampilkan
     * @param {string} type - Tipe notifikasi (info, error, success)
     */
    showNotification(message, type = 'info') {
      // Untuk sementara pakai alert, nanti bisa diganti dengan toast component
      const icons = {
        error: '❌',
        info: 'ℹ️',
        success: '✅'
      }
      alert(`${icons[type]} ${message}`)
    }
  }
}
</script>

<style scoped>
/* === RESPONSIVE LAYOUT CONTROL === */

/* Default: Show mobile, hide desktop */
.desktop-layout {
  display: none;
}

.mobile-layout {
  display: block;
}

/* Desktop (≥769px) */
@media (min-width: 769px) {
  .desktop-layout {
    display: block;
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .mobile-layout {
    display: none;
  }
  
  .desktop-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
    min-height: calc(100vh - 80px);
  }
  
  /* Desktop Profile Header */
  .desktop-profile-header {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #41442A 0%, #5a5e3d 100%);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 32px;
    color: white;
    box-shadow: 0 8px 32px rgba(65, 68, 42, 0.2);
  }
  
  .desktop-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 32px;
    flex-shrink: 0;
  }
  
  .desktop-avatar-text {
    font-size: 48px;
    font-weight: 700;
    color: #41442A;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-profile-info {
    flex: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 16px;
    border-radius: 12px;
  }
  
  .desktop-profile-name {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-profile-subtitle {
    font-size: 16px;
    color: rgba(255,255,255,0.8);
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  
  /* Desktop Content Grid */
  .desktop-content-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Menu Section - Full Width */
  .desktop-menu-section-full {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid #f0f0f0;
    width: 100%;
    max-width: 800px;
  }
  
  .desktop-menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  /* Section Titles */
  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #2d2d2d;
    margin: 0 0 20px 0;
    font-family: 'Inter', sans-serif;
    text-align: center;
  }
  
  .desktop-menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
  }
  
  .desktop-menu-item:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  .desktop-menu-item.logout-item:hover {
    background: #fdf2f2;
    border-color: #fecaca;
  }
  
  .desktop-menu-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: #41442A;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: white;
    transition: all 0.3s ease;
  }
  
  .desktop-menu-icon.logout-icon {
    background: #ffe0e0;
  }
  
  .menu-icon-svg {
    width: 24px;
    height: 24px;
  }
  
  .desktop-menu-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d2d;
    margin: 0 0 8px 0;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-menu-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1.4;
  }
}

/* === TABLET RESPONSIVE (769px - 1024px) === */
@media (min-width: 769px) and (max-width: 1024px) {
  .desktop-content {
    padding: 24px;
  }
  
  .desktop-profile-header {
    padding: 32px 24px;
  }
  
  .desktop-avatar {
    width: 100px;
    height: 100px;
    margin-right: 24px;
  }
  
  .desktop-avatar-text {
    font-size: 40px;
  }
  
  .desktop-profile-name {
    font-size: 28px;
  }
  
  .desktop-menu-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
}

/* === MOBILE STYLES (EXISTING) === */

.account-container {
  background: #fcfcf7;
  min-height: 100vh;
  padding-bottom: 80px;
  box-sizing: border-box;
}

.account-wrapper {
  max-width: 400px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  position: relative;
}

/* === PROFILE HEADER === */

.profile-header {
  background: linear-gradient(135deg, #41442A 0%, #5a5e3d 100%);
  padding: 60px 24px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(65, 68, 42, 0.2);
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  /* Animasi dihapus untuk performa yang lebih baik */
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 36px;
  font-weight: 700;
  color: #41442A;
  border: 4px solid rgba(255,255,255,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  position: relative;
  z-index: 2;
}

.avatar-text {
  font-family: 'Inter', sans-serif;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  position: relative;
  z-index: 2;
  font-family: 'Inter', sans-serif;
}

.profile-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  position: relative;
  z-index: 2;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

/* === PROFILE CONTENT === */

.profile-content {
  padding: 24px;
  background: white;
  border-radius: 24px 24px 0 0;
  margin-top: -20px;
  position: relative;
  z-index: 3;
  min-height: calc(100vh - 180px);
}

/* === MENU CONTAINER === */

.menu-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.menu-item:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.menu-item.logout-item:hover {
  background: #fdf2f2;
  border-color: #fecaca;
}

.menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #41442A;
  transition: all 0.3s ease;
}

.logout-icon {
  background: #fef2f2;
  color: #dc2626;
}

.icon {
  width: 20px;
  height: 20px;
}

.menu-text {
  flex: 1;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0 0 2px 0;
  font-family: 'Inter', sans-serif;
}

.menu-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.menu-arrow {
  display: flex;
  align-items: center;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: #999;
  transition: transform 0.3s ease;
}

.menu-item:hover .arrow-icon {
  transform: translateX(4px);
}

/* === MODAL STYLES === */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.modal-icon {
  width: 56px;
  height: 56px;
  color: #dc2626;
  margin-bottom: 16px;
  background: #fef2f2;
  border-radius: 50%;
  padding: 12px;
}

.modal-header h3 {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
}

.modal-message {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 28px 0;
  text-align: left;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, 
.logout-confirm-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.logout-confirm-btn {
  background: #dc2626;
  color: white;
}

.logout-confirm-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.logout-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === RESPONSIVE === */

@media (max-width: 360px) {
  .profile-header {
    padding: 50px 16px 30px;
  }
  
  .profile-avatar {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-content {
    padding: 16px;
  }
  
  .menu-icon {
    width: 40px;
    height: 40px;
  }
  
  .icon {
    width: 18px;
    height: 18px;
  }
  
  .menu-item {
    padding: 16px;
  }
}

/* === ACCESSIBILITY === */

@media (prefers-reduced-motion: reduce) {
  .profile-header:hover {
    transform: none;
  }
  
  .menu-item:hover .arrow-icon {
    transform: none;
  }
  
  .menu-item:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .menu-item {
    border: 2px solid #333;
  }
  
  .profile-header {
    border: 2px solid #333;
  }
}
</style>