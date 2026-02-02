<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  hero: {
    type: Object,
    required: true
  }
});

const getHealthPercentage = () => {
  if (!props.hero.healthPoints || !props.hero.healthPointsMax) return 0;
  return (props.hero.healthPoints / props.hero.healthPointsMax) * 100;
};

const getHealthColor = () => {
  const percentage = getHealthPercentage();
  if (percentage > 60) return '#10b981';
  if (percentage > 30) return '#fbbf24';
  return '#dc2626';
};
</script>

<template>
  <div class="hero-panel">
    <h3>🛡️ Hero</h3>
    
    <div class="hero-info">
      <div class="hero-avatar">
        <span class="avatar-icon">⚔️</span>
      </div>
      
      <div class="hero-details">
        <h4 class="hero-name">{{ hero.name }}</h4>
        <p class="hero-class" v-if="hero.class">{{ hero.class }}</p>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <label>❤️ Health</label>
        <div class="health-bar-container">
          <div 
            class="health-bar" 
            :style="{ 
              width: getHealthPercentage() + '%',
              backgroundColor: getHealthColor()
            }"
          ></div>
          <span class="health-text">
            {{ hero.healthPoints || 0 }} / {{ hero.healthPointsMax || 100 }}
          </span>
        </div>
      </div>

      <div class="stat-item" v-if="hero.attackPoints !== undefined">
        <label>⚔️ Attack</label>
        <div class="stat-value">{{ hero.attackPoints }}</div>
      </div>

      <div class="stat-item" v-if="hero.level !== undefined">
        <label>⭐ Level</label>
        <div class="stat-value">{{ hero.level }}</div>
      </div>

      <div class="stat-item" v-if="hero.position">
        <label>📍 Position</label>
        <div class="stat-value">
          X: {{ hero.position.x }}, Y: {{ hero.position.y }}
        </div>
      </div>
    </div>

    <div v-if="hero.inventory && hero.inventory.length > 0" class="inventory-section">
      <h4>🎒 Inventory</h4>
      <div class="inventory-grid">
        <div 
          v-for="(item, index) in hero.inventory" 
          :key="index"
          class="inventory-item"
          :title="item.name"
        >
          {{ item.icon || '📦' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-panel {
  color: #e0e0e0;
}

.hero-panel h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #ffd700;
}

.hero-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.hero-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.hero-details {
  flex: 1;
}

.hero-name {
  font-size: 1.2rem;
  margin-bottom: 5px;
  color: #e0e0e0;
}

.hero-class {
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 600;
}

.stat-value {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: #e0e0e0;
}

.health-bar-container {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  height: 30px;
  overflow: hidden;
}

.health-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 6px;
}

.health-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-size: 0.9rem;
}

.inventory-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

.inventory-section h4 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: #e0e0e0;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.inventory-item {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inventory-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #3b82f6;
  transform: scale(1.1);
}
</style>
