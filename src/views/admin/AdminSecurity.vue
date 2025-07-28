<!-- AdminSecurity.vue - Security Dashboard -->
<template>
  <div class="admin-security">
    <AdminPageHeader 
      title="Security Dashboard"
      subtitle="Monitor security events dan hybrid auth activities"
    />
    
    <div class="security-content">
      <!-- Security Overview Cards -->
      <div class="security-overview">
        <AdminCard>
          <template #header>
            <h3>Login Activities</h3>
          </template>
          
          <template #content>
            <div class="security-stats">
              <div class="stat-item">
                <span class="label">Total Logins Today:</span>
                <span class="value">{{ loginStats.today }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Failed Attempts:</span>
                <span class="value">{{ loginStats.failed }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Active Sessions:</span>
                <span class="value">{{ loginStats.activeSessions }}</span>
              </div>
            </div>
          </template>
        </AdminCard>
        
        <AdminCard>
          <template #header>
            <h3>Recent Security Events</h3>
          </template>
          
          <template #content>
            <div class="security-events">
              <div v-if="securityEvents.length === 0" class="no-events">
                No security events recorded yet.
              </div>
              <div v-else class="events-list">
                <div 
                  v-for="event in securityEvents" 
                  :key="event.id"
                  class="event-item"
                  :class="event.type"
                >
                  <div class="event-info">
                    <span class="event-type">{{ event.type }}</span>
                    <span class="event-user">{{ event.nama }}</span>
                    <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </AdminCard>
      </div>
      
      <!-- Security Settings -->
      <div class="security-settings">
        <AdminCard>
          <template #header>
            <h3>Hybrid Auth Settings</h3>
          </template>
          
          <template #content>
            <div class="settings-grid">
              <div class="setting-item">
                <label>Session Timeout (minutes):</label>
                <input 
                  v-model="settings.sessionTimeout" 
                  type="number" 
                  min="5" 
                  max="120"
                  @change="updateSettings"
                />
              </div>
              
              <div class="setting-item">
                <label>Max Login Attempts:</label>
                <input 
                  v-model="settings.maxLoginAttempts" 
                  type="number" 
                  min="3" 
                  max="10"
                  @change="updateSettings"
                />
              </div>
              
              <div class="setting-item">
                <label>Lockout Duration (minutes):</label>
                <input 
                  v-model="settings.lockoutDuration" 
                  type="number" 
                  min="5" 
                  max="60"
                  @change="updateSettings"
                />
              </div>
            </div>
          </template>
        </AdminCard>
      </div>
    </div>
  </div>
</template>

<script>
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'

export default {
  name: 'AdminSecurity',
  components: {
    AdminPageHeader,
    AdminCard
  },
  
  data() {
    return {
      loginStats: {
        today: 0,
        failed: 0,
        activeSessions: 0
      },
      securityEvents: [],
      settings: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15
      }
    }
  },
  
  mounted() {
    this.loadSecurityData()
  },
  
  methods: {
    async loadSecurityData() {
      try {
        // Load security data logic will go here
        console.log('Loading security data...')
        
        // Mock data for now
        this.loginStats = {
          today: 12,
          failed: 2,
          activeSessions: 8
        }
        
        this.securityEvents = [
          {
            id: '1',
            type: 'login_success',
            nama: 'John Doe',
            timestamp: new Date()
          },
          {
            id: '2',
            type: 'login_failed',
            nama: 'Jane Smith',
            timestamp: new Date(Date.now() - 300000)
          }
        ]
        
      } catch (error) {
        console.error('Error loading security data:', error)
      }
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },
    
    updateSettings() {
      console.log('Updating security settings:', this.settings)
      // Settings update logic will go here
    }
  }
}
</script>

<style scoped>
.admin-security {
  padding: 20px;
}

.security-content {
  margin-top: 20px;
}

.security-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.security-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

.security-events {
  max-height: 300px;
  overflow-y: auto;
}

.no-events {
  text-align: center;
  color: #666;
  padding: 20px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #ddd;
}

.event-item.login_success {
  border-left-color: #4CAF50;
  background-color: #f8f9fa;
}

.event-item.login_failed {
  border-left-color: #f44336;
  background-color: #fff5f5;
}

.event-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  font-size: 14px;
}

.event-type {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 12px;
}

.event-user {
  color: #666;
}

.event-time {
  color: #999;
  text-align: right;
}

.security-settings {
  margin-top: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  font-weight: 500;
  color: #333;
}

.setting-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-item input:focus {
  outline: none;
  border-color: #41442A;
}

@media (max-width: 768px) {
  .security-overview {
    grid-template-columns: 1fr;
  }
  
  .event-info {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
