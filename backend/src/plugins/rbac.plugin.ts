import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../config/database.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

type GlobalRole = 'super_admin' | 'support';
type InstitutionRole = 'main_admin' | 'school_admin' | 'teacher' | 'student';
type Role = GlobalRole | InstitutionRole;

interface RBACOptions {
    roles?: Role[];
    requireInstitution?: boolean;
    checkAssignment?: boolean; // For teachers: check if assigned to the resource
}

const rbacPlugin: FastifyPluginAsync = async (fastify) => {
    // RBAC middleware factory
    fastify.decorate(
        'rbac',
        (options: RBACOptions) => async (request: FastifyRequest, _reply: FastifyReply) => {
            if (!request.user) {
                throw new UnauthorizedError('Authentication required');
            }

            const { roles, requireInstitution = true, checkAssignment: _checkAssignment = false } = options;

            // Super admin bypasses all checks
            if (request.user.globalRole === 'super_admin') {
                // Set institution from query/body if provided
                const query = request.query as Record<string, unknown>;
                const body = request.body as Record<string, unknown> | undefined;
                const params = request.params as Record<string, unknown> | undefined;
                const headers = request.headers;

                const institutionId = (query.institutionId || body?.institutionId || params?.institutionId || headers['x-institution-id'] || headers['institutionid']) as string | undefined;
                request.institutionId = institutionId || null;
                return;
            }

            // Support role has limited global access
            if (request.user.globalRole === 'support') {
                if (roles && !roles.includes('support')) {
                    throw new ForbiddenError('Access denied for this role');
                }
                return;
            }

            // Get user's institution role
            const query = request.query as Record<string, unknown>;
            const body = request.body as Record<string, unknown> | undefined;
            const params = request.params as Record<string, unknown> | undefined;
            const headers = request.headers;

            let institutionId = (params?.institutionId || query.institutionId || body?.institutionId || headers['x-institution-id'] || headers['institutionid']) as string | undefined;

            // Fallback: if no institution was supplied explicitly but the user
            // belongs to exactly one institution, use it. This keeps single-tenant
            // users working without every request having to thread institutionId,
            // while still requiring an explicit choice when membership is ambiguous.
            if (!institutionId) {
                const memberships = await prisma.userInstitutionRole.findMany({
                    where: { userId: request.user.userId },
                    select: { institutionId: true },
                    take: 2,
                });
                if (memberships.length === 1) {
                    institutionId = memberships[0].institutionId;
                }
            }

            if (requireInstitution && !institutionId) {
                throw new ForbiddenError('Institution context required');
            }

            if (institutionId) {
                const userRole = await prisma.userInstitutionRole.findUnique({
                    where: {
                        userId_institutionId: {
                            userId: request.user.userId,
                            institutionId,
                        },
                    },
                    select: {
                        role: true,
                        assignedClasses: true,
                        assignedSections: true,
                        studentAccessEnabled: true,
                        studentAccessExpires: true,
                    },
                });

                if (!userRole) {
                    throw new ForbiddenError(`No access to this institution. User: ${request.user.userId}, Inst: ${institutionId}`);
                }

                // Check student access expiry
                if (userRole.role === 'student') {
                    if (!userRole.studentAccessEnabled) {
                        throw new ForbiddenError('Student access not enabled');
                    }
                    if (userRole.studentAccessExpires && userRole.studentAccessExpires < new Date()) {
                        throw new ForbiddenError('Student access has expired');
                    }
                }

                // Check role permission
                if (roles && roles.length > 0) {
                    if (!roles.includes(userRole.role as Role)) {
                        throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
                    }
                }

                request.institutionId = institutionId;
                request.userRole = {
                    role: userRole.role,
                    assignedClasses: userRole.assignedClasses as string[] | null,
                    assignedSections: userRole.assignedSections as string[] | null,
                };
            }
        }
    );

    // Convenience shorthand: requireInstitution
    fastify.decorate(
        'requireInstitution',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const rbacHandler = (fastify as any).rbac({ requireInstitution: true });
            await rbacHandler(request, reply);
        }
    );

    // Convenience shorthand: requireRole(['main_admin', 'teacher', ...])
    fastify.decorate(
        'requireRole',
        (roles: string[]) => async (request: FastifyRequest, reply: FastifyReply) => {
            const rbacHandler = (fastify as any).rbac({ roles: roles as Role[], requireInstitution: true });
            await rbacHandler(request, reply);
        }
    );

    // Convenience shorthand: requireGlobalRole(['super_admin', ...])
    fastify.decorate(
        'requireGlobalRole',
        (roles: string[]) => async (request: FastifyRequest, _reply: FastifyReply) => {
            if (!request.user) {
                throw new UnauthorizedError('Authentication required');
            }
            if (!roles.includes(request.user.globalRole as GlobalRole)) {
                throw new ForbiddenError(`Required global role: ${roles.join(' or ')}`);
            }
        }
    );

    // Helper to check if teacher has access to a section
    fastify.decorate('checkSectionAccess', async (request: FastifyRequest, sectionId: string) => {
        if (!request.userRole) {
            throw new ForbiddenError('No role context');
        }

        // Admins have full access
        if (['main_admin', 'school_admin'].includes(request.userRole.role)) {
            return true;
        }

        // Teachers need explicit assignment
        if (request.userRole.role === 'teacher') {
            const assignedSections = request.userRole.assignedSections || [];
            if (!assignedSections.includes(sectionId)) {
                throw new ForbiddenError('Not assigned to this section');
            }
        }

        return true;
    });

    // Helper to check if teacher has access to a class
    fastify.decorate('checkClassAccess', async (request: FastifyRequest, classId: string) => {
        if (!request.userRole) {
            throw new ForbiddenError('No role context');
        }

        // Admins have full access
        if (['main_admin', 'school_admin'].includes(request.userRole.role)) {
            return true;
        }

        // Teachers need explicit assignment
        if (request.userRole.role === 'teacher') {
            const assignedClasses = request.userRole.assignedClasses || [];
            if (!assignedClasses.includes(classId)) {
                throw new ForbiddenError('Not assigned to this class');
            }
        }

        return true;
    });
};

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        optionalAuth: (request: FastifyRequest) => Promise<void>;
        rbac: (options: RBACOptions) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireInstitution: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireGlobalRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        checkSectionAccess: (request: FastifyRequest, sectionId: string) => Promise<boolean>;
        checkClassAccess: (request: FastifyRequest, classId: string) => Promise<boolean>;
    }
}

export default fp(rbacPlugin, {
    name: 'rbac-plugin',
    dependencies: ['auth-plugin'],
});
