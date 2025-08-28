/**
 * Quick CORS Test Script
 * Test the current backend deployment
 */

console.log('🧪 Quick CORS Test - Testing Current Backend...');

const backendUrl = 'https://telegramapi-7hu5np5oka-uc.a.run.app';
const apiToken = 'myrajawali-secure-api-2025';

// Test 1: Health check
async function testHealth() {
    console.log('\n📋 Test 1: Health Check');
    try {
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check successful:', data);
            return true;
        } else {
            console.log('❌ Health check failed:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Health check error:', error);
        return false;
    }
}

// Test 2: CORS headers check  
async function testCorsHeaders() {
    console.log('\n📋 Test 2: CORS Headers Check');
    try {
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            mode: 'cors'
        });
        
        console.log('Response Headers:');
        for (let [key, value] of response.headers.entries()) {
            if (key.startsWith('access-control')) {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        const corsOrigin = response.headers.get('access-control-allow-origin');
        const corsMethods = response.headers.get('access-control-allow-methods');
        const corsHeaders = response.headers.get('access-control-allow-headers');
        
        console.log('\nCORS Analysis:');
        console.log('  Origin allowed:', !!corsOrigin);
        console.log('  Methods allowed:', !!corsMethods);
        console.log('  Headers allowed:', !!corsHeaders);
        
        return !!(corsOrigin && corsMethods && corsHeaders);
    } catch (error) {
        console.error('❌ CORS headers test error:', error);
        return false;
    }
}

// Test 3: Authenticated request
async function testAuth() {
    console.log('\n📋 Test 3: Authenticated Request');
    try {
        const response = await fetch(`${backendUrl}/testAuth`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth test successful:', data);
            return data.authenticated;
        } else {
            console.log('❌ Auth test failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Auth test error:', error);
        return false;
    }
}

// Test 4: Get Updates (requires auth)
async function testGetUpdates() {
    console.log('\n📋 Test 4: Get Updates');
    try {
        const response = await fetch(`${backendUrl}/getUpdates`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Get updates successful:', {
                success: data.success,
                count: data.count
            });
            return true;
        } else {
            console.log('❌ Get updates failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Get updates error:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive backend test...');
    console.log('Backend URL:', backendUrl);
    console.log('Current origin:', window.location.origin);
    
    const results = {
        health: await testHealth(),
        cors: await testCorsHeaders(),
        auth: await testAuth(),
        getUpdates: await testGetUpdates()
    };
    
    console.log('\n📊 Final Results:');
    console.log('  Health Check:', results.health ? '✅ PASS' : '❌ FAIL');
    console.log('  CORS Headers:', results.cors ? '✅ PASS' : '❌ FAIL');
    console.log('  Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
    console.log('  Get Updates:', results.getUpdates ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = Object.values(results).every(result => result);
    console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
    if (!allPassed) {
        console.log('\n🔧 Troubleshooting Tips:');
        if (!results.health) {
            console.log('  - Backend may be down or unreachable');
        }
        if (!results.cors) {
            console.log('  - CORS headers are missing or incorrect');
        }
        if (!results.auth) {
            console.log('  - Authentication token may be wrong');
        }
        if (!results.getUpdates) {
            console.log('  - Telegram API integration may have issues');
        }
    }
    
    return results;
}

// Export for manual use
window.testBackend = runAllTests;

// Auto-run
runAllTests();
