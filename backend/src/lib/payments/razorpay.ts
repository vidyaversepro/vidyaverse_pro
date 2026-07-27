import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const RZP_API = 'https://api.razorpay.com/v1';

export interface PaymentLinkInput {
  invoiceId: string;
  amountPaise: number;
  description: string;
  customerName: string;
  customerContact: string;
  guardianId?: string;
  callbackUrl?: string;
}

export interface PaymentLinkResult {
  ok: boolean;
  skipped?: boolean;
  shortUrl?: string;
  linkId?: string;
  error?: string;
}

/**
 * Create a Razorpay Payment Link (short_url) suitable for a WhatsApp button.
 * Dependency-free (REST + Basic auth). With no creds it returns a dev placeholder
 * so the fee→reminder flow is testable locally, mirroring the WhatsApp send skip.
 */
export async function createRazorpayPaymentLink(input: PaymentLinkInput): Promise<PaymentLinkResult> {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    logger.warn('[razorpay] no API creds — returning dev placeholder payment link');
    return { ok: true, skipped: true, shortUrl: `https://rzp.example/dev/${input.invoiceId}`, linkId: `dev_${input.invoiceId}` };
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`${RZP_API}/payment_links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: 'INR',
        accept_partial: false,
        description: input.description,
        customer: { name: input.customerName, contact: input.customerContact },
        notify: { sms: false, email: false },
        reminder_enable: false,
        notes: { invoice_id: input.invoiceId, guardian_id: input.guardianId ?? '' },
        ...(input.callbackUrl ? { callback_url: input.callbackUrl, callback_method: 'get' } : {}),
      }),
    });
    const data = (await res.json()) as { id?: string; short_url?: string; [k: string]: unknown };
    if (!res.ok) return { ok: false, error: JSON.stringify(data) };
    return { ok: true, shortUrl: data.short_url, linkId: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Verify a Razorpay webhook HMAC-SHA256 signature against the raw request body. */
export function verifyRazorpaySignature(rawBody: string, signature: string | undefined, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
