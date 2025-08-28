// Minimal auth-hybrid untuk debugging
console.log('🔄 Loading auth-hybrid-minimal...');

export function getCurrentUser() {
  try {
    const userData = localStorage.getItem('myrajawali_user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function isLoggedIn() {
  const user = getCurrentUser();
  return user !== null;
}

export function logoutUser() {
  try {
    console.log('🚪 [AuthMinimal] Logging out user...');
    
    // Clear all auth-related localStorage
    localStorage.removeItem('myrajawali_user');
    localStorage.removeItem('myrajawali_session');
    
    // Clear any other auth-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('myrajawali_') || key.startsWith('rate_limit_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ [AuthMinimal] Logout successful');
    return Promise.resolve(true);
  } catch (error) {
    console.error('❌ [AuthMinimal] Logout error:', error);
    return Promise.resolve(false);
  }
}

export function loginUser(nama, password) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔐 [AuthMinimal] Attempting login for:', nama);
      console.log('🔐 [AuthMinimal] Password received:', password);
      console.log('🔐 [AuthMinimal] Nama length:', nama?.length, 'Password length:', password?.length);
      
      // Basic validation
      if (!nama || !password) {
        reject(new Error('Nama dan password harus diisi'));
        return;
      }
      
      // For demo purposes, accept specific test credentials
      const validCredentials = [
        { nama: 'christy potabuga', password: 'admin123', role: 'admin' },
        { nama: 'admin', password: 'admin', role: 'admin' },
        { nama: 'test', password: 'test', role: 'jemaat' }
      ];
      
      const normalizedNama = nama.toLowerCase().trim();
      const normalizedPassword = password.trim(); // Trim password juga
      console.log('🔧 [AuthMinimal] Normalized nama:', `"${normalizedNama}"`);
      console.log('🔧 [AuthMinimal] Normalized password:', `"${normalizedPassword}"`);
      
      // Debug each credential check
      validCredentials.forEach((cred, index) => {
        const credNormalizedNama = cred.nama.toLowerCase();
        const namaMatch = credNormalizedNama === normalizedNama;
        const passwordMatch = cred.password === normalizedPassword;
        console.log(`🧪 [AuthMinimal] Credential ${index + 1}: "${cred.nama}" / "${cred.password}"`);
        console.log(`   - Nama match: ${namaMatch} ("${credNormalizedNama}" === "${normalizedNama}")`);
        console.log(`   - Password match: ${passwordMatch} ("${cred.password}" === "${normalizedPassword}")`);
      });
      
      const user = validCredentials.find(cred => 
        cred.nama.toLowerCase() === normalizedNama && cred.password === normalizedPassword
      );
      
      if (user) {
        // Create user data
        const userData = {
          id: 'user_' + Date.now(),
          nama: user.nama,
          role: user.role,
          sektor: 'Test Sektor',
          status: 'active',
          loginTime: new Date().toISOString()
        };
        
        // Create session
        const sessionData = {
          sessionId: 'sess_' + Date.now(),
          userId: userData.id,
          nama: userData.nama,
          role: userData.role,
          createdAt: Date.now(),
          expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
          lastActivity: Date.now()
        };
        
        // Store in localStorage
        localStorage.setItem('myrajawali_user', JSON.stringify(userData));
        localStorage.setItem('myrajawali_session', JSON.stringify(sessionData));
        
        console.log('✅ [AuthMinimal] Login successful for:', userData.nama);
        
        resolve({
          success: true,
          user: userData,
          session: sessionData,
          message: 'Login berhasil'
        });
      } else {
        console.log('❌ [AuthMinimal] Invalid credentials for:', nama);
        reject(new Error('Nama atau password salah'));
      }
      
    } catch (error) {
      console.error('❌ [AuthMinimal] Login error:', error);
      reject(error);
    }
  });
}

console.log('✅ Auth-hybrid-minimal loaded successfully');

// Dummy functions for compatibility with existing components
export function getAllJemaatNames() {
  console.log('📝 [AuthMinimal] getAllJemaatNames called (dummy implementation)');
  return Promise.resolve([
    'Christy Potabuga',
    'Admin User',
    'Test User'
  ]);
}

export function getAllUsersWithRoles() {
  console.log('👥 [AuthMinimal] getAllUsersWithRoles called (dummy implementation)');
  return Promise.resolve([
    { nama: 'Christy Potabuga', role: 'admin', sektor: 'Test Sektor' },
    { nama: 'Admin User', role: 'admin', sektor: 'Admin Sektor' },
    { nama: 'Test User', role: 'jemaat', sektor: 'Jemaat Sektor' }
  ]);
}

export function registerUser() {
  console.log('📝 [AuthMinimal] registerUser called (dummy implementation)');
  return Promise.reject(new Error('Registration not implemented in minimal auth'));
}

export default {
  getCurrentUser,
  isLoggedIn,
  logoutUser,
  loginUser,
  getAllJemaatNames,
  getAllUsersWithRoles,
  registerUser
};
