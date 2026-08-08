import { FastifyInstance, FastifyRequest } from 'fastify';
import type { InstitutionType } from '@prisma/client';
import { controller } from './controller.js';

/**
 * These routes key on `:id`, but `rbac` resolves the institution scope from an
 * `institutionId` (param/query/body/header). Copy `:id` into the query so rbac
 * validates that the caller is a member of the institution being addressed.
 * A super_admin bypasses membership inside rbac regardless.
 */
async function scopeToParam(request: FastifyRequest) {
    const params = request.params as Record<string, string> | undefined;
    const query = request.query as Record<string, unknown>;
    if (params?.id && !query.institutionId) {
        query.institutionId = params.id;
    }
}

export async function routes(app: FastifyInstance) {
    // ── Platform-only: the tenant records themselves ──────────────────────────
    // Creating, listing-all and deleting an institution are platform onboarding
    // actions, restricted to global roles.
    app.get<{ Querystring: { page?: number; limit?: number; search?: string; status?: string; tier?: string } }>(
        '/', { preHandler: [app.requireGlobalRole(['super_admin', 'support'])] }, controller.list);
    app.get<{ Querystring: { code?: string; adminEmail?: string; contactEmail?: string; excludeInstitutionId?: string } }>(
        '/check-uniqueness', { preHandler: [app.requireGlobalRole(['super_admin'])] }, controller.checkUniqueness);
    app.post('/', { preHandler: [app.requireGlobalRole(['super_admin'])] }, controller.create);
    app.delete<{ Params: { id: string } }>(
        '/:id', { preHandler: [app.requireGlobalRole(['super_admin'])] }, controller.delete);

    // ── Institution-scoped: an admin acting within their own institution ──────
    app.get<{ Params: { id: string } }>(
        '/:id', { preHandler: [scopeToParam, app.rbac({ requireInstitution: true })] }, controller.getOne);
    app.patch<{ Params: { id: string } }>(
        '/:id', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.update);
    app.patch<{ Params: { id: string }; Body: { institutionType?: InstitutionType } }>(
        '/:id/complete-onboarding', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.completeOnboarding);
    app.post<{ Params: { id: string } }>(
        '/:id/branding', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin', 'school_admin'], requireInstitution: true })] }, controller.updateBranding);

    // Authorities: read by any member of the institution, mutate by main_admin.
    app.get<{ Params: { id: string } }>(
        '/:id/authorities', { preHandler: [scopeToParam, app.rbac({ requireInstitution: true })] }, controller.getAuthorities);
    app.post<{ Params: { id: string } }>(
        '/:id/authorities', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.createAuthority);
    app.patch<{ Params: { id: string; authorityId: string } }>(
        '/:id/authorities/:authorityId', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.updateAuthority);
    app.delete<{ Params: { authorityId: string } }>(
        '/:id/authorities/:authorityId', { preHandler: [scopeToParam, app.rbac({ roles: ['main_admin'], requireInstitution: true })] }, controller.deleteAuthority);
}
