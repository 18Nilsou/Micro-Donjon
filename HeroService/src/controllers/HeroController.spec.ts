import { HeroController } from './HeroController';
import { Hero } from '../domain/models/Hero';
import { HeroService } from '../services/HeroService';
import { NotFoundError } from '../domain/errors/NotFoundError';

describe('HeroController', () => {
    let mockService: Partial<HeroService>;
    let controller: HeroController;
    let mockRes: any;

    beforeEach(() => {
        mockService = {
            listByUserId: jest.fn(),
            listClasses: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
            delete: jest.fn(),
            updateHealthPoints: jest.fn(),
            updateHealthPointsMax: jest.fn(),
            updateLevel: jest.fn(),
            updateAttackPoints: jest.fn(),
            addItemToInventory: jest.fn(),
            getInventory: jest.fn(),
        };
        controller = new HeroController(mockService as HeroService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
    });

    describe('listUserHeroes', () => {
        it('should list all heroes for a user', async () => {
            // Given
            const sample: Hero[] = [
                {
                    id: '1',
                    userId: 'user-1',
                    name: "Aragorn",
                    healthPoints: 100,
                    healthPointsMax: 100,
                    level: 10,
                    attackPoints: 25,
                    inventory: [],
                    class: "Warrior",
                    gold: 1000
                },
                {
                    id: '2',
                    userId: 'user-1',
                    name: "Gandalf",
                    healthPoints: 80,
                    healthPointsMax: 80,
                    level: 15,
                    attackPoints: 30,
                    inventory: [],
                    class: "Mage",
                    gold: 2000
                }
            ];
            (mockService.listByUserId as jest.Mock).mockResolvedValue(sample);

            const mockReq = { 
                params: { userId: 'user-1' },
                headers: { 'x-user-id': 'user-1' }
            } as any;

            // When
            await controller.listUserHeroes(mockReq, mockRes);

            // Then
            expect(mockService.listByUserId).toHaveBeenCalledWith('user-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(sample);
        });
    });

    describe('createHero', () => {
        it('should create a new hero', async () => {
            // Given
            const heroData = {
                name: "Legolas",
                class: { name: "Archer", healthPoints: 90, attackPoints: 28 }
            };

            const createdHero: Hero = {
                id: '3',
                userId: 'user-1',
                name: "Legolas",
                healthPoints: 90,
                healthPointsMax: 90,
                level: 1,
                attackPoints: 28,
                inventory: [],
                class: "Archer",
                gold: 0
            };

            (mockService.create as jest.Mock).mockResolvedValue(createdHero);

            const mockReq = { 
                body: heroData,
                headers: { 'x-user-id': 'user-1' }
            } as any;

            // When
            await controller.createHero(mockReq, mockRes);

            // Then
            expect(mockService.create).toHaveBeenCalledWith({
                ...heroData,
                userId: 'user-1'
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.send).toHaveBeenCalledWith(createdHero);
        });
    });

    describe('getHeroById', () => {
        it('should get a hero by id', async () => {
            // Given
            const heroId = '1';
            const hero: Hero = {
                id: '1',
                userId: 'user-1',
                name: "Aragorn",
                healthPoints: 100,
                healthPointsMax: 100,
                level: 10,
                attackPoints: 25,
                inventory: [],
                class: "Warrior",
                gold: 1000
            };

            (mockService.getById as jest.Mock).mockResolvedValue(hero);

            const mockReq = { 
                params: { id: heroId },
                headers: { 'x-user-id': 'user-1' }
            } as any;

            // When
            await controller.getHeroById(mockReq, mockRes);

            // Then
            expect(mockService.getById).toHaveBeenCalledWith(heroId, 'user-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(hero);
        });

        it('should return 404 when hero is not found', async () => {
            // Given
            const heroId = '999';
            (mockService.getById as jest.Mock).mockRejectedValue(new NotFoundError('Hero not found'));

            const mockReq = { params: { id: heroId }, headers: { 'x-user-id': 'user-1' } } as any;

            // When
            await controller.getHeroById(mockReq, mockRes);

            // Then
            expect(mockService.getById).toHaveBeenCalledWith(heroId, 'user-1');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.send).toHaveBeenCalledWith({ error: 'Hero not found' });
        });

        it('should return 500 on internal server error', async () => {
            // Given
            const heroId = '1';
            (mockService.getById as jest.Mock).mockRejectedValue(new Error('Database error'));

            const mockReq = { params: { id: heroId } } as any;

            // When
            await controller.getHeroById(mockReq, mockRes);

            // Then
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('updateHeroHealthPoints', () => {

        it('should return 404 when hero is not found', async () => {
            // Given
            const heroId = '999';
            const healthPoints = 75;
            (mockService.updateHealthPoints as jest.Mock).mockRejectedValue(new NotFoundError('Hero not found'));

            const mockReq = { params: { id: heroId }, body: { healthPoints } } as any;

            // When
            await controller.updateHeroHealthPoints(mockReq, mockRes);

            // Then
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.send).toHaveBeenCalledWith({ error: 'Hero not found' });
        });
    });

    describe('updateHeroHealthPointsMax', () => {
        it('should update hero max health points', async () => {
            // Given
            const heroId = '1';
            const healthPointsMax = 120;
            const updatedHero: Hero = {
                id: '1',
                userId: 'user-1',
                name: "Aragorn",
                healthPoints: 100,
                healthPointsMax: 120,
                level: 10,
                attackPoints: 25,
                inventory: [],
                class: "Warrior",
                gold: 1000
            };

            (mockService.updateHealthPointsMax as jest.Mock).mockResolvedValue(updatedHero);

            const mockReq = { 
                params: { id: heroId }, 
                body: { healthPointsMax },
                headers: { 'x-user-id': 'user-1' }
            } as any;

            // When
            await controller.updateHeroHealthPointsMax(mockReq, mockRes);

            // Then
            expect(mockService.updateHealthPointsMax).toHaveBeenCalledWith(heroId, healthPointsMax, 'user-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(updatedHero);
        });
    });

    describe('updateHeroAttackPoints', () => {
        it('should update hero attack points', async () => {
            // Given
            const heroId = '1';
            const attackPoints = 35;
            const updatedHero: Hero = {
                id: '1',
                userId: 'user-1',
                name: "Aragorn",
                healthPoints: 100,
                healthPointsMax: 100,
                level: 10,
                attackPoints: 35,
                inventory: [],
                class: "Warrior",
                gold: 1000
            };

            (mockService.updateAttackPoints as jest.Mock).mockResolvedValue(updatedHero);

            const mockReq = { 
                params: { id: heroId }, 
                body: { attackPoints },
                headers: { 'x-user-id': 'user-1' }
            } as any;

            // When
            await controller.updateHeroAttackPoints(mockReq, mockRes);

            // Then
            expect(mockService.updateAttackPoints).toHaveBeenCalledWith(heroId, attackPoints, 'user-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(updatedHero);
        });
    });

    describe('getHeroInventory', () => {
        it('should get hero inventory', async () => {
            // Given
            const heroId = '1';
            const inventory = [
                { id: 101, quantity: 2 },
                { id: 102, quantity: 1 }
            ];

            (mockService.getInventory as jest.Mock).mockResolvedValue(inventory);

            const mockReq = { params: { id: heroId }, headers: { 'x-user-id': 'user-1' } } as any;

            // When
            await controller.getHeroInventory(mockReq, mockRes);

            // Then
            expect(mockService.getInventory).toHaveBeenCalledWith(heroId, 'user-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(inventory);
        });

        it('should return 404 when hero is not found', async () => {
            // Given
            const heroId = '999';
            (mockService.getInventory as jest.Mock).mockRejectedValue(new NotFoundError('Hero not found'));

            const mockReq = { params: { id: heroId }, headers: { 'x-user-id': 'user-1' } } as any;

            // When
            await controller.getHeroInventory(mockReq, mockRes);

            // Then
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.send).toHaveBeenCalledWith({ error: 'Hero not found' });
        });
    });
});