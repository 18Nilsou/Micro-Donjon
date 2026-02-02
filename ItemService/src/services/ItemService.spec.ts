import { Item } from "../domains/model/Item";
import { ItemService } from "./ItemService";
import { NotFoundError } from "../domains/errors/NotFoundError";

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-123')
}));


describe('ItemService', () => {
    let service: ItemService;

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

    beforeEach(() => {
        service = new ItemService();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new item', async () => {
            // Given
            const itemData: any = {
                name: "Wizard",
                effect: "Magic",
                value: 200,
                description: "A wizard staff",
                rarity: "Epic",
                itemType: "Weapon"
            };

            // When
            const result = await service.create(itemData);
            // Then
            expect(result).toEqual({
                uuid: 'test-uuid-123',
                ...itemData
            });
        });
    });

    describe('get', () => {
        it('should retrieve an item by uuid', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            const item = {
                uuid: '1',
                name: "Heroic Sword",
                effect: "Attack",
                value: 100,
                description: "A sword with heroic powers",
                rarity: "Legendary",
                item_type: "Weapon"
            };
            mockQuery.mockResolvedValue({ rows: [item] });

            // When
            const result = await service.get('1');

            // Then
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
            expect(result).toEqual({
                uuid: item.uuid,
                name: item.name,
                effect: item.effect,
                value: item.value,
                description: item.description,
                rarity: item.rarity,
                itemType: item.item_type
            });
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            mockQuery.mockResolvedValue({ rows: [] });

            // When/Then
            await expect(service.get('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('list', () => {
        it('should list all items', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            const items = [
                {
                    uuid: '1',
                    name: "Heroic Sword",
                    effect: "Attack",
                    value: 100,
                    description: "A sword with heroic powers",
                    rarity: "Legendary",
                    item_type: "Weapon"
                },
                {
                    uuid: '2',
                    name: "Healing Potion",
                    effect: "HealthPointMax",
                    value: 50,
                    description: "A potion that restores health",
                    rarity: "Common",
                    item_type: "Consumable"
                }
            ];
            mockQuery.mockResolvedValue({ rows: items });

            // When
            const result = await service.list();

            // Then
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String));
            expect(result).toEqual(items.map(item => ({
                uuid: item.uuid,
                name: item.name,
                effect: item.effect,
                value: item.value,
                description: item.description,
                rarity: item.rarity,
                itemType: item.item_type
            })));
        });
    });

    describe('create', () => {
        it('should create a new item', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            const itemData = {
                name: "Wizard Staff",
                effect: "Magic",
                value: 200,
                description: "A staff for wizards",
                rarity: "Epic",
                itemType: "Weapon"
            };
            const createdItem = {
                uuid: 'test-uuid-123',
                name: "Wizard Staff",
                effect: "Magic",
                value: 200,
                description: "A staff for wizards",
                rarity: "Epic",
                item_type: "Weapon"
            };
            mockQuery.mockResolvedValue({ rows: [createdItem] });

            // When
            const result = await service.create(itemData as Item);

            // Then
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
            expect(result).toEqual({
                uuid: 'test-uuid-123',
                name: "Wizard Staff",
                effect: "Magic",
                value: 200,
                description: "A staff for wizards",
                rarity: "Epic",
                itemType: "Weapon"
            });
        });
    });

    describe('update', () => {
        it('should update an existing item', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            const updatedItem = {
                uuid: '1',
                name: "Updated Sword",
                effect: "Attack",
                value: 120,
                description: "An updated sword",
                rarity: "Legendary",
                item_type: "Weapon",
                itemType: "Weapon"
            };
            mockQuery.mockResolvedValue({ rows: [updatedItem] });

            // When
            const result = await service.update('1', updatedItem as Item);

            // Then
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
            expect(result).toEqual({
                uuid: updatedItem.uuid,
                name: updatedItem.name,
                effect: updatedItem.effect,
                value: updatedItem.value,
                description: updatedItem.description,
                rarity: updatedItem.rarity,
                itemType: updatedItem.item_type
            });
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            mockQuery.mockResolvedValue({ rows: [] });

            // When/Then
            await expect(service.update('999', {} as Item)).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an item by uuid', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            mockQuery.mockResolvedValue({ rows: [{ uuid: '1' }] });

            // When
            const result = await service.delete('1');

            // Then
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
            expect(result).toBe(true);
        });

        it('should throw NotFoundError if item does not exist', async () => {
            // Given
            const mockQuery = jest.spyOn(service["pool"], 'query');
            mockQuery.mockResolvedValue({ rows: [] });

            // When/Then
            await expect(service.delete('999')).rejects.toThrow(NotFoundError);
        });
    });
});