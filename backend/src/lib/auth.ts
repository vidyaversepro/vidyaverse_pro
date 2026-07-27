import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins/jwt';
import { oidcProvider } from 'better-auth/plugins/oidc-provider';
import { prisma } from '../config/database.js';
import { sendEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';
import { passwordResetEmail, welcomeEmail } from '../utils/email-templates.js';
import { resolveOidcClaims } from '../modules/oidc/claims-resolver.js';
import { hashClientSecret } from '../modules/oidc/client-secret-hash.js';

const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';

const trustedOrigins = [
    frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://vgraphics.in',
    'https://api.vgraphics.in',
    ...(env.PDLMS_ORIGIN ? [env.PDLMS_ORIGIN] : []),
    ...(env.DCP_ORIGIN ? [env.DCP_ORIGIN] : []),
];

const baseConfig = {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'mysql' }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendResetPassword: async ({ user, token }: any) => {
            const resetLink = `${frontendUrl}/reset-password?token=${token}`;
            await sendEmail(
                user.email,
                'Reset Your Password - Vidyaverse Pro',
                passwordResetEmail(user.name || 'there', resetLink)
            );
        },
    },
    user: {
        additionalFields: {
            globalRole: { type: 'string' as const, returned: true },
        },
    },
    trustedOrigins,
} satisfies BetterAuthOptions;

// OIDC provider is opt-in via OIDC_ENABLED so existing dev/test environments
// keep their behaviour. When enabled, Vidyaverse becomes an Identity Provider
// for PDLMS and DigiClassroom (see docs/identity-federation-design.md).
const plugins = env.OIDC_ENABLED
    ? [
          jwt({
              jwks: {
                  // EdDSA keys are tiny, fast to verify, and well-supported by `jose` on the RP side.
                  keyPairConfig: { alg: 'EdDSA', crv: 'Ed25519' },
              },
          }),
          oidcProvider({
              // Better Auth appends the original authorize query to loginPage, so
              // we must NOT pre-add a query here (would produce a double-`?`). The
              // login page detects the federated flow by the presence of client_id
              // and loops back to /oauth2/authorize after sign-in.
              loginPage: '/login',
              consentPage: '/oauth/consent',
              allowDynamicClientRegistration: false,
              requirePKCE: true,
              storeClientSecret: { hash: hashClientSecret },
              useJWTPlugin: true,
              metadata: {
                  issuer: env.VIDYAVERSE_ISSUER || env.BETTER_AUTH_URL,
                  scopes_supported: ['openid', 'profile', 'email', 'offline_access', 'memberships', 'entitlements'],
                  claims_supported: [
                      'sub', 'iss', 'aud', 'exp', 'nbf', 'iat', 'jti',
                      'email', 'email_verified', 'name', 'picture',
                      'global_role', 'memberships', 'entitlements_url',
                  ],
              },
              scopes: ['openid', 'profile', 'email', 'offline_access', 'memberships', 'entitlements'],
              getAdditionalUserInfoClaim: async (user, scopes, client) =>
                  resolveOidcClaims(user as any, scopes, client),
          }),
      ]
    : [];

export const auth = betterAuth({
    ...baseConfig,
    plugins,
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Welcome email — non-fatal; signup must not be blocked if mailer is down
                    sendEmail(
                        user.email,
                        'Welcome to Vidyaverse Pro',
                        welcomeEmail(user.name || 'there')
                    ).catch((err) =>
                        console.error('[auth] welcome email failed:', err)
                    );

                    // Auto-link: if exactly one Student row has parentEmail matching
                    // this new user's email and is not yet linked, set Student.userId.
                    // Zero matches → no-op (admin links manually via PATCH /students/:id/link-user).
                    // Multiple matches → no-op + warn (ambiguous; don't link to a random sibling).
                    try {
                        const matches = await prisma.student.findMany({
                            where: { parentEmail: user.email, userId: null },
                            select: { id: true },
                        });
                        if (matches.length === 1) {
                            await prisma.student.update({
                                where: { id: matches[0].id },
                                data: { userId: user.id },
                            });
                        } else if (matches.length > 1) {
                            console.warn(
                                `[auth] auto-link skipped for ${user.email} — ${matches.length} student records match`
                            );
                        }
                    } catch (err) {
                        // Non-fatal — admin can still link manually
                        console.error('[auth] student auto-link failed:', err);
                    }
                },
            },
        },
    },
});
