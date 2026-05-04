import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../../src/index';
import type { FastifyInstance } from 'fastify';

describe('Health Check API', () => {
    let app: FastifyInstance;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
        request = supertest(app.server);
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /health should return 200', async () => {
        const response = await request.get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });

    it('GET /api/v1/system/health should return detailed health', async () => {
        const response = await request.get('/api/v1/system/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
    });
});
