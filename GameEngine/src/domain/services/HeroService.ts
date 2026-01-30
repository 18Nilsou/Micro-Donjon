import { HeroServicePort } from '../../application/ports/inbound/HeroServicePort';
import { Hero } from '../models/Hero';
import { GameRepositoryPort } from '../../application/ports/outbound/GameRepositoryPort';
import { HeroServicePort as OutboundHeroServicePort } from '../../application/ports/outbound/HeroServicePort';
import { MessageBrokerPort } from '../../application/ports/outbound/MessageBrokerPort';

export class HeroService implements HeroServicePort {
  constructor(
    private readonly gameRepo: GameRepositoryPort,
    private readonly heroService: OutboundHeroServicePort,
    private readonly messageBroker: MessageBrokerPort
  ) {}

  async moveHero(heroId: number, x: number, y: number): Promise<Hero> {
    const game = await this.gameRepo.findById('current');
    if (!game) throw new Error('No current game');
    // Check if move is valid (within room, not blocked, etc.)
    // For simplicity, assume valid
    const newPosition = { x, y };
    game.heroPosition = newPosition;
    await this.gameRepo.save(game);
    await this.gameRepo.save({ ...game, id: 'current' });

    const hero = await this.heroService.getHero(heroId);
    hero.position = newPosition;

    await this.messageBroker.notifyAction('hero_moved', { heroId, position: newPosition });

    return hero;
  }
}