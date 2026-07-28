/**
 * Shared email templates for Vidyaverse Pro.
 *
 * All transactional emails share a consistent, brand-styled layout built with
 * email-client-safe HTML (table-based structure, inline styles, bulletproof
 * buttons) so they render correctly in Gmail, Outlook, Apple Mail, etc.
 *
 * To add a new email, compose your body with the small helpers below and wrap
 * it in `emailLayout()`.
 */

import { env } from '../config/env.js';

// =============================================================================
// BRAND CONSTANTS
// =============================================================================

const BRAND = {
    name: 'Vidyaverse Pro',
    primary: '#E63946',
    primaryDark: '#c92c39',
    ink: '#111827',
    body: '#4b5563',
    muted: '#9ca3af',
    line: '#e5e7eb',
    canvas: '#eef0f4',
    card: '#ffffff',
} as const;

/** Absolute, publicly reachable logo URL (email clients cannot load local/inline SVG reliably). */
const LOGO_URL = `${(env.FRONTEND_URL || 'https://vidyaverse.vinstitution.com').replace(/\/$/, '')}/vidyaverse-logo.png`;
const SUPPORT_EMAIL = env.EMAIL_FROM?.match(/<(.+?)>/)?.[1] || env.SMTP_USER || 'support@vinstitution.com';
const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// =============================================================================
// BASE LAYOUT
// =============================================================================

/**
 * Wraps body HTML in the standard Vidyaverse Pro email layout.
 * @param bodyHtml   Inner content (headings, paragraphs, CTA, etc.)
 * @param preheader  Hidden inbox-preview text shown next to the subject line.
 */
export function emailLayout(bodyHtml: string, preheader = ''): string {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.canvas};">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvas};padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.card};border-radius:16px;border:1px solid ${BRAND.line};overflow:hidden;">
        <!-- accent bar -->
        <tr><td style="height:6px;background:${BRAND.primary};line-height:6px;font-size:6px;">&nbsp;</td></tr>
        <!-- logo -->
        <tr>
          <td align="center" style="padding:32px 40px 8px;">
            <img src="${LOGO_URL}" alt="${BRAND.name}" width="190" style="display:block;width:190px;max-width:60%;height:auto;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>
        <!-- content -->
        <tr>
          <td style="padding:16px 40px 8px;font-family:${font};">
            ${bodyHtml}
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="padding:28px 40px 34px;border-top:1px solid ${BRAND.line};">
            <p style="margin:0 0 6px;font-family:${font};font-size:13px;color:${BRAND.body};font-weight:600;">${BRAND.name}</p>
            <p style="margin:0 0 12px;font-family:${font};font-size:12px;color:${BRAND.muted};line-height:1.6;">
              Need help? Reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.primary};text-decoration:none;">${SUPPORT_EMAIL}</a>.
            </p>
            <p style="margin:0;font-family:${font};font-size:11px;color:${BRAND.muted};">
              &copy; ${year} ${BRAND.name}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-family:${font};font-size:11px;color:${BRAND.muted};">
        This is an automated message — please do not reply directly.
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// =============================================================================
// SMALL HELPERS
// =============================================================================

/** Bulletproof, centered call-to-action button. */
export function ctaButton(href: string, label: string): string {
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto;">
      <tr>
        <td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;background:${BRAND.primary};">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${font};font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/** "Trouble clicking" fallback link block. */
export function fallbackLink(href: string): string {
    return `
    <p style="margin:24px 0 0;font-family:${font};color:${BRAND.muted};font-size:12px;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${href}" style="color:${BRAND.primary};word-break:break-all;">${href}</a>
    </p>`;
}

/** Standard heading + greeting used across templates. */
function heading(title: string): string {
    return `<h1 style="margin:8px 0 16px;font-family:${font};font-size:22px;line-height:1.3;color:${BRAND.ink};font-weight:700;">${title}</h1>`;
}
function para(text: string): string {
    return `<p style="margin:0 0 16px;font-family:${font};font-size:15px;line-height:1.7;color:${BRAND.body};">${text}</p>`;
}
function note(text: string): string {
    return `<p style="margin:0 0 8px;font-family:${font};font-size:13px;line-height:1.6;color:${BRAND.muted};">${text}</p>`;
}

// =============================================================================
// SPECIFIC TEMPLATES
// =============================================================================

/** Password reset email. */
export function passwordResetEmail(userName: string, resetLink: string): string {
    return emailLayout(
        `${heading('Reset your password')}
        ${para(`Hi <strong>${userName || 'there'}</strong>,`)}
        ${para('We received a request to reset the password for your Vidyaverse Pro account. Click the button below to choose a new one.')}
        ${ctaButton(resetLink, 'Reset Password')}
        ${note('This link will expire in 1 hour for your security.')}
        ${note("If you didn't request a password reset, you can safely ignore this email — your password won't change.")}
        ${fallbackLink(resetLink)}`,
        'Reset your Vidyaverse Pro password'
    );
}

/** Welcome / signup email. */
export function welcomeEmail(name: string): string {
    const loginUrl = `${(env.FRONTEND_URL || 'https://vidyaverse.vinstitution.com').replace(/\/$/, '')}/login`;
    return emailLayout(
        `${heading('Welcome to Vidyaverse Pro 🎉')}
        ${para(`Hi <strong>${name || 'there'}</strong>,`)}
        ${para('Your account has been created successfully. You can now sign in to access your dashboard, track attendance and fees, explore learning tools, and more.')}
        ${ctaButton(loginUrl, 'Sign In to Your Dashboard')}
        ${note("If you didn't create this account, please ignore this email or contact your school administrator.")}`,
        'Your Vidyaverse Pro account is ready'
    );
}

/** Admin / institution invitation email. */
export function institutionInvitationEmail(institutionName: string, setupLink: string): string {
    return emailLayout(
        `${heading(`You're invited to manage ${institutionName}`)}
        ${para(`You have been invited to set up your administrator account for <strong>${institutionName}</strong> on Vidyaverse Pro.`)}
        ${para('Click below to complete your profile, set a secure password, and access your dashboard.')}
        ${ctaButton(setupLink, 'Set Up My Account')}
        ${note('This invitation link will expire in 24 hours.')}
        ${fallbackLink(setupLink)}`,
        `Set up your admin account for ${institutionName}`
    );
}

/** Student photograph request email (sent to parents). */
export function studentPhotoRequestEmail(studentName: string, institutionName: string, uploadLink: string): string {
    return emailLayout(
        `${heading('We need a photograph 📸')}
        ${para(`Hi ${studentName ? `<strong>${studentName}</strong>'s parent` : 'there'},`)}
        ${para(`<strong>${institutionName}</strong> requires a recent photograph of ${studentName || 'the student'} for their ID card and school records.`)}
        ${para('Tap the button below to take a quick selfie on your phone or upload an existing photo — it takes less than 30 seconds.')}
        ${ctaButton(uploadLink, 'Upload Photograph')}
        ${note('Please complete this at your earliest convenience to avoid delays.')}
        ${fallbackLink(uploadLink)}`,
        `Photo needed for ${studentName || 'your child'}`
    );
}
