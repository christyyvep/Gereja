// Simple fallback for telegram polling service
// Prevents null reference errors

class TelegramPollingServiceFallback {
  constructor() {
    this.isPolling = false
    this.lastUpdateId = 0
    this.pollingDelay = 2000
  }

  getStatus() {
    return {
      isPolling: this.isPolling,
      lastUpdateId: this.lastUpdateId,
      pollingDelay: this.pollingDelay
    }
  }

  async startPolling() {
    console.log('⚠️ Using fallback polling service')
    this.isPolling = true
    return Promise.resolve()
  }

  stopPolling() {
    console.log('⚠️ Using fallback polling service')
    this.isPolling = false
  }
}

// Try to import real service, fallback if failed
let telegramPollingService

try {
  // Dynamic import to handle potential errors
  const module = await import('./telegramPollingService.js')
  telegramPollingService = module.default
  console.log('✅ Real telegram polling service loaded')
} catch (error) {
  console.warn('⚠️ Failed to load telegram polling service, using fallback:', error.message)
  telegramPollingService = new TelegramPollingServiceFallback()
}

export default telegramPollingService
