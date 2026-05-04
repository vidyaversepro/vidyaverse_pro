import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    API_BASE_URL: z.string().default('http://localhost:3000'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),

    // Database
    DATABASE_URL: z.string(),
    DB_CONNECTION_LIMIT: z.string().transform(Number).default('100'),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_PASSWORD: z.string().optional(),

    // Authentication
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

    // Cloudflare R2
    R2_ENDPOINT: z.string().url('R2_ENDPOINT must be a valid URL'),
    R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
    R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
    R2_BUCKET_NAME: z.string().default('vidyaverse'),
    R2_PUBLIC_URL: z.string().url('R2_PUBLIC_URL must be a valid URL'),
    R2_REGION: z.string().default('auto'),

    // AI Enhancement
    GEMINI_API_KEY: z.string().optional(),
    ENABLE_AI_ENHANCEMENT: z.string().transform((v) => v === 'true').default('true'),
    OPENCV_THRESHOLD: z.string().transform(Number).default('0.5'),

    // Email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(Number).optional(),
    SMTP_SECURE: z.string().transform((v) => v === 'true').default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().default('Vidyaverse Pro <noreply@vidyaverse.app>'),

    // System
    MAX_UPLOAD_SIZE_MB: z.string().transform(Number).default('10'),
    DEFAULT_TRIAL_DAYS: z.string().transform(Number).default('7'),
    MAINTENANCE_MODE: z.string().transform((v) => v === 'true').default('false'),
    ENABLE_REGISTRATION: z.string().transform((v) => v === 'true').default('true'),

    // Better Auth
    BETTER_AUTH_URL: z.string().default('http://localhost:3002'),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
});

// NOTE: process.env and console.error are intentional here — logger is not yet
// initialized during env validation. This is the only file exempt from the
// "zero console.log/console.error" and "zero process.env direct access" rules.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
    starter: {
        maxStudents: 500,
        maxTemplates: 3,
        maxUsersPerInstitution: 10,
        aiEnhancementsPerMonth: 100,
        pdfPagesPerMonth: 500,
        bulkOperationsPerDay: 10,
        storageGB: 5,
        enabledServices: ['id_card', 'certificate', 'library_card'],
        emailNotifications: 100,
        smsNotifications: 0,
        customDomain: false,
        whiteLabel: false,
        apiAccess: false,
        prioritySupport: false,
    },
    professional: {
        maxStudents: 2000,
        maxTemplates: 10,
        maxUsersPerInstitution: 50,
        aiEnhancementsPerMonth: 1000,
        pdfPagesPerMonth: 5000,
        bulkOperationsPerDay: 100,
        storageGB: 20,
        enabledServices: ['id_card', 'certificate', 'group_photo', 'portfolio', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate'],
        emailNotifications: 1000,
        smsNotifications: 500,
        customDomain: false,
        whiteLabel: false,
        apiAccess: true,
        prioritySupport: false,
    },
    enterprise: {
        maxStudents: -1,
        maxTemplates: -1,
        maxUsersPerInstitution: -1,
        aiEnhancementsPerMonth: -1,
        pdfPagesPerMonth: -1,
        bulkOperationsPerDay: -1,
        storageGB: 100,
        enabledServices: ['id_card', 'certificate', 'group_photo', 'portfolio', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate'],
        emailNotifications: -1,
        smsNotifications: -1,
        customDomain: true,
        whiteLabel: true,
        apiAccess: true,
        prioritySupport: true,
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_LIMITS;
