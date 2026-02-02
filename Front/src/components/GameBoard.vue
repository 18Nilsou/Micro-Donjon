<script setup>
import { defineProps, defineEmits, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  dungeon: {
    type: Object,
    required: true
  },
  hero: {
    type: Object,
    default: null
  },
  gameState: {
    type: Object,
    default: null
  },
  inFight: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['move']);

// Get the current room based on currentRoomId from game state
const currentRoom = computed(() => {
  if (!props.gameState?.currentRoomId || !props.dungeon?.rooms) return null;
  return props.dungeon.rooms.find(room => room.id === props.gameState.currentRoomId);
});

// Get hero position within the current room
const heroPosition = computed(() => {
  return props.gameState?.heroPosition || { x: 0, y: 0 };
});

// Create a grid for the current room
const roomGrid = computed(() => {
  if (!currentRoom.value) return [];
  
  const room = currentRoom.value;
  const width = room.dimension?.width || 10;
  const height = room.dimension?.height || 10;
  
  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const cell = {
        x,
        y,
        isHero: heroPosition.value.x === x && heroPosition.value.y === y,
        isEntrance: room.entrance?.x === x && room.entrance?.y === y,
        isExit: room.exit?.x === x && room.exit?.y === y,
        isAdjacent: canMoveTo(x, y)
      };
      row.push(cell);
    }
    grid.push(row);
  }
  return grid;
});

const canMoveTo = (x, y) => {
  const heroPos = heroPosition.value;
  const dx = Math.abs(x - heroPos.x);
  const dy = Math.abs(y - heroPos.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

const handleCellClick = (x, y) => {
  if (props.inFight) return; // Disable movement during combat
  if (canMoveTo(x, y)) {
    emit('move', x, y);
  }
};

const handleKeyPress = (event) => {
  if (!heroPosition.value || props.inFight) return; // Disable keyboard controls during combat
  
  let newX = heroPosition.value.x;
  let newY = heroPosition.value.y;
  
  switch(event.key) {
    case 'ArrowUp':
      event.preventDefault();
      newY = heroPosition.value.y - 1;
      break;
    case 'ArrowDown':
      event.preventDefault();
      newY = heroPosition.value.y + 1;
      break;
    case 'ArrowLeft':
      event.preventDefault();
      newX = heroPosition.value.x - 1;
      break;
    case 'ArrowRight':
      event.preventDefault();
      newX = heroPosition.value.x + 1;
      break;
    default:
      return;
  }
  
  if (canMoveTo(newX, newY)) {
    emit('move', newX, newY);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

const getCellClass = (cell) => {
  const classes = ['cell'];
  if (cell.isHero) classes.push('hero-cell');
  if (cell.isEntrance) classes.push('entrance-cell');
  if (cell.isExit) classes.push('exit-cell');
  if (cell.isAdjacent) classes.push('adjacent-cell');
  return classes.join(' ');
};

const getCellIcon = (cell) => {
  if (cell.isHero) return '🧙';
  if (cell.isExit) return '🚪';
  if (cell.isEntrance) return '🚪';
  return '';
};
</script>

<template>
  <div class="game-board">
    <div class="board-header">
      <h3>🏰 {{ dungeon.name }}</h3>
      <p v-if="currentRoom" class="current-room-info">
        Room {{ currentRoom.order + 1 }} of {{ dungeon.rooms.length }}
      </p>
      <p v-if="inFight" class="combat-status">⚔️ IN COMBAT - Movement Paused</p>
    </div>

    <div v-if="currentRoom" class="dungeon-grid-wrapper">
      <div class="dungeon-grid" :class="{ 'paused': inFight }">
        <div 
          v-for="(row, rowIndex) in roomGrid" 
          :key="rowIndex" 
          class="grid-row"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="getCellClass(cell)"
            @click="handleCellClick(cell.x, cell.y)"
          >
            <span v-if="getCellIcon(cell)" class="cell-icon">
              {{ getCellIcon(cell) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Combat overlay -->
      <div v-if="inFight" class="combat-overlay">
        <div class="overlay-content">
          <p class="overlay-icon">⚔️</p>
          <p class="overlay-text">Combat in Progress</p>
          <p class="overlay-hint">Defeat the monster to continue exploring</p>
        </div>
      </div>
    </div>
    <div v-else class="no-room">
      No current room data
    </div>

    <div class="legend">
      <div class="legend-item">
        <span>🧙</span> Your Hero
      </div>
      <div class="legend-item">
        <span>👹</span> Monsters
      </div>
      <div class="legend-item">
        <span>💎</span> Treasure
      </div>
      <div class="legend-item">
        <span>🚪</span> Exit
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  color: #e0e0e0;
}

.board-header {
  margin-bottom: 20px;
  text-align: center;
}

.board-header h3 {
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 10px;
}

.current-room-info {
  color: #94a3b8;
  font-size: 0.9rem;
}

.combat-status {
  color: #dc2626;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 10px;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dungeon-grid-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.dungeon-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow-x: auto;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.dungeon-grid.paused {
  opacity: 0.4;
  filter: grayscale(50%);
  pointer-events: none;
}

.combat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  backdrop-filter: blur(2px);
}

.overlay-content {
  text-align: center;
  padding: 30px;
  background: rgba(220, 38, 38, 0.2);
  border: 2px solid #dc2626;
  border-radius: 10px;
}

.overlay-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.overlay-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 5px;
}

.overlay-hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

.grid-row {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.cell {
  width: 20px;
  height: 20px;
  background: rgba(100, 116, 139, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.hero-cell {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #60a5fa;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  }
  50% {
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
  }
}

.adjacent-cell {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  cursor: pointer;
}

.adjacent-cell:hover {
  background: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  transform: scale(1.2);
}

.entrance-cell {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
}

.exit-cell {
  background: rgba(16, 185, 129, 0.3);
  border-color: #10b981;
}

.cell-icon {
  font-size: 14px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #94a3b8;
}

.legend-item span {
  font-size: 1.3rem;
}

.room-description {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.room-description h4 {
  margin-bottom: 10px;
  color: #e0e0e0;
}

.room-description p {
  color: #94a3b8;
  line-height: 1.6;
}
</style>
