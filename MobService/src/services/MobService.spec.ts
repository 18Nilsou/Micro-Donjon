import { Mob } from "../domain/models/Mob";
import { MobService } from "./MobService";
import { NotFoundError } from "../domain/errors/NotFoundError";

jest.mock('../config/logPublisher', () => ({
    logPublisher: {
        logMobEvent: jest.fn().mockResolvedValue(undefined),
        logError: jest.fn().mockResolvedValue(undefined)
    }
}));

const mobsData: Mob[] = [
    {
        id: 1,
        name: "Lenny Spider",
        healthPoints: 100,
        healthPointsMax: 100,
        attackPoints: 15,
        type: "Common"
    },
    {
        id: 2,
        name: "Lacaca, Eater of Pizza",
        healthPoints: 2000,
        healthPointsMax: 2000,
        attackPoints: 50,
        type: "Boss"
    }
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
            { id: 1, name: "Lenny Spider", healthPoints: 100, healthPointsMax: 100, attackPoints: 15, type: 'Common' },
        ]);
        expect(bossMobs).toEqual([
            { id: 2, name: "Lacaca, Eater of Pizza", healthPoints: 2000, healthPointsMax: 2000, attackPoints: 50, type: "Boss" }
        ]);
    });

    it('should throw when no mobs found for type', async () => {
        // When & Then
        await expect(service.getByType('Elite' as any)).rejects.toThrow(NotFoundError);
        await expect(service.getByType('Elite' as any)).rejects.toThrow('No mobs found of type: Elite');
    });

    it('should retrieve a mob by id', async () => {
        // When
        const result = await service.getById(1);

        // Then
        expect(result).toEqual(mobsData[0]);
    });

    it('should throw when no mob found', async () => {
        // When & Then
        await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
});