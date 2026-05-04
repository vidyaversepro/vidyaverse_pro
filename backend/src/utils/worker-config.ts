/**
 * Resource-aware worker configuration.
 *
 * Reads from environment with sensible defaults based on the host machine's
 * CPU/memory. Values are capped to prevent accidental overloading.
 */
import * as os from 'os';
import { logger } from './logger.js';

const cpuCount = os.cpus().length;
const totalMemGB = os.totalmem() / (1024 ** 3);

/**
 * Sensible ceiling: one Puppeteer tab needs ~80-120 MB.
 * On a 4 GB machine that's roughly 12 concurrent tabs max — leave 40 % for
 * the OS / Node main heap.
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function envInt(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

// ── Puppeteer Pool ──────────────────────────────────────────────────────────

/** How many browser instances to keep alive simultaneously */
export const PUPPETEER_POOL_SIZE = envInt(
    'PUPPETEER_POOL_SIZE',
    clamp(Math.floor(cpuCount / 2), 1, 4)
);

/** Number of jobs after which a browser instance is recycled */
export const PUPPETEER_MAX_JOBS = envInt('PUPPETEER_MAX_JOBS', 100);

// ── ID Card Worker ──────────────────────────────────────────────────────────

/** How many bulk batches the worker can process in parallel */
export const ID_CARD_WORKER_CONCURRENCY = envInt(
    'ID_CARD_WORKER_CONCURRENCY',
    clamp(Math.floor(cpuCount / 2), 1, 4)
);

/** How many students within one batch are rendered concurrently (Puppeteer tabs) */
export const ID_CARD_PUPPETEER_CONCURRENCY = envInt(
    'ID_CARD_PUPPETEER_CONCURRENCY',
    clamp(Math.floor(totalMemGB * 1.5), 2, 10)
);

/** Per-page render timeout (ms) — includes network + PDF generation */
export const ID_CARD_RENDER_TIMEOUT_MS = envInt('ID_CARD_RENDER_TIMEOUT_MS', 30_000);

/** Maximum total duration for an entire bulk batch job (ms) — 4 hours */
export const ID_CARD_BULK_TIMEOUT_MS = envInt('ID_CARD_BULK_TIMEOUT_MS', 4 * 60 * 60 * 1_000);

// ── Log resolved config on first import ─────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
    logger.info({
        cpuCount,
        totalMemGB: totalMemGB.toFixed(1),
        PUPPETEER_POOL_SIZE,
        PUPPETEER_MAX_JOBS,
        ID_CARD_WORKER_CONCURRENCY,
        ID_CARD_PUPPETEER_CONCURRENCY,
        ID_CARD_RENDER_TIMEOUT_MS,
        ID_CARD_BULK_TIMEOUT_MS,
    }, 'Worker config resolved');
}
