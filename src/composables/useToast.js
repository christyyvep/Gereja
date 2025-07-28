import { inject } from 'vue'
import toastService from '@/services/toast'

/**
 * Composable untuk menggunakan toast notifications
 * @returns {Object} Object dengan fungsi-fungsi toast
 */
export function useToast() {
  // Coba inject dari plugin jika tersedia
  const injectedToast = inject('toast', null)
  const toast = injectedToast || toastService

  return {
    // Toast service instance
    toast,
    
    // Convenience methods
    showToast: (message, type = 'info', options = {}) => 
      toast.show({ message, type, ...options }),
    
    showSuccess: (message, options = {}) => 
      toast.success(message, options),
    
    showError: (message, options = {}) => 
      toast.error(message, options),
    
    showWarning: (message, options = {}) => 
      toast.warning(message, options),
    
    showInfo: (message, options = {}) => 
      toast.info(message, options),
    
    // Utility methods
    clear: () => toast.clear(),
    
    // Predefined common toasts
    copySuccess: (item = 'Data') => 
      toast.success(`${item} berhasil disalin!`),
    
    copyError: (item = 'Data') => 
      toast.error(`Gagal menyalin ${item.toLowerCase()}`),
    
    saveSuccess: (item = 'Data') => 
      toast.success(`${item} berhasil disimpan!`),
    
    saveError: (item = 'Data') => 
      toast.error(`Gagal menyimpan ${item.toLowerCase()}`),
    
    deleteSuccess: (item = 'Data') => 
      toast.success(`${item} berhasil dihapus!`),
    
    deleteError: (item = 'Data') => 
      toast.error(`Gagal menghapus ${item.toLowerCase()}`),
    
    updateSuccess: (item = 'Data') => 
      toast.success(`${item} berhasil diperbarui!`),
    
    updateError: (item = 'Data') => 
      toast.error(`Gagal memperbarui ${item.toLowerCase()}`),
    
    networkError: () => 
      toast.error('Koneksi internet bermasalah. Silakan coba lagi.'),
    
    validationError: (message = 'Data tidak valid') => 
      toast.error(message),
    
    comingSoon: (feature = 'Fitur') => 
      toast.info(`${feature} akan segera tersedia!`),
    
    noChanges: () => 
      toast.info('Tidak ada perubahan yang terdeteksi'),
    
    processingError: (action = 'Proses') => 
      toast.error(`${action} gagal. Silakan coba lagi.`)
  }
}

// Export default untuk mudah import
export default useToast
