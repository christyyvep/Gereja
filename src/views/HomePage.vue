<template>
  <div class="home-page">
    
    <!-- === DESKTOP LAYOUT (≥769px) === -->
    <div class="desktop-layout">
      
      <!-- ✅ GUNAKAN COMPONENT NAVBAR -->
      <DesktopNavbar />

      <!-- Main Content Container -->
      <div class="main-content">
        <div class="content-container">
          
          <!-- Welcome Hero Section -->
          <section class="welcome-section">
            <div class="welcome-left">
              <h1 class="welcome-title">Selamat datang, {{ namaUser }}!</h1>
              <p class="welcome-subtitle">Semoga hari Anda diberkati</p>
              <div class="streak-display">
                <span class="streak-label">Streak login:</span>
                <span class="streak-count">{{ streakCount }} hari</span>
              </div>
            </div>
            <div class="welcome-right">
              <div class="daily-verse-desktop">
                <img :src="ayatGambar" alt="Ayat Hari Ini" class="verse-image"/>
              </div>
            </div>
          </section>

          <!-- Features Grid Section -->
          <section class="feature-section">
            <h2 class="section-title">Fitur Aplikasi</h2>
            <div class="feature-grid-desktop">
              <FeatureBox
                v-for="feature in featureList"
                :key="`desktop-${feature.name}`"
                :name="feature.name"
                class="feature-box-desktop"
                @click="navigateToFeature(feature)"
              />
            </div>
          </section>

          <!-- Announcements Section -->
          <section class="announcement-section">
            <h2 class="section-title">Pengumuman Hari Ini</h2>
            <div class="announcement-grid">
              <AnnouncementCard
                v-for="(item, index) in announcementList" 
                :key="`desktop-${index}`"
                :title="item.title"
                :desc="item.desc"
                :icon="item.icon"
                :category="item.category"
                :time="item.time"
                :date="item.date"
                :location="item.location"
                :clickable="true"
                class="announcement-card-desktop"
                @click="navigateToAnnouncement(item)"
              />
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- === MOBILE LAYOUT (≤768px) === -->
    <div class="mobile-layout">
      <div class="home-wrapper">

        <!-- Mobile Header with User Info -->
        <HeaderHome :namaUser="namaUser" :streakCount="streakCount" />

        <!-- Daily Bible Verse -->
        <DailyVerse :ayatGambar="ayatGambar" />

        <!-- Mobile Features Grid -->
        <div class="feature-grid">
          <FeatureBox
            v-for="feature in featureList"
            :key="`mobile-${feature.name}`"
            :name="feature.name"
            @click="navigateToFeature(feature)"
          />
        </div>

        <!-- Mobile Announcements Title -->
        <h2 class="section-title-mobile">Pengumuman Terbaru</h2>

        <!-- Mobile Announcements List -->
        <AnnouncementCard
          v-for="(item, index) in announcementList"
          :key="`mobile-${index}`"
          :title="item.title"
          :desc="item.desc"
          :icon="item.icon"
          :category="item.category"
          :time="item.time"
          :date="item.date"
          :location="item.location"
          :clickable="true"
          @click="navigateToAnnouncement(item)"
        />

        <!-- Bottom Navigation Bar -->
        <BottomNavbar />
      </div>
    </div>
  </div>
</template>

<script>
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import HeaderHome from '@/components/layout/HeaderHome.vue'
import DailyVerse from '@/components/DailyVerse.vue'
import FeatureBox from '@/components/FeatureBox.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import AnnouncementCard from '@/components/AnnouncementCard.vue'
import { useUserStore } from '@/stores/userStore'
import { useStreakStore } from '@/stores/streakStore'
import { getDailyVerseUrl } from '@/utils/imageUtils'
import { getCurrentUser } from '@/services/auth-hybrid-minimal'
import { getUnifiedAnnouncements } from '@/services/announcements'

export default {
  name: 'HomePage',
  
  components: {
    DesktopNavbar, // ✅ TAMBAH COMPONENT
    HeaderHome,
    DailyVerse,
    FeatureBox,
    BottomNavbar,
    AnnouncementCard
  },
  
  computed: {
    userStore() {
      return useUserStore()
    },
    
    streakStore() {
      return useStreakStore()
    },
    
    currentUserId() {
      return this.userStore.userId
    },

    streakCount() {
      if (!this.currentUserId) return 1  // ✅ PERBAIKAN: Return 1 bukan 0
      const streak = this.streakStore.currentStreak(this.currentUserId)
      return Math.max(streak || 1, 1) // ✅ PERBAIKAN: Pastikan minimal 1
    },

    totalLogins() {
      if (!this.currentUserId) return 1  // ✅ PERBAIKAN: Return 1 bukan 0
      return Math.max(this.streakStore.totalLogins(this.currentUserId) || 1, 1)
    },

    longestStreak() {
      if (!this.currentUserId) return 1  // ✅ PERBAIKAN: Return 1 bukan 0
      return Math.max(this.streakStore.longestStreak(this.currentUserId) || 1, 1)
    }
  },

  data() {
    return {
      namaUser: 'Jemaat',
      ayatGambar: null,
      featureList: [
        { name: "News" },
        { name: "Jadwal" },
        { name: "Giving" },
        { name: "Tentang Gereja" },
        { name: "Renungan" },
        { name: "Prayer Request" }
      ],
      announcementList: []
    }
  },

  async mounted() {
    console.log('🏠 [HomePage] Component mounted')
    await this.loadAllData()
  },

  methods: {
    async loadAllData() {
      try {
        await Promise.all([
          this.loadUserData(),
          this.loadStreakData(),
          this.loadUnifiedAnnouncements(),
          this.loadDailyVerse()
        ])
        
        console.log('✅ [HomePage] All data loaded successfully')
      } catch (error) {
        console.error('❌ [HomePage] Error loading data:', error)
      }
    },

    async loadUserData() {
      try {
        if (this.userStore.nama) {
          this.namaUser = this.userStore.nama
          return
        }

        const currentUser = getCurrentUser()
        if (currentUser?.id) {
          this.namaUser = currentUser.nama || 'Jemaat'
        }
      } catch (error) {
        console.error('❌ [HomePage] Error loading user data:', error)
      }
    },

    loadDailyVerse() {
      this.ayatGambar = getDailyVerseUrl()
    },

    async loadStreakData() {
      try {
        console.log('🔥 [HomePage] Loading streak data...')
        
        if (!this.currentUserId) {
          console.log('❌ [HomePage] No user ID for streak')
          return
        }

        // ✅ PERBAIKAN: Gunakan checkDailyStreak untuk update otomatis
        await this.streakStore.checkDailyStreak(this.currentUserId)
        
        console.log(`✅ [HomePage] Streak updated: ${this.streakCount} days`)
        
      } catch (error) {
        console.error('❌ [HomePage] Error loading streak:', error)
      }
    },

    navigateToFeature(feature) {
      const routeMap = {
        'News': '/news',
        'Jadwal': '/jadwal',
        'Giving': '/giving',
        'Tentang Gereja': '/tentang-gereja',
        'Renungan': '/renungan',
        'Prayer Request': '/prayer-request'
      }
      
      const route = routeMap[feature.name]
      if (route) {
        this.$router.push(route)
      }
    },

    async loadUnifiedAnnouncements() {
      try {
        console.log('🔍 [HomePage] Loading unified announcements...')
        
        // ✅ DEBUG: Tambah debug untuk tanggal hari ini
        const today = new Date().toISOString().split('T')[0]
        console.log('📅 [HomePage] Today:', today)
        
        const announcements = await getUnifiedAnnouncements(6)
        
        console.log('✅ [HomePage] Unified announcements loaded:', announcements.length)
        console.log('🔍 [HomePage] Announcements data:', announcements)
        
        this.announcementList = announcements
        
        // ✅ DEBUG: Log final announcement list
        if (announcements.length === 0) {
          console.log('❌ [HomePage] No announcements found for today. This means:')
          console.log('   1. No schedules with date =', today)
          console.log('   2. No news with eventDate/activityDate/scheduleDate/date =', today)
          console.log('   3. Check Firebase data or create test data for today')
          console.log('   4. Falling back to dummy data for testing...')
          
          // ✅ Fallback to dummy data jika benar-benar tidak ada
          this.loadDummyAnnouncements()
        }
        
      } catch (error) {
        console.error('❌ [HomePage] Error loading unified announcements:', error)
        console.log('🔄 [HomePage] Falling back to dummy announcements due to error...')
        this.announcementList = []
        this.loadDummyAnnouncements()
      }
    },

    loadDummyAnnouncements() {
      console.log('🎭 [HomePage] Loading dummy announcements as fallback...')
      
      this.announcementList = [
        {
          id: 'news_Z6NtgDMXfZ8RL01jaZ0P',
          originalId: 'Z6NtgDMXfZ8RL01jaZ0P',
          title: 'Perkemahan Favored Camp 2025',
          desc: 'Perkemahan Rohani Pemuda dan Remaja kembali hadir tahun ini dengan tema "Favored..."',
          category: 'event',
          type: 'news',
          sourceCollection: 'news'
        },
        {
          id: 'announcement_birthday_123',
          originalId: 'birthday_123',
          title: 'Selamat Ulang Tahun Gembala!',
          desc: 'Hari ini adalah hari spesial untuk Bapak Gembala. Mari kita doakan semoga diberkati...',
          category: 'birthday',
          type: 'announcement',
          sourceCollection: 'announcements'
        },
        {
          id: 'schedule_pelprap_456',
          originalId: 'pelprap_456',
          title: 'Undangan Ibadah PELPRAP Wilayah LX',
          desc: 'Undangan untuk seluruh ibu-ibu GPdI Rajawali Kanonang dari Komisi Pelayanan Wanita...',
          category: 'ibadah',
          type: 'schedule',
          sourceCollection: 'schedules'
        }
      ]
    },

    navigateToAnnouncement(item) {
      console.log('🎯 [HomePage] Navigating to announcement:', item)
      
      try {
        const actualId = item.originalId || item.id.replace(/^(news_|schedule_|announcement_)/, '')
        
        let targetRoute = ''
        
        if (item.sourceCollection === 'news' || item.type === 'news') {
          targetRoute = `/news/${actualId}`
        } else if (item.sourceCollection === 'schedules' || item.type === 'schedule') {
          targetRoute = `/jadwal/${actualId}`
        } else if (item.sourceCollection === 'announcements' || item.type === 'announcement') {
          targetRoute = `/news?category=announcements&id=${actualId}`
        } else {
          targetRoute = '/news'
        }
        
        console.log('🧭 [HomePage] Navigating to:', targetRoute)
        console.log('🔍 [HomePage] Using ID:', actualId)
        
        this.$router.push(targetRoute)
        
      } catch (error) {
        console.error('❌ [HomePage] Error navigating to announcement:', error)
        this.$router.push('/news')
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   BASE STYLES
========================================= */
.home-page {
  background: #fcfcf7;
  min-height: 100vh;
}

/* Default: Show mobile, hide desktop */
.desktop-layout {
  display: none;
}

.mobile-layout {
  display: block;
}

/* ========================================
   DESKTOP LAYOUT (≥769px) - CONTENT ONLY
   NAVBAR STYLES SUDAH DI COMPONENT
========================================= */
@media (min-width: 769px) {
  .desktop-layout {
    display: block;
    min-height: 100vh;
    background: #fcfcf7;
  }
  
  .mobile-layout {
    display: none;
  }

  /* === MAIN CONTENT === */
  .main-content {
    padding: 40px;
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* === WELCOME HERO === */
  .welcome-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 48px;
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .welcome-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .welcome-title {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #41442A;
    margin: 0;
    line-height: 1.2;
  }

  .welcome-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .streak-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #41442A, #5a5e3d);
    border-radius: 12px;
    color: white;
    width: fit-content;
  }

  .streak-label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
  }

  .streak-count {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
  }

  .welcome-right {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .daily-verse-desktop {
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .verse-image {
    width: 100%;
    height: auto;
    display: block;
  }

  /* === FEATURES GRID === */
  .feature-section {
    margin-bottom: 48px;
  }

  .section-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #41442A;
    margin: 0 0 24px 0;
  }

  .feature-grid-desktop {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    margin: 0 -20px;
  }

  .feature-box-desktop {
    cursor: pointer;
    transition: transform 0.2s ease;
    transform: scale(1.2);
  }

  .feature-box-desktop:hover {
    transform: scale(1.25) translateY(-2px);
  }

  /* === ANNOUNCEMENTS GRID === */
  .announcement-section {
    margin-bottom: 48px;
  }

  .announcement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .announcement-card-desktop {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }

  .announcement-card-desktop:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  @media (max-width: 1024px) and (min-width: 769px) {
    .main-content {
      padding: 24px;
    }

    .welcome-section {
      padding: 24px;
      gap: 24px;
    }

    .welcome-title {
      font-size: 26px;
    }

    .welcome-subtitle {
      font-size: 15px;
    }

    .section-title {
      font-size: 19px;
    }

    .feature-grid-desktop {
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 0 -10px;
    }

    .feature-box-desktop {
      transform: scale(1.1);
    }

    .feature-box-desktop:hover {
      transform: scale(1.15) translateY(-2px);
    }

    .announcement-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
  }

  @media (max-width: 950px) and (min-width: 769px) {
    .welcome-title {
      font-size: 24px;
    }

    .welcome-subtitle {
      font-size: 14px;
    }

    .section-title {
      font-size: 18px;
    }

    .feature-grid-desktop {
      grid-template-columns: repeat(3, 1fr);
      margin: 0;
    }

    .feature-box-desktop {
      transform: scale(1.05);
    }

    .feature-box-desktop:hover {
      transform: scale(1.1) translateY(-2px);
    }
  }
}

/* ========================================
   MOBILE LAYOUT (≤768px)
========================================= */
@media (max-width: 768px) {
  .home-wrapper {
    padding: 16px;
    max-width: 360px;
    margin: 0 auto;
    padding-top: 0%;
    padding-bottom: 80px;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 20px 0;
  }

  .section-title-mobile {
    font-family: 'Inter';
    font-size: 18px;
    font-weight: 600;
    color: #41442A;
    margin: 24px 0 16px 0;
  }
}
</style>