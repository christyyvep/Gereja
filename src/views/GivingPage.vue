<template>
  <DetailLayout
    header-title="Giving"
    title="Persepuluhan & Persembahan"
    :description="givingDescription"
    thumbnail="giving"
    category="giving"
    content-type="giving"
    :closing="closingMessage"
    :hideBackButton="true"
    :breadcrumbItems="breadcrumbItems"
  >
    <!-- Slot untuk informasi tambahan -->
    <template #additional-info>
      <!-- Bank Account Information -->
      <div class="bank-info-section">
        <h3>Informasi Rekening</h3>
        <div class="bank-details">
          <div class="bank-row">
            <span class="bank-label">BCA</span>
            <span class="bank-separator">:</span>
            <span class="bank-number">01234567890 (GPdI Rajawali Kanonang)</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot untuk action buttons -->
    <template #action-buttons>
      <div class="giving-actions">
        <!-- Primary button untuk Copy nomor -->
        <ButtonPrimary 
          @click="copyBankNumber"
          :loading="isCopying"
          class="copy-button"
        >
          <Copy class="button-icon" />
          {{ isCopying ? 'Menyalin...' : 'Copy nomor' }}
        </ButtonPrimary>
        
        <!-- Secondary button untuk Download QR -->
        <ButtonPrimary 
          variant="secondary"
          @click="downloadQR"
          :loading="isDownloading"
          class="download-button"
        >
          <Download class="button-icon" />
          {{ isDownloading ? 'Downloading...' : 'Download QR' }}
        </ButtonPrimary>
      </div>
    </template>
  </DetailLayout>
</template>

<script>
import DetailLayout from '@/components/layout/DetailLayout.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { Copy, Download } from 'lucide-vue-next'

export default {
  name: 'GivingPage',
  components: {
    DetailLayout,
    ButtonPrimary,
    Copy,
    Download
  },
  data() {
    return {
      givingDescription: `
        Scan QR kode dengan menggunakan aplikasi Mobile Banking, Dana, Shopee atau pun Ovo untuk 
        memberikan persepuluhan dan persembahan Anda. 
        Anda juga bisa transfer lewat nomor rekening di bawah ini.
      `,
      closingMessage: 'Tuhan Yesus memberkati kemurahan hati Anda. Setiap persembahan yang diberikan dengan sukacita akan dipakai untuk kemajuan Kerajaan Allah.',
      // Custom breadcrumb untuk giving
      breadcrumbItems: [
        { text: 'Giving', to: null } // Current page, no link
      ],
      
      // Loading states untuk better UX
      isCopying: false,
      isDownloading: false
    }
  },
  mounted() {
    // 🔍 DEBUG: Test apakah file giving.png bisa di-load
    console.log('🔍 Testing giving.png...')
    try {
      const testPath = require('@/assets/thumbnails/giving/giving.png')
      console.log('✅ Giving file found:', testPath)
    } catch (error) {
      console.error('❌ Giving file error:', error.message)
    }
  },
  methods: {
    async copyBankNumber() {
      const bankNumber = '01234567890'
      
      try {
        this.isCopying = true
        
        // Copy ke clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(bankNumber)
          this.showToast('✅ Nomor rekening berhasil disalin!')
        } else {
          this.fallbackCopy(bankNumber)
        }
      } catch (error) {
        this.fallbackCopy(bankNumber)
      } finally {
        setTimeout(() => {
          this.isCopying = false
        }, 500) // Small delay untuk better UX
      }
    },
    
    fallbackCopy(text) {
      try {
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          this.showToast('✅ Nomor rekening berhasil disalin!')
        } else {
          this.showToast('❌ Gagal menyalin nomor rekening')
        }
      } catch (err) {
        this.showToast('❌ Gagal menyalin nomor rekening')
      }
    },
    
    async downloadQR() {
      try {
        this.isDownloading = true
        
        // Simulate download process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // TODO: Implementasi download QR code yang sesungguhnya
        this.showToast('📱 Fitur download QR akan segera tersedia')
      } catch (error) {
        this.showToast('❌ Gagal mendownload QR code')
      } finally {
        this.isDownloading = false
      }
    },
    
    showToast(message) {
      // Simple toast notification
      // TODO: Bisa diganti dengan toast component yang lebih baik
      alert(message)
    }
  }
}
</script>

<style scoped>
/* ===== ADDITIONAL INFO SECTIONS ===== */
.bank-info-section {
  margin-bottom: 32px;
}

.bank-info-section h3 {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.bank-details {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
}

.bank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
}

.bank-label {
  font-weight: 600;
  color: #333;
  min-width: 40px;
}

.bank-separator {
  color: #666;
}

.bank-number {
  color: #555;
  flex: 1;
  font-weight: 500;
}

/* ===== ACTION BUTTONS ===== */
.giving-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Override DetailLayout background untuk action section */
:deep(.desktop-action-section) {
  background: white !important; /* Force white background */
  padding: 32px;
}

:deep(.detail-actions) {
  background: white !important; /* Force white background untuk mobile */
}

/* Button icons styling */
.button-icon {
  width: 18px;
  height: 18px;
}

/* Custom styling untuk ButtonPrimary di giving page */
:deep(.copy-button .primary-button),
:deep(.download-button .primary-button) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px; /* Consistent height */
}

/* Ensure ButtonPrimary takes full width in container */
:deep(.copy-button),
:deep(.download-button) {
  width: 100%;
}

:deep(.copy-button .button-container),
:deep(.download-button .button-container) {
  width: 100%;
}

/* ===== RESPONSIVE DESIGN ===== */

/* Mobile adjustments */
@media (max-width: 768px) {
  .bank-info-section h3 {
    font-size: 16px;
  }
  
  .bank-details {
    padding: 12px;
  }
  
  .bank-row {
    font-size: 14px;
  }
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .giving-actions {
    flex-direction: row;
    gap: 16px;
  }
  
  .bank-info-section {
    margin-bottom: 0;
  }
}

/* Large desktop */
@media (min-width: 1024px) {
  .bank-details {
    padding: 20px;
  }
  
  .bank-row {
    font-size: 16px;
  }
}
</style>