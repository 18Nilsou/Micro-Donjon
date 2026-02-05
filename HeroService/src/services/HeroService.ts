import { Hero } from "../domain/models/Hero";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { ForbiddenError } from "../domain/errors/ForbiddenError";
import { redisClient } from "../config/redis";
import { logPublisher } from "../config/logPublisher";
import { Class } from "../domain/models/Class";
import { CreateHeroRequest } from "../domain/models/CreateHeroRequest";
import axios from "axios";

type ItemEffect = 'Attack' | 'Heal' | 'HealthPointMax';
type ItemType = 'Weapon' | 'Consumable' | 'Armor';

interface ItemDetails {
    id: number;
    name: string;
    effect: ItemEffect;
    value: number;
    itemType: ItemType;
}

export class HeroService {

    private readonly HEROES_KEY = 'heroes';
    private readonly USER_HEROES_KEY_PREFIX = 'user_heroes:';
    private readonly ITEM_SERVICE_URL = process.env.ITEM_SERVICE_URL || 'http://localhost:3004';

    private async getItemById(itemId: number): Promise<ItemDetails> {
        const response = await axios.get(`${this.ITEM_SERVICE_URL}/items/${itemId}`);
        return response.data as ItemDetails;
    }

    private applyItemEffect(hero: Hero, item: ItemDetails, quantity: number) {
        const totalValue = item.value * quantity;
        switch (item.effect) {
            case 'Attack':
                hero.attackPoints += totalValue;
                break;
            case 'Heal':
                hero.healthPoints = Math.min(hero.healthPointsMax, hero.healthPoints + totalValue);
                break;
            case 'HealthPointMax':
                hero.healthPointsMax += totalValue;
                hero.healthPoints = Math.min(hero.healthPointsMax, hero.healthPoints + totalValue);
                break;
            default:
                break;
        }
    }

    async listByUserId(userId: string): Promise<Hero[]> {
        const heroIds = await redisClient.sMembers(`${this.USER_HEROES_KEY_PREFIX}${userId}`);
        const heroes: Hero[] = [];

        for (const id of heroIds) {
            try {
                const heroData = await this.getById(id, userId);
                if (heroData) {
                    heroes.push(heroData);
                }
            } catch (error) {
                // Skip heroes that can't be retrieved
                if (logPublisher) {
                    await logPublisher.logError(error, { userId, heroId: id });
                }
                console.error(`Error retrieving hero ${id}:`, error);
            }
        }

        if (logPublisher) {
            await logPublisher.logHeroEvent('HEROES_RETRIEVED', { userId, count: heroes.length });
        }

        return heroes;
    }

    async list(): Promise<Hero[]> {
        const heroIds = await redisClient.sMembers(this.HEROES_KEY);
        const heroes: Hero[] = [];

        for (const id of heroIds) {
            const heroData = await redisClient.get(`${this.HEROES_KEY}${id}`);
            if (heroData) {
                const hero = JSON.parse(heroData) as Hero;
                heroes.push(hero);
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
            userId: heroData.userId,
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
        await redisClient.sAdd(`${this.USER_HEROES_KEY_PREFIX}${hero.userId}`, hero.id);

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_CREATED', { heroId: hero.id, userId: hero.userId });
        }

        return hero;
    }

    async getById(heroId: string, requestingUserId?: string): Promise<Hero> {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_GET_BY_ID`, { heroId });
            }
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        // Verify ownership if requestingUserId is provided
        if (requestingUserId && hero.userId !== requestingUserId) {
            throw new ForbiddenError(`Access denied: You don't own this hero.`);
        }

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_RETRIEVED', { heroId: hero.id });
        }

        return hero;
    }

    async delete(heroId: string): Promise<void> {
        const heroData = await this.getById(heroId);

        if (!heroData) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_DELETE`, { heroId });
            }
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = heroData;

        await redisClient.del(`${this.HEROES_KEY}${heroId}`);
        await redisClient.sRem(this.HEROES_KEY, heroId);
        await redisClient.sRem(`${this.USER_HEROES_KEY_PREFIX}${hero.userId}`, heroId);

        if (logPublisher) {
            await logPublisher.logHeroEvent('HERO_DELETED', { heroId });
        }
    }

    private async getAndVerifyOwnership(heroId: string, requestingUserId: string): Promise<Hero> {
        const heroData = await redisClient.get(`${this.HEROES_KEY}${heroId}`);

        if (!heroData) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_GET_AND_VERIFY_OWNERSHIP`, { heroId, requestingUserId });
            }
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = JSON.parse(heroData) as Hero;

        if (hero.userId !== requestingUserId) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_OWNERSHIP_VERIFICATION_FAILED`, { heroId, requestingUserId });
            }
            throw new ForbiddenError(`Access denied: You don't own this hero.`);
        }

        return hero;
    }

    async updateHealthPoints(heroId: string, healthPoints: number): Promise<Hero> {
        const heroData = await this.getById(heroId);

        if (!heroData) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_UPDATE_HEALTH_POINTS`, { heroId });
            }
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = heroData;

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

    async updateHealthPointsMax(heroId: string, healthPointsMax: number, requestingUserId: string): Promise<Hero> {
        const hero = await this.getAndVerifyOwnership(heroId, requestingUserId);

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

    async updateLevel(heroId: string): Promise<Hero> {
        const heroData = await this.getById(heroId);

        if (!heroData) {
            if (logPublisher) {
                await logPublisher.logError(`HERO_UPDATE_LEVEL`, { heroId });
            }
            throw new NotFoundError(`Hero with id ${heroId} not found.`);
        }

        const hero = heroData;

        const oldLevel = hero.level;
        hero.level = oldLevel + 1;

        const oldAttackPoints = hero.attackPoints;
        hero.attackPoints = oldAttackPoints + 10;

        const oldHealthPointsMax = hero.healthPointsMax;
        hero.healthPointsMax = oldHealthPointsMax + 20;

        const oldHealthPoints = hero.healthPoints;
        hero.healthPoints = oldHealthPoints + 20;

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('LEVEL_UPDATED', {
                heroId,
                oldLevel,
                newLevel: hero.level
            });
        }

        return hero;
    }

    async updateAttackPoints(heroId: string, attackPoints: number, requestingUserId: string): Promise<Hero> {
        const hero = await this.getAndVerifyOwnership(heroId, requestingUserId);

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
                newAttackPoints: hero.attackPoints
            });
        }

        return hero;
    }

    async getInventory(heroId: string, requestingUserId: string): Promise<Array<{
        id: number;
        quantity: number;
    }>> {
        const hero = await this.getById(heroId, requestingUserId);
        return hero.inventory;
    }

    async addItemToInventory(id: number, quantity: number, heroId: string, requestingUserId: string) {
        const hero = await this.getAndVerifyOwnership(heroId, requestingUserId);

        const item = await this.getItemById(id);

        const existingItem = hero.inventory.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            hero.inventory.push({ id, quantity });
        }

        if (item.itemType !== 'Consumable') {
            this.applyItemEffect(hero, item, quantity);
        }

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('ITEM_ADDED_TO_INVENTORY', {
                heroId,
                itemId: id,
                quantity,
                itemType: item.itemType,
                effect: item.effect,
                value: item.value
            });
        }
    }

    async consumeItemFromInventory(itemId: number, heroId: string, requestingUserId: string): Promise<Hero> {
        const hero = await this.getAndVerifyOwnership(heroId, requestingUserId);

        const inventoryItem = hero.inventory.find(item => item.id === itemId);
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            if (logPublisher) {
                await logPublisher.logError(`ITEM_CONSUME_FAILED`, { heroId, itemId, reason: 'Item not found in inventory' });
            }
            throw new NotFoundError(`Item with id ${itemId} not found in inventory.`);
        }

        const item = await this.getItemById(itemId);
        if (item.itemType !== 'Consumable') {
            if (logPublisher) {
                await logPublisher.logError(`ITEM_CONSUME_FAILED`, { heroId, itemId, reason: 'Item is not consumable' });
            }
            throw new ForbiddenError('Only consumable items can be consumed.');
        }

        this.applyItemEffect(hero, item, 1);

        inventoryItem.quantity -= 1;
        if (inventoryItem.quantity <= 0) {
            hero.inventory = hero.inventory.filter(item => item.id !== itemId);
        }

        await redisClient.set(
            `${this.HEROES_KEY}${hero.id}`,
            JSON.stringify(hero)
        );

        if (logPublisher) {
            await logPublisher.logHeroEvent('ITEM_CONSUMED', {
                heroId,
                itemId,
                effect: item.effect,
                value: item.value
            });
        }

        return hero;
    }
}
