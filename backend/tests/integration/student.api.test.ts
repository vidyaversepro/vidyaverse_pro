import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../../src/index';
import { createTestInstitution, createTestUser, createTestSession, createTestClass, createTestSection, createTestStudent, cleanupTestData } from '../setup';
import type { FastifyInstance } from 'fastify';

describe('Student API', () => {
    let app: FastifyInstance;
    let request: ReturnType<typeof supertest>;
    let institutionId: string;
    let userId: string;
    let classId: string;
    let sectionId: string;
    let authCookie: string;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
        request = supertest(app.server);

        // Create test data
        const institution = await createTestInstitution();
        institutionId = institution.id;

        const user = await createTestUser(institutionId, 'school_admin');
        userId = user.id;

        const cls = await createTestClass(institutionId);
        classId = cls.id;

        const section = await createTestSection(classId);
        sectionId = section.id;

        // Generate auth cookie
        const session = await createTestSession(userId);
        authCookie = session.cookie;
    });

    afterAll(async () => {
        await cleanupTestData(institutionId);
        await app.close();
    });

    describe('POST /api/v1/student', () => {
        it('should create a new student', async () => {
            const response = await request
                .post('/api/v1/student')
                .set('Cookie', authCookie)
                .send({
                    institutionId,
                    sectionId,
                    admissionNumber: `API${Math.random().toString(36).substring(7)}`,
                    name: 'API Test Student',
                    sex: 'male',
                    dob: '2010-01-15',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe('API Test Student');
        });

        it('should fail without auth token', async () => {
            const response = await request
                .post('/api/v1/student')
                .send({
                    sectionId,
                    admissionNumber: 'NOAUTH123',
                    name: 'No Auth Student',
                });

            expect(response.status).toBe(401);
        });

        it('should validate required fields', async () => {
            const response = await request
                .post('/api/v1/student')
                .set('Cookie', authCookie)
                .send({
                    institutionId,
                    sectionId,
                    // Missing required fields
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/student', () => {
        it('should list students with pagination', async () => {
            // Create test students
            await createTestStudent(institutionId, sectionId);
            await createTestStudent(institutionId, sectionId);

            const response = await request
                .get('/api/v1/student')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId)
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
        });

        it('should filter by section', async () => {
            const response = await request
                .get('/api/v1/student')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId)
                .query({ sectionId });

            expect(response.status).toBe(200);
            response.body.data.forEach((student: Record<string, unknown>) => {
                expect(student.sectionId).toBe(sectionId);
            });
        });
    });

    describe('GET /api/v1/student/:id', () => {
        it('should get student by ID', async () => {
            const student = await createTestStudent(institutionId, sectionId);

            const response = await request
                .get(`/api/v1/student/${student.id}`)
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(student.id);
        });

        it('should return 404 for non-existent student', async () => {
            const response = await request
                .get('/api/v1/student/00000000-0000-0000-0000-000000000000')
                .set('Cookie', authCookie)
                .set('x-institution-id', institutionId);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/student/:id', () => {
        it('should update student', async () => {
            const student = await createTestStudent(institutionId, sectionId);

            const response = await request
                .patch(`/api/v1/student/${student.id}`)
                .set('Cookie', authCookie)
                .send({ institutionId, name: 'Updated Student Name' });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Updated Student Name');
        });
    });
});
