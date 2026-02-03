<script setup>
import { defineProps, computed, defineEmits } from 'vue';
import api from '../services/api';

const props = defineProps({
  gameState: {
    type: Object,
    required: true
  },
  fight: {
    type: Object,
    default: null
  },
  mob: {
    type: Object,
    default: null
  },
  hero: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['fightEnded', 'fightUpdated']);

const getCurrentFight = () => {
  return props.fight || null;
};

const attack = async () => {
  if (!props.fight) return;
  console.log('Attacking with fight ID:', props.fight.id);
  try {
    const updatedFight = await api.attackInFight(props.fight.id);
    if (updatedFight) {
      emit('fightUpdated', updatedFight);
    } else {
      // Refresh fight state if response was empty
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    }
  } catch (error) {
    console.error('Attack failed:', error);
    // Try to refresh state anyway
    try {
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    } catch (e) {
      console.error('Failed to refresh fight state:', e);
    }
  }
};

const defend = async () => {
  if (!props.fight) return;
  try {
    const updatedFight = await api.defendInFight(props.fight.id);
    if (updatedFight) {
      emit('fightUpdated', updatedFight);
    } else {
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    }
  } catch (error) {
    console.error('Defend failed:', error);
    try {
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    } catch (e) {
      console.error('Failed to refresh fight state:', e);
    }
  }
};

const flee = async () => {
  if (!props.fight) return;
  try {
    const updatedFight = await api.fleeFromFight(props.fight.id);
    if (updatedFight) {
      emit('fightUpdated', updatedFight);
    } else {
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    }
  } catch (error) {
    console.error('Flee failed:', error);
    try {
      const freshFight = await api.getFight();
      emit('fightUpdated', freshFight);
    } catch (e) {
      console.error('Failed to refresh fight state:', e);
    }
  }
};


const heroHealthPercent = computed(() => {
  if (!props.hero) return 0;
  return (props.hero.healthPoints / props.hero.healthPointsMax) * 100;
});

const mobHealthPercent = computed(() => {
  if (!props.mob) return 0;
  const maxHp = props.mob.healthPointsMax || 100;
  return (props.mob.healthPoints / maxHp) * 100;
});
</script>

<template>
  <div class="fight-panel">
    <h3>⚔️ Combat</h3>
    
    <div v-if="getCurrentFight()" class="fight-info">
      <div class="encounter-alert">
        <p class="encounter-text">💥 A wild {{ mob?.name || 'monster' }} appears!</p>
      </div>

      <div class="combatants">
        <div class="combatant hero-combatant">
          <div class="combatant-icon">🧙</div>
          <div class="combatant-name">{{ hero?.name || 'Hero' }}</div>
          <div class="health-bar">
            <div 
              class="health-fill hero-health"
              :style="{ width: heroHealthPercent + '%' }"
            ></div>
            <span class="health-text">{{ hero?.healthPoints || 0 }}/{{ hero?.healthPointsMax || 0 }}</span>
          </div>
          <div class="stats">
            <span>⚔️ {{ hero?.attackPoints || 0 }}</span>
          </div>
        </div>

        <div class="vs-divider">⚔️ VS ⚔️</div>

        <div class="combatant enemy-combatant">
          <div class="combatant-icon">👹</div>
          <div class="combatant-name">{{ mob?.name || 'Monster' }}</div>
          <div class="health-bar">
            <div 
              class="health-fill enemy-health"
              :style="{ width: mobHealthPercent + '%' }"
            ></div>
            <span class="health-text">{{ mob?.healthPoints || 0 }}/{{ mob?.healthPointsMax || 0 }}</span>
          </div>
          <div class="stats">
            <span>⚔️ {{ mob?.attackPoints || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="combat-log">
        <h4>Combat Log</h4>
        <div class="log-entries">
          <div v-if="!fight.actions || fight.actions.length === 0">
            <div class="log-entry">⚔️ Combat started with {{ mob?.name }}!</div>
            <div class="log-entry hint">Choose your action below</div>
          </div>
          <div v-else>
            <div 
              v-for="(action, index) in fight.actions" 
              :key="index" 
              class="log-entry"
            >
              {{ action.result }}
            </div>
          </div>
        </div>
      </div>

      <div class="combat-actions">
        <button class="action-btn attack-btn" @click="attack">⚔️ Attack</button>
        <button class="action-btn defend-btn" @click="defend">🛡️ Defend</button>
        <button class="action-btn flee-btn" @click="flee">🏃 Flee</button>
      </div>
    </div>

    <div v-else class="no-combat">
      <p>No active combat</p>
      <p class="hint">Explore the dungeon to find monsters!</p>
    </div>
  </div>
</template>

<style scoped>
.fight-panel {
  color: #e0e0e0;
}

.fight-panel h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #ffd700;
}

.fight-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.encounter-alert {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

.encounter-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.8);
  }
}

.combatants {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.combatant {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.hero-combatant {
  border-color: #3b82f6;
}

.enemy-combatant {
  border-color: #dc2626;
}

.combatant-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 10px;
}

.combatant-name {
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.health-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
}

.health-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.health-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.stats {
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
  color: #94a3b8;
}

.stats span {
  font-weight: 600;
}

.hero-health {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.enemy-health {
  background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
}

.vs-divider {
  text-align: center;
  font-size: 1.2rem;
  padding: 10px 0;
  color: #ffd700;
}

.combat-log {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
 

.log-entry.hint {
  color: #94a3b8;
  font-style: italic;
} border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.combat-log h4 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: #94a3b8;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 0.9rem;
  color: #e0e0e0;
}

.combat-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.attack-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.attack-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 38, 38, 0.4);
}

.defend-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.defend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.flee-btn {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.flee-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(107, 114, 128, 0.4);
}

.no-combat {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.no-combat p {
  margin-bottom: 10px;
}

.hint {
  font-size: 0.9rem;
  font-style: italic;
  color: #64748b;
}
</style>
