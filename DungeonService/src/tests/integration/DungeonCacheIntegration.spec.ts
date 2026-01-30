import { DungeonService } from "../../services/DungeonService";
import { redisClient, connectRedis, disconnectRedis } from "../../config/redis";

jest.unmock('../../config/redis');

describe('DungeonService', () => {

    let service: DungeonService;
    const TEST_DUNGEONS_KEY = 'test_dungeons';
    const TEST_DUNGEON_PREFIX = 'test_dungeon:';

    beforeAll(async () => {
        process.env.DUNGEONS_KEY = TEST_DUNGEONS_KEY;
        process.env.DUNGEON_PREFIX = TEST_DUNGEON_PREFIX;

        process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
        process.env.REDIS_PORT = process.env.REDIS_PORT || '6381';

        await connectRedis();
    }, 30000);

    beforeEach(async () => {
        service = new DungeonService();
    });

    afterEach(async () => {
        const dungeonIds = await redisClient.sMembers(TEST_DUNGEONS_KEY);
        for (const id of dungeonIds) {
            await redisClient.del(`${TEST_DUNGEON_PREFIX}${id}`);
        }
        await redisClient.del(TEST_DUNGEONS_KEY);
    }, 30000);

    afterAll(async () => {
        delete process.env.DUNGEONS_KEY;
        delete process.env.DUNGEON_PREFIX;

        await disconnectRedis();
    }, 30000);

    it('should successfully insert dungeons in the cache and get the list', async () => {
        // Given & When
        await service.insert("Test Dungeon 1", 5);
        await service.insert("Test Dungeon 2", 10);

        const dungeons = await service.list();

        // Then
        expect(dungeons.length).toEqual(2);
    });

    it('should return empty array when cache has no dungeons', async () => {
        // When
        const dungeons = await service.list();

        // Then
        expect(dungeons).toEqual([]);
        expect(dungeons.length).toEqual(0);
    });
});