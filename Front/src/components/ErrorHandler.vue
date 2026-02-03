<!-- filepath: Front/src/components/ErrorHandler.vue -->
<template>
  <div v-if="error" class="error-banner">
    <div class="error-content">
      <h3>❌ Erreur</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="error-button">Fermer</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorHandler',
  props: {
    error: {
      type: String,
      default: null
    }
  },
  methods: {
    clearError() {
      this.$emit('clear-error');
    }
  }
}
</script>

<style scoped>
.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  padding: 1rem;
  z-index: 1000;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.error-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
</style>