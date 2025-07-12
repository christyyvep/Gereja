<template>
  <div class="info-item" :class="{ 'empty': !value }">
    <div class="info-icon">
      <Mic v-if="icon === 'mic'" class="icon" />
      <Music v-else-if="icon === 'music'" class="icon" />
      <Users v-else-if="icon === 'users'" class="icon" />
      <Circle v-else-if="icon === 'circle'" class="icon" />
      <Flag v-else-if="icon === 'flag'" class="icon" />
      <Monitor v-else-if="icon === 'monitor'" class="icon" />
      <User v-else class="icon" />
    </div>
    
    <div class="info-content">
      <span class="info-label">{{ label }}</span>
      <span class="info-value">{{ displayValue }}</span>
    </div>
  </div>
</template>

<script>
import { 
  Mic, 
  Music, 
  Users, 
  Circle, 
  Flag, 
  Monitor, 
  User 
} from 'lucide-vue-next'

export default {
  name: 'InfoItem',
  
  components: {
    Mic,
    Music,
    Users,
    Circle,
    Flag,
    Monitor,
    User
  },
  
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'user'
    }
  },
  
  computed: {
    displayValue() {
      return this.value || 'Belum ditentukan'
    }
  }
}
</script>

<style scoped>
.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item.empty {
  opacity: 0.6;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.info-item:not(.empty) .info-icon {
  background: #8B7355;
  color: white;
}

.icon {
  width: 18px;
  height: 18px;
  color: #666;
}

.info-item:not(.empty) .icon {
  color: white;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #2d2d2d;
  line-height: 1.3;
}

.info-item.empty .info-value {
  color: #999;
  font-style: italic;
  font-weight: 400;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .info-item {
    gap: 10px;
    padding: 10px 0;
  }
  
  .info-icon {
    width: 36px;
    height: 36px;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
  
  .info-label {
    font-size: 12px;
  }
  
  .info-value {
    font-size: 14px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .info-item {
    border-bottom-color: #333;
  }
  
  .info-label {
    color: #333;
  }
  
  .info-value {
    color: #000;
  }
  
  .info-item.empty .info-value {
    color: #666;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .info-item,
  .info-icon {
    transition: none;
  }
}
</style>
