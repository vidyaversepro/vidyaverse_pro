import type { Prisma } from '@prisma/client';

/**
 * SECURITY — the super-admin (platform owner) role is not transferable.
 *
 * Enforced as Prisma middleware rather than at each call site, because
 * `globalRole` can be written from many places (signup, admin routes, the OIDC
 * claims path, scripts) and a per-site check only protects the sites someone
 * remembered. Every write to `User` funnels through here.
 *
 * Vidyaverse is the identity provider, so this is the account that matters
 * most: it is the one that can mint and administer federation for all three
 * apps. The database carries the same rules in a trigger, so a direct SQL
 * write or a path that bypasses Prisma is still refused.
 *
 * `GlobalRole` has no @map, so the client value equals the column value.
 */
const OWNER_ROLE = 'super_admin';

function ownerEmail(): string | null {
    return process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || null;
}

function isOwnerEmail(email: unknown): boolean {
    const target = ownerEmail();
    if (!target) return false;
    return typeof email === 'string' && email.trim().toLowerCase() === target;
}

function unwrap(value: unknown): unknown {
    if (value && typeof value === 'object' && 'set' in (value as Record<string, unknown>)) {
        return (value as Record<string, unknown>).set;
    }
    return value;
}

function grantsOwner(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    return unwrap((data as Record<string, unknown>).globalRole) === OWNER_ROLE;
}

function removesOwner(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const raw = (data as Record<string, unknown>).globalRole;
    if (raw === undefined) return false; // role not being touched
    return unwrap(raw) !== OWNER_ROLE;
}

export class SuperAdminProtectionError extends Error {}

export function superAdminGuard(): Prisma.Middleware {
    return async (params, next) => {
        if (params.model !== 'User') return next(params);

        const args = (params.args ?? {}) as Record<string, unknown>;

        if (params.action === 'create' || params.action === 'createMany') {
            const payload = args.data;
            const rows = Array.isArray(payload) ? payload : [payload];
            for (const row of rows) {
                if (grantsOwner(row) && !isOwnerEmail((row as Record<string, unknown>)?.email)) {
                    throw new SuperAdminProtectionError(
                        'The super-admin role is reserved for the platform owner and cannot be assigned.',
                    );
                }
            }
            return next(params);
        }

        if (params.action === 'delete' || params.action === 'deleteMany') {
            if ((await ownersMatching(next, params)) > 0) {
                throw new SuperAdminProtectionError(
                    'The super-admin (platform owner) account cannot be deleted.',
                );
            }
            return next(params);
        }

        if (
            params.action === 'update' ||
            params.action === 'updateMany' ||
            params.action === 'upsert'
        ) {
            const data = params.action === 'upsert' ? args.update : args.data;

            if (grantsOwner(data)) {
                const target = await findOne(next, params);
                if (!target || !isOwnerEmail(target.email)) {
                    throw new SuperAdminProtectionError(
                        'The super-admin role is reserved for the platform owner and cannot be assigned.',
                    );
                }
            } else if (removesOwner(data)) {
                if ((await ownersMatching(next, params)) > 0) {
                    throw new SuperAdminProtectionError(
                        'The super-admin role cannot be removed from the platform owner account.',
                    );
                }
            }

            if (params.action === 'upsert' && grantsOwner(args.create)) {
                if (!isOwnerEmail((args.create as Record<string, unknown>)?.email)) {
                    throw new SuperAdminProtectionError(
                        'The super-admin role is reserved for the platform owner and cannot be assigned.',
                    );
                }
            }

            return next(params);
        }

        return next(params);
    };
}

async function ownersMatching(
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>,
    params: Prisma.MiddlewareParams,
): Promise<number> {
    const where = (params.args as Record<string, unknown> | undefined)?.where ?? {};
    const rows = (await next({
        ...params,
        action: 'findMany',
        args: { where: { AND: [where, { globalRole: OWNER_ROLE }] }, select: { id: true } },
    })) as unknown[];
    return Array.isArray(rows) ? rows.length : 0;
}

async function findOne(
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>,
    params: Prisma.MiddlewareParams,
): Promise<{ email: string } | null> {
    const where = (params.args as Record<string, unknown> | undefined)?.where ?? {};
    const rows = (await next({
        ...params,
        action: 'findMany',
        args: { where, select: { email: true } },
    })) as Array<{ email: string }>;
    if (!Array.isArray(rows) || rows.length !== 1) return null;
    return rows[0];
}
