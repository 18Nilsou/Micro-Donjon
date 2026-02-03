import { logPublisher } from "../config/logPublisher";
import { Fight } from "../domain/models/Fight";
import { GameService } from "./GameService";
import axios from 'axios';

export class FightService {
  private baseUrl: string = process.env.HERO_SERVICE_URL || 'http://localhost:3002';
  private mobServiceUrl: string = process.env.MOB_SERVICE_URL || 'http://localhost:3003';

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
      throw new Error('No active fight');
    }
    return game.currentFight;
  }

  async attack(fightId: string, userId: string): Promise<Fight> {
    const game = await this.gameService.findById('current');

    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      throw new Error(`Fight not found. Expected: ${fightId}, Got: ${game?.currentFight?.id || 'none'}`);
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      throw new Error('Not hero turn');
    }

    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`, {
      headers: { 'x-user-id': userId }
    });
    const hero = heroResponse.data;

    if (!game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
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
        this.gameService.save(game),
        this.gameService.save({ ...game, id: 'current' })
      ]);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_WON', { heroJson: 'all', mobId: mobInstance.id });
      }

      return fight;
    }

    const mobDamage = Math.max(1, (mobInstance.attackPoints || 5));
    const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

    const updatedHero = await axios.put(`${this.baseUrl}/heroes/${hero.id}/healthPoints`, 
      { healthPoints: newHeroHp },
      { headers: { 'x-user-id': userId } }
    );


    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'mob',
      action: 'attack',
      target: hero.name,
      damage: mobDamage,
      result: `${mobInstance.name || 'Monster'} attacks ${hero.name} for ${mobDamage} damage!`
    });

    if (updatedHero.data.healthPoints <= 0) {
      fight.status = 'heroLost';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'defeat',
        result: `${hero.name} has been defeated...`
      });

      try {
        await axios.delete(`${this.baseUrl}/heroes/${hero.id}`);
      } catch (error: any) {
        console.error('Failed to delete hero:', error.message);
      }

      await this.gameService.delete('current');
      await this.gameService.delete(game.id);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_LOST', { heroJson: 'all', mobId: mobInstance.id });
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

  async defend(fightId: string, userId: string): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      throw new Error('Fight not found');
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      throw new Error('Not hero turn');
    }

    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`, {
      headers: { 'x-user-id': userId }
    });
    const hero = heroResponse.data;

    if (!game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
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

    const updatedHero = await axios.put(`${this.baseUrl}/heroes/${hero.id}/healthPoints`, 
      { healthPoints: newHeroHp },
      { headers: { 'x-user-id': userId } }
    );

    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'mob',
      action: 'attack',
      target: hero.name,
      damage: reducedDamage,
      result: `${mobInstance.name || 'Monster'} attacks but ${hero.name} blocks some damage! (${reducedDamage} damage)`
    });

    if (updatedHero.data.healthPoints <= 0) {
      fight.status = 'heroLost';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'defeat',
        result: `${hero.name} has been defeated...`
      });

      try {
        await axios.delete(`${this.baseUrl}/heroes/${hero.id}`);
      } catch (error: any) {
        console.error('Failed to delete hero:', error.message);
      }

      await this.gameService.delete('current');
      await this.gameService.delete(game.id);

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_LOST', { heroJson: 'all' });
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

  async flee(fightId: string, userId: string): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight || game.currentFight.id !== fightId) {
      throw new Error('Fight not found');
    }

    const fight = game.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    const fleeRoll = Math.random();
    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`, {
      headers: { 'x-user-id': userId }
    });
    const hero = heroResponse.data;

    if (!game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
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
        await logPublisher.logGameEvent('FIGHT_FLED', { heroJson: 'all' });
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

      const updatedHero = await axios.put(`${this.baseUrl}/heroes/${hero.id}/healthPoints`, 
        { healthPoints: newHeroHp },
        { headers: { 'x-user-id': userId } }
      );

      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'mob',
        action: 'attack',
        target: hero.name,
        damage: mobDamage,
        result: `${mobInstance.name || 'Monster'} takes advantage and attacks for ${mobDamage} damage!`
      });

      if (updatedHero.data.healthPoints <= 0) {
        fight.status = 'heroLost';
        fight.endTime = new Date().toISOString();
        fight.actions.push({
          turn: fight.turnNumber || 1,
          actor: 'system',
          action: 'defeat',
          result: `${hero.name} has been defeated...`
        });

        try {
          await axios.delete(`${this.baseUrl}/heroes/${hero.id}`, {
            headers: { 'x-user-id': userId }
          });
        } catch (error: any) {
          console.error('Failed to delete hero:', error.message);
        }

        await this.gameService.delete('current');
        await this.gameService.delete(game.id);

        if (logPublisher) {
          await logPublisher.logGameEvent('FIGHT_LOST', { heroJson: 'all' });
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
  }

  async updateFight(updates: Partial<Fight>): Promise<Fight> {
    const game = await this.gameService.findById('current');
    if (!game || !game.currentFight) {
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
    }
  }
}