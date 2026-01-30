import { Game } from '../../domain/models/Game';
import { GameRepositoryPort } from '../../application/ports/outbound/GameRepositoryPort';
import { createClient } from 'redis';

export class GameRepositoryAdapter implements GameRepositoryPort {
  private client;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    this.client.connect();
  }

  async save(game: Game): Promise<void> {
    await this.client.set(`game:${game.id}`, JSON.stringify(game));
  }

  async findById(id: string): Promise<Game | null> {
    const data = await this.client.get(`game:${id}`);
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
    await this.client.del(`game:${id}`);
  }
}