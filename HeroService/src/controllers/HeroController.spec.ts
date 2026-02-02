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
            list: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
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

    describe('listAllHeroes', () => {
        it('should list all heroes', async () => {
            // Given
            const sample: Hero[] = [
                {
                    id: '1',
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
            (mockService.list as jest.Mock).mockResolvedValue(sample);

            const mockReq = {} as any;

            // When
            await controller.listAllHeroes(mockReq, mockRes);

            // Then
            expect(mockService.list).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(sample);
        });
    });

    describe('createHero', () => {
        it('should create a new hero', async () => {
            // Given
            const heroData = {
                name: "Legolas",
                healthPointsMax: 90,
                level: 8,
                attackPoints: 28,
                or: 800
            };

            const createdHero: Hero = {
                id: '3',
                name: "Legolas",
                healthPoints: 90,
                healthPointsMax: 90,
                level: 8,
                attackPoints: 28,
                inventory: [],
                class: "Archer",
                gold: 800
            };

            (mockService.create as jest.Mock).mockResolvedValue(createdHero);

            const mockReq = { body: heroData } as any;

            // When
            await controller.createHero(mockReq, mockRes);

            // Then
            expect(mockService.create).toHaveBeenCalledWith(heroData);
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

            const mockReq = { params: { id: heroId } } as any;

            // When
            await controller.getHeroById(mockReq, mockRes);

            // Then
            expect(mockService.getById).toHaveBeenCalledWith(heroId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(hero);
        });

        it('should return 404 when hero is not found', async () => {
            // Given
            const heroId = '999';
            (mockService.getById as jest.Mock).mockRejectedValue(new NotFoundError('Hero not found'));

            const mockReq = { params: { id: heroId } } as any;

            // When
            await controller.getHeroById(mockReq, mockRes);

            // Then
            expect(mockService.getById).toHaveBeenCalledWith(heroId);
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
        it('should update hero health points', async () => {
            // Given
            const heroId = '1';
            const healthPoints = 75;
            const updatedHero: Hero = {
                id: '1',
                name: "Aragorn",
                healthPoints: 75,
                healthPointsMax: 100,
                level: 10,
                attackPoints: 25,
                inventory: [],
                class: "Warrior",
                gold: 1000
            };

            (mockService.updateHealthPoints as jest.Mock).mockResolvedValue(updatedHero);

            const mockReq = { params: { id: heroId }, body: { healthPoints } } as any;

            // When
            await controller.updateHeroHealthPoints(mockReq, mockRes);

            // Then
            expect(mockService.updateHealthPoints).toHaveBeenCalledWith(heroId, healthPoints);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(updatedHero);
        });

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

            const mockReq = { params: { id: heroId }, body: { healthPointsMax } } as any;

            // When
            await controller.updateHeroHealthPointsMax(mockReq, mockRes);

            // Then
            expect(mockService.updateHealthPointsMax).toHaveBeenCalledWith(heroId, healthPointsMax);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(updatedHero);
        });
    });

    describe('updateHeroLevel', () => {
        it('should update hero level', async () => {
            // Given
            const heroId = '1';
            const level = 15;
            const updatedHero: Hero = {
                id: '1',
                name: "Aragorn",
                healthPoints: 100,
                healthPointsMax: 100,
                level: 15,
                attackPoints: 25,
                inventory: [],
                class: "Warrior",
                gold: 1000
            };

            (mockService.updateLevel as jest.Mock).mockResolvedValue(updatedHero);

            const mockReq = { params: { id: heroId }, body: { level } } as any;

            // When
            await controller.updateHeroLevel(mockReq, mockRes);

            // Then
            expect(mockService.updateLevel).toHaveBeenCalledWith(heroId, level);
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

            const mockReq = { params: { id: heroId }, body: { attackPoints } } as any;

            // When
            await controller.updateHeroAttackPoints(mockReq, mockRes);

            // Then
            expect(mockService.updateAttackPoints).toHaveBeenCalledWith(heroId, attackPoints);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(updatedHero);
        });
    });

    describe('addHeroItem', () => {
        it('should add an item to hero inventory', async () => {
            // Given
            const heroId = '1';
            const itemData = { id: 101, quantity: 2 };
            const updatedHero: Hero = {
                id: '1',
                name: "Aragorn",
                healthPoints: 100,
                healthPointsMax: 100,
                level: 10,
                attackPoints: 25,
                inventory: [{ id: 101, quantity: 2 }],
                class: "Warrior",
                gold: 1000
            };

            (mockService.addItemToInventory as jest.Mock).mockResolvedValue(undefined);
            (mockService.getById as jest.Mock).mockResolvedValue(updatedHero);

            const mockReq = { params: { id: heroId }, body: itemData } as any;

            // When
            await controller.addHeroItem(mockReq, mockRes);

            // Then
            expect(mockService.addItemToInventory).toHaveBeenCalledWith(itemData.id, itemData.quantity, heroId);
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

            const mockReq = { params: { id: heroId } } as any;

            // When
            await controller.getHeroInventory(mockReq, mockRes);

            // Then
            expect(mockService.getInventory).toHaveBeenCalledWith(heroId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith(inventory);
        });

        it('should return 404 when hero is not found', async () => {
            // Given
            const heroId = '999';
            (mockService.getInventory as jest.Mock).mockRejectedValue(new NotFoundError('Hero not found'));

            const mockReq = { params: { id: heroId } } as any;

            // When
            await controller.getHeroInventory(mockReq, mockRes);

            // Then
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.send).toHaveBeenCalledWith({ error: 'Hero not found' });
        });
    });
});