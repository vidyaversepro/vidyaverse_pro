import { logger } from './logger.js';

/**
 * Lightweight circuit breaker for external service calls (SMTP, APIs, etc.).
 *
 * States:
 *   CLOSED  → requests flow through normally
 *   OPEN    → requests are immediately rejected (fail-fast)
 *   HALF_OPEN → a single probe request is allowed through to test recovery
 *
 * Usage:
 *   const emailBreaker = new CircuitBreaker('smtp', { failureThreshold: 3 });
 *   const result = await emailBreaker.execute(() => transporter.sendMail(opts));
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
    /** Number of consecutive failures before opening the circuit (default: 5) */
    failureThreshold?: number;
    /** Milliseconds to wait before allowing a probe request (default: 60_000) */
    resetTimeoutMs?: number;
}

export class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failureCount = 0;
    private lastFailureTime = 0;

    private readonly name: string;
    private readonly failureThreshold: number;
    private readonly resetTimeoutMs: number;

    constructor(name: string, options: CircuitBreakerOptions = {}) {
        this.name = name;
        this.failureThreshold = options.failureThreshold ?? 5;
        this.resetTimeoutMs = options.resetTimeoutMs ?? 60_000;
    }

    /** Execute a function through the circuit breaker. */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
                this.state = 'HALF_OPEN';
                logger.info(`[CircuitBreaker:${this.name}] Moving to HALF_OPEN — allowing probe request`);
            } else {
                throw new Error(
                    `[CircuitBreaker:${this.name}] Circuit is OPEN. Service unavailable — retry after ${Math.ceil((this.resetTimeoutMs - (Date.now() - this.lastFailureTime)) / 1000)}s.`
                );
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        if (this.state === 'HALF_OPEN') {
            logger.info(`[CircuitBreaker:${this.name}] Probe succeeded — circuit CLOSED`);
        }
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            logger.warn(
                `[CircuitBreaker:${this.name}] ${this.failureCount} consecutive failures — circuit OPENED for ${this.resetTimeoutMs / 1000}s`
            );
        }
    }

    /** Current state (useful for health checks). */
    getState(): { name: string; state: CircuitState; failureCount: number } {
        return { name: this.name, state: this.state, failureCount: this.failureCount };
    }
}
