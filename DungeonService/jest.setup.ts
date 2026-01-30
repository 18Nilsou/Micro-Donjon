jest.mock('./src/config/redis', () => ({
    redisClient: {
        sMembers: jest.fn().mockResolvedValue([]),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        sAdd: jest.fn().mockResolvedValue(1),
        sRem: jest.fn().mockResolvedValue(1),
        del: jest.fn().mockResolvedValue(1),
        isOpen: false,
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
    },
    connectRedis: jest.fn().mockResolvedValue(undefined),
    disconnectRedis: jest.fn().mockResolvedValue(undefined),
}));
