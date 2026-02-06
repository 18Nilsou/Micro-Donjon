import { Hero } from "../domain/models/Hero";
import { HeroService } from "./HeroService";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { redisClient } from "../config/redis";
import { RediSearchSchema } from "redis";

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-123')
}));

const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>

describe('HeroService', () => {
    let service: HeroService;

    const heroesData: Hero[] = [
        {
            id: '1',
            name: "Knight",
            healthPoints: 100,
            healthPointsMax: 100,
            level: 1,
            attackPoints: 15,
            inventory: [],
            class: "Warrior",
            gold: 10,
            userId: 'user-1'
        },
        {
            id: '2',
            name: "Mega Knight",
            healthPoints: 400,
            healthPointsMax: 400,
            level: 1,
            attackPoints: 35,
            inventory: [],
            class: "Paladin",
            gold: 60,
            userId: 'user-1'
        }
    ];

    beforeEach(() => {
        service = new HeroService();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new hero', async () => {
            // Given
            const heroData: any = {
                name: "Wizard",
                class: { name: "Mage", healthPoints: 80, attackPoints: 20 },
                gold: 100,
                userId: 'user-1'
            };

            // When
            const result = await service.create(heroData);

            // Then
            expect(result).toEqual({
                id: 'test-uuid-123',
                name: "Wizard",
                healthPoints: 80,
                healthPointsMax: 80,
                level: 1,
                attackPoints: 20,
                inventory: [],
                gold: 0,
                userId: 'user-1',
                class: "Mage"
            });
            expect(mockRedisClient.set).toHaveBeenCalled();
        });
    });

});