import { ItemController } from './ItemController';
import { Item } from '../domains/model/Item';
import { ItemService } from '../services/ItemService';
import { NotFoundError } from '../domains/errors/NotFoundError';

describe('ItemController', () => {
    
    let mockService: Partial<ItemService>;
    let controller: ItemController;
    let mockRes: any;
    let mockNext: any;
    
    beforeEach(() => {
        mockService = {
            list: jest.fn(),
            create: jest.fn(),
            get: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        controller = new ItemController(mockService as ItemService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
        mockNext = () => {};
    });

    describe('listAllItems', () => {
        it('should list all items', async () => {
            // Given
            const sample: Item[] = [
                { 
                    uuid: '1',
                    name: "Sword of Testing",
                    effect: "Attack",
                    value: 50,
                    description: "A sword used for unit tests",
                    rarity: "Epic",
                    itemType: "Weapon"
                },
                { 
                    uuid: '2',
                    name: "Shield of Mocking",
                    effect: "HealthPointMax",
                    value: 30,
                    description: "A shield used for mocking data",
                    rarity: "Rare",
                    itemType: "Armor"
                }
            ];
            (mockService.list as jest.Mock).mockResolvedValue(sample);

            const mockReq = {} as any;
            const mockNext = () => {};

            // When
            await controller.listAllItems(mockReq, mockRes, mockNext);

            // Then
            expect(mockService.list).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(sample);
        });
    });

    describe('createItem', () => {
        it('should create a new item', async () => {
            // Given
            const itemData = {
                name: "Bow of Jest",
                effect: "Attack",
                value: 40,
                description: "A bow used for Jest testing",
                rarity: "Legendary",
                itemType: "Weapon"
            };

            const createdItem: Item = {
                uuid: '3',
                name: "Bow of Jest",
                effect: "Attack",
                value: 40,
                description: "A bow used for Jest testing",
                rarity: "Legendary",
                itemType: "Weapon"
            };
            (mockService.create as jest.Mock).mockResolvedValue(createdItem);

            const mockReq = { body: itemData } as any;

            // When
            await controller.createItem(mockReq, mockRes, mockNext);

            // Then
            expect(mockService.create).toHaveBeenCalledWith(itemData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.send).toHaveBeenCalledWith(createdItem);
        });
    });

    describe('getItemById', () => {
        it('should get an item by id', async () => {
            // Given
            const itemId = '1';
            const item: Item = {
                uuid: '1',
                name: "Sword of Testing",
                effect: "Attack",
                value: 50,
                description: "A sword used for unit tests",
                rarity: "Epic",
                itemType: "Weapon"
            };

            (mockService.get as jest.Mock).mockResolvedValue(item);

            const mockReq = { params: { uuid: itemId } } as any;

            // When
            await controller.get(mockReq, mockRes, mockNext);

            // Then
            expect(mockService.get).toHaveBeenCalledWith(itemId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(item);
        });
    });

    describe('updateItem', () => {
        it('should update an item', async () => {
            // Given
            const itemId = '1';
            const updatedItem: Item = {
                uuid: '1',
                name: "Sword of Testing",
                effect: "Attack",
                value: 60,
                description: "A sword used for unit tests",
                rarity: "Epic",
                itemType: "Weapon"
            };

            (mockService.update as jest.Mock).mockResolvedValue(updatedItem);

            const mockReq = { params: { uuid: itemId }, body: updatedItem } as any;

            // When
            await controller.updateItem(mockReq, mockRes, mockNext);

            // Then
            expect(mockService.update).toHaveBeenCalledWith(itemId, updatedItem);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(updatedItem);
        });

        it('should return 404 when item is not found', async () => {
            // Given
            const itemId = '999';
            const itemData = { name: "Ghost Item" } as Item;
            (mockService.update as jest.Mock).mockRejectedValue(new NotFoundError('Item not found'));

            const mockReq = { params: { uuid: itemId }, body: itemData } as any;
            const mockNext = jest.fn();

            // When
            await controller.updateItem(mockReq, mockRes, mockNext);

            // Then
            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });
});