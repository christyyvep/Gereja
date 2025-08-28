#!/usr/bin/env node
// scripts/run-telegram-scheduler.js
// Script untuk menjalankan scheduled telegram messages (untuk cron job)

const { initializeApp } = require('firebase/app')
const { getFirestore } = require('firebase/firestore')

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

async function runScheduledMessages() {
  try {
    console.log('🚀 Running Telegram Scheduler...')
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    // Import and run scheduler functions
    const { processScheduledMessages, getPendingSchedules } = require('../src/services/telegramScheduler')
    
    // Get pending schedules
    const pendingSchedules = await getPendingSchedules()
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`)
    
    if (pendingSchedules.length === 0) {
      console.log('✅ No pending schedules to process')
      process.exit(0)
    }
    
    // Get current date
    const today = new Date().toISOString().split('T')[0]
    
    // Filter schedules for today
    const todaySchedules = pendingSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0]
      return scheduleDate === today
    })
    
    if (todaySchedules.length === 0) {
      console.log(`📅 No schedules for today (${today})`)
      process.exit(0)
    }
    
    console.log(`🎯 Processing ${todaySchedules.length} schedules for today`)
    
    // Process today's schedules
    const results = await processScheduledMessages(todaySchedules)
    
    if (results.success) {
      console.log(`✅ Successfully processed ${results.processed} schedules`)
      if (results.failed > 0) {
        console.warn(`⚠️ ${results.failed} schedules failed`)
        process.exit(1)
      }
    } else {
      console.error('❌ Failed to process schedules:', results.error)
      process.exit(1)
    }
    
    console.log('🎉 Telegram Scheduler completed successfully')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error running scheduled messages:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runScheduledMessages()
}

module.exports = { runScheduledMessages }
