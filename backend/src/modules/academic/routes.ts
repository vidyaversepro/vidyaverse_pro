/**
 * Academic-profile API — what relying parties call to learn a student's Class/Section.
 *
 * Same authentication story as the capability API: an RP holds an OIDC access token
 * for the federated user, not a Vidyaverse session, so this endpoint authenticates
 * itself (session cookie OR bearer token) and is listed in index.ts's PUBLIC_PREFIXES
 * for exactly that reason — see capabilities/bearer-auth.ts's header comment.
 */
import { FastifyPluginAsync } from 'fastify';
import { authenticateSessionOrToken } from '../entitlements/capabilities/bearer-auth.js';
import { AcademicProfileUnavailableError, getAcademicProfile, invalidate } from './service.js';

const academicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', authenticateSessionOrToken);

    /**
     * The signed-in user's own Class/Section/Stream, or null if they have no Student
     * record (not a student, or not yet linked to one). Scoped to the caller's own
     * session on purpose, same reasoning as capabilities: no userId parameter, so this
     * cannot become an enumeration endpoint.
     */
    fastify.get('/my-class', async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, error: 'Not authenticated' });
        }

        try {
            const profile = await getAcademicProfile(userId);
            return reply.send({ success: true, data: profile });
        } catch (err) {
            if (err instanceof AcademicProfileUnavailableError) {
                return reply.status(503).header('retry-after', '30').send({
                    success: false,
                    error: err.message,
                    code: 'ACADEMIC_PROFILE_UNAVAILABLE',
                });
            }
            throw err;
        }
    });

    /** Force a re-resolve, e.g. right after a section transfer is applied. */
    fastify.post('/my-class/refresh', async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, error: 'Not authenticated' });
        }
        await invalidate(userId);
        return reply.send({ success: true });
    });
};

export default academicRoutes;
