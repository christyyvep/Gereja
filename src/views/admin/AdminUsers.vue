<!-- AdminUsers.vue - User Management Dashboard -->
<template>
  <div class="admin-users">
    <AdminPageHeader 
      title="Kelola Data Jemaat"
      subtitle="Kelola data jemaat dan permissions"
    />
    
    <div class="users-content">
      <!-- Statistics Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <Users class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ totalUsers }}</h3>
            <p>Total Jemaat</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <User class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ maleUsers }}</h3>
            <p>Jemaat Pria</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <UserCheck class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ femaleUsers }}</h3>
            <p>Jemaat Wanita</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <Users class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ youthUsers }}</h3>
            <p>Pemuda Remaja</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <Heart class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ childrenUsers }}</h3>
            <p>Anak Sekolah Minggu</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <Home class="icon" />
          </div>
          <div class="stat-info">
            <h3>{{ totalFamilies }}</h3>
            <p>Total Keluarga</p>
          </div>
        </div>
      </div>
      
      <!-- Search and Filter -->
      <AdminCard>
        <template #header>
          <div class="users-header">
            <h3>{{ userStore.isOperator ? 'Data Jemaat (Read-Only)' : 'Kelola Data Jemaat' }}</h3>
            <div class="users-actions">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Cari nama jemaat..." 
                class="search-input"
              />
              <select v-model="filterGender" class="filter-select">
                <option value="">Semua Jenis Kelamin</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
              <select v-model="filterRole" class="filter-select">
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="jemaat">Jemaat</option>
              </select>
              <!-- Add User button only for admin -->
              <button 
                v-if="userStore.isAdmin"
                @click="showAddUserModal = true"
                class="btn-primary add-user-btn"
                title="Tambah Jemaat Baru"
              >
                <Plus class="icon" />
                Tambah Jemaat
              </button>
            </div>
          </div>
        </template>
        
        <template #content>
          <div class="users-table" v-if="!loading">
            <table v-if="filteredUsers.length > 0">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Sektor</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Terakhir Login</th>
                  <th>{{ userStore.isOperator ? 'Lihat' : 'Aksi' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td>
                    <div class="user-info">
                      <strong>{{ user.nama }}</strong>
                      <small v-if="user.email">{{ user.email }}</small>
                    </div>
                  </td>
                  <td>{{ user.sektor || '-' }}</td>
                  <td>
                    <span :class="['status-badge', user.isRegistered ? 'registered' : 'unregistered']">
                      {{ user.isRegistered ? 'Terdaftar' : 'Belum Registrasi' }}
                    </span>
                  </td>
                  <td>
                    <span :class="['role-badge', user.role]">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>{{ formatLastLogin(user.lastLoginAt) }}</td>
                  <td>
                    <div class="user-actions">
                      <button 
                        @click="viewUserDetails(user)" 
                        class="btn-icon btn-view"
                        title="Lihat Detail"
                      >
                        <Eye class="icon" />
                      </button>
                      
                      <!-- Admin-only actions -->
                      <template v-if="userStore.isAdmin">
                        <button 
                          @click="editUser(user)" 
                          class="btn-icon btn-edit"
                          title="Edit Data Jemaat"
                        >
                          <Edit class="icon" />
                        </button>
                        <button 
                          @click="editUserRole(user)" 
                          class="btn-icon btn-role"
                          title="Edit Role"
                        >
                          <Shield class="icon" />
                        </button>
                        <button 
                          @click="confirmDeleteUser(user)" 
                          class="btn-icon btn-delete"
                          title="Hapus Jemaat"
                        >
                          <Trash2 class="icon" />
                        </button>
                      </template>
                      
                      <!-- Operator notice -->
                      <span v-else class="operator-notice">
                        (Read-Only)
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-else class="no-users">
              <Users class="no-data-icon" />
              <p>Tidak ada data jemaat yang ditemukan</p>
            </div>
          </div>
          
          <div v-else class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data jemaat...</p>
          </div>
          
          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="btn-secondary"
            >
              Previous
            </button>
            
            <span class="page-info">
              Halaman {{ currentPage }} dari {{ totalPages }}
            </span>
            
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="btn-secondary"
            >
              Next
            </button>
          </div>
        </template>
      </AdminCard>
    </div>
    
    <!-- User Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Detail Jemaat</h3>
          <button @click="closeDetailModal" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loadingDetailData" class="loading-detail">
            <div class="spinner"></div>
            <p>Memuat detail lengkap...</p>
          </div>
          
          <!-- Detail Content -->
          <div v-else-if="userDetailData" class="user-detail-content">
            <!-- Basic Info Section -->
            <div class="detail-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">👤</span>
                  Informasi Dasar
                </h4>
              </div>
              
              <div class="detail-grid">
                <div class="detail-item">
                  <label class="detail-label">Nama Lengkap</label>
                  <span class="detail-value primary">{{ userDetailData.nama }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.jenisKelamin">
                  <label class="detail-label">Jenis Kelamin</label>
                  <span class="detail-value">{{ userDetailData.jenisKelamin }}</span>
                </div>
                
                <div class="detail-item">
                  <label class="detail-label">Role</label>
                  <span :class="['detail-badge', 'role-badge', userDetailData.role]">
                    {{ getRoleLabel(userDetailData.role) }}
                  </span>
                </div>
                
                <div class="detail-item">
                  <label class="detail-label">Status Registrasi</label>
                  <span :class="['detail-badge', 'status-badge', userDetailData.isRegistered ? 'registered' : 'unregistered']">
                    <span class="badge-icon">{{ userDetailData.isRegistered ? '✓' : '⏳' }}</span>
                    {{ userDetailData.isRegistered ? 'Terdaftar' : 'Belum Registrasi' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Church Info Section -->
            <div class="detail-section" v-if="userDetailData.sektor || userDetailData.status || userDetailData.keluarga">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">⛪</span>
                  Informasi Gereja
                </h4>
              </div>
              
              <div class="detail-grid">
                <div class="detail-item" v-if="userDetailData.sektor">
                  <label class="detail-label">Sektor</label>
                  <span class="detail-value">{{ userDetailData.sektor }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.keluarga">
                  <label class="detail-label">Keluarga</label>
                  <span class="detail-value">{{ userDetailData.keluarga }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.status">
                  <label class="detail-label">Status</label>
                  <span class="detail-value">{{ userDetailData.status }}</span>
                </div>
              </div>
            </div>
            
            <!-- Contact Info Section -->
            <div class="detail-section" v-if="userDetailData.email || userDetailData.noHP">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">📧</span>
                  Informasi Kontak
                </h4>
              </div>
              
              <div class="detail-grid">
                <div class="detail-item" v-if="userDetailData.email">
                  <label class="detail-label">Email</label>
                  <span class="detail-value">{{ userDetailData.email }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.noHP">
                  <label class="detail-label">No. HP</label>
                  <span class="detail-value">{{ userDetailData.noHP }}</span>
                </div>
              </div>
            </div>
            
            <!-- Personal Info Section -->
            <div class="detail-section" v-if="userDetailData.tanggalLahir">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">🎂</span>
                  Informasi Personal
                </h4>
              </div>
              
              <div class="detail-grid">
                <div class="detail-item" v-if="userDetailData.tanggalLahir">
                  <label class="detail-label">Tanggal Lahir</label>
                  <span class="detail-value">{{ formatDateOnly(userDetailData.tanggalLahir) }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.tanggalLahir">
                  <label class="detail-label">Usia</label>
                  <span class="detail-value">{{ calculateAge(userDetailData.tanggalLahir) }} tahun</span>
                </div>
              </div>
            </div>
            
            <!-- Activity & Streak Section -->
            <div class="detail-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">🔥</span>
                  Aktivitas & Streak
                </h4>
              </div>
              
              <div class="streak-summary">
                <div class="streak-card current">
                  <div class="streak-icon">🔥</div>
                  <div class="streak-number">{{ userDetailData.currentStreak || 0 }}</div>
                  <div class="streak-label">Streak Saat Ini</div>
                </div>
                
                <div class="streak-card longest">
                  <div class="streak-icon">🏆</div>
                  <div class="streak-number">{{ userDetailData.longestStreak || 0 }}</div>
                  <div class="streak-label">Streak Terpanjang</div>
                </div>
                
                <div class="streak-card total">
                  <div class="streak-icon">📅</div>
                  <div class="streak-number">{{ userDetailData.totalDays || 0 }}</div>
                  <div class="streak-label">Total Hari Aktif</div>
                </div>
              </div>
              
              <div class="detail-grid" v-if="userDetailData.lastActivityDate || userDetailData.streakStartDate">
                <div class="detail-item" v-if="userDetailData.lastActivityDate">
                  <label class="detail-label">Aktivitas Terakhir</label>
                  <span class="detail-value">{{ formatDate(userDetailData.lastActivityDate) }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.streakStartDate">
                  <label class="detail-label">Streak Dimulai</label>
                  <span class="detail-value">{{ formatDate(userDetailData.streakStartDate) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Security & System Info Section -->
            <div class="detail-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">🔐</span>
                  Keamanan & Sistem
                </h4>
              </div>
              
              <div class="detail-grid">
                <div class="detail-item">
                  <label class="detail-label">Status Password</label>
                  <span class="detail-value">
                    <span class="password-status" :class="userDetailData.hasPassword ? 'has-password' : 'no-password'">
                      {{ userDetailData.hasPassword ? '✅ Sudah Diatur' : '❌ Belum Diatur' }}
                    </span>
                  </span>
                </div>
                
                <div class="detail-item" v-if="userStore.isAdmin">
                  <label class="detail-label">Aksi Password</label>
                  <div class="password-actions">
                    <button @click="showPasswordResetConfirm = true" class="btn-reset-password">
                      🔄 Reset Password
                    </button>
                  </div>
                </div>
                
                <div class="detail-item" v-if="userDetailData.createdAt">
                  <label class="detail-label">Tanggal Dibuat</label>
                  <span class="detail-value">{{ formatDate(userDetailData.createdAt) }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.registeredAt">
                  <label class="detail-label">Tanggal Registrasi</label>
                  <span class="detail-value">{{ formatDate(userDetailData.registeredAt) }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.lastLoginAt">
                  <label class="detail-label">Login Terakhir</label>
                  <span class="detail-value">{{ formatDate(userDetailData.lastLoginAt) }}</span>
                </div>
                
                <div class="detail-item" v-if="userDetailData.updatedAt">
                  <label class="detail-label">Terakhir Diupdate</label>
                  <span class="detail-value">{{ formatDate(userDetailData.updatedAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Recent Activities -->
            <div class="detail-section" v-if="userDetailData.activities && userDetailData.activities.length > 0">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">📈</span>
                  Aktivitas Terbaru
                </h4>
              </div>
              
              <div class="activities-list">
                <div v-for="(activity, index) in userDetailData.activities.slice(0, 5)" :key="index" class="activity-item">
                  <div class="activity-icon">📝</div>
                  <div class="activity-content">
                    <div class="activity-type">{{ activity.type || 'Aktivitas Umum' }}</div>
                    <div class="activity-date">{{ formatActivityDate(activity.date) }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="userDetailData.activities.length > 5" class="activities-more">
                <small>Dan {{ userDetailData.activities.length - 5 }} aktivitas lainnya...</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-secondary">
            Tutup
          </button>
          
          <!-- Admin actions -->
          <template v-if="userStore.isAdmin && selectedUser">
            <button @click="editUser(selectedUser)" class="btn-primary">
              <Edit class="icon" />
              Edit Data
            </button>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Edit Role Modal -->
    <div v-if="showRoleModal" class="modal-overlay" @click="closeRoleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Role: {{ selectedUser?.nama }}</h3>
          <button @click="closeRoleModal" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="newRole">Role Baru:</label>
            <select v-model="newRole" id="newRole" class="form-select">
              <option value="jemaat">Jemaat</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <p class="warning-text">
            ⚠️ Perubahan role akan mempengaruhi akses user ke sistem.
          </p>
        </div>
        
        <div class="modal-footer">
          <button @click="closeRoleModal" class="btn-secondary">
            Batal
          </button>
          <button 
            @click="updateUserRole" 
            class="btn-primary"
            :disabled="isUpdatingRole"
          >
            {{ isUpdatingRole ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Reset Confirmation Modal -->
    <div v-if="showPasswordResetConfirm" class="modal-overlay" @click="showPasswordResetConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Reset Password</h3>
          <button @click="showPasswordResetConfirm = false" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="reset-password-form">
            <div class="warning-section">
              <div class="warning-icon">⚠️</div>
              <div class="warning-content">
                <h4>Konfirmasi Reset Password</h4>
                <p>Anda akan mereset password untuk: <strong>{{ selectedUser?.nama }}</strong></p>
                <p class="warning-text">Password akan diatur menjadi password default atau yang Anda tentukan di bawah.</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="newPassword" class="form-label">Password Baru</label>
              <input 
                v-model="resetPasswordData.newPassword" 
                id="newPassword" 
                type="password" 
                class="form-input"
                placeholder="Biarkan kosong untuk password default (123456)"
                autocomplete="new-password"
              />
              <small class="form-hint">
                Jika kosong, password akan diatur menjadi "123456". Minimal 6 karakter.
              </small>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
              <input 
                v-model="resetPasswordData.confirmPassword" 
                id="confirmPassword" 
                type="password" 
                class="form-input"
                placeholder="Konfirmasi password baru"
                autocomplete="new-password"
              />
            </div>
            
            <div v-if="resetPasswordError" class="error-message">
              {{ resetPasswordError }}
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showPasswordResetConfirm = false" class="btn-secondary">
            Batal
          </button>
          
          <button 
            @click="resetUserPassword" 
            class="btn-danger"
            :disabled="isResettingPassword"
          >
            {{ isResettingPassword ? 'Mereset...' : 'Reset Password' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add User Modal (Admin Only) -->
    <div v-if="showAddUserModal && userStore.isAdmin" class="modal-overlay" @click="closeAddUserModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Tambah Jemaat Baru</h3>
          <button @click="closeAddUserModal" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createUser" class="add-user-form">
            <!-- Required Fields Section -->
            <div class="form-section required-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon required">*</span>
                  Data Wajib
                </h4>
                <p class="section-subtitle">Informasi yang harus diisi</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="newUserNama" class="form-label required">
                    Nama Lengkap
                    <span class="asterisk">*</span>
                  </label>
                  <input 
                    v-model="newUser.nama" 
                    id="newUserNama" 
                    type="text" 
                    class="form-input"
                    :class="{ 'error': !newUser.nama && formTouched }"
                    required
                    placeholder="Masukkan nama lengkap"
                    @blur="formTouched = true"
                  />
                  <div v-if="!newUser.nama && formTouched" class="field-error">
                    Nama lengkap wajib diisi
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="newUserJenisKelamin" class="form-label required">
                    Jenis Kelamin
                    <span class="asterisk">*</span>
                  </label>
                  <select 
                    v-model="newUser.jenisKelamin" 
                    id="newUserJenisKelamin" 
                    class="form-select"
                    :class="{ 'error': !newUser.jenisKelamin && formTouched }"
                    required
                    @blur="formTouched = true"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <div v-if="!newUser.jenisKelamin && formTouched" class="field-error">
                    Jenis kelamin wajib dipilih
                  </div>
                </div>
                
                <div class="form-group full-width">
                  <label for="newUserRole" class="form-label required">
                    Role
                    <span class="asterisk">*</span>
                  </label>
                  <select 
                    v-model="newUser.role" 
                    id="newUserRole" 
                    class="form-select"
                    :class="{ 'error': !newUser.role && formTouched }"
                    required
                    @blur="formTouched = true"
                  >
                    <option value="jemaat">Jemaat</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Role menentukan akses user ke sistem
                  </small>
                  <div v-if="!newUser.role && formTouched" class="field-error">
                    Role wajib dipilih
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Optional Fields Section -->
            <div class="form-section optional-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon optional">📝</span>
                  Data Opsional
                </h4>
                <p class="section-subtitle">
                  Data berikut dapat diisi sekarang atau nanti saat jemaat melakukan registrasi
                </p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="newUserSektor" class="form-label">Sektor</label>
                  <select v-model="newUser.sektor" id="newUserSektor" class="form-select">
                    <option value="">Pilih Sektor</option>
                    <option value="Sektor Anugerah">Sektor Anugerah</option>
                    <option value="Sektor Tesalonika">Sektor Tesalonika</option>
                    <option value="Non-Sektoral">Non-Sektoral</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="newUserStatus" class="form-label">Status</label>
                  <select v-model="newUser.status" id="newUserStatus" class="form-select">
                    <option value="">Pilih Status</option>
                    <option value="Single">Single</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Janda/Duda">Janda/Duda</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <label for="newUserKeluarga" class="form-label">Keluarga</label>
                  <input 
                    v-model="newUser.keluarga" 
                    id="newUserKeluarga" 
                    type="text" 
                    class="form-input"
                    placeholder="Contoh: Kel. Potabuga-Gerungan"
                  />
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Nama keluarga akan digunakan untuk menghitung statistik keluarga
                  </small>
                </div>
                
                <div class="form-group full-width">
                  <label for="newUserEmail" class="form-label">Email</label>
                  <input 
                    v-model="newUser.email" 
                    id="newUserEmail" 
                    type="email" 
                    class="form-input"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div class="form-group">
                  <label for="newUserNoHP" class="form-label">No. HP</label>
                  <input 
                    v-model="newUser.noHP" 
                    id="newUserNoHP" 
                    type="tel" 
                    class="form-input"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                
                <div class="form-group">
                  <label for="newUserTanggalLahir" class="form-label">Tanggal Lahir</label>
                  <input 
                    v-model="newUser.tanggalLahir" 
                    id="newUserTanggalLahir" 
                    type="date" 
                    class="form-input"
                  />
                </div>
                
                <div class="form-group full-width">
                  <label for="newUserPassword" class="form-label">Password</label>
                  <input 
                    v-model="newUser.password" 
                    id="newUserPassword" 
                    type="password" 
                    class="form-input"
                    placeholder="Biarkan kosong jika tidak ingin set password"
                  />
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Jika diisi, jemaat bisa langsung login dengan password ini
                  </small>
                </div>
                
                <div class="form-group full-width">
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input 
                        v-model="newUser.isRegistered" 
                        type="checkbox"
                        class="checkbox-input"
                      />
                      <span class="checkbox-custom"></span>
                      <span class="checkbox-text">Sudah terdaftar di aplikasi</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAddUserModal" class="btn-secondary">
            Batal
          </button>
          <button 
            @click="createUser" 
            class="btn-primary"
            :disabled="isCreatingUser || !newUser.nama || !newUser.jenisKelamin || !newUser.role"
          >
            {{ isCreatingUser ? 'Menyimpan...' : 'Tambah Jemaat' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit User Modal (Admin Only) -->
    <div v-if="showEditModal && userStore.isAdmin" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Data Jemaat: {{ selectedUser?.nama }}</h3>
          <button @click="closeEditModal" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateUser" v-if="selectedUser" class="edit-user-form">
            <!-- Personal Info Section -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">👤</span>
                  Informasi Personal
                </h4>
                <p class="section-subtitle">Data identitas jemaat</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="editUserNama" class="form-label required">
                    Nama Lengkap
                    <span class="asterisk">*</span>
                  </label>
                  <input 
                    v-model="editingUser.nama" 
                    id="editUserNama" 
                    type="text" 
                    class="form-input"
                    required
                    placeholder="Nama lengkap jemaat"
                  />
                </div>
                
                <div class="form-group">
                  <label for="editUserJenisKelamin" class="form-label">Jenis Kelamin</label>
                  <select v-model="editingUser.jenisKelamin" id="editUserJenisKelamin" class="form-select">
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="editUserTanggalLahir" class="form-label">Tanggal Lahir</label>
                  <input 
                    v-model="editingUser.tanggalLahir" 
                    id="editUserTanggalLahir" 
                    type="date" 
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="editUserStatus" class="form-label">Status</label>
                  <select v-model="editingUser.status" id="editUserStatus" class="form-select">
                    <option value="">Pilih Status</option>
                    <option value="Single">Single</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Janda/Duda">Janda/Duda</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Church & Contact Info Section -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">⛪</span>
                  Informasi Gereja & Kontak
                </h4>
                <p class="section-subtitle">Data gereja dan informasi kontak</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="editUserSektor" class="form-label">Sektor</label>
                  <select v-model="editingUser.sektor" id="editUserSektor" class="form-select">
                    <option value="">Pilih Sektor</option>
                    <option value="Sektor Anugerah">Sektor Anugerah</option>
                    <option value="Sektor Tesalonika">Sektor Tesalonika</option>
                    <option value="Non-Sektoral">Non-Sektoral</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="editUserKeluarga" class="form-label">Keluarga</label>
                  <input 
                    v-model="editingUser.keluarga" 
                    id="editUserKeluarga" 
                    type="text" 
                    class="form-input"
                    placeholder="Contoh: Kel. Potabuga-Gerungan"
                  />
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Nama keluarga akan digunakan untuk menghitung statistik keluarga
                  </small>
                </div>
                
                <div class="form-group">
                  <label for="editUserRole" class="form-label">Role</label>
                  <select v-model="editingUser.role" id="editUserRole" class="form-select">
                    <option value="jemaat">Jemaat</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Role menentukan akses user ke sistem
                  </small>
                </div>
                
                <div class="form-group">
                  <label for="editUserEmail" class="form-label">Email</label>
                  <input 
                    v-model="editingUser.email" 
                    id="editUserEmail" 
                    type="email" 
                    class="form-input"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div class="form-group">
                  <label for="editUserNoHP" class="form-label">No. HP</label>
                  <input 
                    v-model="editingUser.noHP" 
                    id="editUserNoHP" 
                    type="tel" 
                    class="form-input"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
            </div>
            
            <!-- Security Section -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">
                  <span class="section-icon">🔐</span>
                  Keamanan & Status
                </h4>
                <p class="section-subtitle">Password dan status registrasi</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="editUserPassword" class="form-label">Password Baru</label>
                  <input 
                    v-model="editingUser.newPassword" 
                    id="editUserPassword" 
                    type="password" 
                    class="form-input"
                    placeholder="Biarkan kosong jika tidak ingin mengubah"
                    autocomplete="new-password"
                  />
                  <small class="form-help">
                    <i class="info-icon">ℹ</i>
                    Kosongkan jika tidak ingin mengubah password
                  </small>
                </div>
                
                <div class="form-group">
                  <div class="password-status-display" v-if="editingUser.hasPassword !== undefined">
                    <label class="form-label">Status Password Saat Ini</label>
                    <span class="password-status" :class="editingUser.hasPassword ? 'has-password' : 'no-password'">
                      {{ editingUser.hasPassword ? '✅ Sudah Diatur' : '❌ Belum Diatur' }}
                    </span>
                  </div>
                </div>
                
                <div class="form-group full-width">
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input 
                        v-model="editingUser.isRegistered" 
                        type="checkbox"
                        class="checkbox-input"
                      />
                      <span class="checkbox-custom"></span>
                      <span class="checkbox-text">Sudah terdaftar di aplikasi</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn-secondary">
            Batal
          </button>
          <button 
            @click="updateUser" 
            class="btn-primary"
            :disabled="isUpdatingUser"
          >
            {{ isUpdatingUser ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal (Admin Only) -->
    <div v-if="showDeleteModal && userStore.isAdmin" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus Jemaat</h3>
          <button @click="closeDeleteModal" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="delete-warning">
            <AlertTriangle class="warning-icon" />
            <div>
              <h4>Apakah Anda yakin ingin menghapus jemaat ini?</h4>
              <p><strong>{{ selectedUser?.nama }}</strong></p>
              <p class="warning-text">
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait jemaat ini akan terhapus permanen.
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">
            Batal
          </button>
          <button 
            @click="deleteUser" 
            class="btn-danger"
            :disabled="isDeletingUser"
          >
            {{ isDeletingUser ? 'Menghapus...' : 'Ya, Hapus Jemaat' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import { useUserStore } from '@/stores/userStore'
import { useStreakStore } from '@/stores/streakStore'
import { toast } from '@/utils/toast'
import { 
  getAllJemaat,
  createJemaat,
  updateJemaat,
  updateJemaatRole,
  deleteJemaat,
  searchJemaat,
  jemaatNameExists
} from '@/services/jemaatService'
import { 
  Users, 
  UserCheck, 
  User, 
  Shield, 
  Eye, 
  Edit, 
  X, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Home,
  Heart
} from 'lucide-vue-next'

export default {
  name: 'AdminUsers',
  components: {
    AdminPageHeader,
    AdminCard,
    Users,
    UserCheck,
    User,
    Shield,
    Eye,
    Edit,
    X,
    Plus,
    Trash2,
    AlertTriangle,
    Home,
    Heart
  },
  
  setup() {
    const userStore = useUserStore()
    const streakStore = useStreakStore()
    return { userStore, streakStore }
  },
  data() {
    return {
      users: [],
      loading: true,
      
      // Search and filter
      searchQuery: '',
      filterGender: '',
      filterRole: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Modals
      showDetailModal: false,
      showRoleModal: false,
      showAddUserModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showPasswordResetConfirm: false,
      selectedUser: null,
      newRole: '',
      isUpdatingRole: false,
      newUser: {
        nama: '',
        jenisKelamin: '',
        role: 'jemaat',
        sektor: '',
        status: '',
        keluarga: '',
        email: '',
        noHP: '',
        tanggalLahir: '',
        password: '',
        isRegistered: false
      },
      editingUser: null,
      isCreatingUser: false,
      isUpdatingUser: false,
      isDeletingUser: false,
      formTouched: false,
      
      // Detail modal data
      userDetailData: null,
      loadingDetailData: false,
      
      // Password reset data
      resetPasswordData: {
        newPassword: '',
        confirmPassword: ''
      },
      resetPasswordError: '',
      isResettingPassword: false
    }
  },
  
  computed: {
    // Statistics
    totalUsers() {
      return this.users.length
    },
    
    maleUsers() {
      return this.users.filter(user => 
        user.jenisKelamin === 'Pria' || user.jenisKelamin === 'Laki-laki'
      ).length
    },
    
    femaleUsers() {
      return this.users.filter(user => 
        user.jenisKelamin === 'Wanita' || user.jenisKelamin === 'Perempuan'
      ).length
    },
    
    youthUsers() {
      return this.users.filter(user => {
        const age = this.calculateAge(user.tanggalLahir)
        return age > 12 && user.status === 'Single'
      }).length
    },
    
    childrenUsers() {
      return this.users.filter(user => {
        const age = this.calculateAge(user.tanggalLahir)
        return age <= 12
      }).length
    },
    
    totalFamilies() {
      // Count unique families
      const uniqueFamilies = new Set()
      this.users.forEach(user => {
        if (user.keluarga && user.keluarga.trim() !== '') {
          uniqueFamilies.add(user.keluarga.trim().toLowerCase())
        }
      })
      return uniqueFamilies.size
    },
    
    // Filtered users
    filteredUsers() {
      let filtered = this.users
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(user => 
          user.nama.toLowerCase().includes(query) ||
          (user.sektor && user.sektor.toLowerCase().includes(query))
        )
      }
      
      // Gender filter
      if (this.filterGender) {
        filtered = filtered.filter(user => {
          const userGender = user.jenisKelamin
          if (this.filterGender === 'Pria') {
            return userGender === 'Pria' || userGender === 'Laki-laki'
          } else if (this.filterGender === 'Wanita') {
            return userGender === 'Wanita' || userGender === 'Perempuan'
          }
          return false
        })
      }
      
      // Role filter
      if (this.filterRole) {
        filtered = filtered.filter(user => user.role === this.filterRole)
      }
      
      return filtered
    },
    
    // Pagination
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage)
    },
    
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredUsers.slice(start, end)
    }
  },
  
  watch: {
    // Live search when query changes
    searchQuery: {
      handler() {
        // Reset to first page when searching
        this.currentPage = 1
      },
      immediate: false
    },
    
    // Reset pagination when filters change
    filterGender() {
      this.currentPage = 1
    },
    
    filterRole() {
      this.currentPage = 1
    }
  },
  
  mounted() {
    this.loadUsers()
    
    // 🔄 Auto-refresh data when user returns to this page
    window.addEventListener('focus', this.handleWindowFocus)
    window.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('focus', this.handleWindowFocus)
    window.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },
  
  methods: {
    // Helper method to calculate age from birth date
    calculateAge(birthDate) {
      if (!birthDate) return 0
      
      const today = new Date()
      const birth = new Date(birthDate)
      
      // Handle invalid dates
      if (isNaN(birth.getTime())) return 0
      
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      
      return Math.max(0, age) // Ensure age is not negative
    },

    async loadUsers() {
      try {
        this.loading = true
        console.log('🔍 Loading jemaat data...')
        
        const jemaatData = await getAllJemaat()
        this.users = jemaatData || []
        
        console.log(`✅ Loaded ${this.users.length} jemaat records`)
      } catch (error) {
        console.error('❌ Error loading jemaat:', error)
        toast.error('Gagal memuat data jemaat: ' + error.message)
        this.users = []
      } finally {
        this.loading = false
      }
    },

    // 🔄 Auto-refresh handlers
    async handleWindowFocus() {
      console.log('🔄 [AdminUsers] Window focused, checking for data updates...')
      await this.reloadData()
    },
    
    async handleVisibilityChange() {
      if (!document.hidden) {
        console.log('🔄 [AdminUsers] Page visible again, refreshing data...')
        await this.reloadData()
      }
    },

    // Reload data after CRUD operations
    async reloadData() {
      console.log('🔄 Reloading jemaat data...')
      await this.loadUsers()
    },

    // Search functionality
    async searchUsers() {
      if (!this.searchQuery) {
        await this.loadUsers()
        return
      }
      
      try {
        this.loading = true
        const results = await searchJemaat(this.searchQuery)
        this.users = results || []
        console.log(`🔍 Search found ${this.users.length} results for: ${this.searchQuery}`)
      } catch (error) {
        console.error('❌ Error searching jemaat:', error)
        toast.error('Gagal mencari data jemaat')
      } finally {
        this.loading = false
      }
    },

    // Form validation
    validateUserForm(userData) {
      const errors = []
      
      if (!userData.nama || userData.nama.trim() === '') {
        errors.push('Nama wajib diisi')
      }
      
      if (userData.nama && userData.nama.trim().length < 3) {
        errors.push('Nama minimal 3 karakter')
      }
      
      if (!userData.jenisKelamin) {
        errors.push('Jenis kelamin wajib dipilih')
      }
      
      if (!userData.role) {
        errors.push('Role wajib dipilih')
      }
      
      if (userData.email && !this.isValidEmail(userData.email)) {
        errors.push('Format email tidak valid')
      }
      
      if (userData.password && userData.password.length < 6) {
        errors.push('Password minimal 6 karakter')
      }
      
      return errors
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    // User actions
    async viewUserDetails(user) {
      this.selectedUser = user
      this.showDetailModal = true
      this.loadingDetailData = true
      
      try {
        console.log('📊 Loading user details for:', user.nama)
        
        // Load user streak data directly from Firestore
        let streakData = {}
        try {
          // Use streak service to get fresh data
          const { getUserStreakData } = await import('@/services/streakService')
          streakData = await getUserStreakData(user.id || user.nama) || {}
          console.log('🔥 Streak data loaded:', streakData)
        } catch (streakError) {
          console.warn('⚠️ Could not load streak data:', streakError)
        }
        
        // Check password status
        let hasPassword = false
        try {
          const { checkJemaatPassword } = await import('@/services/jemaatService')
          hasPassword = await checkJemaatPassword(user.id)
        } catch (passwordError) {
          console.warn('⚠️ Could not check password status:', passwordError)
        }
        
        // Compile detailed user data with all fields
        this.userDetailData = {
          ...user,
          // Ensure all contact fields are present
          email: user.email || '',
          noHP: user.noHP || '',
          tanggalLahir: user.tanggalLahir || null,
          keluarga: user.keluarga || '',
          // Password status
          hasPassword: hasPassword,
          // Streak data from Firestore
          currentStreak: streakData.currentStreak || 0,
          longestStreak: streakData.longestStreak || 0,
          totalDays: streakData.totalDays || 0,
          lastActivityDate: streakData.lastActivityDate || null,
          streakStartDate: streakData.streakStartDate || null,
          activities: streakData.activities || []
        }
        
        console.log('✅ Complete user detail data loaded:', this.userDetailData)
        
      } catch (error) {
        console.error('❌ Error loading user details:', error)
        // Fallback to basic user data with default values
        this.userDetailData = {
          ...user,
          email: user.email || '',
          noHP: user.noHP || '',
          tanggalLahir: user.tanggalLahir || null,
          keluarga: user.keluarga || '',
          hasPassword: false,
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          lastActivityDate: null,
          streakStartDate: null,
          activities: []
        }
      } finally {
        this.loadingDetailData = false
      }
    },
    
    editUserRole(user) {
      this.selectedUser = user
      this.newRole = user.role || 'jemaat'
      this.showRoleModal = true
    },
    
    async updateUserRole() {
      if (!this.selectedUser || !this.newRole) return
      
      try {
        this.isUpdatingRole = true
        
        console.log(`Updating role for ${this.selectedUser.nama} to ${this.newRole}`)
        
        // Update role in database
        await updateJemaatRole(this.selectedUser.id, this.newRole)
        
        // Reload data to get fresh list
        await this.reloadData()
        
        toast.success(`Role ${this.selectedUser.nama} berhasil diupdate menjadi ${this.newRole}`)
        this.closeRoleModal()
        
      } catch (error) {
        console.error('❌ Error updating user role:', error)
        toast.error('Gagal mengupdate role: ' + error.message)
      } finally {
        this.isUpdatingRole = false
      }
    },
    
    async createUser() {
      // Validate form
      const errors = this.validateUserForm(this.newUser)
      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }
      
      try {
        this.isCreatingUser = true
        console.log('📥 Adding new jemaat:', this.newUser)
        
        // Check if name already exists
        const nameExists = await jemaatNameExists(this.newUser.nama)
        if (nameExists) {
          toast.error('Jemaat dengan nama tersebut sudah ada')
          return
        }
        
        // Create jemaat in database
        await createJemaat(this.newUser)
        
        // Reload data to get fresh list
        await this.reloadData()
        
        toast.success(`Jemaat ${this.newUser.nama} berhasil ditambahkan`)
        this.closeAddUserModal()
        
      } catch (error) {
        console.error('❌ Error adding jemaat:', error)
        toast.error('Gagal menambah jemaat: ' + error.message)
      } finally {
        this.isCreatingUser = false
      }
    },
    
    // Edit user methods
    async editUser(user) {
      this.selectedUser = user
      
      try {
        // Check password status
        let hasPassword = false
        try {
          const { checkJemaatPassword } = await import('@/services/jemaatService')
          hasPassword = await checkJemaatPassword(user.id)
        } catch (passwordError) {
          console.warn('⚠️ Could not check password status:', passwordError)
        }
        
        // Clone user data with all fields and add password status
        this.editingUser = { 
          ...user,
          // Ensure all fields are present
          nama: user.nama || '',
          jenisKelamin: user.jenisKelamin || '',
          tanggalLahir: user.tanggalLahir || '',
          status: user.status || '',
          sektor: user.sektor || '',
          keluarga: user.keluarga || '',
          role: user.role || 'jemaat',
          email: user.email || '',
          noHP: user.noHP || '',
          isRegistered: user.isRegistered || false,
          // Password fields
          hasPassword: hasPassword,
          newPassword: '' // For setting new password
        }
        
        console.log('📝 Edit user data prepared:', this.editingUser)
        this.showEditModal = true
        
      } catch (error) {
        console.error('❌ Error preparing edit user:', error)
        // Fallback to basic clone
        this.editingUser = { ...user, newPassword: '', hasPassword: false }
        this.showEditModal = true
      }
    },
    
    async updateUser() {
      // Validate form
      const errors = this.validateUserForm(this.editingUser)
      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }
      
      try {
        this.isUpdatingUser = true
        console.log('📝 Updating jemaat:', this.editingUser)
        
        // Check if name already exists (excluding current user)
        if (this.editingUser.nama !== this.selectedUser.nama) {
          const nameExists = await jemaatNameExists(this.editingUser.nama, this.selectedUser.id)
          if (nameExists) {
            toast.error('Jemaat dengan nama tersebut sudah ada')
            return
          }
        }
        
        // Prepare update data (exclude internal fields)
        const updateData = { ...this.editingUser }
        delete updateData.hasPassword
        delete updateData.newPassword
        
        // Handle password update if provided
        if (this.editingUser.newPassword && this.editingUser.newPassword.trim() !== '') {
          if (this.editingUser.newPassword.length < 6) {
            toast.error('Password minimal 6 karakter')
            return
          }
          
          console.log('🔐 Updating password for user')
          updateData.password = this.editingUser.newPassword
          updateData.isRegistered = true // Auto-mark as registered when password is set
        }
        
        // Update jemaat in database
        await updateJemaat(this.selectedUser.id, updateData)
        
        // 🔄 SYNC: Jika user yang diupdate adalah user yang sedang login, update userStore
        if (this.userStore.user && 
            (this.userStore.user.id === this.selectedUser.id || 
             this.userStore.user.nama === this.selectedUser.nama)) {
          
          console.log('🔄 [AdminUsers] Syncing updated data to userStore for current user')
          
          // Update userStore dengan data terbaru
          const updatedUserData = {
            ...this.userStore.user,
            ...updateData,
            lastUpdated: new Date().toISOString()
          }
          
          this.userStore.setUser(updatedUserData)
          localStorage.setItem('user', JSON.stringify(updatedUserData))
          
          toast.success(`Data ${this.editingUser.nama} berhasil diupdate dan disinkronkan`)
        } else {
          toast.success(`Data ${this.editingUser.nama} berhasil diupdate`)
        }
        
        // Reload data to get fresh list
        await this.reloadData()
        this.closeEditModal()
        
      } catch (error) {
        console.error('❌ Error updating jemaat:', error)
        toast.error('Gagal mengupdate data jemaat: ' + error.message)
      } finally {
        this.isUpdatingUser = false
      }
    },
    
    // Delete user methods
    confirmDeleteUser(user) {
      this.selectedUser = user
      this.showDeleteModal = true
    },
    
    async deleteUser() {
      if (!this.selectedUser) return
      
      try {
        this.isDeletingUser = true
        console.log('🗑️ Deleting jemaat:', this.selectedUser.nama)
        
        // Check if trying to delete admin
        if (this.selectedUser.role === 'admin') {
          // Ask for confirmation
          const confirmed = confirm(
            `Anda akan menghapus ${this.selectedUser.role} "${this.selectedUser.nama}". ` +
            'Ini adalah aksi yang berisiko. Apakah Anda yakin?'
          )
          if (!confirmed) {
            this.isDeletingUser = false
            return
          }
        }
        
        // Delete jemaat from database
        await deleteJemaat(this.selectedUser.id)
        
        // Reload data to get fresh list
        await this.reloadData()
        
        toast.success(`Jemaat ${this.selectedUser.nama} berhasil dihapus`)
        this.closeDeleteModal()
        
      } catch (error) {
        console.error('❌ Error deleting jemaat:', error)
        toast.error('Gagal menghapus jemaat: ' + error.message)
      } finally {
        this.isDeletingUser = false
      }
    },

    // Modal controls
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedUser = null
    },
    
    closeRoleModal() {
      this.showRoleModal = false
      this.selectedUser = null
      this.newRole = ''
    },
    
    closeAddUserModal() {
      this.showAddUserModal = false
      this.formTouched = false
      this.newUser = {
        nama: '',
        jenisKelamin: '',
        role: 'jemaat',
        sektor: '',
        status: '',
        keluarga: '',
        email: '',
        noHP: '',
        tanggalLahir: '',
        password: '',
        isRegistered: false
      }
      this.isCreatingUser = false
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.selectedUser = null
      this.editingUser = {}
      this.isUpdatingUser = false
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.selectedUser = null
      this.isDeletingUser = false
    },

    // Utility functions
    getRoleLabel(role) {
      const roleLabels = {
        'admin': 'Admin',
        'operator': 'Operator', 
        'jemaat': 'Jemaat'
      }
      return roleLabels[role] || 'Jemaat'
    },
    
    formatDate(date) {
      if (!date) return '-'
      
      try {
        let dateObj
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (typeof date === 'string') {
          dateObj = new Date(date)
        } else {
          dateObj = date
        }
        
        return dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return '-'
      }
    },
    
    formatLastLogin(lastLogin) {
      if (!lastLogin) return 'Belum pernah login'
      return this.formatDate(lastLogin)
    },

    formatActivityDate(date) {
      if (!date) return '-'
      
      try {
        let dateObj
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (typeof date === 'string') {
          dateObj = new Date(date)
        } else {
          dateObj = date
        }
        
        // Format as relative time for recent activities
        const now = new Date()
        const diffMs = now - dateObj
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          return 'Hari ini'
        } else if (diffDays === 1) {
          return 'Kemarin'
        } else if (diffDays < 7) {
          return `${diffDays} hari lalu`
        } else {
          return dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        }
      } catch (error) {
        return '-'
      }
    },

    // Password reset methods
    async resetUserPassword() {
      this.resetPasswordError = ''
      
      // Get password to use (default or user-specified)
      const newPassword = this.resetPasswordData.newPassword.trim() || '123456'
      const confirmPassword = this.resetPasswordData.confirmPassword.trim() || '123456'
      
      // Validation
      if (newPassword !== confirmPassword) {
        this.resetPasswordError = 'Password dan konfirmasi password tidak sama'
        return
      }
      
      if (newPassword.length < 6) {
        this.resetPasswordError = 'Password minimal 6 karakter'
        return
      }
      
      try {
        this.isResettingPassword = true
        console.log(`🔄 Resetting password for ${this.selectedUser.nama}`)
        
        // Import and use password reset service
        const { resetJemaatPassword } = await import('@/services/jemaatService')
        await resetJemaatPassword(this.selectedUser.id, newPassword)
        
        // Refresh user detail data
        await this.viewUserDetails(this.selectedUser)
        
        toast.success(`Password ${this.selectedUser.nama} berhasil direset`)
        
        // Close modal and reset form
        this.showPasswordResetConfirm = false
        this.resetPasswordData = { newPassword: '', confirmPassword: '' }
        
      } catch (error) {
        console.error('❌ Error resetting password:', error)
        this.resetPasswordError = 'Gagal mereset password: ' + error.message
      } finally {
        this.isResettingPassword = false
      }
    },

    // Utility methods for birth date and age
    formatDateOnly(date) {
      if (!date) return '-'
      
      try {
        let dateObj
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (typeof date === 'string') {
          dateObj = new Date(date)
        } else {
          dateObj = date
        }
        
        return dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      } catch (error) {
        return '-'
      }
    }
  }
}
</script>

<style scoped>
.admin-users {
  padding: 20px;
}

.users-content {
  margin-top: 20px;
}

/* Statistics Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2d3748;
}

.stat-info p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

/* Users Header */
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.users-header h3 {
  margin: 0;
}

.users-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  min-width: 150px;
}

/* Users Table */
.users-table {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
}

.user-info strong {
  display: block;
  color: #2d3748;
}

.user-info small {
  color: #718096;
  font-size: 12px;
}

/* Badges */
.status-badge, .role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.registered {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.unregistered {
  background: #fed7d7;
  color: #742a2a;
}

.role-badge.admin {
  background: #e6fffa;
  color: #234e52;
}

.role-badge.operator {
  background: #e0e7ff;
  color: #3730a3;
}

.role-badge.jemaat {
  background: #f0f9ff;
  color: #0c4a6e;
}

/* User Actions */
.user-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #edf2f7;
  color: #2d3748;
}

.btn-icon .icon {
  width: 16px;
  height: 16px;
}

/* No Data State */
.no-users {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.no-data-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 15px;
  opacity: 0.5;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-info {
  color: #718096;
  font-size: 14px;
}

/* Buttons */
.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.btn-close {
  padding: 4px;
  border: none;
  background: none;
  color: #718096;
  cursor: pointer;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f7fafc;
  color: #2d3748;
}

.btn-close .icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-group:last-child {
  border-bottom: none;
}

.detail-group label {
  font-weight: 500;
  color: #4a5568;
}

.detail-group span {
  color: #2d3748;
}

/* Form Elements */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #4a5568;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.warning-text {
  color: #d69e2e;
  font-size: 14px;
  margin: 10px 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .users-actions {
    justify-content: stretch;
  }
  
  .search-input,
  .filter-select {
    min-width: auto;
    flex: 1;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
}

/* CRUD Button Styles */
.add-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-user-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.add-user-btn .icon {
  width: 16px;
  height: 16px;
}

/* Action Button Styles */
.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon .icon {
  width: 16px;
  height: 16px;
}

.btn-view {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-view:hover {
  background: #cbd5e0;
}

.btn-edit {
  background: #fed7d7;
  color: #c53030;
}

.btn-edit:hover {
  background: #feb2b2;
}

.btn-role {
  background: #d6f5d6;
  color: #2f855a;
}

.btn-role:hover {
  background: #c6f6d5;
}

.btn-delete {
  background: #fbb6ce;
  color: #b83280;
}

.btn-delete:hover {
  background: #f687b3;
}

.operator-notice {
  font-size: 12px;
  color: #718096;
  font-style: italic;
}

/* Large Modal Styles */
.large-modal {
  max-width: 600px;
  width: 90vw;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checkbox-group {
  margin: 15px 0;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

/* Delete Warning Styles */
.delete-warning {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.warning-icon {
  width: 48px;
  height: 48px;
  color: #f56565;
  flex-shrink: 0;
}

.delete-warning h4 {
  margin: 0 0 10px 0;
  color: #2d3748;
}

.delete-warning p {
  margin: 5px 0;
  color: #4a5568;
}

.btn-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  transform: translateY(-1px);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Enhanced Form Styles */
.add-user-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.add-user-form::-webkit-scrollbar {
  width: 6px;
}

.add-user-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.add-user-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.add-user-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.form-section {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.required-section {
  border: 2px solid #ffd6cc;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
}

.optional-section {
  border: 2px solid #c6f6d5;
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
}

.section-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.8);
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 14px;
}

.section-icon.required {
  background: #feb2b2;
  color: #c53030;
  font-weight: bold;
}

.section-icon.optional {
  background: #9ae6b4;
  color: #2f855a;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: #718096;
  line-height: 1.4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 24px;
  background: white;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-label.required {
  color: #2d3748;
}

.asterisk {
  color: #e53e3e;
  font-weight: bold;
}

.form-input, .form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error, .form-select.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-help {
  margin-top: 6px;
  font-size: 12px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #bee3f8;
  color: #2b6cb0;
  font-size: 10px;
  font-weight: bold;
}

.field-error {
  margin-top: 6px;
  font-size: 12px;
  color: #e53e3e;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-error::before {
  content: "⚠";
  color: #e53e3e;
}

.checkbox-group {
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
  background: white;
}

.checkbox-label:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "✓";
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  flex: 1;
  font-size: 14px;
}

/* Enhanced Detail Modal Styles */
.detail-modal {
  max-width: 700px;
  width: 90vw;
  max-height: 85vh;
}

.user-detail-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.user-detail-content::-webkit-scrollbar {
  width: 6px;
}

.user-detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.user-detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.detail-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.detail-section .section-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-bottom: 1px solid #e2e8f0;
}

.detail-section .section-title {
  font-size: 16px;
  margin: 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.detail-value.primary {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-badge .badge-icon {
  font-size: 10px;
}

/* Enhanced Streak Cards */
.streak-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.streak-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.streak-card:hover {
  transform: translateY(-2px);
}

.streak-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.streak-number {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 4px;
}

.streak-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.streak-card.current {
  border-top: 4px solid #f56565;
}

.streak-card.longest {
  border-top: 4px solid #48bb78;
}

.streak-card.total {
  border-top: 4px solid #667eea;
}

/* Enhanced Activities List */
.activities-list {
  padding: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f7fafc;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.activity-content {
  flex: 1;
}

.activity-type {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.activity-date {
  font-size: 12px;
  color: #718096;
}

.activities-more {
  text-align: center;
  padding: 12px;
  background: #f7fafc;
  color: #718096;
  font-style: italic;
}

/* Loading Detail State */
.loading-detail {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.loading-detail .spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .streak-summary {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .detail-modal {
    max-width: 95vw;
  }
  
  .section-header {
    padding: 16px 20px 12px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .activity-item {
    padding: 10px 0;
  }
}

/* Password Reset Modal Styles */
.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warning-section {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #fef5e7;
  border: 1px solid #f6ad55;
  border-radius: 8px;
  align-items: flex-start;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 16px;
}

.warning-content p {
  margin: 4px 0;
  color: #4a5568;
  font-size: 14px;
}

.form-hint {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #feb2b2;
}

/* Password Status Styles */
.password-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.password-status.has-password {
  background: #c6f6d5;
  color: #22543d;
}

.password-status.no-password {
  background: #fed7d7;
  color: #742a2a;
}

.password-actions {
  display: flex;
  gap: 8px;
}

.btn-reset-password {
  background: #fbb6ce;
  color: #b83280;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-password:hover {
  background: #f687b3;
  transform: translateY(-1px);
}

/* Edit User Form Styles */
.edit-user-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.edit-user-form::-webkit-scrollbar {
  width: 6px;
}

.edit-user-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.edit-user-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.edit-user-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.edit-user-form .form-section {
  margin-bottom: 25px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
}

.edit-user-form .section-header {
  padding: 16px 20px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.edit-user-form .section-title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-user-form .section-subtitle {
  margin: 0;
  font-size: 13px;
  color: #718096;
}

.edit-user-form .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
}

.edit-user-form .form-group.full-width {
  grid-column: 1 / -1;
}

.password-status-display {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-status-display .form-label {
  margin-bottom: 0;
}

/* Responsive for Edit Form */
@media (max-width: 768px) {
  .edit-user-form .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .edit-user-form .section-header {
    padding: 12px 16px 8px;
  }
  
  .edit-user-form .section-title {
    font-size: 14px;
  }
  
  .edit-user-form .section-subtitle {
    font-size: 12px;
  }
}
</style>
