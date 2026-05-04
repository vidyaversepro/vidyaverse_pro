import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// We re-declare the schema here instead of importing env.ts directly,
// because env.ts calls process.exit(1) on validation failure during import.
// This mirrors the exact schema from src/config/env.ts.
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3002'),
    API_BASE_URL: z.string().default('http://localhost:3002'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DB_CONNECTION_LIMIT: z.string().transform(Number).default('10'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_PASSWORD: z.string().optional(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRY: z.string().default('7d'),
    MAX_UPLOAD_SIZE_MB: z.string().transform(Number).default('10'),
    BETTER_AUTH_URL: z.string().default('http://localhost:3002'),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
});

describe('Environment Variable Validation', () => {
    const validEnv = {
        DATABASE_URL: 'mysql://root:password@localhost:3306/vidyaverse',
        JWT_SECRET: 'a-minimum-of-32-characters-long-secret-key',
        BETTER_AUTH_SECRET: 'another-minimum-of-32-characters-secret-here',
    };

    it('should accept valid environment variables with defaults', () => {
        const result = envSchema.safeParse(validEnv);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.NODE_ENV).toBe('development');
            expect(result.data.PORT).toBe(3002);
            expect(result.data.FRONTEND_URL).toBe('http://localhost:5173');
            expect(result.data.REDIS_URL).toBe('redis://localhost:6379');
        }
    });

    it('should reject missing DATABASE_URL', () => {
        const result = envSchema.safeParse({
            JWT_SECRET: validEnv.JWT_SECRET,
            BETTER_AUTH_SECRET: validEnv.BETTER_AUTH_SECRET,
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing JWT_SECRET', () => {
        const result = envSchema.safeParse({
            DATABASE_URL: validEnv.DATABASE_URL,
            BETTER_AUTH_SECRET: validEnv.BETTER_AUTH_SECRET,
        });
        expect(result.success).toBe(false);
    });

    it('should reject JWT_SECRET shorter than 32 characters', () => {
        const result = envSchema.safeParse({
            ...validEnv,
            JWT_SECRET: 'short',
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing BETTER_AUTH_SECRET', () => {
        const result = envSchema.safeParse({
            DATABASE_URL: validEnv.DATABASE_URL,
            JWT_SECRET: validEnv.JWT_SECRET,
        });
        expect(result.success).toBe(false);
    });

    it('should reject BETTER_AUTH_SECRET shorter than 32 characters', () => {
        const result = envSchema.safeParse({
            ...validEnv,
            BETTER_AUTH_SECRET: 'too-short',
        });
        expect(result.success).toBe(false);
    });

    it('should reject invalid NODE_ENV', () => {
        const result = envSchema.safeParse({
            ...validEnv,
            NODE_ENV: 'staging',
        });
        expect(result.success).toBe(false);
    });

    it('should accept valid NODE_ENV values', () => {
        for (const env of ['development', 'production', 'test']) {
            const result = envSchema.safeParse({ ...validEnv, NODE_ENV: env });
            expect(result.success).toBe(true);
        }
    });

    it('should transform PORT string to number', () => {
        const result = envSchema.safeParse({ ...validEnv, PORT: '8080' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.PORT).toBe(8080);
            expect(typeof result.data.PORT).toBe('number');
        }
    });

    it('should transform MAX_UPLOAD_SIZE_MB string to number', () => {
        const result = envSchema.safeParse({ ...validEnv, MAX_UPLOAD_SIZE_MB: '25' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.MAX_UPLOAD_SIZE_MB).toBe(25);
        }
    });
});
