/**
 * Transactional mail for Vidyaverse.
 *
 * Resend is the transport when RESEND_API_KEY is set; otherwise this falls back
 * to the original SMTP path, so an environment that hasn't been given a key
 * keeps working exactly as before.
 *
 * Why the move: Vidyaverse is the trio's identity provider, and since email
 * verification became mandatory its verification mail sits on the account
 * ACTIVATION path — if that message doesn't land, the account cannot be used at
 * all. Shared SMTP gives no bounce or complaint feedback, so a dead address is
 * retried forever and the damage to sender reputation is invisible until it has
 * spread across all three apps sharing the domain. Resend reports both, and
 * `emailWebhooks` feeds them into the suppression list consulted below.
 *
 * The public surface (`sendEmail`) is unchanged, so every existing call site is
 * untouched.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { institutionInvitationEmail, studentPhotoRequestEmail } from './email-templates.js';
import { resendSend } from '../lib/email/resend.js';
import { isSuppressed } from '../lib/email/suppression.js';

const useResend = Boolean(env.RESEND_API_KEY);
const smtpConfigured = Boolean(env.SMTP_USER && env.SMTP_PASSWORD);

logger.info(
    `📧 Email transport: ${useResend ? 'resend' : smtpConfigured ? 'smtp' : 'NONE (not configured)'}` +
        (useResend && smtpConfigured ? ' (smtp available as fallback)' : ''),
);

// ─── SMTP (fallback / legacy) ────────────────────────────────────────────────
// Built lazily so that a Resend-only deployment never opens an SMTP connection
// or logs credentials it will not use.
let transporter: Transporter | null = null;
let smtpVerified = false;

function getTransporter(): Transporter {
    if (transporter) return transporter;
    const smtpPort = env.SMTP_PORT || 587;
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        // Port 465 is implicit TLS; 587 upgrades via STARTTLS, so `secure` is false.
        secure: smtpPort === 465 ? true : env.SMTP_SECURE,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
        tls: { rejectUnauthorized: env.NODE_ENV === 'production' },
    });
    return transporter;
}

const verifySMTP = async () => {
    if (smtpVerified) return;
    try {
        await getTransporter().verify();
        logger.info('✅ SMTP connection verified successfully');
        smtpVerified = true;
    } catch (error: any) {
        logger.error(`❌ SMTP verification failed: ${error.message}`);
        logger.error('   Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env');
        // Don't throw — let the send attempt surface a more specific error.
    }
};

// Fail fast after 5 consecutive failures, probe again after 60s.
const smtpBreaker = new CircuitBreaker('smtp', { failureThreshold: 5, resetTimeoutMs: 60_000 });
const resendBreaker = new CircuitBreaker('resend', { failureThreshold: 5, resetTimeoutMs: 60_000 });

async function sendViaSmtp(to: string, subject: string, html: string) {
    await verifySMTP();
    return smtpBreaker.execute(async () => {
        try {
            const info = await getTransporter().sendMail({ from: env.EMAIL_FROM, to, subject, html });
            logger.info(`✅ Email sent via SMTP to ${to} (messageId: ${info.messageId})`);
            return info;
        } catch (error: any) {
            logger.error(`❌ SMTP send to ${to} failed: ${error.message}`);
            if (error.responseCode === 535 || error.code === 'EAUTH') {
                logger.error('   💡 Gmail requires an "App Password" — not your regular Google password.');
                logger.error('   💡 Go to https://myaccount.google.com/apppasswords to generate one.');
            }
            throw error;
        }
    });
}

async function sendViaResend(to: string, subject: string, html: string) {
    return resendBreaker.execute(async () => {
        const result = await resendSend({
            apiKey: env.RESEND_API_KEY as string,
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        logger.info(`✅ Email sent via Resend to ${to} (id: ${result.id})`);
        return result;
    });
}

/**
 * Send a transactional email.
 *
 * Suppressed addresses are dropped silently rather than thrown, because callers
 * on the auth path treat a throw as "signup failed". A user whose address hard-
 * bounced should still get a created account and a clear path to fix it — not a
 * 500 at the registration form.
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!useResend && !smtpConfigured) {
        logger.error('❌ No email transport configured — set RESEND_API_KEY, or SMTP_USER + SMTP_PASSWORD');
        throw new Error('Email service not configured. Set RESEND_API_KEY (preferred) or SMTP credentials in .env');
    }

    if (await isSuppressed(to)) {
        logger.warn(`⛔ Skipping email to ${to} — address is suppressed (hard bounce or complaint)`);
        return { skipped: true as const, reason: 'suppressed' as const };
    }

    if (!useResend) return sendViaSmtp(to, subject, html);

    try {
        return await sendViaResend(to, subject, html);
    } catch (error: any) {
        // Verification mail activates the account, so when a second transport is
        // available it is worth using rather than losing the message outright.
        // Logged at error level so a misconfigured Resend key cannot hide behind
        // a quietly-working fallback.
        if (!smtpConfigured) throw error;
        logger.error(`❌ Resend send to ${to} failed (${error.message}) — falling back to SMTP`);
        return sendViaSmtp(to, subject, html);
    }
};

/** Circuit-breaker state for health endpoints. */
export const getSmtpStatus = () => smtpBreaker.getState();
export const getEmailStatus = () => ({
    transport: useResend ? 'resend' : smtpConfigured ? 'smtp' : 'none',
    smtpFallbackAvailable: useResend && smtpConfigured,
    resend: resendBreaker.getState(),
    smtp: smtpBreaker.getState(),
});

export const sendInstitutionInvitationEmail = async (to: string, token: string, institutionName: string) => {
    const subject = `You've been invited to manage ${institutionName} on Vidyaverse Pro`;
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const setupLink = `${frontendUrl}/admin/setup?token=${token}`;
    const html = institutionInvitationEmail(institutionName, setupLink);
    return sendEmail(to, subject, html);
};

export const sendPhotoRequestEmail = async (to: string, studentName: string, institutionName: string, token: string) => {
    const subject = `Action Required: Upload Photograph for ${studentName}`;
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const uploadLink = `${frontendUrl}/upload-photo/${token}`;
    const html = studentPhotoRequestEmail(studentName, institutionName, uploadLink);
    return sendEmail(to, subject, html);
};
