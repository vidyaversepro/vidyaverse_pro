import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';

/** Institution-scoped roles that may be assigned through this module. */
const INSTITUTION_ROLES = ['main_admin', 'school_admin', 'teacher', 'student'];

function isSuperAdmin(request: FastifyRequest): boolean {
    return (request.user as any)?.globalRole === 'super_admin';
}

/**
 * Confirm the target user shares the caller's rbac-resolved institution.
 * Super-admins bypass. Returns false when the caller has no institution context
 * or the target has no membership there — the route then answers 403.
 */
async function sharesCallerInstitution(request: FastifyRequest, targetUserId: string): Promise<boolean> {
    if (isSuperAdmin(request)) return true;
    const institutionId = request.institutionId;
    if (!institutionId) return false;
    const target = await service.findById(targetUserId);
    if (!target) return false;
    return (target.institutionRoles ?? []).some((r: any) => r.institutionId === institutionId);
}

export const controller = {
    async getStats(_request: FastifyRequest, reply: FastifyReply) {
        const data = await service.getStats();
        return reply.send({ data });
    },

    async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string; role?: string; institutionId?: string; status?: string } }>, reply: FastifyReply) {
        // Force the institution filter to the rbac-validated value so a scoped
        // admin cannot enumerate another institution's users via ?institutionId.
        const result = await service.findAll({
            ...request.query,
            institutionId: request.institutionId ?? undefined,
        });
        return reply.send({ data: result.data, pagination: result.pagination });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = { ...(request.body as any) };
        // A scoped admin may only create memberships inside their own institution,
        // and only for institution-scoped roles — never a global role.
        if (!isSuperAdmin(request)) {
            const institutionId = request.institutionId;
            const roles = Array.isArray(body.institutionRoles) ? body.institutionRoles : [];
            body.institutionRoles = roles
                .filter((r: any) => INSTITUTION_ROLES.includes(r?.role))
                .map((r: any) => ({ ...r, institutionId }));
        }
        try {
            const data = await service.create(body);
            return reply.status(201).send({ data });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    },

    async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        if (!(await sharesCallerInstitution(request, request.params.id))) {
            return reply.status(403).send({ error: 'Not authorized for this user' });
        }
        const data = await service.findById(request.params.id);
        if (!data) return reply.status(404).send({ error: 'Not found' });
        return reply.send({ data });
    },

    async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        if (!(await sharesCallerInstitution(request, request.params.id))) {
            return reply.status(403).send({ error: 'Not authorized for this user' });
        }
        const data = await service.update(request.params.id, request.body);
        return reply.send({ data });
    },

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        if (!(await sharesCallerInstitution(request, request.params.id))) {
            return reply.status(403).send({ error: 'Not authorized for this user' });
        }
        await service.delete(request.params.id);
        return reply.status(204).send();
    },

    async assignRole(request: FastifyRequest<{ Body: { userId: string; institutionId: string; role: string } }>, reply: FastifyReply) {
        const body = request.body;
        // Never let this endpoint grant a global role, and only accept known
        // institution roles.
        if (!INSTITUTION_ROLES.includes(body.role)) {
            return reply.status(400).send({ error: 'Invalid role' });
        }
        // Use the rbac-validated institution, not the raw body value.
        const institutionId = request.institutionId ?? body.institutionId;
        const data = await service.assignRole(body.userId, institutionId, body.role);
        return reply.send({ data });
    },
};
