<template>
  <div :class="alertClasses">
    <div class="alert-icon">
      <AlertCircle v-if="type === 'error'" />
      <CheckCircle v-if="type === 'success'" />
      <AlertTriangle v-if="type === 'warning'" />
      <Info v-if="type === 'info'" />
    </div>
    <div class="alert-content">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-vue-next'

export default {
  name: 'AdminAlert',
  components: {
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Info
  },
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['error', 'success', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    }
  },
  computed: {
    alertClasses() {
      return [
        'admin-alert',
        `admin-alert--${this.type}`
      ]
    }
  }
}
</script>

<style scoped>
.admin-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1rem;
}

.admin-alert--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.admin-alert--success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #16a34a;
}

.admin-alert--warning {
  background: #fffbeb;
  border-color: #fed7aa;
  color: #d97706;
}

.admin-alert--info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.alert-content {
  flex: 1;
}

.alert-content p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
