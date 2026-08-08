import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    // Platform-wide user statistics.
    app.get('/stats', { preHandler: [app.requireGlobalRole(['super_admin', 'support'])] }, controller.getStats);

    // Assigning an institution role: rbac reads `institutionId` from the body and
    // confirms the caller is a main_admin of THAT institution (super_admin bypasses).
    // The controller additionally rejects any attempt to grant a global role.
    app.post<{ Body: { userId: string; institutionId: string; role: string } }>(
        '/assign-role', { preHandler: [app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.assignRole);

    // Listing / creating users is scoped to the caller's institution; the
    // controller filters and sanitises against the rbac-resolved institution.
    app.get<{ Querystring: { page?: number; limit?: number; search?: string; role?: string; institutionId?: string; status?: string } }>(
        '/', { preHandler: [app.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: true })] }, controller.list);
    app.post('/', { preHandler: [app.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: true })] }, controller.create);

    // Single-user reads/writes: admin role required, and the controller confirms
    // the target user shares the caller's institution (super_admin bypasses).
    app.get<{ Params: { id: string } }>(
        '/:id', { preHandler: [app.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: true })] }, controller.getOne);
    app.patch<{ Params: { id: string } }>(
        '/:id', { preHandler: [app.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: true })] }, controller.update);
    app.delete<{ Params: { id: string } }>(
        '/:id', { preHandler: [app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.delete);
}
