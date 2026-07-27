import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

import { CircuitBreaker } from '../utils/circuit-breaker.js';

let redis: Redis | null = null;

const redisBreaker = new CircuitBreaker('redis', {
    failureThreshold: 3,
    resetTimeoutMs: 15_000,
});

export function getRedisClient(): Redis {
    if (!redis) {
        redis = new Redis(env.REDIS_URL, {
            password: env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    logger.error('❌ Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 200, 1000);
            },
            lazyConnect: true,
        });

        redis.on('connect', () => {
            logger.info('✅ Redis connected successfully');
        });

        redis.on('error', (error) => {
            logger.error(`❌ Redis error: ${error.message}`);
        });
    }

    return redis;
}

export async function connectRedis(): Promise<void> {
    const client = getRedisClient();
    // Idempotent: with lazyConnect, any earlier Redis command (cache/worker) may
    // have already auto-connected the singleton. Calling connect() again throws
    // "Redis is already connecting/connected", which intermittently broke boot.
    if (['connecting', 'connect', 'ready'].includes(client.status)) return;
    await client.connect();
}

export async function disconnectRedis(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
        logger.info('📴 Redis disconnected');
    }
}

// Cache utilities
export const cache = {
    async get<T>(key: string): Promise<T | null> {
        return redisBreaker.execute(async () => {
            const client = getRedisClient();
            if (client.status !== 'ready') return null; // fail gracefully if disconnected
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        }).catch(() => null); // Silent fallback on cache miss/error
    },

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        return redisBreaker.execute(async () => {
            const client = getRedisClient();
            if (client.status !== 'ready') return;
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await client.setex(key, ttlSeconds, serialized);
            } else {
                await client.set(key, serialized);
            }
        }).catch(() => { }); // silent fallback
    },

    async del(key: string): Promise<void> {
        return redisBreaker.execute(async () => {
            const client = getRedisClient();
            if (client.status !== 'ready') return;
            await client.del(key);
        }).catch(() => { });
    },

    async delPattern(pattern: string): Promise<void> {
        return redisBreaker.execute(async () => {
            const client = getRedisClient();
            if (client.status !== 'ready') return;
            const keys: string[] = [];
            return new Promise<void>((resolve, reject) => {
                const stream = client.scanStream({ match: pattern, count: 100 });
                stream.on('data', (resultKeys) => {
                    keys.push(...resultKeys);
                });
                stream.on('end', async () => {
                    if (keys.length > 0) {
                        await client.del(...keys);
                    }
                    resolve();
                });
                stream.on('error', reject);
            });
        }).catch(() => { });
    },
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    INSTITUTION_SETTINGS: 3600, // 1 hour
    TEMPLATES: 1800, // 30 minutes
    STUDENT_LIST: 300, // 5 minutes
    USER_SESSION: 900, // 15 minutes
    IMAGE_HASH: 2592000, // 30 days
} as const;
