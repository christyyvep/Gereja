<!-- <template>
    <div class="pengurus-container">
      <div class="pengurus-wrapper"> -->
        <!-- <HeaderWithBack title="Mode Admin" /> -->
  
        <!-- <div class="mode-info-card">
          <div class="mode-icon">👨‍💼</div>
          <div class="mode-text">
            <h2>Mode Admin Aktif</h2>
            <p>Anda sekarang dapat mengakses fitur khusus admin</p>
          </div>
        </div> -->
  
        <!-- <div class="pengurus-menu">
          <h3 class="menu-title">Fitur Admin</h3>
          
          <div class="menu-item" @click="goToManageNews">
            <div class="menu-icon">📰</div>
            <div class="menu-content">
              <h4>Kelola Berita</h4>
              <p>Tambah, edit, dan hapus berita</p>
            </div>
            <ChevronRight class="menu-arrow" />
          </div> -->
  
          <!-- <div class="menu-item" @click="goToManageSchedule">
            <div class="menu-icon">📅</div>
            <div class="menu-content">
              <h4>Kelola Jadwal</h4>
              <p>Atur jadwal ibadah dan kegiatan</p>
            </div>
            <ChevronRight class="menu-arrow" />
          </div> -->
  
          <!-- <div class="menu-item" @click="goToManageDevotionals">
            <div class="menu-icon">🙏</div>
            <div class="menu-content">
              <h4>Kelola Renungan</h4>
              <p>Buat dan edit renungan harian</p>
            </div>
            <ChevronRight class="menu-arrow" />
          </div>
  
          <div class="menu-item" @click="goToManageAnnouncements">
            <div class="menu-icon">📢</div>
            <div class="menu-content">
              <h4>Kelola Pengumuman</h4>
              <p>Buat pengumuman untuk jemaat</p>
            </div>
            <ChevronRight class="menu-arrow" />
          </div>
  
          <div class="menu-item" @click="goToMembersList">
            <div class="menu-icon">👥</div>
            <div class="menu-content">
              <h4>Daftar Jemaat</h4>
              <p>Lihat dan kelola data jemaat</p>
            </div>
            <ChevronRight class="menu-arrow" />
          </div>
        </div> -->
  
        <!-- <div class="exit-mode-section">
          <button class="exit-mode-btn" @click="exitPengurusMode">
            <LogOut class="exit-icon" />
            <span>Keluar dari Mode Admin</span>
          </button>
        </div>
      </div>
    </div>
  </template> -->
  
<!-- <script>
  import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
  import { ChevronRight, LogOut } from 'lucide-vue-next'
  
  export default {
    name: 'PengurusMode',
    components: {
      HeaderWithBack,
      ChevronRight,
      LogOut
    },
    created() {
      console.log('🎉 [PengurusMode] Successfully loaded!')
      console.log('✅ User accessed pengurus mode')
    },
    methods: {
      goToManageNews() {
        alert('📰 Fitur Kelola Berita akan tersedia setelah development selesai!')
      },
  
      goToManageSchedule() {
        alert('📅 Fitur Kelola Jadwal akan tersedia setelah development selesai!')
      },
  
      goToManageDevotionals() {
        alert('🙏 Fitur Kelola Renungan akan tersedia setelah development selesai!')
      },
  
      goToManageAnnouncements() {
        alert('📢 Fitur Kelola Pengumuman akan tersedia setelah development selesai!')
      },
  
      goToMembersList() {
        alert('👥 Fitur Daftar Jemaat akan tersedia setelah development selesai!')
      },
  
      exitPengurusMode() {
        console.log('🚪 [PengurusMode] Exiting pengurus mode...')
        this.$router.push('/home')
      }
    }
  }
  </script> -->
  
  <!-- <style scoped>
  .pengurus-container {
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .pengurus-wrapper {
    padding: 16px;
    max-width: 360px;
    margin: 0 auto;
  }
  
  .mode-info-card {
    background: linear-gradient(135deg, #41442A, #5a5e3d);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: white;
  }
  
  .mode-icon {
    font-size: 48px;
    line-height: 1;
  }
  
  .mode-text h2 {
    font-family: 'Inter';
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .mode-text p {
    font-family: 'Inter';
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
    line-height: 1.4;
  }
  
  .pengurus-menu {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .menu-title {
    font-family: 'Inter';
    font-size: 18px;
    font-weight: 600;
    color: #41442A;
    margin: 0;
    padding: 20px 20px 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .menu-item:last-child {
    border-bottom: none;
  }
  
  .menu-item:hover {
    background-color: #f8f9fa;
  }
  
  .menu-item:active {
    background-color: #e9ecef;
  }
  
  .menu-icon {
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(65, 68, 42, 0.1);
    border-radius: 12px;
    margin-right: 16px;
  }
  
  .menu-content {
    flex: 1;
  }
  
  .menu-content h4 {
    font-family: 'Inter';
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 4px 0;
  }
  
  .menu-content p {
    font-family: 'Inter';
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.3;
  }
  
  .menu-arrow {
    width: 16px;
    height: 16px;
    color: #999;
  }
  
  .exit-mode-section {
    margin-top: 24px;
  }
  
  .exit-mode-btn {
    width: 100%;
    background: #dc3545;
    border: none;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter';
    font-size: 16px;
    font-weight: 600;
    color: white;
  }
  
  .exit-mode-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
  
  .exit-mode-btn:active {
    transform: translateY(0);
  }
  
  .exit-icon {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 360px) {
    .pengurus-wrapper {
      padding: 12px;
    }
    
    .mode-info-card {
      padding: 20px;
    }
    
    .mode-icon {
      font-size: 40px;
    }
    
    .mode-text h2 {
      font-size: 18px;
    }
    
    .menu-item {
      padding: 14px 16px;
    }
    
    .menu-icon {
      font-size: 28px;
      width: 40px;
      height: 40px;
    }
  }
  </style> -->