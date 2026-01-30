import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'redis-hero';
const redisPort = process.env.REDIS_PORT || 6379;

export const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.disconnect();
    }
}