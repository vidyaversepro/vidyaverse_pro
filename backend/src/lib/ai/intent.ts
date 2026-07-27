import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export type Intent =
  | 'fee_query'
  | 'attendance_query'
  | 'homework_query'
  | 'exam_query'
  | 'transport_query'
  | 'complaint'
  | 'absence_notification'
  | 'payment_proof'
  | 'document_submission'
  | 'greeting'
  | 'out_of_scope'
  | 'emergency';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  language: 'hi' | 'en' | 'hi-en';
  urgency: 'low' | 'normal' | 'high';
  source: 'claude' | 'rules';
}

const SYSTEM_PROMPT = `You classify WhatsApp messages from parents/guardians of a K-12 Indian school.
Messages may be English, Hindi, or Hinglish (Hindi in Latin script).
Return ONLY a JSON object: {"intent": <intent>, "confidence": 0-1, "language": "hi"|"en"|"hi-en", "urgency": "low"|"normal"|"high"}.
Intents: fee_query, attendance_query, homework_query, exam_query, transport_query, complaint, absence_notification, payment_proof, document_submission, greeting, emergency, out_of_scope.
Mark accidents/illness/safety as urgency "high" and intent "emergency".`;

/** Classify an inbound message. Uses Claude Haiku if a key is set, else rules. */
export async function classifyIntent(text: string, studentContext?: unknown): Promise<IntentResult> {
  if (env.ANTHROPIC_API_KEY) {
    try {
      return await classifyWithClaude(env.ANTHROPIC_API_KEY, text, studentContext);
    } catch (err) {
      logger.warn({ err }, '[ai] Claude intent classification failed; falling back to rules');
    }
  }
  return ruleBasedIntent(text);
}

async function classifyWithClaude(apiKey: string, text: string, studentContext?: unknown): Promise<IntentResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 200,
      system: SYSTEM_PROMPT + (studentContext ? `\nStudent context: ${JSON.stringify(studentContext)}` : ''),
      messages: [{ role: 'user', content: text }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const raw = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const json = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(json) as Omit<IntentResult, 'source'>;
  return { ...parsed, source: 'claude' };
}

/** Keyword classifier (English + Hindi + common Hinglish) for dev / fallback. */
export function ruleBasedIntent(text: string): IntentResult {
  const t = text.toLowerCase();
  const has = (re: RegExp) => re.test(t);
  const language: IntentResult['language'] = /[ऀ-ॿ]/.test(text)
    ? /[a-z]/i.test(text) ? 'hi-en' : 'hi'
    : 'en';

  let intent: Intent = 'out_of_scope';
  let urgency: IntentResult['urgency'] = 'normal';

  if (has(/accident|emergency|hospital|ambulance|दुर्घटना|आपातकाल|अस्पताल|बीमार|injured/)) {
    intent = 'emergency';
    urgency = 'high';
  } else if (has(/paid|payment done|receipt|screenshot|भुगतान कर|रसीद|पेमेंट हो/)) {
    intent = 'payment_proof';
  } else if (has(/fee|fees|due|फीस|शुल्क|बकाया|pay/)) {
    intent = 'fee_query';
  } else if (has(/absent|leave|not coming|छुट्टी|अनुपस्थित|नहीं आ/)) {
    intent = 'absence_notification';
  } else if (has(/attendance|present|हाज़िर|उपस्थि|हाजिर/)) {
    intent = 'attendance_query';
  } else if (has(/homework|syllabus|गृहकार्य|होमवर्क/)) {
    intent = 'homework_query';
  } else if (has(/exam|result|marks|परीक्षा|रिजल्ट|परिणाम|अंक/)) {
    intent = 'exam_query';
  } else if (has(/bus|transport|बस|वाहन/)) {
    intent = 'transport_query';
  } else if (has(/complain|complaint|शिकायत/)) {
    intent = 'complaint';
  } else if (has(/^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|good morning|good evening)\b/)) {
    intent = 'greeting';
  }

  return { intent, confidence: 0.5, language, urgency, source: 'rules' };
}
