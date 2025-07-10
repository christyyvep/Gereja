<template>
  <div class="renungan-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Header dengan tombol back dan bookmark icon -->
      <div class="custom-header">
        <HeaderWithBack title="Renungan" />
        <button class="bookmark-nav-btn" @click="goToBookmarks" aria-label="Lihat Bookmark">
          <Bookmark class="bookmark-nav-icon" />
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <p>Memuat renungan harian...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <ButtonPrimary @click="fetchDevotionals">Coba Lagi</ButtonPrimary>
      </div>

      <!-- Content ketika ada data -->
      <div v-else-if="devotionals.length > 0" class="devotionals-content">  
        <!-- Daftar renungan dalam bentuk cards -->
        <div class="devotionals-list">
          <ScheduleCard 
            v-for="devotional in devotionals" 
            :key="devotional.id"
            :schedule="devotional"
          />
        </div>
      </div>

      <!-- Empty state ketika tidak ada data -->
      <div v-else class="empty-container">
        <div class="empty-content">
          <BookOpen class="empty-icon" />
          <h3>Belum Ada Renungan</h3>
          <p>Saat ini belum ada renungan harian yang tersedia.</p>
          <ButtonPrimary @click="fetchDevotionals">Refresh</ButtonPrimary>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Header dengan tombol back dan bookmark icon -->
      <div class="custom-header">
        <HeaderWithBack title="Renungan" />
        <button class="bookmark-nav-btn" @click="goToBookmarks" aria-label="Lihat Bookmark">
          <Bookmark class="bookmark-nav-icon" />
        </button>
      </div>

      <div class="renungan-wrapper">
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <p>Memuat renungan harian...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchDevotionals">Coba Lagi</ButtonPrimary>
        </div>

        <!-- Content ketika ada data -->
        <div v-else-if="devotionals.length > 0" class="devotionals-content">  
          <!-- Daftar renungan dalam bentuk cards -->
          <div class="devotionals-list">
            <ScheduleCard 
              v-for="devotional in devotionals" 
              :key="devotional.id"
              :schedule="devotional"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <BookOpen class="empty-icon" />
            <h3>Belum Ada Renungan</h3>
            <p>Saat ini belum ada renungan harian yang tersedia.</p>
            <ButtonPrimary @click="fetchDevotionals">Refresh</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ScheduleCard from '@/components/ScheduleCard.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { BookOpen, Bookmark } from 'lucide-vue-next'
import { getDevotionals } from '@/services/devotionals'

export default {
  name: 'RenunganPage',
  components: {
    HeaderWithBack,
    ScheduleCard,
    ButtonPrimary,
    BookOpen,
    Bookmark
  },

  data() {
    return {
      devotionals: [],
      loading: true,
      error: null
    }
  },
  async created() {
    // Load data renungan ketika komponen dibuat
    await this.fetchDevotionals()
  },
  methods: {
    async fetchDevotionals() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [RenunganPage] Fetching devotionals...')
        
        // Ambil data dari Firebase
        const devotionalsData = await getDevotionals(20) // Ambil maksimal 20 renungan
        
        console.log('✅ [RenunganPage] Devotionals loaded:', devotionalsData.length)
        
        this.devotionals = devotionalsData
      } catch (error) {
        console.error('❌ [RenunganPage] Error loading devotionals:', error)
        this.error = 'Gagal memuat renungan. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },

    goToBookmarks() {
      this.$router.push('/renungan/bookmarks')
    }
  }
}
</script>

<style scoped>
.renungan-container {
  background: #fcfcf7;
  min-height: 100vh;
}

.renungan-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Loading state */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: 'Inter';
  color: #666;
}

/* Error state */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
}

 /* Custom Header dengan Bookmark Nav */
 .custom-header {
  position: relative;
  margin-bottom: 18px;
}

.bookmark-nav-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bookmark-nav-btn:hover {
  transform: scale(1.1);
}

.bookmark-nav-btn:active {
  transform: scale(0.9);
}

.bookmark-nav-icon {
  width: 20px;
  height: 20px;
  color: #41442A;
}

.error-text {
  color: #d32f2f;
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
}

/* Content area */
.devotionals-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.devotionals-list {
  display: flex;
  flex-direction: column;
}

/* Empty state */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 32px 16px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 280px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 8px;
}

.empty-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.empty-content p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

/* Responsive */
@media (max-width: 360px) {
  .renungan-wrapper {
    padding: 12px;
  }
  
  .devotionals-info {
    padding: 6px 0;
  }
  
  .info-text {
    font-size: 13px;
  }
}
</style>