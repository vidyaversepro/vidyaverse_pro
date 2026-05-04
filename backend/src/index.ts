import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';

import { env, connectDatabase, disconnectDatabase, connectRedis, disconnectRedis, initializeMinio } from './config/index.js';
import { authPlugin, rbacPlugin, errorHandlerPlugin } from './plugins/index.js';
import { logger } from './utils/logger.js';

import { auth } from './lib/auth.js';
import { institutionModule } from './modules/institution/index.js';
import { branchModule } from './modules/branch/index.js';
import { userModule } from './modules/user/index.js';
import { classModule } from './modules/class/index.js';
import { streamModule } from './modules/stream/index.js';
import { sectionModule } from './modules/section/index.js';
import { studentModule } from './modules/student/index.js';
import { photoModule } from './modules/photo/index.js';
import { templateRoutes } from './modules/templates/index.js';
import { idCardRoutes } from './modules/id-cards/index.js';
import { certificateRoutes } from './modules/certificates/index.js';
import { groupPhotoRoutes } from './modules/group-photos/index.js';
import { portfolioRoutes } from './modules/portfolios/index.js';
import { hallTicketRoutes } from './modules/hall-tickets/index.js';
import marksheetRoutes from './modules/marksheets/marksheet.routes.js';
import libraryCardRoutes from './modules/library-cards/library-card.routes.js';
import transferCertificateRoutes from './modules/transfer-certificates/transfer-certificate.routes.js';
import visitingCardRoutes from './modules/visiting-card/visiting-card.routes.js';
import jobRoutes from './modules/jobs/jobs.routes.js';
import { visionariumModule } from './modules/visionarium/index.js';
import { socialModule } from './modules/social/index.js';
import { analyticsModule } from './modules/analytics/index.js';
import { approvalRoutes } from './modules/approvals/index.js';
import authRoutes from './modules/auth/auth.routes.js';
import { opsRoutes } from './modules/ops/index.js';

export async function buildApp() {
    const fastify = Fastify({
        logger: {
            level: env.NODE_ENV === 'production' ? 'info' : 'debug',
        },
        bodyLimit: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    });

    // Security
    await fastify.register(helmet, {
        contentSecurityPolicy: env.NODE_ENV === 'production',
    });

    // Cookie support (required for CSRF)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fastify.register(fastifyCookie as any, {
        secret: env.JWT_SECRET,
    });

    // CSRF protection for state-changing requests
    await fastify.register(fastifyCsrf, {
        cookieOpts: { signed: true },
    });

    await fastify.register(cors, {
        origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true,
        credentials: true,
    });

    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
    });

    // File uploads
    await fastify.register(multipart, {
        limits: {
            fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
        },
    });

    // API Documentation
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Vidyaverse Pro API',
                description: 'Comprehensive Educational Management Platform API',
                version: '1.0.0',
                contact: { name: 'Vidyaverse Team' },
            },
            servers: [
                { url: `http://localhost:${env.PORT}`, description: 'Local development' },
            ],
            tags: [
                { name: 'Auth', description: 'Authentication & authorization' },
                { name: 'Institutions', description: 'Institution management' },
                { name: 'Students', description: 'Student records' },
                { name: 'ID Cards', description: 'ID card generation' },
                { name: 'Certificates', description: 'Certificate generation' },
                { name: 'Templates', description: 'Template management' },
                { name: 'Group Photos', description: 'Group photo processing' },
                { name: 'Users', description: 'User management' },
                { name: 'System', description: 'Health checks & system info' },
            ],
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'better-auth.session_token',
                        description: 'Session cookie set by Better Auth after sign-in',
                    },
                },
            },
        },
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            persistAuthorization: true,
        },
    });

    // Custom plugins
    await fastify.register(errorHandlerPlugin);
    await fastify.register(authPlugin);
    await fastify.register(rbacPlugin);

    // Root health check — used by Docker HEALTHCHECK and load balancers
    fastify.get('/health', async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
    }));

    // Static file serving for uploaded assets (local dev fallback for MinIO)
    fastify.get('/uploads/*', async (request, reply) => {
        const { '*': filePath } = request.params as { '*': string };
        const path = await import('path');
        const fs = await import('fs');
        const safePath = path.resolve(process.cwd(), 'uploads', filePath);
        
        // Prevent directory traversal
        if (!safePath.startsWith(path.resolve(process.cwd(), 'uploads'))) {
            return reply.status(403).send({ error: 'Forbidden' });
        }
        
        if (!fs.existsSync(safePath)) {
            return reply.status(404).send({ error: 'File not found' });
        }

        const ext = path.extname(safePath).toLowerCase();
        const mimeMap: Record<string, string> = {
            '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
        };
        
        const stream = fs.createReadStream(safePath);
        return reply
            .header('Content-Type', mimeMap[ext] || 'application/octet-stream')
            .header('Cache-Control', 'public, max-age=31536000')
            .send(stream);
    });

    // Detailed health check — used by API consumers and monitoring
    fastify.get('/api/v1/system/health', async () => {
        return {
            success: true,
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: env.NODE_ENV,
            },
        };
    });

    fastify.get('/test-ping', async () => ({ pong: true }));

    // Better Auth Routes
    fastify.all('/api/auth/*', async (request, reply) => {
        const url = new URL(request.url, env.API_BASE_URL || 'http://localhost:3002');
        const webReq = new Request(url, {
            method: request.method,
            headers: request.headers as HeadersInit,
            // @ts-ignore
            body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? JSON.stringify(request.body) : undefined,
        });

        const response = await auth.handler(webReq);

        const headers: Record<string, string | string[]> = {};
        for (const [key, value] of response.headers as unknown as Iterable<[string, string]>) {
            if (key.toLowerCase() === 'set-cookie') {
                // @ts-ignore Fastify can handle array set-cookies
                const existing = headers['set-cookie'] || [];
                // @ts-ignore
                headers['set-cookie'] = [...(Array.isArray(existing) ? existing : [existing]), value];
            } else {
                headers[key] = value;
            }
        }

        reply.headers(headers).status(response.status);
        const text = await response.text();
        return reply.send(text);
    });



    // Register Feature Modules
    await fastify.register(institutionModule);
    await fastify.register(branchModule);
    await fastify.register(userModule);
    await fastify.register(classModule);
    await fastify.register(streamModule);
    await fastify.register(sectionModule);
    await fastify.register(studentModule);
    await fastify.register(photoModule);
    await fastify.register(templateRoutes, { prefix: '/api/v1/templates' });
    await fastify.register(idCardRoutes, { prefix: '/api/v1/id-cards' });
    await fastify.register(certificateRoutes, { prefix: '/api/v1/certificates' });
    await fastify.register(groupPhotoRoutes, { prefix: '/api/v1/group-photos' });
    await fastify.register(portfolioRoutes, { prefix: '/api/v1/portfolios' });
    await fastify.register(hallTicketRoutes, { prefix: '/api/v1/hall-tickets' });
    await fastify.register(marksheetRoutes, { prefix: '/api/v1/marksheets' });
    await fastify.register(libraryCardRoutes, { prefix: '/api/v1/library-cards' });
    await fastify.register(transferCertificateRoutes, { prefix: '/api/v1/transfer-certificates' });
    await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(visitingCardRoutes, { prefix: '/api/v1/visiting-cards' });
    await fastify.register(jobRoutes, { prefix: '/api/v1/jobs' });
    await fastify.register(visionariumModule);
    await fastify.register(socialModule);
    await fastify.register(analyticsModule);
    await fastify.register(approvalRoutes, { prefix: '/api/approvals' });
    await fastify.register(opsRoutes, { prefix: '/api/ops' });

    return fastify;
}

import { csvImportWorker } from './workers/csvImportWorker.js';

// Graceful shutdown
async function gracefulShutdown(fastify: any, signal: string) {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    await csvImportWorker.close();
    await fastify.close();
    await disconnectDatabase();
    await disconnectRedis();

    logger.info('Server shut down successfully');
    process.exit(0);
}

// Main startup
async function main() {
    try {
        // Connect to services
        logger.info('Connecting to database...');
        await connectDatabase();

        logger.info('Connecting to Redis...');
        await connectRedis();

        logger.info('Initializing MinIO...');
        await initializeMinio();

        // Instantiate app
        const app = await buildApp();

        // Start server
        await app.listen({
            port: env.PORT,
            host: '0.0.0.0',
        });

        logger.info(`
    🚀 Vidyaverse Pro API Server
    ============================
    Environment: ${env.NODE_ENV}
    Port: ${env.PORT}
    API Docs: ${env.API_BASE_URL}/docs
    Health: ${env.API_BASE_URL}/api/v1/system/health
    `);

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown(app, 'SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown(app, 'SIGINT'));
    } catch (error) {
        console.error('FULL ERROR:', error);
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    main();
}
