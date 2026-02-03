import { Hero } from "../domain/models/Hero";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { redisClient } from "../config/redis";
import { logPublisher } from "../config/logPublisher";
import { Class } from "../domain/models/Class";
import { CreateHeroRequest } from "../domain/models/CreateHeroRequest";

export class HeroService {

    private readonly HEROES_KEY = 'heroes';

    async list(): Promise<Hero[]> {
        const heroIds = await redisClient.sMembers(this.HEROES_KEY);
        const heroes: Hero[] = [];

        for (const id of heroIds) {
            const heroData = await this.getById(id);
            if (heroData) {
                heroes.push(heroData);
            }
        }

        if (logPublisher) {
            await logPublisher.logHeroEvent('HEROES_RETRIEVED', { heroJson: 'all' });
        }

        return heroes;
    }

    async listClasses(): Promise<Class[]> {
        const classes: Class[] = require('../../data/classes.json');

        if (logPublisher) {
            await logPublisher.logHeroEvent('CLASSES_RETRIEVED', { classesJson: 'all' });
        }

        return classes;
    }

    async create(heroData: CreateHeroRequest): Promise<Hero> {
        let hero: Hero = {
            id: uuidv4(),
            level: 1,
            inventory: [],
            healthPoints: heroData.class.healthPoints,
            healthPointsMax: heroData.class.healthPoints,
            attackPoints: heroData.class.attackPoints,
            name: heroData.name,
            class: heroData.class.name,
            gold: 0
        };

        await redisClient.sAdd(this.HEROES_KEY, hero.id);

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_CREATED', { heroId: hero.id });
        }

        return hero;
    }

    async getById(heroId: string): Promise<Hero> {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_RETRIEVED', { heroId: hero.id });
        }

        return hero;
    }

    async delete(heroId: string): Promise<void> {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        await redisClient.del(`${this.HEROES_KEY}${heroId}`);
        await redisClient.sRem(this.HEROES_KEY, heroId);

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_DELETED', { heroId });
        }
    }

    async updateHealthPoints(heroId: string, healthPoints: number): Promise<Hero> {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        const oldHealthPoints = hero.healthPoints;

        if (hero.healthPointsMax >= healthPoints) {
            hero.healthPoints = healthPoints;
        } else {
            hero.healthPoints = hero.healthPointsMax;
        }

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

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
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        const oldHealthPointsMax = hero.healthPointsMax;
        hero.healthPointsMax = healthPointsMax;

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

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
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        const oldLevel = hero.level;
        hero.level = level;

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

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
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        const oldAttackPoints = hero.attackPoints;
        hero.attackPoints = attackPoints;

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

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
    }>> {
        const hero = await this.getById(heroId);
        return hero.inventory;
    }

    async addItemToInventory(id: number, quantity: number, heroId: string) {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        const existingItem = hero.inventory.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            hero.inventory.push({ id, quantity });
        }

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('ITEM_ADDED_TO_INVENTORY', {
                heroId,
                itemId: id,
                quantity
            });
        }
    }
}
