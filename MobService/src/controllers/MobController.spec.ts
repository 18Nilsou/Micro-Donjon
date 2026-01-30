import { MobController } from './MobController';
import { Mob } from '../domain/models/Mob';
import { MobService } from '../services/MobService';
import { NotFoundError } from '../domain/errors/NotFoundError';

describe('MobController', () => {
    let mockService: Partial<MobService>;
    let controller: MobController;
    let mockRes: any;

    beforeEach(() => {
        mockService = {
            list: jest.fn(),
            getByType: jest.fn(),
        };
        controller = new MobController(mockService as MobService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
    });

    it('should list mobs', async () => {
        // Given
        const sample: Mob[] = [
            { name: "Lenny Spider", hp: 100, attack: 15, type: "Common" },
            { name: "Dieg'Art", hp: 80, attack: 10, type: "Common" },
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ];
        (mockService.list as jest.Mock).mockResolvedValue(sample);  // mockResolvedValue au lieu de mockReturnValue

        const mockReq = {} as any;

        // When
        await controller.listAllMobs(mockReq, mockRes);

        // Then
        expect(mockService.list).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(sample);
    });

    it('should get mobs by type', async () => {
        // Given
        const sample: Mob[] = [
            { name: "Lenny Spider", hp: 100, attack: 15, type: "Common" },
            { name: "Dieg'Art", hp: 80, attack: 10, type: "Common" },
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ];
        (mockService.getByType as jest.Mock).mockResolvedValue(sample);  // mockResolvedValue

        const mockReq = { params: { type: "Common" } } as any;

        // When
        await controller.getMobsByType(mockReq, mockRes);

        // Then
        expect(mockService.getByType).toHaveBeenCalledWith("Common");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(sample);
    });

    it('should throw when no mobs found for type', async () => {
        // Given
        const error = new NotFoundError('No mobs found of type: Elite');
        (mockService.getByType as jest.Mock).mockRejectedValue(error);  // mockRejectedValue pour simuler un throw async
        const mockReq = { params: { type: "Elite" } } as any;

        // When & Then
        await expect(controller.getMobsByType(mockReq, mockRes)).rejects.toThrow(NotFoundError);
        expect(mockService.getByType).toHaveBeenCalledWith("Elite");
    });
});