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
            { id: 1, name: "Lenny Spider", healthPoints: 100, healthPointsMax: 100, attackPoints: 15, type: "Common" },
            { id: 2, name: "Dieg'Art", healthPoints: 80, healthPointsMax: 80, attackPoints: 10, type: "Common" },
            { id: 3, name: "Lacaca, Eater of Pizza", healthPoints: 2000, healthPointsMax: 2000, attackPoints: 50, type: "Boss" }
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
            { id: 1, name: "Lenny Spider", healthPoints: 100, healthPointsMax: 100, attackPoints: 15, type: "Common" },
            { id: 2, name: "Dieg'Art", healthPoints: 80, healthPointsMax: 80, attackPoints: 10, type: "Common" },
            { id: 3, name: "Lacaca, Eater of Pizza", healthPoints: 2000, healthPointsMax: 2000, attackPoints: 50, type: "Boss" }
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