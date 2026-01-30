import { Hero } from "../domain/models/Hero";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { redisClient } from "../config/redis";
import { logPublisher } from "../config/logPublisher";

export class HeroService {
    
    private readonly HEROES_KEY = 'heroes';

    async list(): Promise<Hero[]> {
        const heroesData = require('../../data/hero_data.json');

        if (logPublisher) {
            await logPublisher.logHeroEvent('HEROES_RETRIEVED', { heroId: 'all' });
        }
        return Promise.resolve(heroesData);
    }

   async create(heroData: Hero): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }

        let hero = {
            ...heroData,
            id: uuidv4(),
            level: 1,
        };

        hero.inventory = [];
        hero.healthPoints = hero.healthPointsMax;

        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        
        heroes.push(hero);
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_CREATED', { heroId: hero.id, name: hero.name });
        }
        
        return hero;
    }

    async getById(heroId: string): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        if (logPublisher) {
            console.log('sdfghjk')
            await logPublisher.logHeroEvent('HERO_RETRIEVED', { heroId: hero.id });
        }
        
        return hero;
    }

    async updateHealthPoints(heroId: string, healthPoints: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        const oldHealthPoints = hero.healthPoints;
        
        if (hero.healthPointsMax >= healthPoints){
            hero.healthPoints = healthPoints;
        } else {
            hero.healthPoints = hero.healthPointsMax;
        }
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('HEALTH_POINTS_UPDATED', { 
                heroId, 
                oldHealthPoints, 
                newHealthPoints: hero.healthPoints 
            });
        }
        
        return hero;
    }

    async updateHealthPointsMax(heroId: string, healthPointsMax: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        const oldHealthPointsMax = hero.healthPointsMax;
        hero.healthPointsMax = healthPointsMax;
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('MAX_HEALTH_POINTS_UPDATED', { 
                heroId, 
                oldHealthPointsMax, 
                newHealthPointsMax: healthPointsMax 
            });
        }
        
        return hero;
    }

    async updateLevel(heroId: string, level: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        const oldLevel = hero.level;
        hero.level = level;
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('LEVEL_UPDATED', { 
                heroId, 
                oldLevel, 
                newLevel: level 
            });
        }
        
        return hero;
    }

    async updateAttackPoints(heroId: string, attackPoints: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        const oldAttackPoints = hero.attackPoints;
        hero.attackPoints = attackPoints;
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('ATTACK_POINTS_UPDATED', { 
                heroId, 
                oldAttackPoints, 
                newAttackPoints: attackPoints 
            });
        }
        
        return hero;
    }
    
    async getInventory(heroId: string): Promise<Array<{
                                                id: number;
                                                quantity: number;
                                            }>> 
    {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        let hero = await this.getById(heroId);
        return hero.inventory;
    }

    async addItemToInventory(id: number, quantity: number, heroId: string){
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        
        const heroesStr = await redisClient.get(this.HEROES_KEY);
        const heroes: Hero[] = heroesStr ? JSON.parse(heroesStr) : [];
        const hero = heroes.find(h => h.id === heroId);
        
        if (!hero) {
            throw new NotFoundError(`Hero with id ${heroId} not found in Redis`);
        }
        
        hero.inventory.push({id, quantity});
        
        await redisClient.set(this.HEROES_KEY, JSON.stringify(heroes));
        
        if (logPublisher) {
            await logPublisher.logHeroEvent('ITEM_ADDED_TO_INVENTORY', { 
                heroId, 
                itemId: id, 
                quantity 
            });
        }
    }
}
