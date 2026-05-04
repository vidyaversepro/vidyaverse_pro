import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    // ─── Saathi Links ────────────────────────────────────────────────────────────

    app.post('/saathi-requests', {
        preHandler: [app.authenticate],
    }, controller.createSaathiRequest);

    app.get('/saathi-requests', {
        preHandler: [app.authenticate],
    }, controller.listSaathiRequests);

    app.patch('/saathi-requests/:id', {
        preHandler: [app.authenticate],
    }, controller.updateSaathiRequest);

    app.get('/saathis', {
        preHandler: [app.authenticate],
    }, controller.listAcceptedSaathis);

    // ─── Relationships ───────────────────────────────────────────────────────────

    app.post('/relationships', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.createRelationship);

    app.get('/relationships/me', {
        preHandler: [app.authenticate],
    }, controller.getMyRelationships);

    // ─── Posts & Feeds ────────────────────────────────────────────────────────────

    app.post('/posts', {
        preHandler: [app.authenticate],
    }, controller.createPost);

    app.get('/posts/institution', {
        preHandler: [app.authenticate, app.requireInstitution],
    }, controller.getInstitutionFeed);

    app.get('/posts/class', {
        preHandler: [app.authenticate],
    }, controller.getClassFeed);

    app.get('/posts/me', {
        preHandler: [app.authenticate],
    }, controller.getMyPosts);

    // ─── Comments ────────────────────────────────────────────────────────────────

    app.post('/posts/:id/comments', {
        preHandler: [app.authenticate],
    }, controller.addComment);

    app.get('/posts/:id/comments', {
        preHandler: [app.authenticate],
    }, controller.getComments);

    // ─── Reactions ───────────────────────────────────────────────────────────────

    app.post('/posts/:id/reactions', {
        preHandler: [app.authenticate],
    }, controller.addReaction);

    app.delete('/posts/:id/reactions/me', {
        preHandler: [app.authenticate],
    }, controller.removeReaction);
}
