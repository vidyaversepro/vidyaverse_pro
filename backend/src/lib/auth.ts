import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../config/database.js';
import { sendEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';
import { passwordResetEmail } from '../utils/email-templates.js';

const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendResetPassword: async ({ user, token }, _request) => {
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
            globalRole: {
                type: "string",
                returned: true,
            }
        }
    },
    trustedOrigins: [frontendUrl, "http://localhost:5173", "http://localhost:5174", "http://localhost:3002", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "https://vgraphics.in", "https://api.vgraphics.in"]
});
