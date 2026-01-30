import { HeroService } from "../../services/HeroService";
import { Hero } from "../../domain/models/Hero";

describe('HeroService - In Memory Integration', () => {
    let service: HeroService;

    beforeEach(() => {
        service = new HeroService();
    });

    it('should list heroes from JSON data', async () => {
        // When
        const heroes = await service.list();

        // Then
        expect(heroes).toBeDefined();
        expect(Array.isArray(heroes)).toBe(true);
        expect(heroes.length).toBeGreaterThan(0);
        
        // Verify structure of first hero
        const firstHero = heroes[0];
        expect(firstHero).toHaveProperty('name');
        expect(firstHero).toHaveProperty('healthPointsMax');
        expect(firstHero).toHaveProperty('level');
        expect(firstHero).toHaveProperty('attackPoints');
        expect(firstHero).toHaveProperty('or');
    });

    it('should have correct hero data from hero_data.json', async () => {
        // When
        const heroes = await service.list();

        // Then
        const knightHero = heroes.find((h: Hero) => h.name === 'Knight');
        expect(knightHero).toBeDefined();
        if (knightHero) {
            expect(knightHero.healthPointsMax).toBe(100);
            expect(knightHero.level).toBe(1);
            expect(knightHero.attackPoints).toBe(15);
            expect(knightHero.or).toBe(10);
        }

        const megaKnightHero = heroes.find((h: Hero) => h.name === 'Mega Knight');
        expect(megaKnightHero).toBeDefined();
        if (megaKnightHero) {
            expect(megaKnightHero.healthPointsMax).toBe(400);
            expect(megaKnightHero.level).toBe(1);
            expect(megaKnightHero.attackPoints).toBe(35);
            expect(megaKnightHero.or).toBe(60);
        }
    });

    it('should verify all heroes have required properties', async () => {
        // When
        const heroes = await service.list();

        // Then
        heroes.forEach((hero: Hero) => {
            expect(hero.name).toBeDefined();
            expect(typeof hero.healthPointsMax).toBe('number');
            expect(typeof hero.level).toBe('number');
            expect(typeof hero.attackPoints).toBe('number');
            expect(typeof hero.or).toBe('number');
            expect(hero.healthPointsMax).toBeGreaterThan(0);
            expect(hero.level).toBeGreaterThanOrEqual(1);
            expect(hero.attackPoints).toBeGreaterThan(0);
        });
    });
});