/**
 * Invalidation-webhook signing.
 *
 * An unsigned or replayable invalidation endpoint would let anyone flush another
 * user's cached entitlements at will — cheap to abuse and awkward to notice. These
 * tests pin the rules the relying parties must implement identically.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    signPayload,
    verifySignature,
} from '../../src/modules/entitlements/capabilities/webhook-dispatch.js';

const SECRET = 'test-webhook-secret-value';
const body = JSON.stringify({ userIds: ['user-1'], reason: 'subscription.created' });
const nowSeconds = () => Math.floor(Date.now() / 1000).toString();

afterEach(() => {
    vi.useRealTimers();
});

describe('signPayload', () => {
    it('is deterministic for the same inputs', () => {
        expect(signPayload(body, '1000', SECRET)).toBe(signPayload(body, '1000', SECRET));
    });

    it('changes when the body changes', () => {
        expect(signPayload(body, '1000', SECRET)).not.toBe(signPayload('{}', '1000', SECRET));
    });

    it('changes when the timestamp changes', () => {
        // The timestamp is inside the signed material, which is what stops a captured
        // request being replayed with a fresh header.
        expect(signPayload(body, '1000', SECRET)).not.toBe(signPayload(body, '1001', SECRET));
    });

    it('changes when the secret changes', () => {
        expect(signPayload(body, '1000', SECRET)).not.toBe(signPayload(body, '1000', 'other'));
    });
});

describe('verifySignature', () => {
    it('accepts a correctly signed, current request', () => {
        const timestamp = nowSeconds();
        const signature = signPayload(body, timestamp, SECRET);
        expect(verifySignature({ body, timestamp, signature, secret: SECRET })).toBe(true);
    });

    it('rejects a forged signature', () => {
        expect(
            verifySignature({ body, timestamp: nowSeconds(), signature: 'deadbeef', secret: SECRET }),
        ).toBe(false);
    });

    it('rejects a signature made with the wrong secret', () => {
        const timestamp = nowSeconds();
        const signature = signPayload(body, timestamp, 'attacker-secret');
        expect(verifySignature({ body, timestamp, signature, secret: SECRET })).toBe(false);
    });

    it('rejects a tampered body even when the signature is otherwise valid', () => {
        const timestamp = nowSeconds();
        const signature = signPayload(body, timestamp, SECRET);
        const tampered = JSON.stringify({ userIds: ['someone-else'], reason: 'x' });
        expect(verifySignature({ body: tampered, timestamp, signature, secret: SECRET })).toBe(false);
    });

    it('rejects a replayed request once outside the tolerance window', () => {
        const timestamp = String(Math.floor(Date.now() / 1000) - 3600);
        const signature = signPayload(body, timestamp, SECRET);
        expect(verifySignature({ body, timestamp, signature, secret: SECRET })).toBe(false);
    });

    it('rejects a timestamp from the future beyond tolerance', () => {
        // Guards against a clock-skew bypass in one direction only.
        const timestamp = String(Math.floor(Date.now() / 1000) + 3600);
        const signature = signPayload(body, timestamp, SECRET);
        expect(verifySignature({ body, timestamp, signature, secret: SECRET })).toBe(false);
    });

    it('accepts a request inside the tolerance window', () => {
        const timestamp = String(Math.floor(Date.now() / 1000) - 120);
        const signature = signPayload(body, timestamp, SECRET);
        expect(verifySignature({ body, timestamp, signature, secret: SECRET })).toBe(true);
    });

    it('rejects missing headers rather than treating them as empty', () => {
        expect(verifySignature({ body, timestamp: undefined, signature: 'x', secret: SECRET })).toBe(false);
        expect(verifySignature({ body, timestamp: nowSeconds(), signature: undefined, secret: SECRET })).toBe(false);
    });

    it('rejects a non-numeric timestamp', () => {
        expect(
            verifySignature({ body, timestamp: 'not-a-number', signature: 'x', secret: SECRET }),
        ).toBe(false);
    });
});
