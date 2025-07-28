<!-- AdminCard.vue - Reusable card component for admin interface -->
<template>
  <div class="admin-card">
    <div v-if="$slots.header" class="admin-card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="admin-card-content">
      <slot name="content">
        <slot></slot>
      </slot>
    </div>
    
    <div v-if="$slots.footer" class="admin-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminCard',
  props: {
    elevated: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.admin-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1rem;
  transition: box-shadow 0.3s ease;
}

.admin-card.elevated {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.admin-card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.admin-card-content {
  padding: 1.5rem;
}

.admin-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Loading state */
.admin-card[data-loading="true"] {
  position: relative;
  pointer-events: none;
}

.admin-card[data-loading="true"]::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-card-header,
  .admin-card-content,
  .admin-card-footer {
    padding: 1rem;
  }
}
</style>
