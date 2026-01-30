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
            or: 10
        },
        {
            id: '2',
            name: "Mega Knight",
            healthPoints: 400,
            healthPointsMax: 400,
            level: 1,
            attackPoints: 35,
            inventory: [],
            or: 60
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
                healthPointsMax: 80,
                level: 5,
                attackPoints: 20,
                or: 100
            };

            // When
            const result = await service.create(heroData);

            // Then
            expect(result).toEqual({
                id: 'test-uuid-123',
                name: "Wizard",
                healthPoints: 80,
                healthPointsMax: 80,
                level: 5,
                attackPoints: 20,
                inventory: [],
                or: 100
            });
            expect(mockRedisClient.set).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should get hero by id', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.getById('1');

            // Then
            expect(result).toEqual(heroesData[0]);
        });

        it('should throw NotFoundError when hero not found', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When/Then
            await expect(service.getById('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateHealthPoints', () => {
        it('should update hero health points', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.updateHealthPoints('1', 50);

            // Then
            expect(result.healthPoints).toBe(50);
            expect(mockRedisClient.set).toHaveBeenCalled();
        });

        it('should cap health points at healthPointsMax', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.updateHealthPoints('1', 150);

            // Then
            expect(result.healthPoints).toBe(100);
        });
    });

    describe('updateHealthPointsMax', () => {
        it('should update hero max health points', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.updateHealthPointsMax('1', 150);

            // Then
            expect(result.healthPointsMax).toBe(150);
            expect(mockRedisClient.set).toHaveBeenCalled();
        });
    });

    describe('updateLevel', () => {
        it('should update hero level', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.updateLevel('1', 10);

            // Then
            expect(result.level).toBe(10);
            expect(mockRedisClient.set).toHaveBeenCalled();
        });
    });

    describe('updateAttackPoints', () => {
        it('should update hero attack points', async () => {
            // Given
            mockRedisClient.get.mockResolvedValue(JSON.stringify(heroesData));

            // When
            const result = await service.updateAttackPoints('1', 25);

            // Then
            expect(result.attackPoints).toBe(25);
            expect(mockRedisClient.set).toHaveBeenCalled();
        });
    });

    describe('getInventory', () => {
        it('should get hero inventory', async () => {
            // Given
            const heroWithItems = {
                ...heroesData[0],
                inventory: [{ id: 1, quantity: 2 }]
            };
            mockRedisClient.get.mockResolvedValue(JSON.stringify([heroWithItems]));

            // When
            const result = await service.getInventory('1');

            // Then
            expect(result).toEqual([{ id: 1, quantity: 2 }]);
        });
    });
});