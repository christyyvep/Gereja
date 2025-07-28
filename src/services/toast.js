import { createApp } from 'vue'
import ToastNotification from '@/components/common/Toast.vue'

class ToastService {
  constructor() {
    this.toasts = []
    this.containerId = 'toast-container'
    this.maxToasts = 5
    this.defaultDuration = 3000
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} options.type - Toast type (success, error, warning, info)
   * @param {number} options.duration - Duration in ms (0 = permanent)
   * @param {string} options.position - Position (toast-top, toast-bottom, toast-center)
   * @param {boolean} options.closable - Show close button
   */
  show(options) {
    const toastOptions = {
      message: '',
      type: 'info',
      duration: this.defaultDuration,
      position: 'toast-top',
      closable: false,
      ...options
    }

    // Limit jumlah toast yang tampil
    if (this.toasts.length >= this.maxToasts) {
      this.toasts[0].close()
    }

    // Create container if not exists
    this.ensureContainer()

    // Create Vue app instance untuk toast
    const toastApp = createApp(ToastNotification, {
      ...toastOptions,
      onClose: () => this.removeToast(toastInstance),
      onDestroy: () => this.destroyToast(toastInstance)
    })

    // Mount toast
    const toastElement = document.createElement('div')
    const toastInstance = {
      app: toastApp,
      element: toastElement,
      close: () => {
        const component = toastApp._component?.proxy || toastApp._instance?.proxy
        if (component && component.close) {
          component.close()
        }
      }
    }

    // Mount dan tambahkan ke DOM
    toastApp.mount(toastElement)
    this.toasts.push(toastInstance)

    return toastInstance
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  success(message, options = {}) {
    return this.show({
      message,
      type: 'success',
      ...options
    })
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  error(message, options = {}) {
    return this.show({
      message,
      type: 'error',
      duration: 5000, // Error toast lebih lama
      ...options
    })
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  warning(message, options = {}) {
    return this.show({
      message,
      type: 'warning',
      duration: 4000,
      ...options
    })
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  info(message, options = {}) {
    return this.show({
      message,
      type: 'info',
      ...options
    })
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(toast => {
      toast.close()
    })
  }

  /**
   * Remove toast from array
   * @param {Object} toastInstance - Toast instance to remove
   */
  removeToast(toastInstance) {
    const index = this.toasts.indexOf(toastInstance)
    if (index > -1) {
      this.toasts.splice(index, 1)
    }
  }

  /**
   * Destroy toast completely
   * @param {Object} toastInstance - Toast instance to destroy
   */
  destroyToast(toastInstance) {
    try {
      if (toastInstance.app && toastInstance.app.unmount) {
        toastInstance.app.unmount()
      }
      
      if (toastInstance.element && toastInstance.element.parentNode) {
        toastInstance.element.parentNode.removeChild(toastInstance.element)
      }
    } catch (error) {
      console.warn('Error destroying toast:', error)
    }
  }

  /**
   * Ensure toast container exists
   */
  ensureContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div')
      container.id = this.containerId
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
      `
      document.body.appendChild(container)
    }
  }
}

// Create singleton instance
const toastService = new ToastService()

// Export service dan convenience functions
export default toastService

// Export convenience functions untuk import langsung
export const toast = toastService
export const showToast = (message, type = 'info', options = {}) => 
  toastService.show({ message, type, ...options })
export const showSuccess = (message, options = {}) => 
  toastService.success(message, options)
export const showError = (message, options = {}) => 
  toastService.error(message, options)
export const showWarning = (message, options = {}) => 
  toastService.warning(message, options)
export const showInfo = (message, options = {}) => 
  toastService.info(message, options)

// Vue 3 Plugin (opsional)
export const ToastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = toastService
    app.provide('toast', toastService)
  }
}
