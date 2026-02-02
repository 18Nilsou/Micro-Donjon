<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const emit = defineEmits(['start-game']);

const DUNGEON_NAMES = [
    'Caverns of Chaos',
    'Dungeon of Doom',
    'Labyrinth of Legends',
    'Crypt of Shadows',
    'Fortress of Fear',
    'Maze of Mysteries',
    'Catacombs of the Forgotten',
    'Temple of Trials',
    'Citadel of Sorrows',
    'Keep of the Damned'
];

const heroes = ref([]);
const classes = ref([]);
const selectedHeroId = ref(null);
const selectedDungeonId = ref(null);
const loading = ref(false);
const error = ref(null);

// Create new hero form
const showCreateHero = ref(false);
const newHeroName = ref('');
const newHeroClass = ref(null);

const loadHeroes = async () => {
    try {
        heroes.value = await api.getHeroes();
    } catch (err) {
        console.error('Failed to load heroes:', err);
    }
};

const loadClasses = async () => {
    try {
        classes.value = await api.getHeroClasses();
        newHeroClass.value = classes.value.length > 0 ? classes.value[0].name : null;
    } catch (err) {
        console.error('Failed to load hero classes:', err);
    }
};

const createHero = async () => {
    if (!newHeroName.value.trim()) return;

    loading.value = true;
    error.value = null;
    try {
        const heroData = {
            name: newHeroName.value,
            class: classes.value.filter(classItem => classItem.name === newHeroClass.value)[0] || null,
        };
        await api.createHero(heroData);
        await loadHeroes();
        showCreateHero.value = false;
        newHeroName.value = '';
        newHeroClass.value = classes.value.length > 0 ? classes.value[0].name : null;
    } catch (err) {
        error.value = 'Failed to create hero: ' + err.message;
    } finally {
        loading.value = false;
    }
};

const createDungeon = async () => {
    loading.value = true;
    error.value = null;
    try {
        const name = DUNGEON_NAMES[Math.floor(Math.random() * DUNGEON_NAMES.length)];
        const rooms = Math.round(Math.random() * (20 - 3) + 3);

        const dungeonData = {
            name: name,
            numberOfRooms: rooms,
        };
        const dungeon = await api.createDungeon(dungeonData);
        selectedDungeonId.value = dungeon.id;
    } catch (err) {
        error.value = 'Failed to create dungeon: ' + err.message;
    } finally {
        loading.value = false;
    }
};

const startGame = async () => {
    if (!selectedHeroId.value) {
        error.value = 'Please select a hero';
        return;
    }
    emit('start-game', selectedHeroId.value);
};

onMounted(async () => {
    await Promise.all([loadHeroes(), loadClasses()]);
});
</script>

<template>
    <div class="game-setup">
        <div class="setup-card">
            <h2>Start Your Adventure</h2>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div class="setup-section">
                <div class="section-header">
                    <h3>Choose Your Hero</h3>
                    <button @click="showCreateHero = !showCreateHero" class="btn-toggle">
                        {{ showCreateHero ? '✕' : '＋ New Hero' }}
                    </button>
                </div>

                <div v-if="showCreateHero" class="create-form">
                    <input v-model="newHeroName" type="text" placeholder="Hero name" class="form-input"
                        @keyup.enter="createHero" />
                    <select v-model="newHeroClass" class="form-select">
                        <option v-for="heroClass in classes" :key="heroClass.name" :value="heroClass.name">
                            {{ heroClass.name }}
                        </option>
                    </select>
                    <button @click="createHero" :disabled="loading" class="btn-create">
                        Create Hero
                    </button>
                </div>

                <div class="selection-grid">
                    <div v-for="hero in heroes" :key="hero.id"
                        :class="['selection-card', { selected: selectedHeroId === hero.id }]"
                        @click="selectedHeroId = hero.id">
                        <div class="card-body">
                            <div class="card-name">{{ hero.name }}</div>
                            <div class="card-detail">{{ hero.class || 'Adventurer' }}</div>
                            <div class="card-stats" v-if="hero.healthPoints">
                                <div class="stat-label">Health</div>
                                <div class="stat-value">{{ hero.healthPoints }} / {{ hero.healthPointsMax }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="heroes.length === 0" class="empty-state">
                        No heroes available. Create one!
                    </div>
                </div>
            </div>

            <button @click="startGame" :disabled="!selectedHeroId || loading" class="btn-start">
                Start Adventure
            </button>
        </div>
    </div>
</template>

<style scoped>
.game-setup {
    width: 100%;
}

.setup-card {
    background: linear-gradient(145deg, rgba(45, 45, 68, 0.95), rgba(30, 30, 46, 0.95));
    border-radius: 20px;
    padding: 40px;
    max-width: 1200px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.setup-card h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 30px;
    background: linear-gradient(135deg, #ffd700, #ffa500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.error-message {
    background: #dc2626;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
}

.setup-section {
    margin-bottom: 25px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.section-header h3 {
    color: #f1f5f9;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.btn-toggle {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-toggle:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.create-form {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.form-input,
.form-select {
    flex: 1;
    min-width: 200px;
    padding: 10px 15px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    font-size: 1rem;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #3b82f6;
}

.btn-create {
    padding: 10px 20px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-create:hover {
    background: #059669;
}

.btn-create:disabled {
    background: #6b7280;
    cursor: not-allowed;
}

.selection-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.selection-card {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
    border: 2px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    padding: 0;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
}

.selection-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.selection-card:hover::before {
    opacity: 1;
}

.selection-card.selected {
    border-color: #10b981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
}

.selection-card.selected::before {
    background: linear-gradient(90deg, #10b981, #059669);
    opacity: 1;
}

.card-header {
    padding: 30px 20px 20px;
    background: rgba(0, 0, 0, 0.2);
}

.hero-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.selection-card.selected .hero-avatar {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.card-body {
    padding: 20px;
}

.card-name {
    font-weight: 700;
    font-size: 1.4rem;
    color: #f1f5f9;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

.card-detail {
    color: #94a3b8;
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
}

.card-stats {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
}

.stat-value {
    color: #fbbf24;
    font-size: 1.1rem;
    font-weight: 700;
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: #94a3b8;
    font-style: italic;
}

.btn-start {
    width: 100%;
    padding: 18px 40px;
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    margin-top: 30px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    position: relative;
    overflow: hidden;
}

.btn-start::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.btn-start:hover:not(:disabled)::before {
    left: 100%;
}

.btn-start:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(16, 185, 129, 0.5);
}

.btn-start:active:not(:disabled) {
    transform: translateY(-2px);
}

.btn-start:disabled {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
}
</style>
