/**
 * Simple Backend Test - Check Raw Response
 */

console.log('🧪 Testing backend response...');

const backendUrl = 'https://us-central1-myrajawali-app.cloudfunctions.net/telegramapi';
const apiToken = 'myrajawali-secure-api-2025';

// Test 1: Health check without auth
fetch(`${backendUrl}/health`)
  .then(response => {
    console.log('Health check status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    return response.text(); // Get raw text first
  })
  .then(text => {
    console.log('Raw response:', text);
    try {
      const json = JSON.parse(text);
      console.log('✅ Valid JSON:', json);
    } catch (e) {
      console.log('❌ Invalid JSON:', e.message);
    }
  })
  .catch(error => {
    console.log('❌ Network error:', error.message);
  });

// Test 2: Test with auth
setTimeout(() => {
  fetch(`${backendUrl}/testAuth`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('Auth test status:', response.status);
      return response.text();
    })
    .then(text => {
      console.log('Auth response:', text);
    })
    .catch(error => {
      console.log('❌ Auth test error:', error.message);
    });
}, 2000);
