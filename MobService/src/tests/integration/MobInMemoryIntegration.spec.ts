import { MobService } from "../../services/MobService";

describe('MobService', () => {
    let service: MobService;

    let mobsData = require('../../../data/mobs_data.json');

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
            { name: "Dieg'Art", hp: 80, attack: 10, type: 'Common' },
            { name: "Orc", hp: 150, attack: 25, type: 'Common' },
        ]);
        expect(bossMobs).toEqual([
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ]);
    });
});