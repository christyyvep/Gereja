<!-- src/components/layout/HeaderHome.vue -->
<template>
    <div class="header">
      <p class="greeting">{{ greeting }}</p>
      <div class="streak" v-if="streakCount > 0">
        <span>{{ displayStreak }}</span>
        <Flame class="icon-flame" />
      </div>
    </div>
  </template>
  
  <script>
  import { Flame } from 'lucide-vue-next'
  
  export default {
    name: 'HeaderHome',
    components: {
      Flame
    },
    props: {
      namaUser: {
        type: String,
        default: 'Jemaat'
      },
      streakCount: {
        type: Number,
        default: 1
      }
    },
    computed: {
      greeting() {
        return `Halo, ${this.namaUser}!`
      },
      displayStreak() {
        return Math.max(this.streakCount || 1, 1)
      }
    }
  }
  </script>
  
  <style scoped>
  .header {
    /* Spesifikasi dari Figma */
    display: flex;
    width: 100%;
    max-width: 360px;
    height: 56px;
    justify-content: space-between; /* Untuk memisahkan greeting dan streak */
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    background-color: #fcfcf7; /* Sesuaikan dengan background app kamu */
    box-sizing: border-box;
  }
  
  .greeting {
    font-size: 16px;
    font-family: 'Inter';
    font-weight: 600;
    margin: 0;
    color: #41442A; /* Sesuaikan dengan warna teks utama app kamu */
  }
  
  .streak {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: bold;
    font-size: 14px;
    color: #41442A;
  }
  
  .icon-flame {
    width: 20px;
    height: 20px;
    color: #41442A;
  }
</style>