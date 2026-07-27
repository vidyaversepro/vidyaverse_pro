import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface TranscriptResult {
  text: string | null;
  provider: 'bhashini' | 'azure' | 'none';
  skipped?: boolean;
}

/**
 * Transcribe an inbound WhatsApp voice note. Bhashini (Indian-language ASR) is
 * preferred; Azure Speech is the fallback. With no creds (dev) it no-ops so the
 * pipeline degrades gracefully. Ported conceptually from Urmi's voice handler.
 */
export async function transcribeAudio(
  audio: Buffer | null,
  opts: { language?: string; mimeType?: string } = {},
): Promise<TranscriptResult> {
  if (!audio || audio.length === 0) return { text: null, provider: 'none', skipped: true };

  if (env.BHASHINI_API_KEY && env.BHASHINI_PIPELINE_ID) {
    try {
      const text = await transcribeBhashini(audio, opts);
      if (text) return { text, provider: 'bhashini' };
    } catch (err) {
      logger.warn({ err }, '[voice] Bhashini ASR failed; trying Azure');
    }
  }

  if (env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION) {
    try {
      const text = await transcribeAzure(audio, opts);
      if (text) return { text, provider: 'azure' };
    } catch (err) {
      logger.warn({ err }, '[voice] Azure ASR failed');
    }
  }

  logger.warn('[voice] no ASR provider configured — skipping transcription');
  return { text: null, provider: 'none', skipped: true };
}

/** Bhashini (Dhruva) inference pipeline ASR. Requires an inference key + pipeline id. */
async function transcribeBhashini(audio: Buffer, opts: { language?: string }): Promise<string | null> {
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: env.BHASHINI_API_KEY as string },
    body: JSON.stringify({
      pipelineTasks: [
        { taskType: 'asr', config: { language: { sourceLanguage: opts.language ?? 'hi' } } },
      ],
      inputData: { audio: [{ audioContent: audio.toString('base64') }] },
      pipelineId: env.BHASHINI_PIPELINE_ID,
    }),
  });
  if (!res.ok) throw new Error(`Bhashini ${res.status}`);
  const data = (await res.json()) as { pipelineResponse?: Array<{ output?: Array<{ source?: string }> }> };
  return data.pipelineResponse?.[0]?.output?.[0]?.source ?? null;
}

/** Azure Speech short-audio REST STT. */
async function transcribeAzure(audio: Buffer, opts: { language?: string; mimeType?: string }): Promise<string | null> {
  const lang = opts.language === 'en' ? 'en-IN' : 'hi-IN';
  const url = `https://${env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY as string,
      'Content-Type': opts.mimeType ?? 'audio/ogg; codecs=opus',
      Accept: 'application/json',
    },
    body: new Uint8Array(audio),
  });
  if (!res.ok) throw new Error(`Azure ${res.status}`);
  const data = (await res.json()) as { DisplayText?: string; RecognitionStatus?: string };
  return data.DisplayText ?? null;
}
