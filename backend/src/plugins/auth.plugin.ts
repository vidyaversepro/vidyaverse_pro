import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { UnauthorizedError } from '../utils/errors.js';

import { auth } from '../lib/auth.js';


declare module 'fastify' {
    interface FastifyRequest {
        user: { userId: string; email: string; type: string; globalRole?: string } | null;
        institutionId: string | null;
        userRole: {
            role: string;
            assignedClasses: string[] | null;
            assignedSections: string[] | null;
        } | null;
    }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
    // Decorate request with user data
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('institutionId', null);
    fastify.decorateRequest('userRole', null);

    // Authentication hook
    fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
        try {
            const sessionData = await auth.api.getSession({
                headers: request.headers as Record<string, string>
            });

            if (!sessionData || !sessionData.user) {
                throw new UnauthorizedError('Invalid or missing authentication token');
            }

            request.log?.info({ user: sessionData.user }, 'Session Data User Object');

            request.user = {
                userId: sessionData.user.id,
                email: sessionData.user.email,
                type: 'access',
                globalRole: (sessionData.user as any).globalRole || (sessionData.user as any).role || undefined
            };
        } catch (error) {
            request.log?.error({ err: error }, 'Authentication failed');
            throw new UnauthorizedError('Authentication failed');
        }
    });

    // Optional authentication (doesn't fail if no token)
    fastify.decorate('optionalAuth', async (request: FastifyRequest) => {
        try {
            const sessionData = await auth.api.getSession({
                headers: request.headers as Record<string, string>
            });
            if (sessionData && sessionData.user) {
                request.user = {
                    userId: sessionData.user.id,
                    email: sessionData.user.email,
                    type: 'access'
                };
            }
        } catch (err) {
            request.log?.debug({ err }, 'Optional auth failed');
        }
    });
};

export default fp(authPlugin, {
    name: 'auth-plugin',
});
