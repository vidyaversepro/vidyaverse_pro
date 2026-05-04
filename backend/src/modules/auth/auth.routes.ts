// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { auth } from '../../lib/auth.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
    // Get Current User attached to Better Auth session
    fastify.get('/me', async (request, reply) => {
        // Build generic Request so auth can infer correctly on fastify
        const url = new URL(request.url, process.env.API_BASE_URL || 'http://localhost:3002');
        const webReq = new Request(url, { method: request.method, headers: request.headers as HeadersInit });
        const session = await auth.api.getSession({ headers: webReq.headers });
        
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const user = session.user as any;
        return reply.send({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                globalRole: user.globalRole,
                roles: [], 
            }
        });
    });
};

export default authRoutes;
