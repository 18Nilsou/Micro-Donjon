import { logPublisher } from "../config/logPublisher";
import { Fight } from "../domain/models/Fight";
import { GameService } from "./GameService";
import axios from 'axios';

export class FightService {
  private baseUrl: string = process.env.HERO_SERVICE_URL || 'http://localhost:3005';
  private mobServiceUrl: string = process.env.MOB_SERVICE_URL || 'http://localhost:3003';
  private currentFight: Fight | null = null;

  constructor(private readonly gameService: GameService) { }

  async startFight(fight: Fight): Promise<Fight> {
    this.currentFight = fight;
    if (logPublisher) {
      await logPublisher.logGameEvent('FIGHT_STARTED', { heroJson: 'all' });
    }
    return fight;
  }

  async getFight(): Promise<Fight> {
    if (!this.currentFight) {
      throw new Error('No active fight');
    }
    return this.currentFight;
  }

  async attack(fightId: string): Promise<Fight> {
    if (!this.currentFight || this.currentFight.id !== fightId) {
      throw new Error('Fight not found');
    }

    const fight = this.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      throw new Error('Not hero turn');
    }

    // Get hero from HeroService
    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`);
    const hero = heroResponse.data;

    // Get mob from game state
    const game = await this.gameService.findById('current');
    if (!game || !game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      throw new Error('Mob instance not found in game state');
    }

    // Calculate damage
    const heroDamage = Math.max(1, hero.attackPoints);
    const newMobHp = Math.max(0, mobInstance.healthPoints - heroDamage);

    // Update mob HP in game state
    mobInstance.healthPoints = newMobHp;
    if (newMobHp <= 0) {
      mobInstance.status = 'dead';
    }
    await this.gameService.save(game);
    await this.gameService.save({ ...game, id: 'current' });

    // Add to combat log
    fight.actions = fight.actions || [];
    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'attack',
      target: mobInstance.name || 'Monster',
      damage: heroDamage,
      result: `${hero.name} attacks ${mobInstance.name || 'Monster'} for ${heroDamage} damage!`
    });

    // Check if mob is dead
    if (newMobHp <= 0) {
      fight.status = 'heroWon';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'system',
        action: 'victory',
        result: `${mobInstance.name || 'Monster'} has been defeated!`
      });

      // Clear fight from game state
      game.currentFightId = undefined;
      await this.gameService.save(game);
      await this.gameService.save({ ...game, id: 'current' });

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_WON', { heroJson: 'all', mobId: mobInstance.id });
      }

      this.currentFight = null;
      return fight;
    }

    // Mob's turn - counter attack
    const mobDamage = Math.max(1, (mobInstance.attackPoints || 5) - (hero.defensePoints || 0));
    const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

    // Update hero HP
    hero.healthPoints = newHeroHp;
    await axios.put(`${this.baseUrl}/heroes/${hero.id}`, hero);

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

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_LOST', { heroJson: 'all', mobId: mobInstance.id });
      }

      this.currentFight = null;
      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;
    this.currentFight = fight;
    return fight;
  }

  async defend(fightId: string): Promise<Fight> {
    if (!this.currentFight || this.currentFight.id !== fightId) {
      throw new Error('Fight not found');
    }

    const fight = this.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    if (fight.turn !== 'hero') {
      throw new Error('Not hero turn');
    }

    // Get hero from HeroService
    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`);
    const hero = heroResponse.data;

    // Get mob from game state
    const game = await this.gameService.findById('current');
    if (!game || !game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      throw new Error('Mob instance not found in game state');
    }

    // Add to combat log
    fight.actions = fight.actions || [];
    fight.actions.push({
      turn: fight.turnNumber || 1,
      actor: 'hero',
      action: 'defend',
      result: `${hero.name} takes a defensive stance!`
    });

    // Mob attacks but damage is reduced by 50%
    const mobDamage = Math.max(1, (mobInstance.attackPoints || 5) - (hero.defensePoints || 0));
    const reducedDamage = Math.floor(mobDamage / 2);
    const newHeroHp = Math.max(0, hero.healthPoints - reducedDamage);

    // Update hero HP
    hero.healthPoints = newHeroHp;
    await axios.put(`${this.baseUrl}/heroes/${hero.id}`, hero);

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
      this.currentFight = null;
      return fight;
    }

    fight.turnNumber = (fight.turnNumber || 1) + 1;
    this.currentFight = fight;
    return fight;
  }

  async flee(fightId: string): Promise<Fight> {
    if (!this.currentFight || this.currentFight.id !== fightId) {
      throw new Error('Fight not found');
    }

    const fight = this.currentFight;
    if (fight.status !== 'active') {
      throw new Error('Fight is not active');
    }

    // 60% chance to flee successfully
    const fleeRoll = Math.random();
    const heroResponse = await axios.get(`${this.baseUrl}/heroes/${fight.heroId}`);
    const hero = heroResponse.data;

    // Get mob from game state
    const game = await this.gameService.findById('current');
    if (!game || !game.mobs) {
      throw new Error('Game or mob data not found');
    }

    const mobInstance = game.mobs.find(m => m.id === fight.mobIds[0]);
    if (!mobInstance) {
      throw new Error('Mob instance not found in game state');
    }

    fight.actions = fight.actions || [];

    if (fleeRoll < 0.6) {
      // Successful flee
      fight.status = 'fled';
      fight.endTime = new Date().toISOString();
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'hero',
        action: 'flee',
        result: `${hero.name} successfully escaped from combat!`
      });

      // Clear fight from game state
      game.currentFightId = undefined;
      await this.gameService.save(game);
      await this.gameService.save({ ...game, id: 'current' });

      if (logPublisher) {
        await logPublisher.logGameEvent('FIGHT_FLED', { heroJson: 'all', mobId: mobInstance.id });
      }

      this.currentFight = null;
      return fight;
    } else {
      // Failed to flee, mob gets free attack
      fight.actions.push({
        turn: fight.turnNumber || 1,
        actor: 'hero',
        action: 'flee',
        result: `${hero.name} tried to flee but failed!`
      });

      const mobDamage = Math.max(1, (mobInstance.attackPoints || 5) - (hero.defensePoints || 0));
      const newHeroHp = Math.max(0, hero.healthPoints - mobDamage);

      hero.healthPoints = newHeroHp;
      await axios.put(`${this.baseUrl}/heroes/${hero.id}`, hero);

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
        this.currentFight = null;
        return fight;
      }

      fight.turnNumber = (fight.turnNumber || 1) + 1;
      this.currentFight = fight;
      return fight;
    }
  }

  async updateFight(updates: Partial<Fight>): Promise<Fight> {
    if (!this.currentFight) {
      throw new Error('No active fight');
    }
    this.currentFight = { ...this.currentFight, ...updates };
    return this.currentFight;
  }

  async deleteFight(): Promise<void> {
    this.currentFight = null;
  }
}