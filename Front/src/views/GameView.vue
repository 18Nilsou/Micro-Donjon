<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import GameSetup from '../components/GameSetup.vue';
import GameBoard from '../components/GameBoard.vue';
import HeroPanel from '../components/HeroPanel.vue';
import FightPanel from '../components/FightPanel.vue';

const gameState = ref(null);
const loading = ref(false);
const error = ref(null);
const gameStarted = ref(false);
const currentHero = ref(null);
const currentDungeon = ref(null);
const inFight = ref(false);
const currentFight = ref(null);
const currentMob = ref(null);

const startNewGame = async ({ hero, dungeon }) => {
  loading.value = true;
  error.value = null;
  try {
    await api.startGame(hero, dungeon);
    await loadGameState();
    gameStarted.value = true;
  } catch (err) {
    error.value = 'Failed to start game: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadGameState = async () => {
  try {
    gameState.value = await api.getGame();
    
    // Fetch hero and dungeon separately
    if (gameState.value?.heroId) {
      currentHero.value = await api.getHero(gameState.value.heroId);
    }
    if (gameState.value?.dungeonId) {
      currentDungeon.value = await api.getDungeon(gameState.value.dungeonId);
    }
    
    // Check if there's an active fight
    if (gameState.value?.currentFightId) {
      try {
        currentFight.value = await api.getFight();
        inFight.value = true;
        
        // Get mob from game state
        if (gameState.value.mobs && currentFight.value.mobIds && currentFight.value.mobIds.length > 0) {
          const mobInstance = gameState.value.mobs.find(m => m.id === currentFight.value.mobIds[0]);
          if (mobInstance) {
            currentMob.value = mobInstance;
          }
        }
      } catch (err) {
        console.error('Failed to load fight state:', err);
        // Clear fight if it failed to load
        inFight.value = false;
        currentFight.value = null;
        currentMob.value = null;
      }
    }
  } catch (err) {
    console.error('Failed to load game state:', err);
  }
};

const moveHero = async (x, y) => {
  if (!currentHero.value || !gameState.value) return;
  
  // Optimistic update - update UI immediately
  const previousPosition = { ...gameState.value.heroPosition };
  const previousRoomId = gameState.value.currentRoomId;
  gameState.value.heroPosition = { x, y };
  
  try {
    const result = await api.moveHero(currentHero.value.id, x, y);
    
    // Check if encounter happened
    if (result.encounter?.happened && result.encounter?.fight) {
      console.log('New encounter! Fight ID:', result.encounter.fight.id);
      currentFight.value = result.encounter.fight;
      inFight.value = true;
      
      // Use mob data from encounter response (already included from game state)
      currentMob.value = result.encounter.mob;
      
      console.log('Encounter!', currentFight.value, currentMob.value);
    }
    
    // Only reload if room changed
    if (result.roomId !== previousRoomId) {
      await loadGameState();
    } else {
      // Just update position
      gameState.value.heroPosition = result.position;
    }
  } catch (err) {
    // Revert on error
    gameState.value.heroPosition = previousPosition;
    gameState.value.currentRoomId = previousRoomId;
    error.value = 'Failed to move hero: ' + err.message;
  }
};

const endGame = async () => {
  loading.value = true;
  try {
    await api.deleteGame();
    gameState.value = null;
    gameStarted.value = false;
    currentHero.value = null;
    currentDungeon.value = null;
    inFight.value = false;
    currentFight.value = null;
    currentMob.value = null;
  } catch (err) {
    error.value = 'Failed to end game: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const handleFightUpdate = async (updatedFight) => {
  console.log('Fight updated:', updatedFight.id, 'Status:', updatedFight.status);
  currentFight.value = updatedFight;
  
  // Check if hero died FIRST before trying to fetch deleted data
  if (updatedFight.status === 'heroLost') {
    error.value = 'Game Over! Your hero has fallen...';
    // Hero is dead - go back to main screen after showing message
    setTimeout(() => {
      gameState.value = null;
      gameStarted.value = false;
      currentHero.value = null;
      currentDungeon.value = null;
      inFight.value = false;
      currentFight.value = null;
      currentMob.value = null;
      error.value = null;
    }, 3000);
    return; // Don't continue with normal flow
  }
  
  // Refresh hero data to show updated HP (only if hero is alive)
  if (gameState.value?.heroId) {
    try {
      currentHero.value = await api.getHero(gameState.value.heroId);
    } catch (err) {
      console.error('Failed to refresh hero data:', err);
    }
  }
  
  // Refresh mob data from game state
  try {
    const freshGameState = await api.getGame();
    if (freshGameState?.mobs && updatedFight.mobIds && updatedFight.mobIds.length > 0) {
      const mobInstance = freshGameState.mobs.find(m => m.id === updatedFight.mobIds[0]);
      if (mobInstance) {
        currentMob.value = mobInstance;
      }
    }
  } catch (err) {
    console.error('Failed to refresh game state:', err);
  }
  
  // Check if fight has ended
  if (updatedFight.status !== 'active') {
    // Show result message
    if (updatedFight.status === 'heroWon') {
      error.value = 'Victory! The monster has been defeated!';
      setTimeout(() => { error.value = null; }, 3000);
    } else if (updatedFight.status === 'fled') {
      error.value = 'You successfully fled from combat!';
      setTimeout(() => { error.value = null; }, 3000);
    }
    
    // Clear fight state after a delay to show final combat log
    setTimeout(() => {
      inFight.value = false;
      currentFight.value = null;
      currentMob.value = null;
    }, 2000);
  }
};

onMounted(async () => {
  // Check if there's an ongoing game
  try {
    await loadGameState();
    if (gameState.value) {
      gameStarted.value = true;
    }
  } catch (err) {
    // No active game
    console.log('No active game');
  }
});
</script>

<template>
  <div class="game-container">
    <header class="game-header">
      <h1>Micro-Donjon</h1>
      <p v-if="gameStarted" class="game-status">Game in progress</p>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null" class="close-btn">×</button>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div v-if="!gameStarted" class="setup-section">
      <GameSetup @start-game="startNewGame" />
    </div>

    <div v-else class="game-area">
      <div class="main-content">
        <div class="left-panel">
          <HeroPanel 
            v-if="currentHero" 
            :hero="currentHero"
          />
        </div>

        <div class="center-panel">
          <GameBoard 
            v-if="currentDungeon && gameState"
            :dungeon="currentDungeon"
            :hero="currentHero"
            :gameState="gameState"
            :inFight="inFight"
            @move="moveHero"
          />
        </div>

        <div class="right-panel">
          <FightPanel 
            v-if="inFight"
            :gameState="gameState"
            :fight="currentFight"
            :mob="currentMob"
            :hero="currentHero"
            @fightUpdated="handleFightUpdate"
          />
          <div v-else class="no-fight">
            <p>No active combat</p>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <button @click="loadGameState" class="btn-refresh">
          🔄 Refresh
        </button>
        <button @click="endGame" class="btn-end">
          🚪 End Game
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  /* max-width: 1800px; */
  margin: 0 auto;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 10px 20px;
}

.game-header h1 {
  font-size: 2.5rem;
  margin-bottom: 5px;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 700;
}

.game-status {
  color: #4ade80;
  font-weight: 600;
}

.error-banner {
  background: #dc2626;
  color: white;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 10px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.setup-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.game-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20px;
}

.left-panel,
.right-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.center-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  min-height: 600px;
}

.no-fight {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
}

.btn-refresh,
.btn-end {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh {
  background: #3b82f6;
  color: white;
}

.btn-refresh:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-end {
  background: #dc2626;
  color: white;
}

.btn-end:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .left-panel,
  .right-panel {
    max-width: 100%;
  }
}
</style>
