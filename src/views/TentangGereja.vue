<!-- src/views/TentangGereja.vue - Responsive Desktop Version -->
<template>
  <div class="tentang-gereja-container">
    
    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Header dengan tombol back -->
      <HeaderWithBack title="Tentang Gereja" />

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <p>Memuat informasi gereja...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <ButtonPrimary @click="fetchChurchInfo">Coba Lagi</ButtonPrimary>
      </div>

      <!-- Mobile Content -->
      <div v-else class="mobile-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-placeholder">
            <h1 class="church-name">Gereja Rajawali</h1>
            <p class="church-subtitle">Melayani dengan Kasih Kristus</p>
          </div>
        </div>

        <!-- Mobile Sections -->
        <div class="mobile-sections">
          <!-- Sejarah -->
          <div class="info-section">
            <div class="section-header">
              <History class="section-icon" />
              <h2 class="section-title">Sejarah Singkat</h2>
            </div>
            <div class="section-content">
              <p class="history-text">{{ churchInfo.sejarah }}</p>
              <div class="milestone-item">
                <span class="milestone-year">{{ churchInfo.tahunBerdiri }}</span>
                <span class="milestone-desc">Gereja Rajawali didirikan</span>
              </div>
            </div>
          </div>

          <!-- Visi & Misi -->
          <div class="info-section">
            <div class="section-header">
              <Target class="section-icon" />
              <h2 class="section-title">Visi & Misi</h2>
            </div>
            <div class="section-content">
              <div class="visi-misi-block">
                <h3 class="visi-title">🎯 Visi</h3>
                <p class="visi-text">{{ churchInfo.visi }}</p>
              </div>
              <div class="visi-misi-block">
                <h3 class="misi-title">🎯 Misi</h3>
                <ul class="misi-list">
                  <li v-for="misi in churchInfo.misi" :key="misi">{{ misi }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Kontak -->
          <div class="info-section">
            <div class="section-header">
              <MapPin class="section-icon" />
              <h2 class="section-title">Kontak & Lokasi</h2>
            </div>
            <div class="section-content">
              <div class="contact-item">
                <Building class="contact-icon" />
                <span>{{ churchInfo.alamat }}</span>
              </div>
              <div class="contact-item">
                <Phone class="contact-icon" />
                <span>{{ churchInfo.telepon }}</span>
              </div>
              <div class="contact-item">
                <Mail class="contact-icon" />
                <span>{{ churchInfo.email }}</span>
              </div>
            </div>
          </div>

          <!-- Jadwal -->
          <div class="info-section">
            <div class="section-header">
              <Clock class="section-icon" />
              <h2 class="section-title">Jadwal Ibadah</h2>
            </div>
            <div class="section-content">
              <div class="schedule-item">
                <strong>Ibadah Minggu:</strong> {{ churchInfo.jadwalMinggu }}
              </div>
              <div class="schedule-item">
                <strong>Persekutuan Doa:</strong> {{ churchInfo.jadwalPelprap }}
              </div>
            </div>
          </div>

          <!-- Fasilitas -->
          <div class="info-section">
            <div class="section-header">
              <Building class="section-icon" />
              <h2 class="section-title">Fasilitas</h2>
            </div>
            <div class="section-content">
              <div class="facilities-grid">
                <div v-for="facility in facilitiesList" :key="facility.name" class="facility-item">
                  <span class="facility-icon">{{ facility.icon }}</span>
                  <span class="facility-name">{{ facility.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pengurus -->
          <div class="info-section">
            <div class="section-header">
              <Users class="section-icon" />
              <h2 class="section-title">Pengurus Gereja</h2>
            </div>
            <div class="section-content">
              <div class="leadership-grid">
                <div v-for="pengurus in leadershipList" :key="pengurus.name" class="leadership-item">
                  <div class="leadership-avatar">
                    <span class="avatar-initials">{{ getInitials(pengurus.name) }}</span>
                  </div>
                  <div class="leadership-info">
                    <h4 class="leadership-name">{{ pengurus.name }}</h4>
                    <p class="leadership-position">{{ pengurus.position }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Main Content -->
      <main class="desktop-main">
        <!-- Breadcrumb Navigation -->
        <BreadcrumbDesktop :items="breadcrumbItems" />

        <!-- Loading state -->
        <div v-if="loading" class="desktop-loading">
          <div class="loading-card">
            <p>Memuat informasi gereja...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="desktop-error">
          <div class="error-card">
            <p class="error-text">{{ error }}</p>
            <ButtonPrimary @click="fetchChurchInfo">Coba Lagi</ButtonPrimary>
          </div>
        </div>

        <!-- Desktop Content -->
        <div v-else class="desktop-content">
          <!-- Hero Card dengan Image -->
          <div class="desktop-hero-card">
            <!-- Hero Image Section -->
            <div class="hero-image-section">
              <!-- Gambar gereja dari assets/thumbnails/about/about.png -->
              <img 
                v-if="churchHeroImage && !imageError" 
                :src="churchHeroImage" 
                alt="Gereja Rajawali"
                class="hero-image"
                @error="onImageError"
                @load="onImageLoad"
              />
              <!-- Fallback placeholder jika gambar tidak ada -->
              <div v-else class="hero-image-placeholder">
                <Building class="hero-church-icon" />
              </div>
            </div>
            
            <!-- Hero Content Section -->
            <div class="hero-content-section">
              <div class="hero-badge">
                <Building class="badge-icon" />
                <span>Tentang Gereja</span>
              </div>
              
              <h1 class="desktop-church-name">Gereja Rajawali</h1>
              <p class="desktop-church-subtitle">Melayani dengan Kasih Kristus</p>
              
              <div class="hero-meta">
                <div class="meta-item">
                  <History class="meta-icon" />
                  <span>Berdiri sejak {{ churchInfo.tahunBerdiri }}</span>
                </div>
                <div class="meta-item">
                  <MapPin class="meta-icon" />
                  <span>Manado, Sulawesi Utara</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Content Grid -->
          <div class="desktop-content-grid">
            
            <!-- Left Column -->
            <div class="desktop-left-column">
              
              <!-- Sejarah Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <History class="card-icon" />
                  <h2 class="card-title">Sejarah Singkat</h2>
                </div>
                <div class="card-content">
                  <p class="card-text">{{ churchInfo.sejarah }}</p>
                </div>
              </div>

              <!-- Visi & Misi Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <Target class="card-icon" />
                  <h2 class="card-title">Visi & Misi</h2>
                </div>
                <div class="card-content">
                  <div class="visi-misi-section">
                    <h3 class="vm-title">🎯 Visi</h3>
                    <p class="vm-text">{{ churchInfo.visi }}</p>
                  </div>
                  <div class="visi-misi-section">
                    <h3 class="vm-title">🎯 Misi</h3>
                    <ul class="vm-list">
                      <li v-for="misi in churchInfo.misi" :key="misi">{{ misi }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Fasilitas Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <Building class="card-icon" />
                  <h2 class="card-title">Fasilitas</h2>
                </div>
                <div class="card-content">
                  <div class="desktop-facilities-grid">
                    <div v-for="facility in facilitiesList" :key="facility.name" class="desktop-facility-item">
                      <span class="facility-emoji">{{ facility.icon }}</span>
                      <span class="facility-label">{{ facility.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column -->
            <div class="desktop-right-column">
              
              <!-- Kontak Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <MapPin class="card-icon" />
                  <h2 class="card-title">Kontak & Lokasi</h2>
                </div>
                <div class="card-content">
                  <div class="desktop-contact-item">
                    <Building class="contact-icon" />
                    <span class="contact-text">{{ churchInfo.alamat }}</span>
                  </div>
                  <div class="desktop-contact-item">
                    <Phone class="contact-icon" />
                    <span class="contact-text">{{ churchInfo.telepon }}</span>
                  </div>
                  <div class="desktop-contact-item">
                    <Mail class="contact-icon" />
                    <span class="contact-text">{{ churchInfo.email }}</span>
                  </div>
                </div>
              </div>

              <!-- Jadwal Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <Clock class="card-icon" />
                  <h2 class="card-title">Jadwal Ibadah</h2>
                </div>
                <div class="card-content">
                  <div class="desktop-schedule-item">
                    <strong>Ibadah Minggu:</strong>
                    <span>{{ churchInfo.jadwalMinggu }}</span>
                  </div>
                  <div class="desktop-schedule-item">
                    <strong>Persekutuan Doa:</strong>
                    <span>{{ churchInfo.jadwalPelprap }}</span>
                  </div>
                </div>
              </div>

              <!-- Pengurus Card -->
              <div class="desktop-card">
                <div class="card-header">
                  <Users class="card-icon" />
                  <h2 class="card-title">Pengurus Gereja</h2>
                </div>
                <div class="card-content">
                  <div class="desktop-leadership-grid">
                    <div v-for="pengurus in leadershipList" :key="pengurus.name" class="desktop-leadership-item">
                      <div class="desktop-leadership-avatar">
                        <span class="desktop-avatar-initials">{{ getInitials(pengurus.name) }}</span>
                      </div>
                      <div class="desktop-leadership-info">
                        <h4 class="desktop-leadership-name">{{ pengurus.name }}</h4>
                        <p class="desktop-leadership-position">{{ pengurus.position }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import { 
  History, 
  Target, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users 
} from 'lucide-vue-next'
import { getChurchDisplayData } from '@/services/church.js'
import { getAboutThumbnail } from '@/utils/imageUtils.js'

export default {
  name: 'TentangGerejaPage',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    DesktopNavbar,
    BreadcrumbDesktop,
    History,
    Target,
    Building,
    MapPin,
    Phone,
    Mail,
    Clock,
    Users
  },
  
  data() {
    return {
      loading: false,
      error: null,
      imageError: false,
      
      // Breadcrumb data
      breadcrumbItems: [
        {
          text: 'Tentang Gereja'
        }
      ],
      
      // Data gereja
      churchInfo: {
        sejarah: '',
        tahunBerdiri: '',
        visi: '',
        misi: [],
        alamat: '',
        telepon: '',
        email: '',
        jadwalMinggu: '',
        jadwalPelprap: ''
      },
      
      // Data fasilitas
      facilitiesList: [
        { name: 'Ruang Ibadah Utama', icon: '⛪' },
        { name: 'Ruang Anak', icon: '🧸' },
        { name: 'Ruang Remaja', icon: '🎵' },
        { name: 'Dapur', icon: '🍽️' },
        { name: 'Parkir', icon: '🚗' },
        { name: 'Sound System', icon: '🎤' }
      ],
      
      // Data pengurus
      leadershipList: [
        { name: 'Pdt. John Doe', position: 'Pendeta' },
        { name: 'Jane Smith', position: 'Ketua Majelis' },
        { name: 'Bob Wilson', position: 'Sekretaris' },
        { name: 'Mary Johnson', position: 'Bendahara' },
        { name: 'David Lee', position: 'Koordinator Ibadah' },
        { name: 'Sarah Brown', position: 'Koordinator Anak' }
      ]
    }
  },
  
  computed: {
    churchHeroImage() {
      // Buat object tentang gereja untuk getAboutThumbnail
      const aboutData = {
        thumbnail: 'about', // Akan mencari about.png
        category: 'church',
        title: 'Gereja Rajawali'
      }
      return getAboutThumbnail(aboutData, 'large')
    }
  },
  
  async created() {
    await this.fetchChurchInfo()
  },
  
  methods: {
    async fetchChurchInfo() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [TentangGereja] Fetching church info from service...')
        
        // Menggunakan service call
        const churchData = await getChurchDisplayData()
        
        // Update church info
        this.updateChurchInfo(churchData)
        
        console.log('✅ [TentangGereja] Church info loaded successfully from service')
        
      } catch (error) {
        console.error('❌ [TentangGereja] Error loading church info:', error)
        this.error = 'Gagal memuat informasi gereja. Pastikan koneksi internet Anda stabil.'
        
        // Fallback ke data default
        this.updateChurchInfo(this.getDefaultChurchInfo())
      } finally {
        this.loading = false
      }
    },
    
    updateChurchInfo(data) {
      this.churchInfo = {
        sejarah: data.sejarah || 'Gereja Rajawali didirikan dengan visi untuk menyebarkan kasih Kristus kepada seluruh jemaat dan masyarakat sekitar. Sejak awal berdiri, gereja ini telah menjadi rumah spiritual bagi banyak keluarga di wilayah Manado dan sekitarnya.',
        tahunBerdiri: data.tahunBerdiri || '1995',
        visi: data.visi || 'Menjadi gereja yang bertumbuh dalam kasih Kristus dan melayani dengan sukacita di tengah masyarakat.',
        misi: data.misi || [
          'Memberitakan Injil kepada semua orang',
          'Membangun persekutuan yang kuat antar jemaat',
          'Melayani masyarakat dengan kasih Kristus',
          'Mendidik generasi muda dalam iman'
        ],
        alamat: data.alamat || 'Jl. Sam Ratulangi No. 123, Wenang, Manado, Sulawesi Utara',
        telepon: data.telepon || '(0431) 123-4567',
        email: data.email || 'info@gerejarajawali.org',
        jadwalMinggu: data.jadwalMinggu || '08:00 & 17:00 WITA',
        jadwalPelprap: data.jadwalPelprap || '19:00 WITA'
      }
    },
    
    getDefaultChurchInfo() {
      return {
        sejarah: 'Gereja Rajawali didirikan dengan visi untuk menyebarkan kasih Kristus kepada seluruh jemaat dan masyarakat sekitar. Sejak awal berdiri, gereja ini telah menjadi rumah spiritual bagi banyak keluarga di wilayah Manado dan sekitarnya.',
        tahunBerdiri: '1995',
        visi: 'Menjadi gereja yang bertumbuh dalam kasih Kristus dan melayani dengan sukacita di tengah masyarakat.',
        misi: [
          'Memberitakan Injil kepada semua orang',
          'Membangun persekutuan yang kuat antar jemaat',
          'Melayani masyarakat dengan kasih Kristus',
          'Mendidik generasi muda dalam iman'
        ],
        alamat: 'Jl. Sam Ratulangi No. 123, Wenang, Manado, Sulawesi Utara',
        telepon: '(0431) 123-4567',
        email: 'info@gerejarajawali.org',
        jadwalMinggu: '08:00 & 17:00 WITA',
        jadwalPelprap: '19:00 WITA'
      }
    },
    
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    onImageError() {
      this.imageError = true
      console.log('⚠️ [TentangGereja] Church hero image failed to load, using placeholder')
    },

    onImageLoad() {
      this.imageError = false
      console.log('✅ [TentangGereja] Church hero image loaded successfully')
    }
  }
}
</script>

<style scoped>
/* ========================================
   BASE CONTAINER
========================================= */
.tentang-gereja-container {
  background: #fcfcf7;
  min-height: 100vh;
  width: 100%;
}

/* ========================================
   MOBILE LAYOUT (Default)
========================================= */
.mobile-layout {
  display: block;
  width: 100%;
  background: #fcfcf7;
}

.mobile-content {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Mobile Loading & Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: 'Inter';
  color: #666;
  gap: 16px;
  text-align: center;
  padding: 16px;
}

.error-text {
  color: #d32f2f;
  font-size: 14px;
  margin: 0;
}

/* Mobile Hero Section */
.hero-section {
  background: linear-gradient(135deg, #41442A, #5a5e3d);
  border-radius: 16px;
  padding: 32px 16px;
  margin-bottom: 24px;
  text-align: center;
  color: white;
}

.church-name {
  font-family: 'Inter';
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.church-subtitle {
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

/* Mobile Sections */
.mobile-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #41442A;
}

.section-title {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
}

.section-content {
  line-height: 1.6;
  color: #4a4a4a;
}

/* Mobile specific styles */
.history-text {
  font-family: 'Inter';
  font-size: 14px;
  margin: 0 0 16px 0;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.milestone-year {
  font-weight: 600;
  color: #41442A;
}

.visi-misi-block {
  margin-bottom: 16px;
}

.visi-misi-block:last-child {
  margin-bottom: 0;
}

.visi-title, .misi-title {
  font-family: 'Inter';
  font-size: 15px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.visi-text {
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
}

.misi-list {
  margin: 0;
  padding-left: 20px;
}

.misi-list li {
  font-family: 'Inter';
  font-size: 14px;
  margin-bottom: 6px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.contact-icon {
  width: 16px;
  height: 16px;
  color: #41442A;
}

.schedule-item {
  font-family: 'Inter';
  font-size: 14px;
  margin-bottom: 8px;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.facility-icon {
  font-size: 16px;
}

.facility-name {
  font-family: 'Inter';
  font-size: 13px;
  font-weight: 500;
}

.leadership-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leadership-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.leadership-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #41442A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.leadership-name {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
}

.leadership-position {
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* ========================================
   DESKTOP LAYOUT (768px+)
========================================= */
.desktop-layout {
  display: none;
  width: 100%;
  min-height: 100vh;
  background: #fcfcf7;
}

@media screen and (min-width: 768px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

/* Desktop Main Content */
.desktop-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fcfcf7;
}

/* Desktop Loading & Error States */
.desktop-loading, .desktop-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-card, .error-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading-card p, .error-card p {
  font-family: 'Inter';
  font-size: 16px;
  color: #666;
  margin: 0 0 20px 0;
}

/* Desktop Content */
.desktop-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Desktop Hero Card */
.desktop-hero-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
  overflow: hidden;
}

/* Hero Image Section */
.hero-image-section {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.hero-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #41442A 0%, #5a5e3d 50%, #6b7042 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-church-icon {
  width: 120px;
  height: 120px;
  color: white;
  opacity: 0.9;
}

/* Hero Content Section */
.hero-content-section {
  padding: 40px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #41442A 0%, #5a5d3a 100%);
  color: white;
  padding: 10px 18px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.desktop-church-name {
  font-family: 'Inter';
  font-size: 42px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 12px 0;
  line-height: 1.1;
}

.desktop-church-subtitle {
  font-family: 'Inter';
  font-size: 20px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
}

.meta-icon {
  width: 20px;
  height: 20px;
  color: #41442A;
}

/* Desktop Content Grid */
.desktop-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

/* Desktop Cards */
.desktop-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.desktop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-icon {
  width: 24px;
  height: 24px;
  color: #41442A;
}

.card-title {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0;
}

.card-content {
  line-height: 1.6;
}

.card-text {
  font-family: 'Inter';
  font-size: 16px;
  color: #4a4a4a;
  margin: 0;
}

/* Desktop Visi Misi */
.visi-misi-section {
  margin-bottom: 24px;
}

.visi-misi-section:last-child {
  margin-bottom: 0;
}

.vm-title {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 12px 0;
}

.vm-text {
  font-family: 'Inter';
  font-size: 16px;
  color: #4a4a4a;
  margin: 0;
}

.vm-list {
  margin: 0;
  padding-left: 20px;
}

.vm-list li {
  font-family: 'Inter';
  font-size: 16px;
  color: #4a4a4a;
  margin-bottom: 8px;
}

/* Desktop Facilities */
.desktop-facilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.desktop-facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.desktop-facility-item:hover {
  background: #e9ecef;
}

.facility-emoji {
  font-size: 20px;
}

.facility-label {
  font-family: 'Inter';
  font-size: 15px;
  font-weight: 500;
  color: #2d2d2d;
}

/* Desktop Contact */
.desktop-contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.desktop-contact-item:last-child {
  margin-bottom: 0;
}

.contact-text {
  font-family: 'Inter';
  font-size: 15px;
  color: #2d2d2d;
}

/* Desktop Schedule */
.desktop-schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 12px;
}

.desktop-schedule-item:last-child {
  margin-bottom: 0;
}

.desktop-schedule-item strong {
  font-family: 'Inter';
  font-size: 15px;
  color: #41442A;
}

.desktop-schedule-item span {
  font-family: 'Inter';
  font-size: 15px;
  color: #2d2d2d;
  font-weight: 500;
}

/* Desktop Leadership */
.desktop-leadership-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desktop-leadership-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.desktop-leadership-item:hover {
  background: #e9ecef;
}

.desktop-leadership-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #41442A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.desktop-leadership-info {
  flex: 1;
}

.desktop-leadership-name {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0 0 4px 0;
}

.desktop-leadership-position {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* ========================================
   RESPONSIVE DESIGN
========================================= */

/* Tablet adjustments */
@media screen and (max-width: 950px) and (min-width: 768px) {
  .desktop-main {
    padding: 24px 16px;
  }
  
  .desktop-content-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .hero-image-section {
    height: 320px;
  }
  
  .hero-church-icon {
    width: 100px;
    height: 100px;
  }
  
  .hero-content-section {
    padding: 32px;
  }
  
  .desktop-church-name {
    font-size: 36px;
  }
  
  .desktop-church-subtitle {
    font-size: 18px;
  }
  
  .hero-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .desktop-card {
    padding: 20px;
  }
  
  .desktop-facilities-grid {
    grid-template-columns: 1fr;
  }
}

/* Large desktop adjustments */
@media screen and (min-width: 1400px) {
  .desktop-main {
    max-width: 1400px;
    padding: 40px 32px;
  }
  
  .desktop-content-grid {
    gap: 40px;
  }
  
  .hero-image-section {
    height: 450px;
  }
  
  .hero-church-icon {
    width: 140px;
    height: 140px;
  }
  
  .hero-content-section {
    padding: 50px;
  }
  
  .desktop-church-name {
    font-size: 48px;
  }
  
  .desktop-church-subtitle {
    font-size: 22px;
  }
}

/* ========================================
   ACCESSIBILITY
========================================= */
@media (prefers-reduced-motion: reduce) {
  .desktop-card,
  .desktop-facility-item,
  .desktop-leadership-item {
    transition: none;
  }
  
  .desktop-card:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .desktop-card {
    border: 2px solid #41442A;
  }
  
  .card-title {
    color: #000;
  }
  
  .card-text {
    color: #000;
  }
}

/* ========================================
   PRINT STYLES
========================================= */
@media print {
  .desktop-layout {
    display: block !important;
  }
  
  .mobile-layout {
    display: none !important;
  }
  
  .desktop-main {
    padding: 0;
    max-width: none;
  }
  
  .desktop-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .desktop-card {
    box-shadow: none;
    border: 1px solid #ddd;
    margin-bottom: 20px;
  }
  
  .desktop-hero-card {
    box-shadow: none;
    border: 2px solid #41442A;
  }
}
</style>