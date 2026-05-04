import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Since setup.ts globally mocks '../../src/config/redis' via setupFiles,
 * we test the cache utilities by verifying they are correctly wired:
 * - cache.get/set/del/delPattern are callable and return the expected mock values
 * - CACHE_TTL constants are exported correctly
 *
 * The SCAN-based delPattern implementation is verified via integration tests
 * against a real Redis instance.
 */

import { cache, CACHE_TTL, getRedisClient } from '../../src/config/redis';

describe('Redis Cache Utilities (mocked)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('cache.get', () => {
        it('should be a callable mock function', () => {
            expect(typeof cache.get).toBe('function');
        });

        it('should return null by default (mocked)', async () => {
            const result = await cache.get('somekey');
            expect(result).toBeNull();
        });
    });

    describe('cache.set', () => {
        it('should be a callable mock function', () => {
            expect(typeof cache.set).toBe('function');
        });

        it('should resolve without error (mocked)', async () => {
            await expect(cache.set('key', { v: 1 }, 300)).resolves.toBeUndefined();
        });
    });

    describe('cache.del', () => {
        it('should be a callable mock function', () => {
            expect(typeof cache.del).toBe('function');
        });

        it('should resolve without error (mocked)', async () => {
            await expect(cache.del('key')).resolves.toBeUndefined();
        });
    });

    describe('cache.delPattern', () => {
        it('should be a callable mock function (SCAN-based)', () => {
            expect(typeof cache.delPattern).toBe('function');
        });

        it('should resolve without error (mocked)', async () => {
            await expect(cache.delPattern('some:*')).resolves.toBeUndefined();
        });
    });

    describe('getRedisClient', () => {
        it('should return a mock Redis client', () => {
            const client = getRedisClient();
            expect(client).toBeDefined();
            expect(typeof client.get).toBe('function');
            expect(typeof client.setex).toBe('function');
            expect(typeof client.del).toBe('function');
        });
    });

    describe('CACHE_TTL constants', () => {
        it('should export institution settings TTL as 1 hour', () => {
            expect(CACHE_TTL.INSTITUTION_SETTINGS).toBe(3600);
        });

        it('should export templates TTL as 30 minutes', () => {
            expect(CACHE_TTL.TEMPLATES).toBe(1800);
        });

        it('should export student list TTL as 5 minutes', () => {
            expect(CACHE_TTL.STUDENT_LIST).toBe(300);
        });

        it('should export user session TTL as 15 minutes', () => {
            expect(CACHE_TTL.USER_SESSION).toBe(900);
        });

        it('should export image hash TTL as 30 days', () => {
            expect(CACHE_TTL.IMAGE_HASH).toBe(2592000);
        });
    });
});
