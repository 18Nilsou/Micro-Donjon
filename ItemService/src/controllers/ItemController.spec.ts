import { ItemController } from './ItemController';
import { Item } from '../domain/model/Item';
import { ItemService } from '../services/ItemService';
import { NotFoundError } from '../domain/errors/NotFoundError';

describe('ItemController', () => {

    let mockService: Partial<ItemService>;
    let controller: ItemController;
    let mockRes: any;

    beforeEach(() => {
        mockService = {
            list: jest.fn(),
            getById: jest.fn(),
            getRandom: jest.fn(),
        };
        controller = new ItemController(mockService as ItemService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
    });

    it('should list all items', async () => {
        // Given
        const sample: Item[] = [
            {
                id: 1,
                name: "Sword of Testing",
                effect: "Attack",
                value: 50,
                description: "A sword used for unit tests",
                rarity: "Epic",
                itemType: "Weapon"
            },
            {
                id: 2,
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

        // When
        await controller.listAllItems(mockReq, mockRes);

        // Then
        expect(mockService.list).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(sample);
    });

    it('should get an item by id', async () => {
        // Given
        const itemId = 1;
        const item: Item = {
            id: 1,
            name: "Sword of Testing",
            effect: "Attack",
            value: 50,
            description: "A sword used for unit tests",
            rarity: "Epic",
            itemType: "Weapon"
        };

        (mockService.getById as jest.Mock).mockResolvedValue(item);

        const mockReq = { params: { id: itemId } } as any;

        // When
        await controller.getItemById(mockReq, mockRes);

        // Then
        expect(mockService.getById).toHaveBeenCalledWith(itemId);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(item);
    });

    it('should throw when no item found', async () => {
        // Given
        const itemId = 999;
        const error = new NotFoundError('Item not found');
        (mockService.getById as jest.Mock).mockRejectedValue(error);
        const mockReq = { params: { id: itemId } } as any;

        // When & Then
        await expect(controller.getItemById(mockReq, mockRes)).rejects.toThrow(NotFoundError);
        expect(mockService.getById).toHaveBeenCalledWith(itemId);
    });

    it('should return a random item', async () => {
        // Given
        const item: Item = {
            id: 1,
            name: "Sword of Testing",
            effect: "Attack",
            value: 50,
            description: "A sword used for unit tests",
            rarity: "Epic",
            itemType: "Weapon"
        };
        (mockService.getRandom as jest.Mock).mockResolvedValue(item);

        const mockReq = {} as any;

        // When
        await controller.getRandomItem(mockReq, mockRes);

        // Then
        expect(mockService.getRandom).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(item);
    });

    it('should throw when no items found for random', async () => {
        // Given
        const error = new NotFoundError('No items found');
        (mockService.getRandom as jest.Mock).mockRejectedValue(error);
        const mockReq = {} as any;

        // When & Then
        await expect(controller.getRandomItem(mockReq, mockRes)).rejects.toThrow(NotFoundError);
        expect(mockService.getRandom).toHaveBeenCalledTimes(1);
    });
});