import { Game } from '../../domain/models/Game';
import { GameRepositoryPort } from '../../application/ports/outbound/GameRepositoryPort';
import { redisClient } from '../../config/redis';

export class GameRepositoryAdapter implements GameRepositoryPort {

  async save(game: Game): Promise<void> {
    await redisClient.set(`game:${game.id}`, JSON.stringify(game));
  }

  async findById(id: string): Promise<Game | null> {
    const data = await redisClient.get(`game:${id}`);
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
}