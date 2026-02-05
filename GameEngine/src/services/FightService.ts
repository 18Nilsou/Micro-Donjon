import { logPublisher } from "../config/logPublisher";
import { heroEventPublisher } from "../config/heroEventPublisher";
import { Fight } from "../domain/models/Fight";
import { GameService } from "./GameService";
import { Hero } from "../domain/models/Hero";

export class FightService {

  constructor(private readonly gameService: GameService) { }

  async startFight(fight: Fight): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (game) {
      game.currentFight = fight;
      game.currentFightId = fight.id;

      await Promise.all([
        this.gameService.save(game),
        this.gameService.save({ ...game, id: 'current' })
      ]);

      const verifyGame = await this.gameService.findById('current');
      if (!verifyGame?.currentFight || verifyGame.currentFight.id !== fight.id) {
        throw new Error('Failed to persist fight state');
      }
    }

    if (logPublisher) {
      await logPublisher.logGameEvent('FIGHT_STARTED', { heroJson: 'all' });
    }
    return fight;
  }

  async getFight(): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_RETRIEVAL_FAILED', { reason: 'No active fight found in game state' });
      }
      throw new Error('No active fight');
    }
    if (logPublisher) {
      await logPublisher.logGameEvent('FIGHT_RETRIEVED', { fightId: game.currentFight.id });
    }
    return game.currentFight;
  }

  async attack(fightId: string, hero: Hero): Promise<Fight> {
    // Get fight from game state
    const game = await this.gameService.findById('current');

    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_ATTACK_FAILED', { reason: 'Fight not found in game state', expectedFightId: fightId, actualFightId: game?.currentFight?.id || 'none' });
      }
      throw new Error(`Fight not found. Expected: ${fightId}, Got: ${game?.currentFight?.id || 'none'}`);
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_ATTACK_FAILED', { reason: 'Fight is not active', fightStatus: fight.status });
      }
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_ATTACK_FAILED', { reason: 'Not hero turn', currentTurn: fight.turn });
      }
      throw new Error('Not hero turn');
    }

    // Get mob from game state
    if (!game.mobs) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_ATTACK_FAILED', { reason: 'No mobs found in game state' });
      }
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_ATTACK_FAILED', { reason: 'Mob instance not found in game state', mobId: fight.mobIds[0] });
      }
      throw new Error('Mob instance not found in game state');
    }

    const heroDamage = Math.max(1, hero.attackPoints);
    const newMobHp = Math.max(0, mobInstance.healthPoints - heroDamage);

    mobInstance.healthPoints = newMobHp;
    if (newMobHp <= 0) {
      mobInstance.status = 'dead';
    }

    fight.actions = fight.actions || [];
    fight.actions.push({
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
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'victory',
        result: `${mobInstance.name || 'Monster'} has been defeated!`
      });

      game.currentFightId = undefined;
      game.currentFight = undefined;
      await Promise.all([
        heroEventPublisher.publishHeroLevelUp(hero.id),
        this.gameService.save(game),
        this.gameService.save({ ...game, id: 'current' })
      ]);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_WON', { gameJson: 'all', mobId: mobInstance.id });
      }

      return fight;
    }

    const mobDamage = Math.max(1, (mobInstance.attackPoints || 5));
    const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

    // Publish hero HP update to message queue
    await heroEventPublisher.publishHeroUpdate(hero.id, newHeroHp);

    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'mob',
      action: 'attack',
      target: hero.name,
      damage: mobDamage,
      result: `${mobInstance.name || 'Monster'} attacks ${hero.name} for ${mobDamage} damage!`
    });

    // Check if hero is dead
    if (newHeroHp <= 0) {
      fight.status = 'heroLost';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'defeat',
        result: `${hero.name} has been defeated...`
      });

      // Publish hero delete event to message queue
      await heroEventPublisher.publishHeroDelete(hero.id);

      await this.gameService.delete('current');
      await this.gameService.delete(game.id);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_LOST', { gameJson: 'all', mobId: mobInstance.id });
        await logPublisher.logGameEvent('GAME_OVER', { heroId: hero.id });
      }

      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;

    game.currentFight = fight;
    await Promise.all([
      this.gameService.save(game),
      this.gameService.save({ ...game, id: 'current' })
    ]);

    return fight;
  }

  async defend(fightId: string, hero: Hero): Promise<Fight> {
    // Get fight from game state
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_DEFEND_FAILED', { reason: 'Fight not found in game state', expectedFightId: fightId, actualFightId: game?.currentFight?.id || 'none' });
      }
      throw new Error('Fight not found');
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_DEFEND_FAILED', { reason: 'Fight is not active', fightStatus: fight.status });
      }
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_DEFEND_FAILED', { reason: 'Not hero turn', currentTurn: fight.turn });
      }
      throw new Error('Not hero turn');
    }

    if (!game.mobs) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_DEFEND_FAILED', { reason: 'No mobs found in game state' });
      }
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_DEFEND_FAILED', { reason: 'Mob instance not found in game state', mobId: fight.mobIds[0] });
      }
      throw new Error('Mob instance not found in game state');
    }

    fight.actions = fight.actions || [];
    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'defend',
      result: `${hero.name} takes a defensive stance!`
    });

    const mobDamage = Math.max(1, (mobInstance.attackPoints || 5));
    const reducedDamage = Math.floor(mobDamage / 2);
    const newHeroHp = Math.max(0, hero.healthPoints - reducedDamage);

    // Publish hero HP update to message queue
    await heroEventPublisher.publishHeroUpdate(hero.id, newHeroHp);

    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'mob',
      action: 'attack',
      target: hero.name,
      damage: reducedDamage,
      result: `${mobInstance.name || 'Monster'} attacks but ${hero.name} blocks some damage! (${reducedDamage} damage)`
    });

    // Check if hero is dead (unlikely when defending)
    if (newHeroHp <= 0) {
      fight.status = 'heroLost';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'defeat',
        result: `${hero.name} has been defeated...`
      });

      // Publish hero delete event to message queue
      await heroEventPublisher.publishHeroDelete(hero.id);

      await this.gameService.delete('current');
      await this.gameService.delete(game.id);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_LOST', { gameJson: 'all' });
        await logPublisher.logGameEvent('GAME_OVER', { heroId: hero.id });
      }

      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;

    game.currentFight = fight;
    await Promise.all([
      this.gameService.save(game),
      this.gameService.save({ ...game, id: 'current' })
    ]);

    return fight;
  }

  async flee(fightId: string, hero: Hero): Promise<Fight> {
    // Get fight from game state
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_FLEE_FAILED', { reason: 'Fight not found in game state', expectedFightId: fightId, actualFightId: game?.currentFight?.id || 'none' });
      }
      throw new Error('Fight not found');
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_FLEE_FAILED', { reason: 'Fight is not active', fightStatus: fight.status });
      }
      throw new Error('Fight is not active');
    }

    const fleeRoll = Math.random();

    if (!game.mobs) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_FLEE_FAILED', { reason: 'No mobs found in game state' });
      }
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_FLEE_FAILED', { reason: 'Mob instance not found in game state', mobId: fight.mobIds[0] });
      }
      throw new Error('Mob instance not found in game state');
    }

    fight.actions = fight.actions || [];

    if (fleeRoll < 0.6) {
      fight.status = 'fled';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'hero',
        action: 'flee',
        result: `${hero.name} successfully escaped from combat!`
      });

      game.currentFightId = undefined;
      game.currentFight = undefined;
      await Promise.all([
        this.gameService.save(game),
        this.gameService.save({ ...game, id: 'current' })
      ]);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_FLED', { gameJson: 'all' });
      }

      return fight;
    } else {
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'hero',
        action: 'flee',
        result: `${hero.name} tried to flee but failed!`
      });

      const mobDamage = Math.max(1, (mobInstance.attackPoints || 5));
      const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

      // Publish hero HP update to message queue
      await heroEventPublisher.publishHeroUpdate(hero.id, newHeroHp);

      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'mob',
        action: 'attack',
        target: hero.name,
        damage: mobDamage,
        result: `${mobInstance.name || 'Monster'} takes advantage and attacks for ${mobDamage} damage!`
      });

      if (newHeroHp <= 0) {
        fight.status = 'heroLost';
        fight.endTime = new Date().toISOString();
        fight.actions.push({
          turn: fight.turnNumber || 1,
          actor: 'system',
          action: 'defeat',
          result: `${hero.name} has been defeated...`
        });

        // Publish hero delete event to message queue
        await heroEventPublisher.publishHeroDelete(hero.id);

        await this.gameService.delete('current');
        await this.gameService.delete(game.id);

        if (logPublisher) {
          await logPublisher.logGameEvent('FIGHT_LOST', { gameJson: 'all' });
          await logPublisher.logGameEvent('GAME_OVER', { heroId: hero.id });
        }

        return fight;
      }
    }

    // Delete game state (game over)
    await this.gameService.delete('current');
    await this.gameService.delete(game.id);

    if (logPublisher) {
      await logPublisher.logGameEvent('FIGHT_LOST', { gameJson: 'all' });
      await logPublisher.logGameEvent('GAME_OVER', { heroId: hero.id });
    }

    return fight;
  }


  async updateFight(updates: Partial<Fight>): Promise<Fight> {
    const game = await this.gameService.findById('current');

    if (!game || !game.currentFight) {
      if (logPublisher) {
        await logPublisher.logError('FIGHT_UPDATE_FAILED', { reason: 'No active fight found in game state' });
      }
      throw new Error('No active fight');
    }

    game.currentFight = { ...game.currentFight, ...updates };
    await Promise.all([
      this.gameService.save(game),
      this.gameService.save({ ...game, id: 'current' })
    ]);
    return game.currentFight;
  }

  async deleteFight(): Promise<void> {
    const game = await this.gameService.findById('current');

    if (game) {
      game.currentFight = undefined;
      game.currentFightId = undefined;

      await Promise.all([
        this.gameService.save(game),
        this.gameService.save({ ...game, id: 'current' })
      ]);
      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_DELETED', { gameID: game.id });
      }
    }
  }
}