import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { institutionInvitationEmail, studentPhotoRequestEmail } from './email-templates.js';

const smtpHost = env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = env.SMTP_PORT || 587;
// For port 587 (STARTTLS), secure should be false; nodemailer upgrades via STARTTLS automatically.
// For port 465 (SSL), secure should be true.
const smtpSecure = smtpPort === 465 ? true : env.SMTP_SECURE;

logger.info(`📧 SMTP Config: host=${smtpHost}, port=${smtpPort}, secure=${smtpSecure}, user=${env.SMTP_USER || '(not set)'}`);

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
    },
    tls: {
        // Only relax certificate validation in development
        rejectUnauthorized: env.NODE_ENV === 'production',
    },
});

// Circuit breaker: fail-fast after 5 consecutive SMTP failures, probe every 60s
const smtpBreaker = new CircuitBreaker('smtp', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
});

let smtpVerified = false;

const verifySMTP = async () => {
    if (smtpVerified) return;
    try {
        await transporter.verify();
        logger.info('✅ SMTP connection verified successfully');
        smtpVerified = true;
    } catch (error: any) {
        logger.error(`❌ SMTP verification failed: ${error.message}`);
        logger.error('   Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env');
        // Don't throw here — allow the send attempt so we get more specific errors
    }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
        logger.error('❌ SMTP_USER or SMTP_PASSWORD not configured in .env');
        throw new Error('Email service not configured. Set SMTP_USER and SMTP_PASSWORD in .env');
    }

    await verifySMTP();

    return smtpBreaker.execute(async () => {
        try {
            const info = await transporter.sendMail({
                from: env.EMAIL_FROM,
                to,
                subject,
                html,
            });
            logger.info(`✅ Email sent successfully to ${to} (messageId: ${info.messageId})`);
            return info;
        } catch (error: any) {
            logger.error(`❌ Error sending email to ${to}: ${error.message}`);
            if (error.responseCode === 535 || error.code === 'EAUTH') {
                logger.error('   💡 Gmail requires an "App Password" — not your regular Google password.');
                logger.error('   💡 Go to https://myaccount.google.com/apppasswords to generate one.');
            }
            throw error;
        }
    });
};

/** Get SMTP circuit breaker status (for health endpoints). */
export const getSmtpStatus = () => smtpBreaker.getState();

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
