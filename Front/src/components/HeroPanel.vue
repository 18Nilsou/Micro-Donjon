<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  hero: {
    type: Object,
    required: true
  },
  itemsCatalog: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['consume-item']);

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

const inventoryItems = computed(() => {
  const itemsById = new Map((props.itemsCatalog || []).map(item => [item.id, item]));
  return (props.hero.inventory || []).map(invItem => {
    const details = itemsById.get(invItem.id);
    return {
      ...invItem,
      ...(details || {})
    };
  });
});

const formatEffect = (item) => {
  if (!item?.effect || item?.value === undefined) return 'Effet inconnu';
  const value = item.value;
  switch (item.effect) {
    case 'Attack':
      return `+${value} Attaque`;
    case 'Heal':
      return `+${value} Soins`;
    case 'HealthPointMax':
      return `+${value} PV max`;
    default:
      return 'Effet inconnu';
  }
};

const consumeItem = (itemId) => {
  emit('consume-item', itemId);
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
      <ul class="inventory-list">
        <li 
          v-for="item in inventoryItems" 
          :key="item.id"
          class="inventory-list-item"
        >
          <div class="item-info">
            <div class="item-name">{{ item.name || `Item #${item.id}` }}</div>
            <div class="item-effect">{{ formatEffect(item) }}</div>
          </div>
          <div class="item-actions">
            <span v-if="item.quantity > 1" class="item-qty">x{{ item.quantity }}</span>
            <button 
              v-if="item.itemType === 'Consumable'" 
              class="consume-btn" 
              @click="consumeItem(item.id)"
            >
              Consommer
            </button>
          </div>
        </li>
      </ul>
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

.inventory-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inventory-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 700;
  color: #e0e0e0;
}

.item-effect {
  font-size: 0.85rem;
  color: #94a3b8;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-qty {
  font-weight: 600;
  color: #e0e0e0;
}

.consume-btn {
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.consume-btn:hover {
  background: #059669;
}
</style>
