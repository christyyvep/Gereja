<template>
  <div class="header-container">
    <div class="header-inner">
      <button class="back-button" @click="goBack" :aria-label="backLabel">
        <ChevronLeft class="icon-back" />
      </button>
      <h2 class="header-title">{{ title }}</h2>
      <div class="spacer"></div>
    </div>
  </div>
</template>

<script>
import { ChevronLeft } from 'lucide-vue-next'

export default {
  name: 'HeaderWithBack',
  components: {
    ChevronLeft
  },
  props: {
    title: {
      type: String,
      required: true
    },
    backLabel: {
      type: String,
      default: 'Kembali'
    },
    customBackAction: {
      type: Function,
      default: null
    }
  },
  methods: {
    goBack() {
      if (this.customBackAction) {
        this.customBackAction()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style scoped>
.header-container {
  width: 100%;
  /* ⭐ HAPUS max-width supaya memenuhi layar penuh */
  margin-bottom: 18px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 32px;
  /* Padding removed as requested */
}

.back-button {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  flex-shrink: 0;
}

.icon-back {
  width: 20px;
  height: 20px;
  display: block;
  color: #333;
}

.header-title {
  flex: 1;
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  text-align: center;
  padding: 0 8px;
  
  /* ⭐ PERBAIKAN UNTUK TITLE PANJANG */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* ⭐ PERBAIKI CENTER POSITIONING */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 96px); /* Ruang untuk back button dan spacer + padding */
}

.spacer {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

/* ⭐ MEDIA QUERY UNTUK MOBILE */
@media (max-width: 360px) {
  .header-title {
    font-size: 16px;
    max-width: calc(100% - 88px);
  }
}

@media (max-width: 320px) {
  .header-title {
    font-size: 14px;
    max-width: calc(100% - 80px);
  }
}
</style>