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

    it('should list mobs', () => {
        // Given
        const sample: Mob[] = [
            { name: "Lenny Spider", hp: 100, attack: 15, type: "Common" },
            { name: "Dieg'Art", hp: 80, attack: 10, type: "Common" },
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ];
        (mockService.list as jest.Mock).mockReturnValue(sample);

        const mockReq = {} as any;

        // When
        controller.listAllMobs(mockReq, mockRes);

        // Then
        expect(mockService.list).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(sample);
    });

    it('should get mobs by type', () => {
        // Given
        const sample: Mob[] = [
            { name: "Lenny Spider", hp: 100, attack: 15, type: "Common" },
            { name: "Dieg'Art", hp: 80, attack: 10, type: "Common" },
            { name: "Lacaca, Eater of Pizza", hp: 2000, attack: 50, type: "Boss" }
        ];
        (mockService.getByType as jest.Mock).mockReturnValue(sample);

        const mockReq = { params: { type: "Common" } } as any;

        // When
        controller.getMobsByType(mockReq, mockRes);

        // Then
        expect(mockService.getByType).toHaveBeenCalledWith("Common");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(sample);
    });

    it('should throw when no mobs found for type', () => {
        // Given
        const error = new NotFoundError('No mobs found of type: Elite');
        (mockService.getByType as jest.Mock).mockImplementation(() => { throw error; });
        const mockReq = { params: { type: "Elite" } } as any;

        // When & Then
        expect(() => controller.getMobsByType(mockReq, mockRes)).toThrow(NotFoundError);
        expect(mockService.getByType).toHaveBeenCalledWith("Elite");
    });
});