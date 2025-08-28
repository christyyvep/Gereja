/**
 * COMPREHENSIVE TELEGRAM BACKEND TEST
 * Test all functionality end-to-end
 */

console.log('🚀 Starting Comprehensive Telegram Backend Test...')

const BACKEND_URL = 'https://telegramapi-7hu5np5oka-uc.a.run.app'
const API_TOKEN = 'myr_tF8XVyfGZ2KrpHpd13nLbeArWr0D'

async function comprehensiveTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 MYRAJAWALI TELEGRAM BACKEND COMPREHENSIVE TEST')
  console.log('='.repeat(60))
  
  const results = {
    health: false,
    config: false,
    auth: false,
    getUpdates: false,
    sendMessage: false
  }
  
  // Test 1: Health Check
  console.log('\n1️⃣ Testing Health Check...')
  try {
    const response = await fetch(`${BACKEND_URL}/health`)
    const data = await response.json()
    
    if (response.ok && data.status === 'OK') {
      console.log('✅ Health Check: PASSED')
      console.log(`   Version: ${data.version}`)
      console.log(`   Config Available: ${data.config.telegram && data.config.api ? 'YES' : 'NO'}`)
      results.health = true
    } else {
      console.log('❌ Health Check: FAILED')
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR -', error.message)
  }
  
  // Test 2: Configuration Check
  console.log('\n2️⃣ Testing Configuration...')
  try {
    const response = await fetch(`${BACKEND_URL}/testConfig`)
    const data = await response.json()
    
    if (response.ok && data.hasBotToken && data.hasApiSecret) {
      console.log('✅ Configuration: PASSED')
      console.log(`   Bot Token: ${data.hasBotToken ? 'Available' : 'Missing'}`)
      console.log(`   API Secret: ${data.hasApiSecret ? 'Available' : 'Missing'}`)
      results.config = true
    } else {
      console.log('❌ Configuration: FAILED')
      console.log('   Missing required environment variables')
    }
  } catch (error) {
    console.log('❌ Configuration: ERROR -', error.message)
  }
  
  // Test 3: Authentication
  console.log('\n3️⃣ Testing Authentication...')
  try {
    const response = await fetch(`${BACKEND_URL}/testAuth`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    })
    const data = await response.json()
    
    if (response.ok && data.authenticated) {
      console.log('✅ Authentication: PASSED')
      console.log('   API Token is valid')
      results.auth = true
    } else {
      console.log('❌ Authentication: FAILED')
      console.log('   API Token invalid or missing')
    }
  } catch (error) {
    console.log('❌ Authentication: ERROR -', error.message)
  }
  
  // Test 4: getUpdates (only if auth passed)
  if (results.auth) {
    console.log('\n4️⃣ Testing getUpdates...')
    try {
      const response = await fetch(`${BACKEND_URL}/getUpdates`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ getUpdates: PASSED')
        console.log(`   Retrieved ${data.count} updates`)
        results.getUpdates = true
        
        if (data.updates && data.updates.length > 0) {
          console.log('   Recent messages:')
          data.updates.slice(-2).forEach((update, index) => {
            if (update.message) {
              const msg = update.message
              console.log(`     ${index + 1}. ${msg.from.first_name}: "${msg.text?.substring(0, 50)}${msg.text?.length > 50 ? '...' : ''}"`)
            }
          })
        }
      } else {
        console.log('❌ getUpdates: FAILED')
        const errorData = await response.json().catch(() => ({}))
        console.log('   Error:', errorData.error || `Status ${response.status}`)
      }
    } catch (error) {
      console.log('❌ getUpdates: ERROR -', error.message)
    }
  } else {
    console.log('\n4️⃣ Skipping getUpdates (auth failed)')
  }
  
  // Test 5: sendMessage test (mock - don't actually send unless specified)
  if (results.auth) {
    console.log('\n5️⃣ Testing sendMessage (validation only)...')
    try {
      const response = await fetch(`${BACKEND_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: 'test-chat-id',
          text: 'Test message from backend validation'
        })
      })
      
      // We expect this to fail with a proper error (bad chat ID), but it shows the endpoint works
      const data = await response.json().catch(() => ({}))
      
      if (response.status === 400 && data.error) {
        console.log('✅ sendMessage: ENDPOINT WORKING')
        console.log('   (Expected error due to test chat ID)')
        results.sendMessage = true
      } else {
        console.log('❌ sendMessage: UNEXPECTED RESPONSE')
        console.log('   Status:', response.status, 'Data:', data)
      }
    } catch (error) {
      console.log('❌ sendMessage: ERROR -', error.message)
    }
  } else {
    console.log('\n5️⃣ Skipping sendMessage (auth failed)')
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.padEnd(15)} ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  console.log('\n📈 Overall Score:', `${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Backend is fully functional!')
  } else if (passed >= 3) {
    console.log('⚠️  Most tests passed, minor issues to resolve')
  } else {
    console.log('❌ Major issues detected, check configuration')
  }
  
  console.log('\n💡 Next Steps:')
  console.log('1. Re-enable polling in frontend')
  console.log('2. Update frontend to use new backend URL')
  console.log('3. Test full application integration')
  
  return results
}

// Helper function for real message sending (manual)
window.sendRealMessage = async function(chatId, message) {
  console.log(`📤 Sending real message to ${chatId}...`)
  
  try {
    const response = await fetch(`${BACKEND_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Real message sent successfully!')
      console.log('Message ID:', data.message_id)
    } else {
      console.log('❌ Failed to send real message:', data.error)
    }
    
    return data
  } catch (error) {
    console.log('❌ Error sending real message:', error.message)
  }
}

// Export test function
window.comprehensiveTest = comprehensiveTest

// Auto-run
comprehensiveTest()
