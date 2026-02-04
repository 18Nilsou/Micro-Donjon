import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../config/redis';
import { Game } from '../domain/models/Game';
import { Hero } from '../domain/models/Hero';
import { logPublisher } from '../config/logPublisher';
import { NotFoundError } from '../domain/errors/NotFoundError';
import { Dungeon } from '../domain/models/Dungeon';

export class GameService {

  private readonly GAMES_KEY = 'game:';

  constructor() { }

  async startGame(hero: Hero, dungeon: Dungeon): Promise<Game> {
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
    await redisClient.set(`${this.GAMES_KEY}${game.id}`, JSON.stringify(game));
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
    await redisClient.del(`${this.GAMES_KEY}${id}`);
  }
}