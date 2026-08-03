/**
 * Academic-profile service — resolves a federated user's Class/Section/Stream.
 *
 * Reads Vidyaverse's own ERP tables (Student → Section → Class/Stream) directly, not a
 * second datasource — unlike entitlements, this data has exactly one owner and no
 * cross-app union to compute, so there is nothing to extract.
 *
 * Cache policy mirrors capabilities/service.ts for operational consistency, even
 * though class assignments change far less often than subscriptions: brief hub
 * hiccups stay invisible, sustained ones fail closed rather than serve indefinitely.
 */
import { cache } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';
import type { AcademicProfile } from './types.js';

export const FRESH_TTL_SECONDS = 5 * 60;
export const STALE_CEILING_SECONDS = 30 * 60;
export const cacheKey = (userId: string) => `acad:${userId}`;

interface CacheEnvelope {
    cachedAt: number;
    /** null is a valid, cacheable answer — "this user has no Student record". */
    payload: SerialisedProfile | null;
}

type SerialisedProfile = Omit<AcademicProfile, 'resolvedAt'> & { resolvedAt: string };

function revive(p: SerialisedProfile): AcademicProfile {
    return { ...p, resolvedAt: new Date(p.resolvedAt) };
}

export class AcademicProfileUnavailableError extends Error {
    readonly statusCode = 503;
    constructor(message = 'Academic profile is temporarily unavailable. Please try again shortly.') {
        super(message);
        this.name = 'AcademicProfileUnavailableError';
    }
}

/** Resolve straight from Postgres, bypassing the cache, and repopulate it. */
export async function resolveFromSource(
    userId: string,
    now = new Date(),
): Promise<AcademicProfile | null> {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: {
            institutionId: true,
            academicYear: true,
            institution: { select: { name: true } },
            section: {
                select: {
                    id: true,
                    name: true,
                    class: { select: { id: true, name: true } },
                    stream: { select: { id: true, name: true } },
                },
            },
        },
    });

    const resolved: AcademicProfile | null = student
        ? {
            userId,
            institutionId: student.institutionId,
            institutionName: student.institution.name,
            classId: student.section.class.id,
            className: student.section.class.name,
            streamId: student.section.stream?.id ?? null,
            streamName: student.section.stream?.name ?? null,
            sectionId: student.section.id,
            sectionName: student.section.name,
            academicYear: student.academicYear,
            resolvedAt: now,
        }
        : null;

    const envelope: CacheEnvelope = {
        cachedAt: now.getTime(),
        payload: resolved ? { ...resolved, resolvedAt: resolved.resolvedAt.toISOString() } : null,
    };
    await cache.set(cacheKey(userId), envelope, STALE_CEILING_SECONDS);

    return resolved;
}

/**
 * Resolve a user's academic profile, honouring the cache policy above.
 *
 * Returns null when the user genuinely has no Student record (not a student, or not
 * yet linked) — that is a valid answer, not an error.
 *
 * @throws AcademicProfileUnavailableError when the source is unreachable and no
 *         cached answer is young enough to serve.
 */
export async function getAcademicProfile(
    userId: string,
    now = new Date(),
): Promise<AcademicProfile | null> {
    const key = cacheKey(userId);
    const cached = await cache.get<CacheEnvelope>(key);
    const ageSeconds = cached ? (now.getTime() - cached.cachedAt) / 1000 : Infinity;

    if (cached && ageSeconds < FRESH_TTL_SECONDS) {
        return cached.payload ? revive(cached.payload) : null;
    }

    try {
        return await resolveFromSource(userId, now);
    } catch (err) {
        const reason = (err as Error).message;

        if (cached && ageSeconds < STALE_CEILING_SECONDS) {
            logger.warn(
                `[academic] source unreachable, serving stale for ${userId} (age ${Math.round(ageSeconds)}s): ${reason}`,
            );
            return cached.payload ? revive(cached.payload) : null;
        }

        logger.error(
            `[academic] source unreachable and no usable cache for ${userId} — failing closed: ${reason}`,
        );
        throw new AcademicProfileUnavailableError();
    }
}

/**
 * Drop a user's cached answer so the next read re-resolves.
 *
 * Called when a Student's section/class changes (promotion, section transfer) so the
 * update is near-instant instead of waiting out the TTL.
 */
export async function invalidate(userId: string): Promise<void> {
    await cache.del(cacheKey(userId));
    logger.info(`[academic] invalidated cache for ${userId}`);
}
