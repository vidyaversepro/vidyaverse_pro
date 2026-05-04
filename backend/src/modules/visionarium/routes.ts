import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    // ─── Articles ────────────────────────────────────────────────────────────────

    // Public reading (authenticated users)
    app.get('/articles', {
        preHandler: [app.authenticate],
    }, controller.listArticles);

    app.get('/articles/:id', {
        preHandler: [app.authenticate],
    }, controller.getArticle);

    // Admin-only article creation/updates
    app.post('/articles', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.createArticle);

    app.patch('/articles/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.updateArticle);

    // ─── Issues ──────────────────────────────────────────────────────────────────

    app.get('/issues', {
        preHandler: [app.authenticate],
    }, controller.listIssues);

    app.get('/issues/:id', {
        preHandler: [app.authenticate],
    }, controller.getIssue);

    app.post('/issues', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin'] })],
    }, controller.createIssue);

    // ─── Test Series ─────────────────────────────────────────────────────────────

    app.get('/test-series', {
        preHandler: [app.authenticate],
    }, controller.listTestSeries);

    app.get('/test-series/:id', {
        preHandler: [app.authenticate],
    }, controller.getTestSeries);

    app.post('/test-series', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'] })],
    }, controller.createTestSeries);

    // ─── Test Attempts ───────────────────────────────────────────────────────────

    app.post('/test-series/:id/attempts', {
        preHandler: [app.authenticate],
    }, controller.submitAttempt);

    app.get('/test-series/:id/attempts/me', {
        preHandler: [app.authenticate],
    }, controller.getMyAttempts);

    // ─── Submissions ─────────────────────────────────────────────────────────────

    app.get('/submissions', {
        preHandler: [app.authenticate],
    }, controller.listSubmissions);

    app.post('/submissions', {
        preHandler: [app.authenticate],
    }, controller.createSubmission);

    app.patch('/submissions/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.updateSubmission);
}
