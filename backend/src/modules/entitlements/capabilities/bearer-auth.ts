/**
 * Accepts an OIDC access token on the capability endpoint.
 *
 * Relying parties hold an access token per federated user — better-auth's
 * genericOAuth stores it when the user signs in through Vidyaverse — but they hold no
 * Vidyaverse *session* cookie, which is all `fastify.authenticate` understands. So a
 * server-side call from PDLMS or DigiClassroom to "what may this user do" had no way
 * to authenticate.
 *
 * An access token is exactly the right credential here: it is already scoped, already
 * expiring, already revocable, and the `entitlements` scope exists for precisely this
 * call. Using it also means the RP never handles a hub session, and the hub never has
 * to trust the RP's assertion about *which* user is asking — the token says so.
 */
import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../../config/database.js';

/** The scope a token must carry to read capabilities. */
const REQUIRED_SCOPE = 'entitlements';

function bearerFrom(request: FastifyRequest): string | null {
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.slice(7).trim();
    return token.length > 0 ? token : null;
}

/**
 * Authenticate by session cookie OR OIDC access token.
 *
 * Tries the token first: a request carrying an explicit Authorization header is
 * stating its intent, and falling through to an ambient cookie could otherwise
 * resolve a *different* user than the token names.
 */
export async function authenticateSessionOrToken(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const token = bearerFrom(request);

    if (token) {
        const record = await prisma.oauthAccessToken.findUnique({
            where: { accessToken: token },
            select: { userId: true, scopes: true, accessTokenExpiresAt: true, clientId: true },
        });

        if (!record || !record.userId) {
            return reply.status(401).send({ success: false, error: 'Invalid access token' });
        }
        if (record.accessTokenExpiresAt <= new Date()) {
            // Distinct from "invalid" so the RP knows to refresh rather than to
            // re-authenticate the user.
            return reply.status(401).send({
                success: false,
                error: 'Access token expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        // Scopes are stored space- or comma-delimited depending on how they were
        // requested; accept either rather than depending on the writer's format.
        const scopes = record.scopes.split(/[\s,]+/).filter(Boolean);
        if (!scopes.includes(REQUIRED_SCOPE)) {
            return reply.status(403).send({
                success: false,
                error: `Access token lacks the '${REQUIRED_SCOPE}' scope`,
                code: 'INSUFFICIENT_SCOPE',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: record.userId },
            select: { id: true, email: true, globalRole: true },
        });
        if (!user) {
            return reply.status(401).send({ success: false, error: 'Token subject no longer exists' });
        }

        request.user = {
            userId: user.id,
            email: user.email,
            type: 'access',
            globalRole: user.globalRole ?? undefined,
        };
        return;
    }

    // No bearer token — fall back to the normal session-cookie path.
    await (request.server as unknown as {
        authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
    }).authenticate(request, reply);
}
