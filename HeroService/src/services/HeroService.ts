import { Hero } from "../domain/models/Hero";
import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { redisClient } from "../config/redis";

export class HeroService {
    
    private readonly HEROES_KEY = 'heroes';
    private heroesJson: Hero[] = [];

    list(): Promise<Hero[]> {
        if (this.heroesJson.length === 0) {
            const heroesData = require('../../data/hero_data.json');
            this.heroesJson = heroesData;
        }
        return Promise.resolve(this.heroesJson);
    }

   async create(heroData: Hero): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }

        let hero = {
            ...heroData,
            id: uuidv4()
        };

        hero.inventory = [];
        hero.healthPoints = hero.healthPointsMax;

        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
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
        return hero;
    }

    async updateHealthPoints(heroId: string, healthPoints: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        let hero = await this.getById(heroId);
        if (hero.healthPointsMax >= healthPoints){
            hero.healthPoints = healthPoints;
        } else {
            hero.healthPoints = hero.healthPointsMax;
        }
        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
        return hero;
    }

    async updateHealthPointsMax(heroId: string, healthPointsMax: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        let hero = await this.getById(heroId);
        hero.healthPointsMax = healthPointsMax;
        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
        return hero;
    }

    async updateLevel(heroId: string, level: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        let hero = await this.getById(heroId);
        hero.level = level;
        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
        return hero;
    }

    async updateAttackPoints(heroId: string, attackPoints: number): Promise<Hero> {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        let hero = await this.getById(heroId);
        hero.attackPoints = attackPoints;
        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
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
        let hero = await this.getById(heroId);
        hero.inventory.push({id, quantity});
        await redisClient.set(this.HEROES_KEY, JSON.stringify(hero));
    }
}
