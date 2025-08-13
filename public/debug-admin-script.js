// Admin Button Debug Script - MyRajawali
// Jalankan script ini di Developer Console untuk debug admin button

console.log('🔍 ADMIN BUTTON DEBUG SCRIPT STARTED');
console.log('=====================================');

// 1. Check Current User
function checkCurrentUser() {
    console.log('\n1️⃣ CHECKING CURRENT USER:');
    
    const localUser = localStorage.getItem('user');
    const myRajawaliUser = localStorage.getItem('myrajawali_user');
    
    console.log('localStorage.user:', localUser ? JSON.parse(localUser) : null);
    console.log('localStorage.myrajawali_user:', myRajawaliUser ? JSON.parse(myRajawaliUser) : null);
    
    return localUser ? JSON.parse(localUser) : null;
}

// 2. Force Set Admin Role
function forceSetAdmin(userName = 'admin') {
    console.log('\n2️⃣ FORCE SETTING ADMIN ROLE:');
    
    let user = localStorage.getItem('user');
    
    if (!user) {
        // Create new admin user
        user = {
            id: 'force-admin-' + Date.now(),
            nama: userName,
            email: userName + '@admin.com',
            role: 'admin',
            updatedAt: new Date().toISOString()
        };
        console.log('✅ Created new admin user:', user);
    } else {
        user = JSON.parse(user);
        user.role = 'admin';
        user.updatedAt = new Date().toISOString();
        console.log('✅ Updated existing user to admin:', user);
    }
    
    // Set in both localStorage keys
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('myrajawali_user', JSON.stringify(user));
    
    console.log('✅ Admin role set successfully!');
    return user;
}

// 3. Check Vue Component State
function checkVueComponentState() {
    console.log('\n3️⃣ CHECKING VUE COMPONENT STATE:');
    
    // Find Vue app instance
    const app = document.querySelector('#app');
    if (app && app.__vue_app__) {
        console.log('✅ Vue app found');
        
        // Try to access userStore
        try {
            const userStore = app.__vue_app__.config.globalProperties.$userStore;
            if (userStore) {
                console.log('✅ UserStore found:', userStore);
                console.log('UserStore.user:', userStore.user);
                console.log('UserStore.isAdmin:', userStore.isAdmin);
            } else {
                console.log('❌ UserStore not found in global properties');
            }
        } catch (error) {
            console.log('❌ Error accessing userStore:', error);
        }
    } else {
        console.log('❌ Vue app not found');
    }
}

// 4. Check Admin Button Visibility
function checkAdminButtonVisibility() {
    console.log('\n4️⃣ CHECKING ADMIN BUTTON VISIBILITY:');
    
    const adminLink = document.querySelector('.admin-link');
    if (adminLink) {
        console.log('✅ Admin button found in DOM:', adminLink);
        console.log('Admin button visible:', window.getComputedStyle(adminLink).display !== 'none');
        console.log('Admin button href:', adminLink.href);
        console.log('Admin button classes:', adminLink.className);
        
        // Check if clickable
        const rect = adminLink.getBoundingClientRect();
        console.log('Admin button position:', rect);
        console.log('Admin button pointer-events:', window.getComputedStyle(adminLink).pointerEvents);
        
        return adminLink;
    } else {
        console.log('❌ Admin button NOT found in DOM');
        
        // Check if user should see admin button
        const user = checkCurrentUser();
        if (user && user.role === 'admin') {
            console.log('⚠️ User is admin but admin button not visible - Vue reactivity issue?');
        }
        
        return null;
    }
}

// 5. Force Trigger Vue Reactivity
function forceVueReactivity() {
    console.log('\n5️⃣ FORCING VUE REACTIVITY:');
    
    // Try to trigger reactivity by dispatching storage event
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: localStorage.getItem('user'),
        storageArea: localStorage
    }));
    
    console.log('✅ Storage event dispatched');
    
    // Try to force re-render by changing route slightly
    if (window.$router) {
        console.log('✅ Router found, trying to force refresh');
        window.$router.go(0); // Force refresh current route
    }
}

// 6. Test Admin Navigation
function testAdminNavigation() {
    console.log('\n6️⃣ TESTING ADMIN NAVIGATION:');
    
    const adminButton = document.querySelector('.admin-link');
    if (adminButton) {
        console.log('✅ Admin button found, testing click...');
        
        // Add click event listener to log what happens
        adminButton.addEventListener('click', function(e) {
            console.log('🖱️ Admin button clicked!');
            console.log('Event:', e);
            console.log('Target:', e.target);
            console.log('Current target:', e.currentTarget);
        });
        
        console.log('✅ Click listener added. Try clicking the admin button now.');
        
        // Highlight the button
        adminButton.style.border = '3px solid yellow';
        adminButton.style.boxShadow = '0 0 10px yellow';
        
        return adminButton;
    } else {
        console.log('❌ Admin button not found for testing');
        return null;
    }
}

// 7. Full Debug Report
function fullDebugReport() {
    console.log('\n🔍 FULL DEBUG REPORT');
    console.log('===================');
    
    const user = checkCurrentUser();
    checkVueComponentState();
    const adminButton = checkAdminButtonVisibility();
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('User logged in:', !!user);
    console.log('User is admin:', user?.role === 'admin');
    console.log('Admin button visible:', !!adminButton);
    
    if (user?.role === 'admin' && !adminButton) {
        console.log('\n⚠️ ISSUE DETECTED:');
        console.log('User has admin role but admin button is not visible.');
        console.log('This suggests a Vue reactivity or component rendering issue.');
        
        console.log('\n🛠️ SUGGESTED FIX:');
        console.log('1. Run: forceVueReactivity()');
        console.log('2. Or refresh the page');
        console.log('3. Or logout and login again');
    }
    
    return {
        user,
        adminButton,
        hasIssue: user?.role === 'admin' && !adminButton
    };
}

// Auto-run functions
const user = checkCurrentUser();
checkAdminButtonVisibility();

// Make functions available globally
window.debugAdmin = {
    checkCurrentUser,
    forceSetAdmin,
    checkVueComponentState,
    checkAdminButtonVisibility,
    forceVueReactivity,
    testAdminNavigation,
    fullDebugReport
};

console.log('\n🛠️ AVAILABLE COMMANDS:');
console.log('debugAdmin.checkCurrentUser() - Check current user');
console.log('debugAdmin.forceSetAdmin() - Force set admin role');
console.log('debugAdmin.checkAdminButtonVisibility() - Check if admin button is visible');
console.log('debugAdmin.forceVueReactivity() - Force Vue to update');
console.log('debugAdmin.testAdminNavigation() - Test admin button click');
console.log('debugAdmin.fullDebugReport() - Run full diagnostic');

console.log('\n🚀 Quick fix: debugAdmin.forceSetAdmin() then refresh page');
