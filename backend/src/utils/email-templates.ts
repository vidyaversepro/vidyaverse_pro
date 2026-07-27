/**
 * Shared email templates for Vidyaverse Pro.
 *
 * All transactional emails share a consistent brand layout.
 * To add a new email, use `emailLayout()` with your custom body content.
 */

// =============================================================================
// BASE LAYOUT
// =============================================================================

/**
 * Wraps body HTML in the standard Vidyaverse Pro email layout.
 */
export function emailLayout(bodyHtml: string): string {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #E63946; margin: 0;">Vidyaverse Pro</h1>
            </div>
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                ${bodyHtml}
            </div>
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                &copy; ${new Date().getFullYear()} Vidyaverse Pro. All rights reserved.
            </p>
        </div>
    `;
}

// =============================================================================
// CTA BUTTON
// =============================================================================

/**
 * Renders a centered call-to-action button.
 */
export function ctaButton(href: string, label: string): string {
    return `
        <div style="text-align: center; margin: 30px 0;">
            <a href="${href}" style="background-color: #E63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${label}</a>
        </div>
    `;
}

/**
 * Renders a "trouble clicking" fallback link block.
 */
export function fallbackLink(href: string): string {
    return `
        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
            If you're having trouble clicking the button, copy and paste this link into your browser:<br><br>
            <a href="${href}" style="color: #E63946; word-break: break-all;">${href}</a>
        </p>
    `;
}

// =============================================================================
// SPECIFIC TEMPLATES
// =============================================================================

/**
 * Password reset email body.
 */
export function passwordResetEmail(userName: string, resetLink: string): string {
    return emailLayout(`
        <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #4b5563;">Hi <strong>${userName || 'there'}</strong>,</p>
        <p style="color: #4b5563;">We received a request to reset your password. Click the button below to choose a new password:</p>
        ${ctaButton(resetLink, 'Reset Password')}
        <p style="color: #6b7280; font-size: 13px;">This link will expire in 1 hour.</p>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        ${fallbackLink(resetLink)}
    `);
}

/**
 * Admin invitation email body.
 */
export function institutionInvitationEmail(institutionName: string, setupLink: string): string {
    return emailLayout(`
        <h2 style="color: #111827; margin-top: 0;">Welcome to ${institutionName}!</h2>
        <p style="color: #4b5563;">You have been invited to set up your administrator account for <strong>${institutionName}</strong> on Vidyaverse Pro.</p>
        <p style="color: #4b5563;">Click the button below to complete your profile, set a secure password, and access your dashboard.</p>
        ${ctaButton(setupLink, 'Set Up My Account')}
        <p style="color: #6b7280; font-size: 13px;">This invitation link will expire in 24 hours.</p>
        ${fallbackLink(setupLink)}
    `);
}

/**
 * Student photo request email body.
 */
export function studentPhotoRequestEmail(studentName: string, institutionName: string, uploadLink: string): string {
    return emailLayout(`
        <h2 style="color: #111827; margin-top: 0;">We need your photograph!</h2>
        <p style="color: #4b5563;">Hi ${studentName ? `<strong>${studentName}</strong>'s parent` : 'there'},</p>
        <p style="color: #4b5563;"><strong>${institutionName}</strong> requires a recent photograph of ${studentName || 'the student'} for their ID Card and school records.</p>
        <p style="color: #4b5563;">Click the button below to take a quick selfie using your smartphone or upload an existing photo. It takes less than 30 seconds!</p>
        ${ctaButton(uploadLink, 'Upload Photograph')}
        <p style="color: #6b7280; font-size: 13px;">Please complete this at your earliest convenience to avoid delays.</p>
        ${fallbackLink(uploadLink)}
    `);
}

export function welcomeEmail(name: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="color: #1a1a1a; margin-bottom: 8px;">Welcome to Vidyaverse Pro</h2>
      <p style="color: #444; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #444; line-height: 1.6;">
        Your account has been created successfully. You can now sign in to access
        your student dashboard, track attendance, view fee status, and more.
      </p>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        If you didn't create this account, please ignore this email or contact your school administrator.
      </p>
    </div>
  `;
}
