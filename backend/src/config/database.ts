import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: env.DATABASE_URL,
            },
        },
    });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    if (globalThis.prisma) {
        await globalThis.prisma.$disconnect();
    }
    logger.info('📴 Database disconnected');
}
