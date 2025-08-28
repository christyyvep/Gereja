// Debug Helper untuk test devotional dan Telegram
import telegramService from '@/services/telegramService'
import { db } from '@/services/firebase'
import { addDevotional } from '@/services/devotionals'

export class DevotionalDebugger {
  async testAll() {
    console.log('🔧 Starting Comprehensive Devotional Debug...')
    
    const results = {
      telegramConnection: await this.testTelegramConnection(),
      firebaseConnection: await this.testFirebaseConnection(),
      telegramUsers: await this.checkTelegramUsers(),
      devotionalFormat: await this.testDevotionalFormat(),
      actualSave: await this.testActualSave()
    }
    
    console.log('📊 Complete Debug Results:', results)
    this.provideFixes(results)
    
    return results
  }
  
  async testTelegramConnection() {
    try {
      console.log('📱 Testing Telegram Connection...')
      const result = await telegramService.testConnection()
      console.log('🔌 Telegram connection result:', result)
      return result
    } catch (error) {
      console.error('❌ Telegram connection failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  async testFirebaseConnection() {
    try {
      console.log('🔥 Testing Firebase Connection...')
      
      if (!db) {
        throw new Error('Firebase db not initialized')
      }
      
      // Simple test - try to access Firebase
      console.log('✅ Firebase db is available:', !!db)
      return { success: true, db: !!db }
    } catch (error) {
      console.error('❌ Firebase test failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  async checkTelegramUsers() {
    try {
      console.log('👥 Checking Telegram Users...')
      
      const pending = await telegramService.getPendingUsers()
      const approved = await telegramService.getApprovedUsers()
      const stats = await telegramService.getJemaatStats()
      
      const result = {
        pending: pending.length,
        approved: approved.length,
        stats,
        pendingUsers: pending,
        approvedUsers: approved
      }
      
      console.log('📊 Telegram users result:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to check Telegram users:', error)
      return { success: false, error: error.message }
    }
  }
  
  async testDevotionalFormat() {
    try {
      console.log('📝 Testing Devotional Format...')
      
      const testData = {
        title: 'Debug Test Renungan',
        verse: 'Yohanes 3:16 - "Karena begitu besar kasih Allah akan dunia ini..."',
        content: 'Ini adalah test content untuk debugging masalah renungan',
        reflection: 'Test reflection untuk melihat apakah format message bekerja dengan baik',
        prayer: 'Ya Tuhan, bantulah kami mengatasi masalah teknis ini. Dalam nama Yesus. Amin.',
        category: 'harian',
        createdBy: 'debug-admin'
      }
      
      console.log('📋 Test devotional data:', testData)
      
      // Test Telegram format
      const telegramMessage = telegramService.formatRenunganMessage(testData)
      console.log('📄 Formatted Telegram message:')
      console.log(telegramMessage)
      console.log('📏 Message length:', telegramMessage.length)
      
      // Test if message is valid
      const isValid = testData.title && testData.title.trim().length > 0
      
      return {
        success: true,
        testData,
        telegramMessage,
        messageLength: telegramMessage.length,
        isValid
      }
    } catch (error) {
      console.error('❌ Devotional format test failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  async testActualSave() {
    try {
      console.log('💾 Testing Actual Devotional Save...')
      
      const testData = {
        title: 'DEBUG Test Renungan - ' + new Date().toLocaleTimeString(),
        verse: 'Mazmur 23:1 - "TUHAN adalah gembalaku, takkan kekurangan aku."',
        content: 'Test content untuk memastikan penyimpanan berfungsi',
        reflection: 'Ini adalah test reflection untuk debugging',
        prayer: 'Ya Tuhan, terima kasih atas debugging yang berhasil. Amin.',
        category: 'debug',
        createdBy: 'debug-system',
        isTest: true // Flag untuk marking sebagai test data
      }
      
      console.log('🚀 Attempting to save test devotional...')
      const devotionalId = await addDevotional(testData)
      
      console.log('✅ Test devotional saved successfully! ID:', devotionalId)
      
      return {
        success: true,
        devotionalId,
        testData,
        message: 'Devotional berhasil disimpan!'
      }
    } catch (error) {
      console.error('❌ Test save failed:', error)
      return {
        success: false,
        error: error.message,
        stack: error.stack
      }
    }
  }
  
  provideFixes(results) {
    console.log('\n🔧 REKOMENDASI PERBAIKAN:')
    
    if (!results.telegramConnection?.success) {
      console.error('🚨 TELEGRAM ISSUE:')
      console.log('   • Check bot token di file .env')
      console.log('   • Pastikan VUE_APP_TELEGRAM_BOT_TOKEN sudah diset')
      console.log('   • Test manual: https://api.telegram.org/bot<TOKEN>/getMe')
    }
    
    if (!results.firebaseConnection?.success) {
      console.error('🚨 FIREBASE ISSUE:')
      console.log('   • Check Firebase configuration')
      console.log('   • Pastikan Firebase SDK ter-initialize dengan benar')
      console.log('   • Check Firestore rules')
    }
    
    if (results.telegramUsers?.approved === 0) {
      console.warn('⚠️ NO APPROVED USERS:')
      console.log('   • Renungan akan tersimpan tapi tidak ada yang menerima')
      console.log('   • Pergi ke /admin/telegram untuk approve users')
    }
    
    if (!results.actualSave?.success) {
      console.error('🚨 SAVE ISSUE:')
      console.log('   • Masalah utama ada di penyimpanan devotional')
      console.log('   • Check error details:', results.actualSave?.error)
    } else {
      console.log('✅ SAVE WORKING: Masalah bukan di penyimpanan')
    }
  }
  
  // Method untuk cleanup test data
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...')
    // Implement cleanup if needed
  }
}

// Quick system check function
export async function runSystemCheck() {
  console.log('🔧 Running quick system check...')
  
  const devotionalDebugger = new DevotionalDebugger()
  const results = await devotionalDebugger.testAll()
  
  // Determine overall status
  let status = 'healthy'
  
  if (!results.firebaseConnection?.success || !results.telegramConnection?.success) {
    status = 'critical'
  } else if (!results.actualSave?.success) {
    status = 'warning'
  } else if (results.telegramUsers?.approved === 0) {
    status = 'warning'
  }
  
  return {
    status,
    details: results,
    timestamp: new Date().toISOString()
  }
}

// Export untuk digunakan di komponen Vue
export const debugDevotional = new DevotionalDebugger()

// Export default untuk import mudah
export default debugDevotional
