<!-- AdminUsers.vue - User Management Dashboard -->
<template>
  <div class="admin-users">
    <AdminPageHeader 
      title="User Management"
      subtitle="Kelola data jemaat dan permissions"
    />
    
    <div class="users-content">
      <AdminCard>
        <template #header>
          <h3>Data Jemaat</h3>
        </template>
        
        <template #content>
          <div class="users-table">
            <!-- User table will go here -->
            <p>User management functionality will be implemented here.</p>
          </div>
        </template>
      </AdminCard>
    </div>
  </div>
</template>

<script>
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'

export default {
  name: 'AdminUsers',
  components: {
    AdminPageHeader,
    AdminCard
  },
  
  data() {
    return {
      users: []
    }
  },
  
  mounted() {
    this.loadUsers()
  },
  
  methods: {
    async loadUsers() {
      try {
        // Load users logic will go here
        console.log('Loading users...')
      } catch (error) {
        console.error('Error loading users:', error)
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

.users-table {
  padding: 20px;
}
</style>
