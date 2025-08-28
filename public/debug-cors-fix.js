/**
 * CORS Debug and Fix Script
 * Diagnoses and fixes CORS/authentication issues
 */

console.log('🔧 Starting CORS Debug and Fix...');

// Test current environment
console.log('Current origin:', window.location.origin);
console.log('User agent:', navigator.userAgent);

// Environment variables check
const backendUrl = process.env.VUE_APP_TELEGRAM_BACKEND_URL || 'https://telegramapi-7hu5np5oka-uc.a.run.app';
const apiToken = process.env.VUE_APP_TELEGRAM_API_TOKEN || 'myrajawali-secure-api-2025';

console.log('Backend URL:', backendUrl);
console.log('API Token configured:', !!apiToken);

// Test 1: Basic fetch without auth
async function testBasicFetch() {
    console.log('🧪 Test 1: Basic health check...');
    
    try {
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.text();
        console.log('✅ Basic fetch success:', response.status, data);
        return true;
    } catch (error) {
        console.error('❌ Basic fetch failed:', error);
        return false;
    }
}

// Test 2: Test with auth headers
async function testAuthFetch() {
    console.log('🧪 Test 2: Authenticated request...');
    
    try {
        const response = await fetch(`${backendUrl}/testAuth`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });
        
        const data = await response.json();
        console.log('✅ Auth fetch success:', data);
        return true;
    } catch (error) {
        console.error('❌ Auth fetch failed:', error);
        return false;
    }
}

// Test 3: Test OPTIONS preflight
async function testPreflight() {
    console.log('🧪 Test 3: OPTIONS preflight...');
    
    try {
        const response = await fetch(`${backendUrl}/testAuth`, {
            method: 'OPTIONS',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });
        
        console.log('✅ OPTIONS success:', response.status);
        console.log('CORS headers:', {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        });
        return true;
    } catch (error) {
        console.error('❌ OPTIONS failed:', error);
        return false;
    }
}

// Test 4: Direct API call with no-cors
async function testNoCors() {
    console.log('🧪 Test 4: No-CORS mode...');
    
    try {
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        console.log('✅ No-CORS success:', response.status, response.type);
        return true;
    } catch (error) {
        console.error('❌ No-CORS failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running comprehensive CORS tests...');
    
    const results = {
        basic: await testBasicFetch(),
        auth: await testAuthFetch(),
        preflight: await testPreflight(),
        noCors: await testNoCors()
    };
    
    console.log('📊 Test Results:', results);
    
    // Determine issue
    if (!results.basic && !results.noCors) {
        console.log('🔥 NETWORK ISSUE: Backend is completely unreachable');
    } else if (!results.basic && results.noCors) {
        console.log('🔥 CORS ISSUE: Backend reachable but CORS headers missing/wrong');
    } else if (results.basic && !results.auth) {
        console.log('🔥 AUTH ISSUE: Basic requests work but auth fails');
    } else if (!results.preflight) {
        console.log('🔥 PREFLIGHT ISSUE: OPTIONS requests failing');
    } else {
        console.log('✅ ALL TESTS PASSED: CORS should be working');
    }
    
    return results;
}

// Fix functions
window.fixCors = async function() {
    console.log('🔧 Attempting to fix CORS issues...');
    
    // Update environment variables
    window.process = window.process || {};
    window.process.env = window.process.env || {};
    window.process.env.VUE_APP_TELEGRAM_BACKEND_URL = backendUrl;
    window.process.env.VUE_APP_TELEGRAM_API_TOKEN = apiToken;
    
    console.log('✅ Environment variables updated');
    
    // Test again
    await runAllTests();
};

// Export for use
window.debugCors = runAllTests;

// Auto-run
runAllTests();
