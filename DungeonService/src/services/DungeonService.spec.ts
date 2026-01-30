import { Dungeon } from "../domain/models/Dungeon";
import { DungeonService } from "./DungeonService";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { BadRequestError } from "../domain/errors/BadRequestError";
import { redisClient } from "../config/redis";

const mockedRedisClient = redisClient as jest.Mocked<typeof redisClient>;

describe('DungeonService', () => {

    let service: DungeonService;

    const dungeonsData: Dungeon[] = [
        { id: "1", name: "Dungeon One", rooms: [] },
        { id: "2", name: "Dungeon Two", rooms: [] }
    ];

    beforeEach(() => {
        service = new DungeonService();
        jest.clearAllMocks();
    });

    it('should list dungeons', async () => {
        // Given
        mockedRedisClient.sMembers.mockResolvedValue(['1', '2']);
        mockedRedisClient.get
            .mockResolvedValueOnce(JSON.stringify(dungeonsData[0]))
            .mockResolvedValueOnce(JSON.stringify(dungeonsData[1]));

        // When
        const dungeons = await service.list();

        // Then
        expect(dungeons).toEqual(dungeonsData);
        expect(mockedRedisClient.sMembers).toHaveBeenCalledWith('dungeons');
    });

    it('should list empty array when no dungeons exist', async () => {
        // Given
        mockedRedisClient.sMembers.mockResolvedValue([]);

        // When
        const dungeons = await service.list();

        // Then
        expect(dungeons).toEqual([]);
        expect(mockedRedisClient.sMembers).toHaveBeenCalledWith('dungeons');
    });

    it('should get dungeons by id', async () => {
        // Given
        mockedRedisClient.get.mockResolvedValueOnce(JSON.stringify(dungeonsData[0]));

        // When
        const dungeonOne = await service.getById('1');

        // Then
        expect(dungeonOne).toEqual(dungeonsData[0]);
        expect(mockedRedisClient.get).toHaveBeenCalledWith('dungeon:1');
    });

    it('should throw error when dungeon not found', async () => {
        // Given
        mockedRedisClient.get.mockResolvedValue(null);

        // When & Then
        await expect(service.getById('999')).rejects.toThrow('Dungeon with id 999 not found.');

        await expect(service.getById('999')).rejects.toThrow(NotFoundError);
    });

    it('should insert a new dungeon', async () => {
        // Given
        const name = "New Dungeon";
        const numberOfRooms = 2;

        // When
        const newDungeon = await service.insert(name, numberOfRooms);

        // Then
        expect(newDungeon.name).toEqual(name);
        expect(newDungeon.rooms.length).toEqual(numberOfRooms);
    });

    it('should throw when generating a dungeon with not enough rooms', async () => {
        // Given
        const name = "Invalid Dungeon";
        const numberOfRooms = -1;

        // When & Then
        await expect(service.insert(name, numberOfRooms)).rejects.toThrow('A dungeon must have at least one room.');

        await expect(service.insert(name, numberOfRooms)).rejects.toThrow(BadRequestError);
    });

    it('should throw when generating a dungeon with too many rooms', async () => {
        // Given
        const name = "Invalid Dungeon";
        const numberOfRooms = 10000;

        // When & Then
        await expect(service.insert(name, numberOfRooms)).rejects.toThrow('A dungeon cannot have more than 20 rooms.');

        await expect(service.insert(name, numberOfRooms)).rejects.toThrow(BadRequestError);
    });

    it('should generate dungeon with correct number of rooms', async () => {
        // Given
        const name = "Multi-Room Dungeon";
        const numberOfRooms = 5;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        expect(dungeon.name).toEqual(name);
        expect(dungeon.rooms.length).toEqual(numberOfRooms);
        expect(dungeon.id).toBeDefined();
        expect(dungeon.rooms.every(room => room.id)).toBeTruthy();
        expect(dungeon.rooms.every(room => room.dimension)).toBeTruthy();
        expect(dungeon.rooms.every(room => room.entrance)).toBeTruthy();
        expect(dungeon.rooms.every(room => room.exit)).toBeTruthy();
    });

    it('should generate rooms with sequential order', async () => {
        // Given
        const name = "Sequential Dungeon";
        const numberOfRooms = 3;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        expect(dungeon.rooms[0].order).toEqual(0);
        expect(dungeon.rooms[1].order).toEqual(1);
        expect(dungeon.rooms[2].order).toEqual(2);
    });

    it('should generate rooms with valid dimensions', async () => {
        // Given
        const name = "Valid Dimensions Dungeon";
        const numberOfRooms = 10;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        dungeon.rooms.forEach(room => {
            expect(room.dimension.width).toBeGreaterThanOrEqual(3);
            expect(room.dimension.height).toBeGreaterThanOrEqual(3);
            expect(room.dimension.width).toBeLessThanOrEqual(40);
            expect(room.dimension.height).toBeLessThanOrEqual(40);
        });
    });

    it('should generate entrance and exit within room bounds', async () => {
        // Given
        const name = "Valid Positions Dungeon";
        const numberOfRooms = 10;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        dungeon.rooms.forEach(room => {
            expect(room.entrance.x).toBeGreaterThanOrEqual(0);
            expect(room.entrance.y).toBeGreaterThanOrEqual(0);
            expect(room.entrance.x).toBeLessThan(room.dimension.width);
            expect(room.entrance.y).toBeLessThan(room.dimension.height);

            expect(room.exit.x).toBeGreaterThanOrEqual(0);
            expect(room.exit.y).toBeGreaterThanOrEqual(0);
            expect(room.exit.x).toBeLessThan(room.dimension.width);
            expect(room.exit.y).toBeLessThan(room.dimension.height);
        });
    });

    it('should generate entrance on room walls', async () => {
        // Given
        const name = "Wall Entrance Dungeon";
        const numberOfRooms = 15;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        dungeon.rooms.forEach(room => {
            const onWall =
                room.entrance.x === 0 || // Left wall
                room.entrance.x === room.dimension.width - 1 || // Right wall
                room.entrance.y === 0 || // Bottom wall
                room.entrance.y === room.dimension.height - 1; // Top wall
            expect(onWall).toBeTruthy();
        });
    });

    it('should generate exit on room walls', async () => {
        // Given
        const name = "Wall Exit Dungeon";
        const numberOfRooms = 15;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        dungeon.rooms.forEach(room => {
            const onWall =
                room.exit.x === 0 || // Left wall
                room.exit.x === room.dimension.width - 1 || // Right wall
                room.exit.y === 0 || // Bottom wall
                room.exit.y === room.dimension.height - 1; // Top wall
            expect(onWall).toBeTruthy();
        });
    });

    it('should store dungeon in redis with correct keys', async () => {
        // Given
        const name = "Redis Dungeon";
        const numberOfRooms = 2;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        expect(mockedRedisClient.sAdd).toHaveBeenCalledWith('dungeons', dungeon.id);
        expect(mockedRedisClient.set).toHaveBeenCalledWith(
            `dungeon:${dungeon.id}`,
            JSON.stringify(dungeon)
        );
    });

    it('should generate different room types across multiple rooms', async () => {
        // Given
        const name = "Varied Room Types";
        const numberOfRooms = 20;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        const uniqueDimensions = new Set(
            dungeon.rooms.map(room => `${room.dimension.width}x${room.dimension.height}`)
        );
        expect(uniqueDimensions.size).toBeGreaterThan(1);
    });

    it('should generate large dungeon successfully', async () => {
        // Given
        const name = "Maximum Dungeon";
        const numberOfRooms = 20;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        expect(dungeon.rooms.length).toEqual(20);
        expect(dungeon.rooms[0].order).toEqual(0);
        expect(dungeon.rooms[19].order).toEqual(19);
    });

    it('should accept boundary values for number of rooms', async () => {
        // Given & When
        const minDungeon = await service.insert("Min Dungeon", 1);
        const maxDungeon = await service.insert("Max Dungeon", 20);

        // Then
        expect(minDungeon.rooms.length).toEqual(1);
        expect(maxDungeon.rooms.length).toEqual(20);
    });

    it('should generate dungeon with CORRIDOR rooms having proper orientation', async () => {
        // Given
        const name = "Corridor Test";
        const numberOfRooms = 20;

        // When
        const dungeon = await service.insert(name, numberOfRooms);

        // Then
        dungeon.rooms.forEach(room => {
            if (room.dimension.height <= 5 && room.dimension.width >= 12) {
                expect(room.dimension.width).toBeGreaterThan(room.dimension.height);
            } else if (room.dimension.width <= 5 && room.dimension.height >= 12) {
                expect(room.dimension.height).toBeGreaterThan(room.dimension.width);
            }
        });
    });

    it('should handle edge case dungeons with various room counts', async () => {
        // Given & When & Then
        for (let i = 1; i <= 10; i++) {
            const dungeon = await service.insert(`Dungeon ${i}`, i);
            expect(dungeon.rooms.length).toEqual(i);
            expect(dungeon.rooms.every((room, idx) => room.order === idx)).toBeTruthy();
        }
    });
});