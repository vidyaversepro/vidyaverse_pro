import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function branchRoutes(fastify: FastifyInstance) {
    // List branches (main_admin, school_admin, super_admin)
    fastify.get('/', {
        preHandler: [fastify.authenticate, fastify.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: false })],
    }, controller.findAll);

    // Get branch by ID
    fastify.get('/:id', {
        preHandler: [fastify.authenticate, fastify.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: false })],
    }, controller.findById);

    // Create branch (main_admin only)
    fastify.post('/', {
        preHandler: [fastify.authenticate, fastify.rbac({ roles: ['main_admin'] })],
    }, controller.create);

    // Update branch (main_admin only)
    fastify.patch('/:id', {
        preHandler: [fastify.authenticate, fastify.rbac({ roles: ['main_admin'] })],
    }, controller.update);

    // Delete branch (main_admin only)
    fastify.delete('/:id', {
        preHandler: [fastify.authenticate, fastify.rbac({ roles: ['main_admin'] })],
    }, controller.delete);
}
