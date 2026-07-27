import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { buildComponents } from './template-mapper.js';

/**
 * Thin WhatsApp Cloud API client. Framework-agnostic — no Fastify, no Prisma.
 * The access token is platform-level (env); the phone number id is per-institution.
 * Ported from Urmi's outbox worker send path.
 */
export interface SendTemplateInput {
  phoneNumberId: string;
  toWhatsappNumber: string;
  templateName: string;
  languageCode: string;
  placeholders: Record<string, string[]> | null;
  variables: Record<string, string> | null;
}

export interface SendTemplateResult {
  ok: boolean;
  waMessageId?: string;
  error?: string;
  /** True when creds are absent and the send was skipped (local dev). */
  skipped?: boolean;
}

export async function sendTemplateMessage(input: SendTemplateInput): Promise<SendTemplateResult> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !input.phoneNumberId) {
    logger.warn('[whatsapp] Missing access token or phoneNumberId — skipping send (local dev).');
    return { ok: true, skipped: true };
  }

  const components = buildComponents({ placeholders: input.placeholders }, input.variables);

  const payload = {
    messaging_product: 'whatsapp',
    to: input.toWhatsappNumber.replace('+', ''),
    type: 'template',
    template: {
      name: input.templateName,
      language: { code: input.languageCode },
      components,
    },
  };

  const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${input.phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: unknown;
    };

    if (!res.ok) {
      return { ok: false, error: JSON.stringify(data) };
    }

    return { ok: true, waMessageId: data.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Send a free-text WhatsApp session message. Only valid inside the 24h service
 * window (i.e. as a reply to an inbound message). Used by the inbound pipeline.
 */
export async function sendTextMessage(
  phoneNumberId: string,
  toWhatsappNumber: string,
  text: string,
): Promise<SendTemplateResult> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !phoneNumberId) {
    logger.warn('[whatsapp] Missing creds — skipping text reply (local dev).');
    return { ok: true, skipped: true };
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: toWhatsappNumber.replace('+', ''),
    type: 'text',
    text: { body: text },
  };
  const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { messages?: Array<{ id: string }>; error?: unknown };
    if (!res.ok) return { ok: false, error: JSON.stringify(data) };
    return { ok: true, waMessageId: data.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
