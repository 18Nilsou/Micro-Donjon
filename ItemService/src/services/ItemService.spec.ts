import { Item } from "../domain/model/Item";
import { ItemService } from "./ItemService";
import { NotFoundError } from "../domain/errors/NotFoundError";

jest.mock('../config/logPublisher', () => ({
    logPublisher: {
        logItemEvent: jest.fn().mockResolvedValue(undefined),
        logItemTypeEvent: jest.fn().mockResolvedValue(undefined),
        logError: jest.fn().mockResolvedValue(undefined)
    }
}));

const itemsData: Item[] = [
    {
        id: 1,
        name: "Heroic Sword",
        effect: "Attack",
        value: 100,
        description: "A sword with heroic powers",
        rarity: "Legendary",
        itemType: "Weapon"
    },
    {
        id: 2,
        name: "Healing Potion",
        effect: "HealthPointMax",
        value: 50,
        description: "A potion that restores health",
        rarity: "Common",
        itemType: "Consumable"
    }
];

jest.mock('../../data/items_data.json', () => (itemsData), { virtual: true });

describe('ItemService', () => {
    let service: ItemService;

    beforeEach(() => {
        service = new ItemService();
    });

    it('should list items', async () => {
        // When
        const items = await service.list();

        // Then
        expect(items).toEqual(itemsData);
    });

    it('should retrieve an item by id', async () => {
        // When
        const result = await service.getById(1);

        // Then
        expect(result).toEqual(itemsData[0]);
    });

    it('should throw when no item found', async () => {
        // When & Then
        await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });

    it('should return a random item', async () => {
        // When
        const result = await service.getRandom();

        // Then
        expect(itemsData).toContainEqual(result);
    });
});