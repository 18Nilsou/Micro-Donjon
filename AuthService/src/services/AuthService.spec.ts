import { AuthService } from "./AuthService";
import { BadRequestError } from '../domain/errors/BadRequestError';
import { ConflictError } from '../domain/errors/ConflictError';
import { UnauthorizedError } from '../domain/errors/UnauthorizedError';
import { NotFoundError } from "../domain/errors/NotFoundError";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../config/database';

describe('AuthService', () => {
    let service: AuthService;
    let poolMock: any;

    beforeEach(() => {
        // Mock pool and logPublisher
        poolMock = {
            execute: jest.fn()
        };
        jest.spyOn(db, 'getPool').mockReturnValue(poolMock);
        (global as any).logPublisher = { logAuthEvent: jest.fn(), logError: jest.fn() };
        service = new AuthService();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('registers a user successfully', async () => {
        poolMock.execute
            .mockResolvedValueOnce([[]]) 
            .mockResolvedValueOnce([null])
            .mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]);
        (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hash');
        (service as any).generateToken = jest.fn().mockReturnValue('token');
        const data = { username: 'bob', email: 'bob@mail.com', password: '123456' };
        const result = await service.register(data);
        expect(result.user.username).toBe('bob');
        expect(result.token).toBe('token');
    });

    it('throws error if registration fields missing', async () => {
        await expect(service.register({ username: '', email: '', password: '' })).rejects.toThrow(BadRequestError);
    });

    it('throws error if password too short', async () => {
        await expect(service.register({ username: 'bob', email: 'bob@mail.com', password: '123' })).rejects.toThrow(BadRequestError);
    });

    it('throws error if user already exists', async () => {
        poolMock.execute.mockResolvedValueOnce([[{ id: '1' }]]);
        await expect(service.register({ username: 'bob', email: 'bob@mail.com', password: '123456' })).rejects.toThrow(ConflictError);
    });

    it('logs in a user successfully', async () => {
        poolMock.execute.mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]);
        (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
        (service as any).generateToken = jest.fn().mockReturnValue('token');
        const data = { email: 'bob@mail.com', password: '123456' };
        const result = await service.login(data);
        expect(result.user.email).toBe('bob@mail.com');
        expect(result.token).toBe('token');
    });

    it('throws error if login fields missing', async () => {
        await expect(service.login({ email: '', password: '' })).rejects.toThrow(BadRequestError);
    });

    it('throws error if user not found on login', async () => {
        poolMock.execute.mockResolvedValueOnce([[]]);
        await expect(service.login({ email: 'bob@mail.com', password: '123456' })).rejects.toThrow(UnauthorizedError);
    });

    it('throws error if password invalid', async () => {
        poolMock.execute.mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]);
        (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);
        await expect(service.login({ email: 'bob@mail.com', password: 'wrong' })).rejects.toThrow(UnauthorizedError);
    });

    it('verifies token and returns user', async () => {
        (jwt.verify as jest.Mock) = jest.fn().mockReturnValue({ userId: '1' });
        poolMock.execute.mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]);
        const user = await service.verifyToken('token');
        expect(user.username).toBe('bob');
    });

    it('throws error if token invalid', async () => {
        (jwt.verify as jest.Mock) = jest.fn(() => { throw new Error('bad'); });
        await expect(service.verifyToken('token')).rejects.toThrow(UnauthorizedError);
    });

    it('getUserById returns user', async () => {
        poolMock.execute.mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]);
        const user = await service.getUserById('1');
        expect(user.username).toBe('bob');
    });

    it('getUserById throws if not found', async () => {
        poolMock.execute.mockResolvedValueOnce([[]]);
        await expect(service.getUserById('1')).rejects.toThrow(NotFoundError);
    });

    it('linkHeroToUser updates and returns user', async () => {
        poolMock.execute
            .mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]) // user exists
            .mockResolvedValueOnce([null]) // update
            .mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: 'hero1', created_at: new Date(), updated_at: new Date() }]]); // updated user
        const user = await service.linkHeroToUser('1', 'hero1');
        expect(user.hero_id).toBe('hero1');
    });

    it('linkHeroToUser throws if user not found', async () => {
        poolMock.execute.mockResolvedValueOnce([[]]);
        await expect(service.linkHeroToUser('1', 'hero1')).rejects.toThrow(NotFoundError);
    });

    it('unlinkHeroFromUser updates and returns user', async () => {
        poolMock.execute
            .mockResolvedValueOnce([null]) 
            .mockResolvedValueOnce([[{ id: '1', username: 'bob', email: 'bob@mail.com', password_hash: 'hash', hero_id: null, created_at: new Date(), updated_at: new Date() }]]); // user
        const user = await service.unlinkHeroFromUser('1');
        expect(user.hero_id).toBe(null);
    });

    it('unlinkHeroFromUser throws if user not found', async () => {
        poolMock.execute
            .mockResolvedValueOnce([null])
            .mockResolvedValueOnce([[]]);
        await expect(service.unlinkHeroFromUser('1')).rejects.toThrow(NotFoundError);
    });
});