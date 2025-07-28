<!-- AdminPageHeader.vue - Page header component for admin interface -->
<template>
  <div class="admin-page-header">
    <div class="header-content">
      <div class="header-text">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- Breadcrumb if provided -->
    <nav v-if="breadcrumb && breadcrumb.length" class="breadcrumb">
      <ol class="breadcrumb-list">
        <li v-for="(item, index) in breadcrumb" :key="index" class="breadcrumb-item">
          <router-link 
            v-if="item.to && index < breadcrumb.length - 1" 
            :to="item.to"
            class="breadcrumb-link"
          >
            {{ item.text }}
          </router-link>
          <span v-else class="breadcrumb-current">{{ item.text }}</span>
          <span v-if="index < breadcrumb.length - 1" class="breadcrumb-separator">/</span>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'AdminPageHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: null
    },
    breadcrumb: {
      type: Array,
      default: () => []
    },
    showBack: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.admin-page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-text {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Breadcrumb styles */
.breadcrumb {
  margin-top: 1rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #374151;
}

.breadcrumb-current {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Back button styles */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .breadcrumb-list {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }
  
  .breadcrumb-item {
    font-size: 0.8rem;
  }
}
</style>
