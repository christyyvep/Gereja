<template>
  <div class="altar-servants-card" @click="goToDetail">
    <!-- Konten utama -->
    <div class="card-content">
      <h3 class="card-title">{{ schedule.categoryLabel || 'Jadwal Pelayanan' }}</h3>
      <span class="card-date">{{ formatDate(schedule.tanggal) }}</span>
    </div>

    <!-- Arrow untuk menunjukkan bisa diklik -->
    <div class="card-arrow">
      <ChevronRight class="arrow-icon" />
    </div>
  </div>
</template>

<script>
import { ChevronRight } from 'lucide-vue-next'

export default {
  name: 'AltarServantsCard',
  components: {
    ChevronRight
  },
  props: {
    schedule: {
      type: Object,
      required: true
    }
  },
  methods: {
    goToDetail() {
      if (!this.schedule?.id) {
        console.warn('❌ [AltarServantsCard] No schedule ID available:', this.schedule)
        return
      }
      
      console.log('🔗 [AltarServantsCard] Navigating to detail:', {
        scheduleId: this.schedule.id,
        title: this.schedule.categoryLabel || this.schedule.title,
        fullSchedule: this.schedule
      })
      
      this.$router.push(`/jadwal-peltar/${this.schedule.id}`)
    },

    formatDate(dateString) {
      if (!dateString) return 'Tanggal tidak tersedia'
      
      try {
        const date = new Date(dateString)
        const options = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }
        return date.toLocaleDateString('id-ID', options)
      } catch (error) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   ALTAR SERVANTS CARD - RESPONSIVE
========================================= */

.altar-servants-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.altar-servants-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.altar-servants-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Content section */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.3;
}

.card-date {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #666;
  font-weight: 400;
  line-height: 1.2;
}

/* Arrow section */
.card-arrow {
  display: flex;
  align-items: center;
  margin-left: 16px;
  flex-shrink: 0;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: #999;
  transition: color 0.2s ease;
}

.altar-servants-card:hover .arrow-icon {
  color: #41442A;
}

/* ========================================
   DESKTOP LAYOUT (≥769px)
========================================= */

@media (min-width: 769px) {
  .altar-servants-card {
    padding: 20px 24px;
    border-radius: 12px;
    margin: 0;
    min-height: 100px;
    align-items: flex-start;
  }
  
  .card-content {
    gap: 8px;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
  }
  
  .card-date {
    font-size: 14px;
  }
  
  .arrow-icon {
    width: 20px;
    height: 20px;
  }
  
  .card-arrow {
    margin-left: 20px;
    align-self: center;
  }
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
========================================= */

/* Untuk HP kecil */
@media (max-width: 360px) {
  .altar-servants-card {
    padding: 14px 16px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-date {
    font-size: 12px;
  }
  
  .arrow-icon {
    width: 16px;
    height: 16px;
  }
  
  .card-arrow {
    margin-left: 12px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .altar-servants-card {
    transition: none;
  }
  
  .altar-servants-card:hover {
    transform: none;
  }
  
  .altar-servants-card:active {
    transform: none;
  }
}
</style>