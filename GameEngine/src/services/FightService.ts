import { logPublisher } from "../config/logPublisher";
import { heroEventPublisher } from "../config/heroEventPublisher";
import { Fight } from "../domain/models/Fight";
import { GameService } from "./GameService";
import { Hero } from "../domain/models/Hero";
import { NotFoundError, BadRequestError, InternalServerError } from "../domain/errors";

export class FightService {

  constructor(private readonly gameService: GameService) { }

  async startFight(fight: Fight): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (game) {
      game.currentFight = fight;
      game.currentFightId = fight.id;

      await this.gameService.saveGameState(game);

      const verifyGame = await this.gameService.findById('current');
      if (!verifyGame?.currentFight || verifyGame.currentFight.id !== fight.id) {
        throw new InternalServerError('Failed to persist fight state');
      }
    }

    await logPublisher.logGameEvent('FIGHT_STARTED', { heroJson: 'all' });

    return fight;
  }

  async getFight(): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight) {
      await logPublisher.logError('FIGHT_RETRIEVAL_FAILED', { reason: 'No active fight found in game state' });

      throw new NotFoundError('No active fight');
    }
    await logPublisher.logGameEvent('FIGHT_RETRIEVED', { fightId: game.currentFight.id });

    return game.currentFight;
  }

  async attack(fightId: string, hero: Hero): Promise<Fight> {
    const { fight, game, mobInstance } = await this.validateAndGetFightContext(fightId);

    const heroDamage = Math.max(1, hero.attackPoints);
    const newMobHp = Math.max(0, mobInstance.healthPoints - heroDamage);

    mobInstance.healthPoints = newMobHp;
    if (newMobHp <= 0) {
      mobInstance.status = 'dead';
    }

    this.recordFightAction(fight, {
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'attack',
      target: mobInstance.name || 'Monster',
      damage: heroDamage,
      result: `${hero.name} attacks ${mobInstance.name || 'Monster'} for ${heroDamage} damage!`
    });

    if (newMobHp <= 0) {
      fight.status = 'heroWon';
      fight.endTime = new Date().toISOString();
      this.recordFightAction(fight, {
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'victory',
        result: `${mobInstance.name || 'Monster'} has been defeated!`
      });

      game.currentFightId = undefined;
      game.currentFight = undefined;
      await Promise.all([
        heroEventPublisher.publishHeroLevelUp(hero.id),
        this.gameService.saveGameState(game)
      ]);

      await logPublisher.logGameEvent('FIGHT_WON', { gameJson: 'all', mobId: mobInstance.id });
      return fight;
    }

    const newHeroHp = await this.applyMobDamageToHero(fight, hero, mobInstance);

    if (newHeroHp <= 0) {
      await this.handleHeroDeath(fight, game, hero, mobInstance);
      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;
    game.currentFight = fight;
    await this.gameService.saveGameState(game);

    return fight;
  }

  async defend(fightId: string, hero: Hero): Promise<Fight> {
    const { fight, game, mobInstance } = await this.validateAndGetFightContext(fightId);

    this.recordFightAction(fight, {
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'defend',
      result: `${hero.name} takes a defensive stance!`
    });

    const newHeroHp = await this.applyMobDamageToHero(
      fight,
      hero,
      mobInstance,
      0.5,
      `${mobInstance.name || 'Monster'} attacks but ${hero.name} blocks some damage! (${this.calculateMobDamage(mobInstance, 0.5)} damage)`
    );

    if (newHeroHp <= 0) {
      await this.handleHeroDeath(fight, game, hero, mobInstance);
      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;
    game.currentFight = fight;
    await this.gameService.saveGameState(game);

    return fight;
  }

  async flee(fightId: string, hero: Hero): Promise<Fight> {
    const { fight, game, mobInstance } = await this.validateAndGetFightContext(fightId);

    const fleeRoll = Math.random();

    if (fleeRoll < 0.6) {
      fight.status = 'fled';
      fight.endTime = new Date().toISOString();
      this.recordFightAction(fight, {
        turn: fight.turnNumber || 1,
        actor: 'hero',
        action: 'flee',
        result: `${hero.name} successfully escaped from combat!`
      });

      game.currentFightId = undefined;
      game.currentFight = undefined;
      await this.gameService.saveGameState(game);

      await logPublisher.logGameEvent('FIGHT_FLED', { gameJson: 'all' });
      return fight;
    }

    this.recordFightAction(fight, {
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'flee',
      result: `${hero.name} tried to flee but failed!`
    });

    const newHeroHp = await this.applyMobDamageToHero(
      fight,
      hero,
      mobInstance,
      1,
      `${mobInstance.name || 'Monster'} takes advantage and attacks for ${this.calculateMobDamage(mobInstance)} damage!`
    );

    if (newHeroHp <= 0) {
      await this.handleHeroDeath(fight, game, hero, mobInstance);
      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;
    game.currentFight = fight;
    await this.gameService.saveGameState(game);

    return fight;
  }


  async updateFight(updates: Partial<Fight>): Promise<Fight> {
    const game = await this.gameService.findById('current');

    if (!game || !game.currentFight) {
      await logPublisher.logError('FIGHT_UPDATE_FAILED', { reason: 'No active fight found in game state' });
      throw new NotFoundError('No active fight');
    }

    game.currentFight = { ...game.currentFight, ...updates };
    await this.gameService.saveGameState(game);
    return game.currentFight;
  }

  async deleteFight(): Promise<void> {
    const game = await this.gameService.findById('current');

    if (game) {
      game.currentFight = undefined;
      game.currentFightId = undefined;

      await this.gameService.saveGameState(game);
      await logPublisher.logGameEvent('FIGHT_DELETED', { gameID: game.id });
    }
  }

  private async validateAndGetFightContext(fightId: string) {
    const game = await this.gameService.findById('current');

    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      await logPublisher.logError('FIGHT_VALIDATION_FAILED', {
        reason: 'Fight not found in game state',
        expectedFightId: fightId,
        actualFightId: game?.currentFight?.id || 'none'
      });
      throw new NotFoundError(`Fight not found. Expected: ${fightId}, Got: ${game?.currentFight?.id || 'none'}`);
    }

    const fight = game.currentFight;

    if (fight.status !== 'active') {
      await logPublisher.logError('FIGHT_VALIDATION_FAILED', {
        reason: 'Fight is not active',
        fightStatus: fight.status
      });
      throw new BadRequestError('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      await logPublisher.logError('FIGHT_VALIDATION_FAILED', {
        reason: 'Not hero turn',
        currentTurn: fight.turn
      });
      throw new BadRequestError('Not hero turn');
    }

    if (!game.mobs) {
      await logPublisher.logError('FIGHT_VALIDATION_FAILED', {
        reason: 'No mobs found in game state'
      });
      throw new InternalServerError('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      await logPublisher.logError('FIGHT_VALIDATION_FAILED', {
        reason: 'Mob instance not found in game state',
        mobId: fight.mobIds[0]
      });
      throw new NotFoundError('Mob instance not found in game state');
    }

    return { fight, game, mobInstance };
  }

  private recordFightAction(fight: Fight, action: any): void {
    fight.actions = fight.actions || [];
    fight.actions.push(action);
  }

  private async handleHeroDeath(fight: Fight, game: any, hero: Hero, mobInstance: any): Promise<void> {
    fight.status = 'heroLost';
    fight.endTime = new Date().toISOString();
    this.recordFightAction(fight, {
      turn: fight.turnNumber || 1,
      actor: 'system',
      action: 'defeat',
      result: `${hero.name} has been defeated...`
    });

    await heroEventPublisher.publishHeroDelete(hero.id);
    await this.gameService.delete('current');
    await this.gameService.delete(game.id);
    await logPublisher.logGameEvent('FIGHT_LOST', { gameJson: 'all', mobId: mobInstance.id });
    await logPublisher.logGameEvent('GAME_OVER', { heroId: hero.id });
  }

  private calculateMobDamage(mobInstance: any, modifier: number = 1): number {
    return Math.max(1, Math.floor((mobInstance.attackPoints || 5) * modifier));
  }

  private async applyMobDamageToHero(
    fight: Fight,
    hero: Hero,
    mobInstance: any,
    damageModifier: number = 1,
    customMessage?: string
  ): Promise<number> {
    const mobDamage = this.calculateMobDamage(mobInstance, damageModifier);
    const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

    await heroEventPublisher.publishHeroUpdate(hero.id, newHeroHp);

    const message = customMessage ||
      `${mobInstance.name || 'Monster'} attacks ${hero.name} for ${mobDamage} damage!`;

    this.recordFightAction(fight, {
      turn: fight.turnNumber || 1,
      actor: 'mob',
      action: 'attack',
      target: hero.name,
      damage: mobDamage,
      result: message
    });

    return newHeroHp;
  }
}