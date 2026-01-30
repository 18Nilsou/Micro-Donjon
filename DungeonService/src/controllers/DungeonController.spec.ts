import { DungeonController } from './DungeonController';
import { DungeonService } from '../services/DungeonService';
import { Dungeon } from '../domain/models/Dungeon';
import { NotFoundError } from '../domain/errors/NotFoundError';
import { BadRequestError } from '../domain/errors/BadRequestError';

describe('DungeonController', () => {

    let mockService: Partial<DungeonService>;
    let controller: DungeonController;
    let mockRes: any;

    beforeEach(() => {
        mockService = {
            list: jest.fn(),
            getById: jest.fn(),
            insert: jest.fn()
        };
        controller = new DungeonController(mockService as DungeonService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
    });

    it('should list dungeons', async () => {
        // Given
        const sample: Dungeon[] = [
            { id: "1", name: "Dungeon One", rooms: [] },
            { id: "2", name: "Dungeon Two", rooms: [] }
        ];
        (mockService.list as jest.Mock).mockResolvedValue(sample);

        const mockReq = {} as any;

        // When
        await controller.listAllDungeons(mockReq, mockRes);

        // Then
        expect(mockService.list).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(sample);
    });

    it('should get dungeons by id', async () => {
        // Given
        const sample: Dungeon = { id: "1", name: "Dungeon One", rooms: [] };
        (mockService.getById as jest.Mock).mockResolvedValue(sample);

        const mockReq = { params: { id: "1" } } as any;

        // When
        await controller.getDungeonsById(mockReq, mockRes);

        // Then
        expect(mockService.getById).toHaveBeenCalledWith("1");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(sample);
    });

    it('should throw when the dungeon is not found', async () => {
        // Given
        const error = new NotFoundError('No dungeons found');
        (mockService.getById as jest.Mock).mockRejectedValue(error);
        const mockReq = { params: { id: "999" } } as any;

        // When & Then
        await expect(controller.getDungeonsById(mockReq, mockRes))
            .rejects.toThrow(NotFoundError);

        await expect(controller.getDungeonsById(mockReq, mockRes))
            .rejects.toThrow('No dungeons found');

        expect(mockService.getById).toHaveBeenCalledWith("999");
    });

    it('should create a dungeon', async () => {
        // Given
        const sample: Dungeon = { id: "1", name: "New Dungeon", rooms: [] };
        (mockService.insert as jest.Mock).mockResolvedValue(sample);

        const mockReq = { body: { name: "New Dungeon", numberOfRooms: 1 } } as any;

        // When
        await controller.createDungeon(mockReq, mockRes);

        // Then
        expect(mockService.insert).toHaveBeenCalledWith("New Dungeon", 1);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith(sample);
    });

    it('should throw when creating a dungeon with no rooms', async () => {
        // Given
        const error = new BadRequestError('Number of rooms error');
        (mockService.insert as jest.Mock).mockRejectedValue(error);
        const mockReq = { body: { name: "New Dungeon", numberOfRooms: -1 } } as any;

        // When & Then
        await expect(controller.createDungeon(mockReq, mockRes))
            .rejects.toThrow(BadRequestError);

        await expect(controller.createDungeon(mockReq, mockRes))
            .rejects.toThrow('Number of rooms error');

        expect(mockService.insert).toHaveBeenCalledWith("New Dungeon", -1);
    });

    it('should throw when creating a dungeon with too many rooms', async () => {
        // Given
        const error = new BadRequestError('Number of rooms error');
        (mockService.insert as jest.Mock).mockRejectedValue(error);
        const mockReq = { body: { name: "New Dungeon", numberOfRooms: 10000000 } } as any;

        // When & Then
        await expect(controller.createDungeon(mockReq, mockRes))
            .rejects.toThrow(BadRequestError);

        await expect(controller.createDungeon(mockReq, mockRes))
            .rejects.toThrow('Number of rooms error');

        expect(mockService.insert).toHaveBeenCalledWith("New Dungeon", 10000000);
    });
});