// src/utils/toast.js
let toastContainer = null

// Membuat container untuk toast
function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

// Membuat elemen toast
function createToast(message, type = 'info') {
  const toast = document.createElement('div')
  
  const colors = {
    success: { bg: '#27ae60', border: '#219a52' },
    error: { bg: '#e74c3c', border: '#c0392b' },
    warning: { bg: '#f39c12', border: '#e67e22' },
    info: { bg: '#3498db', border: '#2980b9' }
  }
  
  const color = colors[type] || colors.info
  
  toast.style.cssText = `
    background: ${color.bg};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    border-left: 4px solid ${color.border};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    word-wrap: break-word;
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    cursor: pointer;
  `
  
  toast.textContent = message
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    removeToast(toast)
  })
  
  return toast
}

// Menghapus toast
function removeToast(toast) {
  toast.style.transform = 'translateX(100%)'
  toast.style.opacity = '0'
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 300)
}

// Menampilkan toast
function showToast(message, type = 'info', duration = 4000) {
  const container = createToastContainer()
  const toast = createToast(message, type)
  
  container.appendChild(toast)
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Auto remove
  setTimeout(() => {
    removeToast(toast)
  }, duration)
}

// Export functions
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration)
}

// Vue plugin untuk global access
export const ToastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = toast
  }
}

export default toast
