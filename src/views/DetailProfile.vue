<!-- src/views/DetailProfile.vue - Responsive Profile Details -->
<template>
  <div class="profile-detail-container">
    
    <!-- === DESKTOP LAYOUT (≥769px) === -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />
      
      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Desktop Profile Form -->
        <div class="desktop-profile-wrapper">
          
          <!-- Desktop Header -->
          <div class="desktop-header">
            <h1 class="desktop-title">Detail Profil</h1>
            <p class="desktop-subtitle">Kelola informasi pribadi Anda</p>
          </div>
          
          <!-- Desktop Profile Grid -->
          <div class="desktop-profile-grid">
            
            <!-- Photo Section -->
            <div class="desktop-photo-section">
              <h2 class="section-title">Foto Profil</h2>
              <div class="desktop-photo-container">
                <div class="desktop-profile-photo">
                  <span class="desktop-photo-text">{{ userInitial }}</span>
                </div>
                <button class="desktop-change-photo-btn" @click="changePhoto">
                  <Camera class="camera-icon" />
                  Ubah Foto Profil
                </button>
              </div>
            </div>
            
            <!-- Form Section -->
            <div class="desktop-form-section">
              <div class="form-header">
                <h2 class="section-title">Informasi Pribadi</h2>
                <div class="form-actions">
                  <ButtonPrimary 
                    v-if="!isEditing" 
                    @click="startEditing"
                    variant="secondary"
                  >
                    <Edit class="btn-icon" />
                    Edit Profile
                  </ButtonPrimary>
                  
                  <div v-else class="edit-button-group">
                    <ButtonPrimary 
                      @click="cancelEditing"
                      variant="secondary"
                    >
                      <X class="btn-icon" />
                      Batal
                    </ButtonPrimary>
                    <ButtonPrimary 
                      @click="saveProfile"
                      :loading="isLoading"
                      :disabled="isLoading"
                    >
                      <Check class="btn-icon" />
                      {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
              
              <!-- Desktop Form Grid -->
              <div class="desktop-form-grid">
                <!-- Row 1 -->
                <div class="form-row">
                  <div class="nama-field-container">
                    <FormInput
                      id="desktop-profile-nama"
                      label="Nama Lengkap"
                      v-model="profileData.nama"
                      placeholder="Masukkan nama lengkap"
                      type="text"
                      :disabled="true"
                      :required="true"
                    />
                    <small class="helper-text">Nama tidak dapat diubah</small>
                  </div>
                  <FormInput
                    id="desktop-profile-tanggal-lahir"
                    label="Tanggal Lahir"
                    v-model="profileData.tanggalLahir"
                    type="date"
                    :disabled="!isEditing"
                  />
                </div>
                
                <!-- Row 2 -->
                <div class="form-row">
                  <SelectDropdown
                    id="desktop-profile-status"
                    label="Status"
                    v-model="profileData.status"
                    :disabled="!isEditing"
                    :options="statusOptions"
                    placeholder="Pilih status"
                  />
                  <SelectDropdown
                    id="desktop-profile-jenis-kelamin"
                    label="Jenis Kelamin"
                    v-model="profileData.jenisKelamin"
                    :disabled="!isEditing"
                    :options="jenisKelaminOptions"
                    placeholder="Pilih jenis kelamin"
                  />
                </div>
                
                <!-- Row 3 -->
                <div class="form-row">
                  <SelectDropdown
                    id="desktop-profile-sektor"
                    label="Sektor"
                    v-model="profileData.sektor"
                    :disabled="!isEditing"
                    :options="sektorOptions"
                    placeholder="Pilih sektor"
                  />
                  <FormInput
                    id="desktop-profile-no-telp"
                    label="No. Telepon"
                    v-model="profileData.noTelp"
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                    :disabled="!isEditing"
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
    
    <!-- === MOBILE LAYOUT (≤768px) === -->
    <div class="mobile-layout">
      <div class="profile-wrapper">
        <!-- Header dengan tombol back -->
        <HeaderWithBack title="Profile" />
  
        <!-- Profile Photo Section -->
        <div class="photo-section">
          <div class="profile-photo">
            <span class="photo-text">{{ userInitial }}</span>
          </div>
          <button class="change-photo-btn" @click="changePhoto">
            Ubah Foto Profil
          </button>
        </div>
  
        <!-- Form Fields menggunakan component yang ada -->
        <div class="form-section">
          <!-- Nama -->
          <div class="nama-field-container">
            <FormInput
              id="profile-nama"
              label="Nama"
              v-model="profileData.nama"
              placeholder="Masukkan nama lengkap"
              type="text"
              :disabled="true"
              :required="true"
            />
            <small class="helper-text">Nama tidak dapat diubah</small>
          </div>
  
          <!-- Tanggal Lahir -->
          <FormInput
            id="profile-tanggal-lahir"
            label="Tanggal lahir"
            v-model="profileData.tanggalLahir"
            type="date"
            :disabled="!isEditing"
          />
  
          <!-- Status -->
          <SelectDropdown
            id="profile-status"
            label="Status"
            v-model="profileData.status"
            :disabled="!isEditing"
            :options="statusOptions"
            placeholder="Pilih status"
          />
  
          <!-- Sektor -->
          <SelectDropdown
            id="profile-sektor"
            label="Sektor"
            v-model="profileData.sektor"
            :disabled="!isEditing"
            :options="sektorOptions"
            placeholder="Pilih sektor"
          />
  
          <!-- Jenis Kelamin -->
          <SelectDropdown
            id="profile-jenis-kelamin"
            label="Jenis Kelamin"
            v-model="profileData.jenisKelamin"
            :disabled="!isEditing"
            :options="jenisKelaminOptions"
            placeholder="Pilih jenis kelamin"
          />
  
          <!-- No. Telepon -->
          <FormInput
            id="profile-no-telp"
            label="No. Telp"
            v-model="profileData.noTelp"
            placeholder="08xxxxxxxxxx"
            type="tel"
            :disabled="!isEditing"
          />
        </div>
  
        <!-- Action Buttons -->
        <div class="action-buttons">
          <ButtonPrimary 
            v-if="!isEditing" 
            @click="startEditing"
            :fullWidth="true"
          >
            <Edit class="btn-icon" />
            Edit Profile
          </ButtonPrimary>
          
          <div v-else class="edit-actions">
            <ButtonPrimary 
              @click="cancelEditing"
              variant="secondary"
              :fullWidth="false"
            >
              <X class="btn-icon" />
              Batal
            </ButtonPrimary>
            <ButtonPrimary 
                @click="saveProfile"
                :fullWidth="false"
                :loading="isLoading"
                :disabled="isLoading"
            >
                <Check class="btn-icon" />
                {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import FormInput from '@/components/common/FormInput.vue'
import SelectDropdown from '@/components/common/SelectDropdown.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { Edit, Check, X, Camera } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { updateUserProfile } from '@/services/profile.js'

export default {
  name: 'DetailProfile',
  components: {
    HeaderWithBack,
    DesktopNavbar,
    BreadcrumbDesktop,
    FormInput,
    SelectDropdown,
    ButtonPrimary,
    Edit,
    Check,
    X,
    Camera
  },
  
  data() {
    return {
      isEditing: false,
      isLoading: false,
      profileData: {
        nama: '',
        tanggalLahir: '',
        status: '',
        sektor: '',
        jenisKelamin: '',
        noTelp: ''
      },
      originalData: {}, // Backup data untuk cancel
      
      // Breadcrumb items untuk desktop
      breadcrumbItems: [
        { text: 'Profile', to: '/account' },
        { text: 'Detail Profile', to: '/detail-profile', active: true }
      ],
      
      // Options untuk dropdown
      statusOptions: ['Menikah', 'Single', 'Janda/Duda'],
      sektorOptions: ['Tesalonika', 'Anugerah'],
      jenisKelaminOptions: ['Laki-laki', 'Perempuan']
    }
  },
    
    computed: {
      userStore() {
        return useUserStore()
      },
      
      userInitial() {
        return this.profileData.nama.charAt(0).toUpperCase() || 'U'
      }
    },
    
    created() {
      this.loadUserProfile()
    },
    
    methods: {
      loadUserProfile() {
        console.log('📋 [DetailProfile] Loading user profile...')
        
        // Ambil data asli dari userStore tanpa default values
        const user = this.userStore.user
        
        if (user) {
          console.log('👤 [DetailProfile] Raw user data:', user)
          
          this.profileData = {
            // Ambil nama dari berbagai kemungkinan field
            nama: user.nama || user.namaUser || '',
            
            // Format tanggal lahir dari database
            tanggalLahir: this.formatDateForInput(user.tanggalLahir) || '',
            
            // Ambil status dari database
            status: user.status || '',
            
            // Ambil sektor dari database
            sektor: user.sektor || '',
            
            // Ambil jenis kelamin dari database
            jenisKelamin: user.jenisKelamin || '',
            
            // Ambil nomor telepon dari database
            noTelp: user.noTelp || ''
          }
          
          console.log('✅ [DetailProfile] Profile data loaded:', this.profileData)
        } else {
          console.log('❌ [DetailProfile] No user data found in store')
          // Jika tidak ada user data, semua field tetap kosong
        }
      },
      
      formatDateForInput(dateValue) {
        if (!dateValue) return ''
        
        try {
          // Jika dateValue adalah Firestore Timestamp
          if (dateValue.toDate && typeof dateValue.toDate === 'function') {
            const date = dateValue.toDate()
            return date.toISOString().split('T')[0]
          }
          
          // Jika dateValue adalah string atau Date object
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) {
            console.warn('⚠️ [DetailProfile] Invalid date format:', dateValue)
            return ''
          }
          
          return date.toISOString().split('T')[0]
        } catch (error) {
          console.error('❌ [DetailProfile] Error formatting date:', error)
          return ''
        }
      },
      
      startEditing() {
        this.isEditing = true
        // Backup original data untuk cancel
        this.originalData = { ...this.profileData }
        console.log('✏️ [DetailProfile] Started editing mode')
      },
      
      cancelEditing() {
        this.isEditing = false
        // Restore original data
        this.profileData = { ...this.originalData }
        console.log('❌ [DetailProfile] Cancelled editing, restored original data')
      },
      
      async saveProfile() {
        try {
            console.log('💾 [DetailProfile] Saving profile...', this.profileData)
            
            // Tampilkan loading state
            this.isLoading = true
            
            // ⭐ UPDATE KE FIREBASE DATABASE dengan history tracking
            // Gunakan ID yang tersedia (prioritas: id > documentId > nama sebagai fallback)
            const userId = this.userStore.user.id || 
                        this.userStore.user.documentId || 
                        this.userStore.user.nama
            
            if (!userId) {
            throw new Error('User identifier tidak ditemukan. Silakan login ulang.')
            }
            
            console.log('🔍 [DetailProfile] Using userId:', userId)
            
            const result = await updateUserProfile(userId, {
            // nama: this.profileData.nama, // Nama tidak boleh diupdate
            tanggalLahir: this.profileData.tanggalLahir,
            status: this.profileData.status,
            sektor: this.profileData.sektor,
            jenisKelamin: this.profileData.jenisKelamin,
            noTelp: this.profileData.noTelp
            }, 'user') // 'user' = diupdate oleh user sendiri
            
            console.log('🔥 [DetailProfile] Firebase update result:', result)
            
            // Update local userStore dan localStorage
            const updatedUser = {
            ...this.userStore.user,
            // nama tetap dari data awal, tidak diupdate dari form
            // nama: this.profileData.nama,
            // namaUser: this.profileData.nama,
            tanggalLahir: this.profileData.tanggalLahir,
            status: this.profileData.status,
            sektor: this.profileData.sektor,
            jenisKelamin: this.profileData.jenisKelamin,
            noTelp: this.profileData.noTelp,
            lastUpdated: new Date().toISOString()
            }
            
            // Set user data ke store
            this.userStore.setUser(updatedUser)
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser))
            
            this.isEditing = false
            this.isLoading = false
            
            console.log('✅ [DetailProfile] Profile saved successfully')
            console.log('📋 [DetailProfile] Updated user data:', updatedUser)
            
            // Tampilkan pesan sukses dengan info changes
            const changesCount = result.changesCount || 0
            if (changesCount > 0) {
            alert(`✅ Profile berhasil disimpan!\n🔄 ${changesCount} perubahan tersimpan di database`)
            } else {
            alert('ℹ️ Tidak ada perubahan yang terdeteksi')
            }
            
        } catch (error) {
            console.error('❌ [DetailProfile] Error saving profile:', error)
            this.isLoading = false
            
            // Handle specific errors
            if (error.message.includes('User tidak ditemukan')) {
            alert('❌ User tidak ditemukan di database!')
            } else if (error.message.includes('permission')) {
            alert('❌ Tidak memiliki permission untuk mengubah data!')
            } else {
            alert('❌ Gagal menyimpan profile ke database!\n\nError: ' + error.message)
            }
        }
        },
      
      changePhoto() {
        // TODO: Implementasi change photo
        alert('📷 Fitur ubah foto akan tersedia setelah development selesai!')
      }
    }
  }
  </script>
  
  <style scoped>
  .profile-detail-container {
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .profile-wrapper {
    padding: 16px;
    max-width: 360px;
    margin: 0 auto;
  }
  
  /* Photo Section */
  .photo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    margin-bottom: 24px;
  }
  
  .profile-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .photo-text {
    color: white;
    font-size: 36px;
    font-weight: bold;
    font-family: 'Inter';
  }
  
  .change-photo-btn {
    background: none;
    border: none;
    color: #007AFF;
    font-family: 'Inter';
    font-size: 16px;
    cursor: pointer;
    padding: 8px;
  }
  
  .change-photo-btn:hover {
    text-decoration: underline;
  }
  
  /* Form Section */
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  /* Action Buttons */
  .action-buttons {
    padding: 20px 0;
  }
  
  .edit-actions {
    display: flex;
    gap: 12px;
  }
  
  .edit-actions .btn-icon {
    width: 18px;
    height: 18px;
  }
  
  .btn-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }
  
  /* Nama Field Container - Global untuk mobile dan desktop */
  .nama-field-container {
    position: relative;
  }
  
  .helper-text {
    display: block;
    font-size: 11px;
    color: #888;
    margin: 6px 0 0 0;
    font-style: normal;
    font-family: 'Inter', sans-serif;
    line-height: 1.3;
  }
  
  /* === DESKTOP RESPONSIVE LAYOUT === */

/* Desktop layout - hidden on mobile */
.desktop-layout {
  display: none;
}

/* Mobile layout - shown by default */
.mobile-layout {
  display: block;
}

/* === DESKTOP STYLES (≥769px) === */
@media (min-width: 769px) {
  .desktop-layout {
    display: block;
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .mobile-layout {
    display: none;
  }
  
  .desktop-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
    min-height: calc(100vh - 80px);
  }
  
  /* Desktop Header */
  .desktop-header {
    text-align: center;
    margin-bottom: 32px;
    padding: 0 0 32px 0;
    border-bottom: 1px solid #e9ecef;
  }
  
  .desktop-title {
    font-size: 32px;
    font-weight: 700;
    color: #2d2d2d;
    margin: 0 0 8px 0;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  
  /* Desktop Profile Wrapper */
  .desktop-profile-wrapper {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid #f0f0f0;
  }
  
  /* Desktop Profile Grid */
  .desktop-profile-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 40px;
    align-items: start;
  }
  
  /* Section Titles */
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #2d2d2d;
    margin: 0 0 20px 0;
    font-family: 'Inter', sans-serif;
  }
  
  /* Desktop Photo Section */
  .desktop-photo-section {
    display: flex;
    flex-direction: column;
  }
  
  .desktop-photo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
    background: #f8f9fa;
    border-radius: 16px;
    border: 1px solid #e9ecef;
  }
  
  .desktop-profile-photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #41442A;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  .desktop-photo-text {
    color: white;
    font-size: 48px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-change-photo-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #41442A;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .desktop-change-photo-btn:hover {
    background: #5a5e3d;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(65, 68, 42, 0.2);
  }
  
  .camera-icon {
    width: 18px;
    height: 18px;
  }
  
  /* Desktop Form Section */
  .desktop-form-section {
    display: flex;
    flex-direction: column;
  }
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .form-actions {
    display: flex;
    gap: 12px;
  }
  
  .desktop-form-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  /* Desktop Nama Field Container */
  .desktop-form-section .nama-field-container {
    position: relative;
  }
  
  .desktop-form-section .helper-text {
    display: block;
    font-size: 11px;
    color: #888;
    margin: 6px 0 0 0;
    font-style: normal;
    font-family: 'Inter', sans-serif;
    line-height: 1.3;
  }
  
  /* Form inputs styling for desktop */
  .desktop-form-section .form-input-container {
    margin-bottom: 0;
  }
  
  .desktop-form-section .form-label {
    font-size: 14px;
    font-weight: 600;
    color: #2d2d2d;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
  }
  
  .desktop-form-section .form-input,
  .desktop-form-section .form-select {
    border-radius: 12px;
    border: 1px solid #e9ecef;
    padding: 14px 16px;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .desktop-form-section .form-input:focus,
  .desktop-form-section .form-select:focus {
    border-color: #41442A;
    box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
    outline: none;
  }
  
  .desktop-form-section .form-input:disabled,
  .desktop-form-section .form-select:disabled {
    background-color: #f8f9fa;
    color: #666;
    cursor: not-allowed;
  }
}

/* === TABLET RESPONSIVE (769px - 1024px) === */
@media (min-width: 769px) and (max-width: 1024px) {
  .desktop-content {
    padding: 24px;
  }
  
  .desktop-profile-wrapper {
    padding: 32px 24px;
  }
  
  .desktop-profile-grid {
    grid-template-columns: 250px 1fr;
    gap: 32px;
  }
  
  .desktop-profile-photo {
    width: 100px;
    height: 100px;
  }
  
  .desktop-photo-text {
    font-size: 40px;
  }
  
  .form-row {
    gap: 16px;
  }
}

/* === LARGE TABLET (1025px - 1200px) === */
@media (min-width: 1025px) and (max-width: 1200px) {
  .desktop-profile-grid {
    grid-template-columns: 280px 1fr;
    gap: 36px;
  }
}
  
  </style>