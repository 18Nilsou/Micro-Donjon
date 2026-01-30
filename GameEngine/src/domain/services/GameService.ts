import { GameServicePort } from '../../application/ports/inbound/GameServicePort';
import { Game } from '../models/Game';
import { GameRepositoryPort } from '../../application/ports/outbound/GameRepositoryPort';
import { HeroServicePort } from '../../application/ports/outbound/HeroServicePort';
import { DungeonServicePort } from '../../application/ports/outbound/DungeonServicePort';
import { MessageBrokerPort } from '../../application/ports/outbound/MessageBrokerPort';
import { v4 as uuidv4 } from 'uuid';

export class GameService implements GameServicePort {
  constructor(
    private readonly gameRepo: GameRepositoryPort,
    private readonly heroService: HeroServicePort,
    private readonly dungeonService: DungeonServicePort,
    private readonly messageBroker: MessageBrokerPort
  ) {}

  async startGame(heroId: number, dungeonId: string): Promise<Game> {
    const hero = await this.heroService.getHero(heroId);
    const dungeon = await this.dungeonService.getDungeon(dungeonId);

    const game: Game = {
      id: uuidv4(),
      heroId,
      dungeonId,
      currentRoomId: dungeon.rooms[0].id,
      heroPosition: dungeon.rooms[0].entrance,
      status: 'active',
      startTime: new Date().toISOString(),
      mobs: [],
      items: []
    };

    await this.gameRepo.save(game);
    // Set current game
    await this.gameRepo.save({ ...game, id: 'current' });
    await this.messageBroker.notifyAction('game_started', { gameId: game.id, heroId, dungeonId });

    return game;
  }

  async getGame(): Promise<Game> {
    const current = await this.gameRepo.findById('current');
    if (!current) throw new Error('No current game');
    return current;
  }

  async updateGame(updates: Partial<Game>): Promise<Game> {
    const current = await this.getGame();
    const updated = { ...current, ...updates };
    await this.gameRepo.save(updated);
    await this.gameRepo.save({ ...updated, id: 'current' });
    await this.messageBroker.notifyAction('game_updated', { gameId: current.id, updates });
    return updated;
  }

  async deleteGame(): Promise<void> {
    const current = await this.getGame();
    await this.gameRepo.delete(current.id);
    await this.gameRepo.delete('current');
    await this.messageBroker.notifyAction('game_deleted', { gameId: current.id });
  }
}