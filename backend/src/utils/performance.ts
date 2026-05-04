/**
 * Performance optimization utilities for the backend
 */

import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { logger } from './logger';

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
    SHORT: 60,          // 1 minute
    MEDIUM: 300,        // 5 minutes
    LONG: 3600,         // 1 hour
    VERY_LONG: 86400,   // 24 hours
} as const;

/**
 * Generic caching wrapper with Redis
 */
export async function withCache<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    try {
        // Try to get from cache
        const cached = await getRedisClient().get(key);
        if (cached) {
            logger.debug('Cache hit', { key });
            return JSON.parse(cached);
        }
    } catch (error) {
        logger.warn('Cache read error', { key, error });
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    try {
        await getRedisClient().setex(key, ttl, JSON.stringify(data));
        logger.debug('Cache set', { key, ttl });
    } catch (error) {
        logger.warn('Cache write error', { key, error });
    }

    return data;
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
    try {
        const keys = await getRedisClient().keys(pattern);
        if (keys.length > 0) {
            await getRedisClient().del(...keys);
            logger.debug('Cache invalidated', { pattern, count: keys.length });
        }
    } catch (error) {
        logger.warn('Cache invalidation error', { pattern, error });
    }
}

/**
 * Database query optimization - batch operations
 */
export async function batchProcess<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await processor(batch);
        results.push(...batchResults);

        // Small delay between batches to prevent overwhelming DB
        if (i + batchSize < items.length) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }

    return results;
}

/**
 * Parallel execution with concurrency limit
 */
export async function parallelLimit<T, R>(
    items: T[],
    limit: number,
    processor: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
        const p = processor(item).then((result) => {
            results.push(result);
        });

        executing.push(p);

        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(executing.indexOf(p), 1);
        }
    }

    await Promise.all(executing);
    return results;
}

/**
 * Query performance timing
 */
export function measureQuery<T>(
    name: string,
    queryFn: () => Promise<T>
): Promise<T> {
    const start = performance.now();

    return queryFn().then((result) => {
        const duration = performance.now() - start;

        if (duration > 1000) {
            logger.warn('Slow query detected', { name, durationMs: duration.toFixed(2) });
        } else if (duration > 100) {
            logger.debug('Query timing', { name, durationMs: duration.toFixed(2) });
        }

        return result;
    });
}

/**
 * Prisma query optimization helpers
 */
export const queryOptimizer = {
    /**
     * Select only required fields
     */
    studentBasicSelect: {
        id: true,
        name: true,
        admissionNumber: true,
        photoUrl: true,
        gender: true,
        isActive: true,
    },

    /**
     * Common includes for relationships
     */
    studentWithSection: {
        section: {
            select: {
                id: true,
                name: true,
                class: { select: { id: true, name: true } },
            },
        },
    },

    /**
     * Pagination helper
     */
    paginate: (page: number, limit: number) => ({
        skip: (page - 1) * limit,
        take: limit,
    }),
};

/**
 * Connection pool warm-up
 */
export async function warmupConnections(): Promise<void> {
    logger.info('Warming up database connections...');

    try {
        // Execute simple queries to establish connections
        await Promise.all([
            prisma.$queryRaw`SELECT 1`,
            getRedisClient().ping(),
        ]);

        logger.info('Connection warm-up complete');
    } catch (error) {
        logger.error('Connection warm-up failed', { error });
    }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
    heapUsed: string;
    heapTotal: string;
    external: string;
    rss: string;
} {
    const usage = process.memoryUsage();

    return {
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    };
}

/**
 * Request rate limiting helper
 */
export async function checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const currentKey = `ratelimit:${key}`;

    const current = await getRedisClient().incr(currentKey);

    if (current === 1) {
        await getRedisClient().expire(currentKey, windowSeconds);
    }

    const ttl = await getRedisClient().ttl(currentKey);

    return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetIn: ttl,
    };
}
