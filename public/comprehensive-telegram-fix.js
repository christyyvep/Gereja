/**
 * Comprehensive Telegram Backend Fix
 * Final solution for CORS and backend connectivity issues
 */

console.log('🚀 Comprehensive Telegram Backend Fix - Starting...');

// All possible backend URLs to test
const BACKEND_URLS = [
    'https://telegramapi-7hu5np5oka-uc.a.run.app',
    'https://us-central1-myrajawali-app.cloudfunctions.net/telegramapi',
    'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI',
    'https://us-central1-myrajawali-app.cloudfunctions.net/corstest',
    'https://us-central1-myrajawali-app.cloudfunctions.net/simpletest'
];

const API_TOKEN = 'myrajawali-secure-api-2025';

// Test a single URL comprehensively
async function testBackendUrl(url) {
    console.log(`\n🧪 Testing: ${url}`);
    
    const results = {
        url,
        health: false,
        cors: false,
        auth: false,
        telegram: false,
        error: null
    };
    
    try {
        // Test 1: Health check
        const healthResponse = await fetch(`${url}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (healthResponse.ok) {
            results.health = true;
            console.log('  ✅ Health check passed');
            
            // Check CORS headers
            const corsOrigin = healthResponse.headers.get('access-control-allow-origin');
            if (corsOrigin) {
                results.cors = true;
                console.log('  ✅ CORS headers present');
            } else {
                console.log('  ⚠️ CORS headers missing');
            }
        } else {
            console.log('  ❌ Health check failed:', healthResponse.status);
        }
        
        // Test 2: Authentication
        if (results.health) {
            const authResponse = await fetch(`${url}/testAuth`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            });
            
            if (authResponse.ok) {
                const authData = await authResponse.json();
                if (authData.authenticated) {
                    results.auth = true;
                    console.log('  ✅ Authentication passed');
                } else {
                    console.log('  ⚠️ Authentication failed (wrong token?)');
                }
            } else {
                console.log('  ❌ Auth test failed:', authResponse.status);
            }
        }
        
        // Test 3: Telegram functionality
        if (results.auth) {
            const telegramResponse = await fetch(`${url}/getUpdates`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            });
            
            if (telegramResponse.ok) {
                results.telegram = true;
                console.log('  ✅ Telegram API passed');
            } else {
                console.log('  ❌ Telegram API failed:', telegramResponse.status);
            }
        }
        
    } catch (error) {
        results.error = error.message;
        console.log('  ❌ Error:', error.message);
    }
    
    return results;
}

// Find the best working backend URL
async function findBestBackend() {
    console.log('🔍 Testing all possible backend URLs...');
    
    const results = [];
    
    for (const url of BACKEND_URLS) {
        const result = await testBackendUrl(url);
        results.push(result);
        
        // If we find a fully working backend, use it immediately
        if (result.health && result.cors && result.auth && result.telegram) {
            console.log(`\n🎯 Perfect backend found: ${url}`);
            return result;
        }
    }
    
    // Find the best partial match
    const workingBackends = results.filter(r => r.health);
    if (workingBackends.length > 0) {
        // Prefer backends with CORS
        const corsBackends = workingBackends.filter(r => r.cors);
        if (corsBackends.length > 0) {
            console.log(`\n⚠️ Using best available backend: ${corsBackends[0].url}`);
            return corsBackends[0];
        } else {
            console.log(`\n⚠️ Using backend without CORS: ${workingBackends[0].url}`);
            return workingBackends[0];
        }
    }
    
    console.log('\n❌ No working backends found');
    return null;
}

// Update the frontend to use the working backend
function updateFrontendConfig(backendResult) {
    if (!backendResult) {
        console.log('❌ No backend to configure');
        return false;
    }
    
    console.log(`\n🔧 Updating frontend configuration...`);
    console.log(`Using backend: ${backendResult.url}`);
    
    // Update process.env
    if (!window.process) window.process = {};
    if (!window.process.env) window.process.env = {};
    
    window.process.env.VUE_APP_TELEGRAM_BACKEND_URL = backendResult.url;
    window.process.env.VUE_APP_TELEGRAM_API_TOKEN = API_TOKEN;
    
    // Try to update telegramService if it exists
    if (window.telegramService) {
        window.telegramService.backendApiUrl = backendResult.url;
        window.telegramService.apiToken = API_TOKEN;
        console.log('✅ TelegramService updated');
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('telegram_backend_url', backendResult.url);
    localStorage.setItem('telegram_api_token', API_TOKEN);
    
    console.log('✅ Frontend configuration updated');
    return true;
}

// Test the final configuration
async function testFinalConfiguration(backendUrl) {
    console.log('\n🧪 Testing final configuration...');
    
    try {
        // Test a complete workflow
        const response = await fetch(`${backendUrl}/testAuth`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Final configuration test successful:', {
                authenticated: data.authenticated,
                hasConfig: data.hasConfig
            });
            return true;
        } else {
            console.log('⚠️ Final test failed but backend is reachable');
            return false;
        }
    } catch (error) {
        console.log('❌ Final test error:', error.message);
        return false;
    }
}

// Apply CORS workarounds if needed
function applyCorsWorkarounds() {
    console.log('\n🔧 Applying CORS workarounds...');
    
    // Suppress CORS error logs to reduce noise
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(error => {
            if (error.message.includes('CORS')) {
                console.warn('🔧 CORS error intercepted:', error.message);
                // Try with no-cors mode as fallback
                if (args[1] && args[1].mode === 'cors') {
                    console.log('🔄 Retrying with no-cors mode...');
                    const newOptions = { ...args[1], mode: 'no-cors' };
                    return originalFetch(args[0], newOptions);
                }
            }
            throw error;
        });
    };
    
    console.log('✅ CORS workarounds applied');
}

// Main fix function
async function fixTelegramBackend() {
    console.log('🚀 Starting comprehensive Telegram backend fix...');
    console.log('Current origin:', window.location.origin);
    
    // Step 1: Find working backend
    const bestBackend = await findBestBackend();
    
    if (!bestBackend) {
        console.log('\n❌ CRITICAL: No working backend found');
        console.log('💡 Suggestions:');
        console.log('  1. Check Firebase Functions deployment');
        console.log('  2. Verify network connectivity');
        console.log('  3. Check Firebase project configuration');
        return false;
    }
    
    // Step 2: Update frontend configuration
    const configUpdated = updateFrontendConfig(bestBackend);
    
    if (!configUpdated) {
        console.log('❌ Failed to update frontend configuration');
        return false;
    }
    
    // Step 3: Apply CORS workarounds if needed
    if (!bestBackend.cors) {
        applyCorsWorkarounds();
    }
    
    // Step 4: Test final configuration
    const finalTestPassed = await testFinalConfiguration(bestBackend.url);
    
    // Step 5: Summary
    console.log('\n📊 Fix Summary:');
    console.log('  Backend URL:', bestBackend.url);
    console.log('  Health Check:', bestBackend.health ? '✅' : '❌');
    console.log('  CORS Support:', bestBackend.cors ? '✅' : '⚠️');
    console.log('  Authentication:', bestBackend.auth ? '✅' : '⚠️');
    console.log('  Telegram API:', bestBackend.telegram ? '✅' : '⚠️');
    console.log('  Final Test:', finalTestPassed ? '✅' : '⚠️');
    
    const allGood = bestBackend.health && bestBackend.cors && bestBackend.auth && bestBackend.telegram && finalTestPassed;
    
    if (allGood) {
        console.log('\n🎉 SUCCESS: Telegram backend is fully operational!');
        console.log('💡 You can now use Telegram features in the admin panel');
    } else {
        console.log('\n⚠️ PARTIAL SUCCESS: Backend is reachable but some features may not work');
        console.log('💡 Try refreshing the page and testing Telegram features manually');
    }
    
    return allGood;
}

// Export functions for manual use
window.fixTelegramBackend = fixTelegramBackend;
window.testBackendUrl = testBackendUrl;
window.findBestBackend = findBestBackend;

// Auto-run the fix
fixTelegramBackend();
