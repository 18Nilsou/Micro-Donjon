import { Item } from "../domains/model/Item";
import { ItemService } from "./ItemService";
import { NotFoundError } from "../domains/errors/NotFoundError";
import * as fs from "fs/promises";
import * as path from "path";

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-123')
}));

jest.mock("fs/promises");

describe('ItemService', () => {
    let service: ItemService;
    const mockFs = fs as jest.Mocked<typeof fs>;

    const itemsData: Item[] = [
        {
            uuid: '1',
            name: "Heroic Sword",
            effect: "Attack",
            value: 100,
            description: "A sword with heroic powers",
            rarity: "Legendary",
            itemType: "Weapon"
        },
        {
            uuid: '2',
            name: "Healing Potion",
            effect: "HealthPointMax",
            value: 50,
            description: "A potion that restores health",
            rarity: "Common",
            itemType: "Consumable"
        }
    ];

    const itemsDataJson = itemsData.map(item => ({
        uuid: item.uuid,
        name: item.name,
        effect: item.effect,
        value: item.value,
        description: item.description,
        rarity: item.rarity,
        item_type: item.itemType,
    }));

    beforeEach(() => {
        service = new ItemService();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new item', async () => {
            // Given
            const itemData: any = {
                name: "Wizard Staff",
                effect: "Magic",
                value: 200,
                description: "A wizard staff",
                rarity: "Epic",
                itemType: "Weapon"
            };

            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));
            mockFs.writeFile.mockResolvedValue();

            // When
            const result = await service.create(itemData);

            // Then
            expect(result).toEqual({
                uuid: 'test-uuid-123',
                name: "Wizard Staff",
                effect: "Magic",
                value: 200,
                description: "A wizard staff",
                rarity: "Epic",
                itemType: "Weapon"
            });
            expect(mockFs.writeFile).toHaveBeenCalled();
        });
    });

    describe('get', () => {
        it('should retrieve an item by uuid', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When
            const result = await service.get('1');

            // Then
            expect(result).toEqual(itemsData[0]);
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When/Then
            await expect(service.get('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('list', () => {
        it('should list all items', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When
            const result = await service.list();

            // Then
            expect(result).toEqual(itemsData);
        });
    });

    describe('getRandom', () => {
        it('should return a random item', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When
            const result = await service.getRandom();

            // Then
            expect(itemsData).toContainEqual(result);
        });

        it('should throw NotFoundError if no items found', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify([]));

            // When/Then
            await expect(service.getRandom()).rejects.toThrow(NotFoundError);
        });
    });

    describe('update', () => {
        it('should update an existing item', async () => {
            // Given
            const updatedItemData = {
                name: "Updated Sword",
                effect: "Attack",
                value: 120,
                description: "An updated sword",
                rarity: "Legendary",
                itemType: "Weapon"
            };
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));
            mockFs.writeFile.mockResolvedValue();

            // When
            const result = await service.update('1', updatedItemData as Item);

            // Then
            expect(result).toEqual({
                uuid: '1',
                ...updatedItemData
            });
            expect(mockFs.writeFile).toHaveBeenCalled();
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When/Then
            await expect(service.update('999', {} as Item)).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an item by uuid', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));
            mockFs.writeFile.mockResolvedValue();

            // When
            const result = await service.delete('1');

            // Then
            expect(result).toBe(true);
            expect(mockFs.writeFile).toHaveBeenCalled();
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            mockFs.readFile.mockResolvedValue(JSON.stringify(itemsDataJson));

            // When/Then
            await expect(service.delete('999')).rejects.toThrow(NotFoundError);
        });
    });
});