import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    // List sections (all authenticated institution members)
    app.get('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.list);

    // Get section by ID
    app.get('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.getOne);

    // Create section (school_admin or main_admin)
    app.post('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.create);

    // Create bulk sections
    app.post('/bulk', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.createBulk);

    // Update section
    app.patch('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.update);

    // Delete section
    app.delete('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.delete);
}
