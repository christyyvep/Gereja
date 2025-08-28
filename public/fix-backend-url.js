/**
 * Backend URL Fix Script
 * Updates the backend URL to use the direct function URL
 */

console.log('🔧 Backend URL Fix Script');

// The issue might be that we're using the wrong endpoint
// Let's check all possible backend URLs

const possibleUrls = [
    'https://telegramapi-7hu5np5oka-uc.a.run.app',  // Current
    'https://us-central1-myrajawali-app.cloudfunctions.net/telegramapi',  // Direct function URL
    'https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI',  // Old function name
];

async function testUrl(url) {
    console.log(`\n🧪 Testing: ${url}`);
    
    try {
        const response = await fetch(`${url}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success:', data.message || 'OK');
            
            // Check CORS headers
            const corsOrigin = response.headers.get('access-control-allow-origin');
            console.log('  CORS Origin:', corsOrigin || 'Missing');
            
            return { url, working: true, data, cors: !!corsOrigin };
        } else {
            console.log('❌ Failed:', response.status, response.statusText);
            return { url, working: false, status: response.status };
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return { url, working: false, error: error.message };
    }
}

async function findWorkingUrl() {
    console.log('🔍 Testing all possible backend URLs...');
    
    const results = [];
    
    for (const url of possibleUrls) {
        const result = await testUrl(url);
        results.push(result);
        
        if (result.working && result.cors) {
            console.log(`\n✅ Found working URL with CORS: ${url}`);
            return url;
        }
    }
    
    console.log('\n📊 All Results:');
    results.forEach(result => {
        console.log(`  ${result.url}: ${result.working ? '✅' : '❌'} ${result.cors ? '(CORS OK)' : '(CORS Missing)'}`);
    });
    
    // Return the first working URL even if CORS is missing
    const workingUrl = results.find(r => r.working);
    if (workingUrl) {
        console.log(`\n⚠️ Using working URL without CORS: ${workingUrl.url}`);
        return workingUrl.url;
    }
    
    console.log('\n❌ No working URLs found');
    return null;
}

async function updateTelegramService(newUrl) {
    if (!newUrl) {
        console.log('❌ No URL provided for update');
        return;
    }
    
    console.log(`\n🔧 Updating frontend to use: ${newUrl}`);
    
    // Update environment variables
    if (window.process && window.process.env) {
        window.process.env.VUE_APP_TELEGRAM_BACKEND_URL = newUrl;
        console.log('✅ Environment variable updated');
    }
    
    // Try to update the service directly if available
    if (window.telegramService) {
        window.telegramService.backendUrl = newUrl;
        console.log('✅ Service URL updated');
    }
    
    console.log('✅ Frontend configuration updated');
    console.log('💡 You may need to refresh the page for changes to take effect');
}

// Main function
async function fixBackendUrl() {
    const workingUrl = await findWorkingUrl();
    
    if (workingUrl) {
        await updateTelegramService(workingUrl);
        
        // Test the updated configuration
        console.log('\n🧪 Testing updated configuration...');
        try {
            const response = await fetch(`${workingUrl}/testAuth`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer myrajawali-secure-api-2025'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Final test successful:', data);
            } else {
                console.log('⚠️ Final test failed but URL is reachable');
            }
        } catch (error) {
            console.log('⚠️ Final test error:', error.message);
        }
    }
}

// Export for manual use
window.fixBackendUrl = fixBackendUrl;
window.testUrl = testUrl;

// Auto-run
fixBackendUrl();
