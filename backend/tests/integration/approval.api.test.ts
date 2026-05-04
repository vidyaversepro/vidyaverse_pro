import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../../src/index';
import { createTestInstitution, createTestUser, createTestSession, createTestClass, createTestSection, createTestStudent, cleanupTestData } from '../setup';
import type { FastifyInstance } from 'fastify';

describe('Approval API', () => {
    let app: FastifyInstance;
    let request: ReturnType<typeof supertest>;
    let institutionId: string;
    let userId: string;
    let authCookie: string;
    let workflowId: string;
    let requestId: string;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
        request = supertest(app.server);

        // Create test data
        const institution = await createTestInstitution();
        institutionId = institution.id;

        const user = await createTestUser(institutionId, 'school_admin');
        userId = user.id;

        // Generate auth cookie
        const session = await createTestSession(userId);
        authCookie = session.cookie;
        console.log("APPROVAL TEST COOKIE IS:", authCookie);
    });

    afterAll(async () => {
        await cleanupTestData(institutionId);
        await app.close();
    });

    describe('Workflows', () => {
        it('POST /api/approvals/workflows should create workflow', async () => {
            const response = await request
                .post('/api/approvals/workflows')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId)
                .send({
                    name: 'Test TC Workflow',
                    type: 'transfer_certificate',
                    description: 'Test workflow',
                    steps: [
                        { order: 1, name: 'Admin Initial Review', approverRole: 'school_admin', isRequired: true },
                        { order: 2, name: 'Admin Final Approval', approverRole: 'school_admin', isRequired: true },
                    ],
                    isActive: true,
                });

            if (response.status !== 201) {
                throw new Error("APPROVAL FAILED: " + JSON.stringify(response.body));
            }
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            workflowId = response.body.data.id;
        });

        it('GET /api/approvals/workflows should list workflows', async () => {
            const response = await request
                .get('/api/approvals/workflows')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Requests', () => {
        it('POST /api/approvals/requests should create request', async () => {
            const response = await request
                .post('/api/approvals/requests')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId)
                .send({
                    type: 'transfer_certificate',
                    title: 'TC Request for Student',
                    description: 'Requesting TC for transfer',
                    priority: 'normal',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.status).toBe('pending');
            requestId = response.body.data.id;
        });

        it('GET /api/approvals/requests should list requests', async () => {
            const response = await request
                .get('/api/approvals/requests')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
        });

        it('GET /api/approvals/requests/:id should get request details', async () => {
            const response = await request
                .get(`/api/approvals/requests/${requestId}`)
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(requestId);
            expect(response.body.data.steps).toBeInstanceOf(Array);
        });

        it('POST /api/approvals/requests/:id/process should approve request', async () => {
            const response = await request
                .post(`/api/approvals/requests/${requestId}/process`)
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId)
                .send({
                    action: 'approve',
                    comments: 'Approved for testing',
                });

            if (response.status !== 200) {
                require('fs').writeFileSync('approval-error.json', JSON.stringify(response.body, null, 2));
                throw new Error("APPROVAL FAILED: " + JSON.stringify(response.body));
            }
            expect(response.status).toBe(200);
            // After first step approval, should move to next step or complete
        });
    });

    describe('Stats', () => {
        it('GET /api/approvals/stats should return statistics', async () => {
            const response = await request
                .get('/api/approvals/stats')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('total');
            expect(response.body.data).toHaveProperty('pending');
            expect(response.body.data).toHaveProperty('approved');
        });
    });
});
