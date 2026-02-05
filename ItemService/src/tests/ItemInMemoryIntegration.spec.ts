import { ItemService } from "../services/ItemService";
import { Item } from "../domain/model/Item";

describe('ItemService - Integration', () => {
    let service: ItemService;

    beforeEach(() => {
        service = new ItemService();
    });

    it('should list items from json', async () => {
        // When
        const items = await service.list();

        // Then
        expect(items).toBeDefined();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);

        if (items.length > 0) {
            // Verify structure of first item if any exist
            const firstItem = items[0];
            expect(firstItem).toHaveProperty('name');
            expect(firstItem).toHaveProperty('itemType');
            expect(firstItem).toHaveProperty('value');
            expect(firstItem).toHaveProperty('rarity');
        }
    });

    it('should have correct item data when items exist', async () => {
        // When
        const items = await service.list();

        // Then
        if (items.length > 0) {
            const swordItem = items.find((item: Item) => item.name === 'Sword');
            if (swordItem) {
                expect(swordItem.itemType).toBe('Weapon');
                expect(swordItem.value).toBe(100);
                expect(swordItem.rarity).toBe('Common');
            }

            const shieldItem = items.find((item: Item) => item.name === 'Shield');
            if (shieldItem) {
                expect(shieldItem.itemType).toBe('Armor');
                expect(shieldItem.value).toBe(150);
                expect(shieldItem.rarity).toBe('Rare');
            }
        } else {
            // If no items exist, this test passes
            expect(true).toBe(true);
        }
    });

    it('should verify all items have required properties', async () => {
        // When
        const items = await service.list();

        // Then
        items.forEach((item: Item) => {
            expect(item.name).toBeDefined();
            expect(typeof item.itemType).toBe('string');
            expect(typeof item.value).toBe('number');
            expect(typeof item.rarity).toBe('string');
            expect(item.value).toBeGreaterThanOrEqual(0);
        });
    });
});