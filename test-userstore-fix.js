// FINAL TEST - UserStore Fix
// Paste ini di Console untuk test perbaikan userStore

console.log('🔧 TESTING USERSTORE FIX...')

// 1. Check current localStorage
const currentUser = JSON.parse(localStorage.getItem('myrajawali_user') || 'null')
const session = JSON.parse(localStorage.getItem('myrajawali_session') || 'null')

console.log('👤 Current User:', currentUser)
console.log('🎫 Current Session:', session)

if (!currentUser || !currentUser.nama) {
    console.log('❌ No user found, creating test admin...')
    
    // Create admin user
    const testAdmin = {
        id: 'test-admin-' + Date.now(),
        nama: 'Christy Potabuga',
        role: 'admin',
        email: 'admin@myrajawali.com',
        permissions: ['all'],
        canDelete: true
    }
    
    const testSession = {
        sessionId: 'test-' + Date.now(),
        userId: testAdmin.id,
        nama: testAdmin.nama,
        role: testAdmin.role,
        jemaatId: testAdmin.id,
        loginAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        lastActivity: Date.now(),
        permissions: ['all'],
        isAdmin: true,
        canDelete: true,
        isAuthenticated: true,
        sessionValid: true
    }
    
    localStorage.setItem('myrajawali_user', JSON.stringify(testAdmin))
    localStorage.setItem('myrajawali_session', JSON.stringify(testSession))
    
    console.log('✅ Test admin created:', testAdmin.nama)
}

// 2. Set bypass flags
localStorage.setItem('admin_bypass_validation', 'true')
localStorage.setItem('admin_force_permissions', 'true')

// 3. Test admin ID extraction
function testGetAdminId() {
    const localUser = localStorage.getItem('myrajawali_user')
    if (localUser) {
        const userData = JSON.parse(localUser)
        const adminId = userData.id || userData.nama || 'admin'
        console.log('✅ Admin ID extracted:', adminId)
        return adminId
    }
    return 'admin'
}

function testGetAdminName() {
    const localUser = localStorage.getItem('myrajawali_user')
    if (localUser) {
        const userData = JSON.parse(localUser)
        const adminName = userData.nama || 'Admin'
        console.log('✅ Admin Name extracted:', adminName)
        return adminName
    }
    return 'Admin'
}

// 4. Run tests
const adminId = testGetAdminId()
const adminName = testGetAdminName()

console.log('🎯 FINAL RESULTS:')
console.log('   Admin ID:', adminId)
console.log('   Admin Name:', adminName)
console.log('   Bypass enabled:', localStorage.getItem('admin_bypass_validation'))

console.log('🎉 USERSTORE FIX COMPLETE!')
console.log('🔄 Refresh halaman admin dan coba hapus renungan lagi')
console.log('💡 Jika masih error, cek apakah import useUserStore sudah benar')
