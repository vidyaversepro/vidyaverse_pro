/**
 * Resend transport + webhook signature verification.
 *
 * Uses Resend's HTTP API directly rather than the SDK — one fetch call is the
 * whole surface we need, and the repo installs with pnpm where an extra dep is
 * more friction than it's worth. PDLMS and DigiClassroom already send through
 * Resend; this brings Vidyaverse onto the same provider, which matters because
 * it is the IdP: its verification mail is what activates an account, so a
 * silent delivery failure here is an unusable account, not a missed notice.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface ResendSendResult {
    id: string;
}

/**
 * Send one transactional email. Throws on non-2xx so the caller's circuit
 * breaker sees a failure and can fall back.
 */
export async function resendSend(opts: {
    apiKey: string;
    from: string;
    to: string;
    subject: string;
    html: string;
}): Promise<ResendSendResult> {
    const res = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${opts.apiKey}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            from: opts.from,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
        }),
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
    }

    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { id: body.id ?? '' };
}

/**
 * Verify a Resend webhook signature.
 *
 * Resend signs with Svix: the signed payload is `${id}.${timestamp}.${body}`,
 * HMAC-SHA256 keyed by the secret's base64 body (the part after the `whsec_`
 * prefix), base64-encoded. `svix-signature` may carry several space-separated
 * `v1,<sig>` entries during a secret rotation, so any one matching is a pass.
 */
export function verifyResendSignature(opts: {
    rawBody: string;
    secret: string;
    id?: string;
    timestamp?: string;
    signature?: string;
    /** Reject timestamps outside this window to blunt replay. Default 5 minutes. */
    toleranceSeconds?: number;
}): boolean {
    const { rawBody, secret, id, timestamp, signature } = opts;
    if (!secret || !id || !timestamp || !signature) return false;

    // Replay window. Svix sends seconds since epoch.
    const tolerance = opts.toleranceSeconds ?? 300;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return false;
    if (Math.abs(Date.now() / 1000 - ts) > tolerance) return false;

    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const expected = createHmac('sha256', key)
        .update(`${id}.${timestamp}.${rawBody}`)
        .digest('base64');

    // Header format: "v1,<sig> v1,<sig2>" — compare against each.
    for (const part of signature.split(' ')) {
        const provided = part.includes(',') ? part.slice(part.indexOf(',') + 1) : part;
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length === b.length && timingSafeEqual(a, b)) return true;
    }
    return false;
}
