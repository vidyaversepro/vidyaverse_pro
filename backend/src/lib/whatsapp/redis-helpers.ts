import { getRedisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';

/**
 * Redis-backed primitives for the WhatsApp rail, ported from Urmi:
 *  - service window: the free 24h reply window opened by an inbound message
 *  - digest buffer: per-guardian event list that batches into one daily send
 */

const SERVICE_WINDOW_TTL_SECONDS = 24 * 60 * 60;

export async function setServiceWindow(guardianId: string): Promise<void> {
  await getRedisClient().set(`service_window:${guardianId}`, 'active', 'EX', SERVICE_WINDOW_TTL_SECONDS);
}

export async function checkServiceWindow(guardianId: string): Promise<boolean> {
  const exists = await getRedisClient().exists(`service_window:${guardianId}`);
  return exists === 1;
}

export async function addToDigestBuffer(guardianId: string, event: object): Promise<void> {
  const key = `digest_buffer:${guardianId}`;
  const client = getRedisClient();
  // Single RPUSH (Urmi's original double-pushed — corrected here). Set the TTL
  // only when the buffer is first created so the window is measured from event 1.
  const length = await client.rpush(key, JSON.stringify(event));
  if (length === 1) {
    await client.expire(key, env.WHATSAPP_DIGEST_WINDOW_MINUTES * 60);
  }
}

export async function flushDigestBuffer<T = Record<string, unknown>>(guardianId: string): Promise<T[]> {
  const key = `digest_buffer:${guardianId}`;
  const client = getRedisClient();

  const pipeline = client.pipeline();
  pipeline.lrange(key, 0, -1);
  pipeline.del(key);
  const results = await pipeline.exec();

  if (!results || !results[0]) return [];
  const [error, data] = results[0];
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return (data as string[]).map((item) => JSON.parse(item) as T);
}

/** Enumerate guardians with a pending digest buffer (scanStream, not KEYS). */
export async function listDigestBufferGuardianIds(): Promise<string[]> {
  const client = getRedisClient();
  const ids: string[] = [];

  await new Promise<void>((resolve, reject) => {
    const stream = client.scanStream({ match: 'digest_buffer:*', count: 100 });
    stream.on('data', (keys: string[]) => {
      for (const k of keys) {
        const id = k.split(':')[1];
        if (id) ids.push(id);
      }
    });
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });

  return ids;
}
