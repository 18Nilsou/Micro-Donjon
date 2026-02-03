import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { redisClient } from '../config/redis';
import { DungeonService } from './DungeonService';
import { Game } from '../domain/models/Game';
import { Hero } from '../domain/models/Hero';
import { logPublisher } from '../config/logPublisher';
import { NotFoundError } from '../domain/errors/NotFoundError';
import { ItemService } from './ItemService';
import { Item } from '../domain/models/Item';
import { Dungeon } from '../domain/models/Dungeon';
import { heroEventPublisher } from '../config/heroEventPublisher';

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

export class GameService {

  private readonly GAMES_KEY = 'game:';

  constructor(
    private readonly dungeonService: DungeonService,
    private readonly itemService: ItemService
  ) { }

  async startGame(hero: Hero, dungeon: Dungeon): Promise<Game> {
    // const heroResponse = await axios.get<Hero>(`${this.baseUrl}/heroes/${heroId}`);
    // const hero = heroResponse.data;

    // Automatically generate a new dungeon for this game
    const randomName = DUNGEON_NAMES[Math.floor(Math.random() * DUNGEON_NAMES.length)];
    const randomRooms = Math.round(Math.random() * (20 - 3) + 3);

    const dungeonRequest = {
      name: randomName,
      numberOfRooms: randomRooms
    };
    // const dungeon = await this.dungeonService.generateDungeon(dungeonRequest);

    const game: Game = {
      id: uuidv4(),
      heroId: hero.id,
      dungeonId: dungeon.id,
      currentRoomId: dungeon.rooms[0].id,
      heroPosition: dungeon.rooms[0].entrance,
      status: 'active',
      startTime: new Date().toISOString(),
      mobs: [],
      items: []
    };

    await this.save(game);
    // Set current game
    await this.save({ ...game, id: 'current' });
    if (logPublisher) {
      await logPublisher.logGameEvent('GAME_STARTED', { gameJson: JSON.stringify(game) });
    }

    return game;
  }

  async getGame(): Promise<Game> {
    const current = await this.findById('current');
    if (!current) throw new NotFoundError('No current game');

    if (logPublisher) {
      await logPublisher.logGameEvent('GAME_RETRIEVED', { gameJson: 'all' });
    }

    return current;
  }

  async updateGame(updates: Partial<Game>): Promise<Game> {
    const current = await this.getGame();
    const updated = { ...current, ...updates };
    await this.save(updated);
    await this.save({ ...updated, id: 'current' });
    if (logPublisher) {
      await logPublisher.logGameEvent('GAME_UPDATED', { gameJson: 'all' });
    }
    return updated;
  }

  async deleteGame(): Promise<void> {
    const current = await this.getGame();
    await this.delete(current.id);
    await this.delete('current');
    if (logPublisher) {
      await logPublisher.logGameEvent('GAME_DELETED', { gameJson: 'all' });
    }
  }

  async save(game: Game): Promise<void> {
    await redisClient.set(`game:${game.id}`, JSON.stringify(game));
  }

  async findById(gameId: string): Promise<Game | null> {
    const data = await redisClient.get(`${this.GAMES_KEY}${gameId}`);
    return data ? JSON.parse(data) : null;
  }

  async update(id: string, updates: Partial<Game>): Promise<void> {
    const existing = await this.findById(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      await this.save(updated);
    }
  }

  async delete(id: string): Promise<void> {
    await redisClient.del(`game:${id}`);
  }

  async updateLevel(heroId: string): Promise<void> {
    await heroEventPublisher.publishHeroLevelUp(heroId);
  }

  async getRandomItem(): Promise<Item> {
    return this.itemService.getRandomItem();
  }
}