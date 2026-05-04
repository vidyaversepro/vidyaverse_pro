/**
 * Browser Pool — manages multiple Puppeteer browser instances for
 * concurrent rendering. Replaces the singleton in pdf-generator.ts.
 *
 * Features:
 *  - Configurable pool size (via worker-config.ts / env vars)
 *  - Automatic health checks before leasing
 *  - Auto-recycle after MAX_JOBS or MAX_AGE_MS to prevent memory leaks
 *  - Overflow browsers are NOT added to pool — closed on release
 *  - Graceful shutdown
 */
import puppeteer, { Browser } from 'puppeteer';
import { logger } from './logger.js';
import { PUPPETEER_POOL_SIZE, PUPPETEER_MAX_JOBS } from './worker-config.js';

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface PoolEntry {
    browser: Browser;
    jobCount: number;
    createdAt: number;
    inUse: boolean;
}

const pool: PoolEntry[] = [];
let initialized = false;

const LAUNCH_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--font-render-hinting=medium',
];

async function launchBrowser(): Promise<Browser> {
    return puppeteer.launch({
        headless: true,
        args: LAUNCH_ARGS,
    });
}

async function createEntry(): Promise<PoolEntry> {
    const browser = await launchBrowser();
    return {
        browser,
        jobCount: 0,
        createdAt: Date.now(),
        inUse: false,
    };
}

/**
 * Lightweight health check — browser.version() is a single IPC call.
 * Race against a 2s timeout to catch hung/zombie processes.
 */
async function isHealthy(entry: PoolEntry): Promise<boolean> {
    if (!entry.browser.isConnected()) return false;
    try {
        const p = entry.browser.version();
        const t = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000));
        await Promise.race([p, t]);
        return true;
    } catch {
        return false;
    }
}

function needsRecycle(entry: PoolEntry): boolean {
    return (
        entry.jobCount >= PUPPETEER_MAX_JOBS ||
        Date.now() - entry.createdAt > MAX_AGE_MS
    );
}

async function closeEntry(entry: PoolEntry): Promise<void> {
    try {
        await entry.browser.close();
    } catch {
        // ignore — browser may have crashed already
    }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Lazily initialize the pool (called on first acquire).
 */
async function ensurePool(): Promise<void> {
    if (initialized) return;
    initialized = true;
    logger.info({ size: PUPPETEER_POOL_SIZE }, 'Initializing browser pool');
    const entries = await Promise.all(
        Array.from({ length: PUPPETEER_POOL_SIZE }, () => createEntry())
    );
    pool.push(...entries);
    logger.info(`Browser pool initialized with ${pool.length} instances`);
}

/**
 * Acquire a healthy browser instance from the pool.
 * Retries up to 3 times with 500ms backoff.
 *
 * If all pool slots are busy after retries, creates a temporary overflow
 * browser that is NOT added to the pool. releaseBrowser() will close it
 * outright instead of returning it to the pool.
 */
export async function acquireBrowser(): Promise<Browser> {
    await ensurePool();

    // Try to find an available, healthy entry
    for (let attempt = 0; attempt < 3; attempt++) {
        for (let i = 0; i < pool.length; i++) {
            const entry = pool[i];
            if (entry.inUse) continue;

            // Recycle stale entries — wrapped in try/catch to recover the slot
            if (needsRecycle(entry)) {
                entry.inUse = true; // prevent concurrent access during async ops
                try {
                    logger.info({ index: i, jobCount: entry.jobCount }, 'Recycling browser instance');
                    await closeEntry(entry);
                    const newEntry = await createEntry();
                    newEntry.inUse = true;
                    pool[i] = newEntry;
                    return pool[i].browser;
                } catch (err) {
                    logger.error({ err, index: i }, 'Browser recycle failed — removing dead slot');
                    pool.splice(i, 1); // remove dead slot so pool doesn't count it
                    break; // restart the outer attempt loop with remaining slots
                }
            }

            // Health check
            if (await isHealthy(entry)) {
                entry.inUse = true;
                return entry.browser;
            }

            // Unhealthy — replace (also wrapped to recover the slot)
            try {
                logger.warn({ index: i }, 'Replacing unhealthy browser instance');
                await closeEntry(entry);
                const newEntry = await createEntry();
                newEntry.inUse = true;
                pool[i] = newEntry;
                return pool[i].browser;
            } catch (err) {
                logger.error({ err, index: i }, 'Browser replacement failed — removing dead slot');
                pool.splice(i, 1);
                break;
            }
        }

        // All in use — wait and retry
        await new Promise(r => setTimeout(r, 500));
    }

    // Fallback: create a temporary overflow instance.
    // NOT added to pool — releaseBrowser() will close it outright.
    logger.warn('Browser pool exhausted — creating temporary overflow instance');
    const overflowBrowser = await launchBrowser();
    return overflowBrowser;
}

/**
 * Release a browser instance back to the pool.
 * If the browser is not in the pool (overflow instance), close it outright.
 */
export function releaseBrowser(browser: Browser): void {
    const entry = pool.find(e => e.browser === browser);
    if (entry) {
        entry.inUse = false;
        entry.jobCount++;
    } else {
        // Overflow instance — close it outright, don't leak
        browser.close().catch(err =>
            logger.warn({ err }, 'Failed to close overflow browser instance')
        );
    }
}

/**
 * Close all browser instances (for graceful shutdown).
 */
export async function closePool(): Promise<void> {
    logger.info('Closing browser pool...');
    await Promise.allSettled(pool.map(e => closeEntry(e)));
    pool.length = 0;
    initialized = false;
    logger.info('Browser pool closed');
}
