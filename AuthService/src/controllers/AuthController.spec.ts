// ...
import { AuthService } from '../services/AuthService';
import { AuthController } from './AuthController';

describe('AuthController', () => {

    let mockService: Partial<AuthService>;
    let controller: AuthController;
    let mockRes: any;

    beforeEach(() => {
        mockService = {
            register: jest.fn(),
            login: jest.fn(),
            getUserById: jest.fn(),
            linkHeroToUser: jest.fn(),
            unlinkHeroFromUser: jest.fn(),
            verifyToken: jest.fn(),
        };
        controller = new AuthController(mockService as AuthService);
        const json = jest.fn().mockReturnThis();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json,
            send: json,
        };
    });

    it('create user', async () => {
        const req = { body: { username: 'bob', email: 'bob@mail.com', password: '123456' } } as any;
        const result = { user: { id: '1', username: 'bob', email: 'bob@mail.com' }, token: 'token' };
        (mockService.register as jest.Mock).mockResolvedValue(result);
        await controller.register(req, mockRes, jest.fn());
        expect(mockService.register).toHaveBeenCalledWith(req.body);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(result);
    });

    it('create user with this email or username already exists', async () => {
        const req = { body: { username: 'bob', email: 'bob@mail.com', password: '123456' } } as any;
        const error = new Error('User with this email or username already exists');
        (mockService.register as jest.Mock).mockRejectedValue(error);
        const next = jest.fn();
        await controller.register(req, mockRes, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it('login user', async () => {
        const req = { body: { email: 'bob@mail.com', password: '123456' } } as any;
        const result = { user: { id: '1', username: 'bob', email: 'bob@mail.com' }, token: 'token' };
        (mockService.login as jest.Mock).mockResolvedValue(result);
        await controller.login(req, mockRes, jest.fn());
        expect(mockService.login).toHaveBeenCalledWith(req.body);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(result);
    });

    it('login user bad credential', async () => {
        const req = { body: { email: 'bob@mail.com', password: 'wrong' } } as any;
        const error = new Error('Invalid email or password');
        (mockService.login as jest.Mock).mockRejectedValue(error);
        const next = jest.fn();
        await controller.login(req, mockRes, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it('get user', async () => {
        const req = { headers: { authorization: 'Bearer token' } } as any;
        const user = { id: '1', username: 'bob', email: 'bob@mail.com' };
        (mockService.verifyToken as jest.Mock).mockResolvedValue(user);
        await controller.getMe(req, mockRes, jest.fn());
        expect(mockService.verifyToken).toHaveBeenCalledWith('token');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(user);
    });

    it('get user user not found', async () => {
        const req = { headers: { authorization: 'Bearer token' } } as any;
        const error = new Error('User not found');
        (mockService.verifyToken as jest.Mock).mockRejectedValue(error);
        const next = jest.fn();
        await controller.getMe(req, mockRes, next);
        expect(next).toHaveBeenCalledWith(error);
    });
});