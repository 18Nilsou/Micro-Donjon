import { NotFoundError } from "../domain/errors/NotFoundError";
import { Mob } from "../domain/models/Mob";
import { MobService } from "./MobService";

// Mock du logPublisher pour éviter les erreurs
jest.mock('../config/logPublisher', () => ({
    logPublisher: {
        logMobEvent: jest.fn().mockResolvedValue(undefined)
    }
}));

// Mock des données de mobs
const mobsData: Mob[] = [
    { name: "Lenny Spider", hp: 100, attack: 15, type: "Common" },
    { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
];

jest.mock('../../data/mobs_data.json', () => (mobsData), { virtual: true });

describe('MobService', () => {
    let service: MobService;

    beforeEach(() => {
        service = new MobService();
    });

    it('should list mobs', async () => {
        // When
        const mobs = await service.list();

        // Then
        expect(mobs).toEqual(mobsData);
    });

    it('should get mobs by type', async () => {
        // When
        const commonMobs = await service.getByType('Common');
        const bossMobs = await service.getByType('Boss');

        // Then
        expect(commonMobs).toEqual([
            { name: "Lenny Spider", hp: 100, attack: 15, type: 'Common' },
        ]);
        expect(bossMobs).toEqual([
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ]);
    });

    it('should throw when no mobs found for type', async () => {
        // When & Then
        await expect(service.getByType('Elite' as any)).rejects.toThrow(NotFoundError);
        await expect(service.getByType('Elite' as any)).rejects.toThrow('No mobs found of type: Elite');
    });
});