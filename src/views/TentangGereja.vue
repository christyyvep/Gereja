<template>
  <DetailLayout
    :content="churchContent"
    :thumbnail="churchThumbnail"
    :breadcrumb-items="breadcrumbItems"
    :hide-back-button="false"
    :hide-content-badge="true"
    content-type="church"
  >
    <!-- Slot untuk konten tambahan -->
    <template #additional-info>
      <!-- Sejarah Gereja Section (Our Story style) -->
      <div class="story-section">
        <div class="story-container">
          <div class="story-left">
            <h2 class="story-title">Sejarah Gereja</h2>
          </div>
          <div class="story-right">
            <p class="story-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="story-text">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.
            </p>
            <p class="story-text">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt.
            </p>
          </div>
        </div>
      </div>

      <!-- Visi & Misi Section -->
      <div class="vision-mission-section">
        <div class="vm-container">
          <!-- Visi Section -->
          <div class="vm-block visi-block">
            <div class="vm-image">
              <img :src="churchInfo.visiImage" alt="Visi Gereja" v-if="churchInfo.visiImage" />
              <div v-else class="vm-placeholder visi-placeholder">
                <div class="vm-icon">🎯</div>
              </div>
            </div>
            <div class="vm-content">
              <h3 class="vm-title">VISI</h3>
              <p class="vm-text">{{ churchInfo.visi }}</p>
            </div>
          </div>

          <!-- Misi Section -->
          <div class="vm-block misi-block">
            <div class="vm-content">
              <h3 class="vm-title">MISI</h3>
              <ol class="misi-list">
                <li v-for="misi in churchInfo.misi" :key="misi">{{ misi }}</li>
              </ol>
            </div>
            <div class="vm-image">
              <img :src="churchInfo.misiImage" alt="Misi Gereja" v-if="churchInfo.misiImage" />
              <div v-else class="vm-placeholder misi-placeholder">
                <div class="vm-icon">🎯</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gembala Section -->
      <div class="pastors-section">
        <h2 class="pastors-title">Gembala</h2>
        <div class="pastors-grid">
          <div v-for="pastor in churchInfo.gembala" :key="pastor.name" class="pastor-card">
            <div class="pastor-image">
              <img :src="pastor.image" :alt="pastor.name" v-if="pastor.image" />
              <div v-else class="pastor-placeholder">
                <div class="pastor-avatar">
                  {{ getInitials(pastor.name) }}
                </div>
              </div>
            </div>
            <div class="pastor-info">
              <h3 class="pastor-name">{{ pastor.name }}</h3>
              <p class="pastor-position">{{ pastor.position }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>
</template>

<script>
import DetailLayout from '@/components/layout/DetailLayout.vue'

export default {
  name: 'TentangGereja',
  components: {
    DetailLayout
  },
  
  data() {
    return {
      breadcrumbItems: [
        { text: 'Tentang Gereja' }
      ],
      churchInfo: {
        visiImage: this.getImagePath('church/visi-gereja.jpg'),
        misiImage: this.getImagePath('church/misi-gereja.jpg'),
        visi: 'Menjadikan setiap jemaat murid Yesus dengan cara yang relevan sehingga berdampak bagi lingkungan.',
        misi: [
          'Menyelenggarakan ibadah raya yang menarik dan menggairahkan dengan dukungan sarana yang diperlukan.',
          'Menjadikan ibadah raya sebagai sarana mengajar jemaat untuk memahami firman Tuhan dengan baik dan benar.',
          'Melakukan proses pemuridan melalui kelas 4M (Membership, Maturity, Ministry, dan Mission) dan CORE.',
          'Melakukan proses pemuridan secara pribadi dengan sistem one-on-one.',
          'Melakukan amanat agung Tuhan Yesus, melalui berbagai kegiatan penginjilan dan misi.'
        ],
        gembala: [
          { 
            name: 'Pdt. Fanny Potabuga', 
            position: 'GEMBALA',
            image: this.getImagePath('church/pastors/pdt-fanny-potabuga.jpg')
          },
          { 
            name: 'Pdt. Meity Gerungan-Pesoth', 
            position: 'GEMBALA SENIOR',
            image: this.getImagePath('church/pastors/pdt-meity-gerungan-pesoth.jpg')
          }
        ]
      }
    }
  },
  
  computed: {
    churchContent() {
      return `
        <p>Selamat datang di Gereja Rajawali! Kami adalah komunitas iman yang berdedikasi untuk melayani Tuhan dan sesama dengan penuh kasih. Gereja kami menjadi rumah spiritual bagi keluarga-keluarga Kristen di Manado dan sekitarnya.</p>
        
        <p>Sebagai bagian dari tubuh Kristus, kami berkomitmen untuk terus bertumbuh dalam iman, pengharapan, dan kasih. Melalui ibadah, persekutuan, dan pelayanan, kami berusaha menjadi berkat bagi masyarakat di sekitar kami.</p>
      `
    },

    churchThumbnail() {
      return this.getImagePath('church/gereja-utama.jpg')
    }
  },
  
  methods: {
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    getImagePath(imagePath) {
      try {
        return require(`@/assets/${imagePath}`)
      } catch (error) {
        console.warn(`Image not found: ${imagePath}`)
        return null // Fallback ke placeholder jika gambar tidak ditemukan
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   STORY SECTION (Our Story Style)
========================================= */
.story-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.story-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  align-items: flex-start;
}

.story-left {
  position: sticky;
  top: 100px;
}

.story-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0;
  line-height: 1.1;
}

.story-right {
  padding-top: 20px;
}

.story-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #4a4a4a;
  margin-bottom: 24px;
}

.story-text:last-child {
  margin-bottom: 0;
}

/* ========================================
   VISION MISSION SECTION
========================================= */
.vision-mission-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.vm-container {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.vm-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.vm-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.vm-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.vm-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #41442A, #5a5e3d);
}

.visi-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.misi-placeholder {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.vm-icon {
  font-size: 80px;
  color: white;
}

.vm-content {
  padding: 20px;
}

.vm-title {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
}

.vm-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #4a4a4a;
  margin: 0;
}

.misi-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.misi-list li {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #4a4a4a;
  margin-bottom: 16px;
  padding-left: 30px;
  position: relative;
  counter-increment: misi-counter;
}

.misi-list {
  counter-reset: misi-counter;
}

.misi-list li:before {
  content: counter(misi-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: #41442A;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.misi-list li:last-child {
  margin-bottom: 0;
}

/* ========================================
   PASTORS SECTION
========================================= */
.pastors-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pastors-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #2d2d2d;
  text-align: center;
  margin: 0 0 40px 0;
  line-height: 1.1;
}

.pastors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.pastor-card {
  text-align: center;
}

.pastor-image {
  width: 100%;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #f8f9fa;
}

.pastor-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.pastor-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #41442A, #5a5e3d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pastor-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pastor-info {
  padding: 0 10px;
}

.pastor-name {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 8px 0;
}

.pastor-position {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ========================================
   TABLET RESPONSIVE
========================================= */
@media (max-width: 1024px) {
  .story-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .story-left {
    position: static;
  }
  
  .story-title {
    font-size: 36px;
    text-align: center;
  }
  
  .vm-block {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .vm-image {
    height: 250px;
  }
  
  .vm-icon {
    font-size: 60px;
  }
  
  .vm-title {
    font-size: 28px;
    text-align: center;
  }
  
  .pastors-title {
    font-size: 36px;
  }
  
  .pastor-image {
    height: 300px;
  }
  
  .pastor-avatar {
    width: 100px;
    height: 100px;
    font-size: 28px;
  }
}

/* ========================================
   MOBILE RESPONSIVE
========================================= */
@media (max-width: 768px) {
  .story-section,
  .vision-mission-section,
  .pastors-section {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .story-title {
    font-size: 28px;
  }
  
  .story-text {
    font-size: 14px;
  }
  
  .vm-container {
    gap: 40px;
  }
  
  .vm-image {
    height: 200px;
  }
  
  .vm-icon {
    font-size: 40px;
  }
  
  .vm-title {
    font-size: 24px;
  }
  
  .vm-text {
    font-size: 14px;
  }
  
  .misi-list li {
    font-size: 14px;
    padding-left: 25px;
  }
  
  .misi-list li:before {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }
  
  .pastors-title {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  .pastors-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .pastor-image {
    height: 250px;
  }
  
  .pastor-avatar {
    width: 80px;
    height: 80px;
    font-size: 24px;
  }
  
  .pastor-name {
    font-size: 18px;
  }
  
  .pastor-position {
    font-size: 12px;
  }
}

/* ========================================
   ANIMATIONS
========================================= */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.story-section,
.vision-mission-section,
.pastors-section {
  animation: fadeInUp 0.6s ease-out;
}

.pastor-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pastor-card:hover {
  transform: translateY(-5px);
}

.pastor-image {
  transition: transform 0.3s ease;
}

.pastor-card:hover .pastor-image {
  transform: scale(1.02);
}

/* Stagger animation */
.pastor-card:nth-child(1) { animation-delay: 0.1s; }
.pastor-card:nth-child(2) { animation-delay: 0.2s; }

.vm-block:nth-child(1) { animation-delay: 0.2s; }
.vm-block:nth-child(2) { animation-delay: 0.4s; }
</style>