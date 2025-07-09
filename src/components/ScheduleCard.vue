<template>
  <div class="schedule-card" @click="goToDetail">
    <!-- Thumbnail (gambar kecil di kiri) -->
    <div class="card-thumbnail">
      <img 
        v-if="thumbnailSrc && !imageError" 
        :src="thumbnailSrc" 
        :alt="schedule.title"
        class="thumbnail-img"
        @error="onImageError"
        @load="onImageLoad"
      />
      <!-- Fallback jika gambar tidak ada -->
      <div v-else class="thumbnail-placeholder">
        <span>{{ schedule.title.charAt(0) }}</span>
      </div>
    </div>

    <!-- Konten text di kanan -->
    <div class="card-content">
      <h3 class="card-title">{{ schedule.title }}</h3>
      <p class="card-schedule">{{ schedule.scheduleText || formatSchedule(schedule) }}</p>
    </div>

    <!-- Arrow untuk menunjukkan bisa diklik -->
    <div class="card-arrow">
      <ChevronRight class="arrow-icon" />
    </div>
  </div>
</template>

<script>
import { ChevronRight } from 'lucide-vue-next'
import { getScheduleThumbnail, getNewsThumbnail, getDevotionalThumbnail } from '@/utils/imageUtils'

export default {
  name: 'ScheduleCard',
  components: {
    ChevronRight
  },
  props: {
    schedule: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imageError: false
    }
  },
  computed: {
    currentPath() {
      return this.$route.path
    },
    
    thumbnailSrc() {
      try {
        return this.getThumbnailByPath()
      } catch (error) {
        console.error('Error getting thumbnail:', error)
        return null
      }
    },

    contentType() {
      const path = this.currentPath
      if (path.includes('/news')) return 'news'
      if (path.includes('/renungan')) return 'devotional'
      if (path.includes('/jadwal')) return 'schedule'
      return 'schedule' // default
    }
  },
  methods: {
    getThumbnailByPath() {
      const thumbnailMap = {
        'news': () => getNewsThumbnail(this.schedule, 'small'),
        'devotional': () => getDevotionalThumbnail(this.schedule, 'small'),
        'schedule': () => getScheduleThumbnail(this.schedule, 'small')
      }
      
      const getThumbnail = thumbnailMap[this.contentType]
      return getThumbnail ? getThumbnail() : getScheduleThumbnail(this.schedule, 'small')
    },
    
    goToDetail() {
      if (!this.schedule?.id) {
        console.warn('No schedule ID available')
        return
      }
      
      const routePath = this.getDetailRoute()
      this.$router.push(routePath)
    },

    getDetailRoute() {
      const scheduleId = this.schedule.id
      const routeMap = {
        'news': `/news/${scheduleId}`,
        'devotional': `/renungan/${scheduleId}`,
        'schedule': `/jadwal/${scheduleId}`
      }
      
      return routeMap[this.contentType] || `/jadwal/${scheduleId}`
    },
    
    onImageError(event) {
      this.imageError = true
      // Prevent infinite error loop
      event.target.onerror = null
    },
    
    onImageLoad() {
      this.imageError = false
    },

    formatSchedule(schedule) {
      if (!schedule) return ''
      
      // For daily schedules (like Doa Fajar)
      if (schedule.dayOfWeek === 'daily') {
        return `${schedule.dayName} • ${schedule.time}`
      }
      
      // For weekly schedules
      if (schedule.dayName && schedule.date) {
        const dateObj = new Date(schedule.date)
        const day = dateObj.getDate()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const month = months[dateObj.getMonth()]
        return `${schedule.dayName}, ${day} ${month} • ${schedule.time}`
      }
      
      // Fallback
      return schedule.time || ''
    }
  }
}
</script>

<style scoped>
/* Card container */
.schedule-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  height: 80px;
}

.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.schedule-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Thumbnail section */
.card-thumbnail {
  width: 80px;
  min-width: 80px;
  height: 80px;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #41442A, #5a5e3d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  font-family: 'Inter', sans-serif;
}

/* Content section */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  min-height: 80px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
  font-family: 'Inter';
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-schedule {
  font-family: 'Inter';
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
}

/* Arrow section */
.card-arrow {
  padding: 16px;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  color: #999;
  transition: color 0.2s ease;
}

.schedule-card:hover .arrow-icon {
  color: #41442A;
}

/* Responsive design */
@media (max-width: 360px) {
  .schedule-card {
    height: 70px;
  }
  
  .card-thumbnail {
    width: 70px;
    min-width: 70px;
    height: 70px;
  }
  
  .card-content {
    padding: 12px;
    min-height: 70px;
  }
  
  .thumbnail-placeholder {
    font-size: 20px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .schedule-card,
  .thumbnail-img,
  .arrow-icon {
    transition: none;
  }
  
  .schedule-card:hover {
    transform: none;
  }
}
</style>