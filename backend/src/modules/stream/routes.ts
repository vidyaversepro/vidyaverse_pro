import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    // List streams
    app.get('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.list);

    // Get stream by ID
    app.get('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.getOne);

    // Create stream
    app.post('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.create);

    // Update stream
    app.patch('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.update);

    // Delete stream
    app.delete('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.delete);
}
