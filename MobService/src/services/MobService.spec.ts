import { Mob } from "../domain/models/Mob";
import { MobService } from "./MobService";

describe('MobService', () => {
    let service: MobService;

    const mobsData: Mob[] = [
        { name: "Lenny Spider", hp: 100, attack: 15, type: 'Common' },
        { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
    ];

    jest.mock('../../data/mobs_data.json', () => (mobsData), { virtual: true });

    beforeEach(() => {
        service = new MobService();
    });

    it('should list mobs', () => {
        // When
        const mobs = service.list();

        // Then
        expect(mobs).toEqual(mobsData);
    });

    it('should get mobs by type', () => {
        // When
        const commonMobs = service.getByType('Common');
        const bossMobs = service.getByType('Boss');

        // Then
        expect(commonMobs).toEqual([
            { name: "Lenny Spider", hp: 100, attack: 15, type: 'Common' },
        ]);
        expect(bossMobs).toEqual([
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ]);
    });

    it('should return empty array if no mobs of given type', () => {
        // Given
        service.mobs = [
            { name: "Lenny Spider", hp: 100, attack: 15, type: 'Common' }
        ];

        // When
        const commonMobs = service.getByType('Boss');

        // Then
        expect(commonMobs).toEqual([]);
    });
});