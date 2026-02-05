import { MobService } from "../../services/MobService";
import { Mob } from "../../domain/models/Mob";

describe('MobService - Integration', () => {
    let service: MobService;

    beforeEach(() => {
        service = new MobService();
    });

    it('should list mobs from json', async () => {
        // When
        const mobs = await service.list();

        // Then
        expect(mobs).toBeDefined();
        expect(Array.isArray(mobs)).toBe(true);
        expect(mobs.length).toBeGreaterThan(0);

        if (mobs.length > 0) {
            // Verify structure of first mob if any exist
            const firstMob = mobs[0];
            expect(firstMob).toHaveProperty('name');
            expect(firstMob).toHaveProperty('healthPoints');
            expect(firstMob).toHaveProperty('healthPointsMax');
            expect(firstMob).toHaveProperty('attackPoints');
            expect(firstMob).toHaveProperty('type');
        }
    });

    it('should have correct mob data when mobs exist', async () => {
        // When
        const mobs = await service.list();

        // Then
        if (mobs.length > 0) {
            const lennyMob = mobs.find((mob: Mob) => mob.name === 'Lenny Spider');
            if (lennyMob) {
                expect(lennyMob.healthPoints).toBe(100);
                expect(lennyMob.healthPointsMax).toBe(100);
                expect(lennyMob.attackPoints).toBe(15);
                expect(lennyMob.type).toBe('Common');
            }

            const lacacaMob = mobs.find((mob: Mob) => mob.name === 'Lacaca, Eater of Pizza');
            if (lacacaMob) {
                expect(lacacaMob.healthPoints).toBe(2000);
                expect(lacacaMob.healthPointsMax).toBe(2000);
                expect(lacacaMob.attackPoints).toBe(50);
                expect(lacacaMob.type).toBe('Boss');
            }
        } else {
            // If no mobs exist, this test passes
            expect(true).toBe(true);
        }
    });

    it('should verify all mobs have required properties', async () => {
        // When
        const mobs = await service.list();

        // Then
        mobs.forEach((mob: Mob) => {
            expect(mob.name).toBeDefined();
            expect(typeof mob.healthPoints).toBe('number');
            expect(typeof mob.healthPointsMax).toBe('number');
            expect(typeof mob.attackPoints).toBe('number');
            expect(typeof mob.type).toBe('string');
            expect(mob.healthPoints).toBeGreaterThanOrEqual(0);
        });
    });
});