/**
 * Institute curriculum scope for the shared cross-repo taxonomy — which subjects
 * (board/class/degree/exam nodes) an institute's curriculum actually covers, so a
 * student's PDLMS/DigiClassroom retrieval can be pre-scoped to it by default.
 *
 * Deliberately FAIL OPEN, unlike every other cache in this codebase
 * (capabilities/service.ts, academic/service.ts both fail closed after the stale
 * ceiling). Those gate access or identity — failing closed there is the safe
 * direction. This only NARROWS retrieval; failing closed here would mean a Vidyaverse
 * hiccup takes down book search/chat for every institutional student, which is a far
 * worse outcome than a student briefly seeing the unscoped global catalog. So: any
 * failure to resolve, at any point, degrades to "no scope" (empty array), never an
 * error the caller has to handle.
 */
import { cache } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';

export const FRESH_TTL_SECONDS = 5 * 60;
export const cacheKey = (userId: string) => `curr-scope:${userId}`;

interface CacheEnvelope {
    cachedAt: number;
    nodeIds: string[];
}

/**
 * The calling student's own scope, resolved via their Student->Institution link —
 * the same resolution academic/service.ts already uses for Class/Section, so a
 * federated user's institution is never in question here.
 *
 * Always resolves to SOMETHING — an empty array for "no Student record" and for
 * "source unreachable" alike, since both mean the same thing to a caller: apply no
 * taxonomy filter.
 */
export async function getScopeNodeIdsForUser(userId: string, now = new Date()): Promise<string[]> {
    const key = cacheKey(userId);
    const cached = await cache.get<CacheEnvelope>(key);
    const ageSeconds = cached ? (now.getTime() - cached.cachedAt) / 1000 : Infinity;

    if (cached && ageSeconds < FRESH_TTL_SECONDS) {
        return cached.nodeIds;
    }

    try {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { institutionId: true },
        });

        const nodeIds = student
            ? (
                  await prisma.institutionCurriculumScope.findMany({
                      where: { institutionId: student.institutionId },
                      select: { taxonomyNodeId: true },
                  })
              ).map((r) => r.taxonomyNodeId)
            : [];

        await cache.set(key, { cachedAt: now.getTime(), nodeIds }, FRESH_TTL_SECONDS);
        return nodeIds;
    } catch (err) {
        logger.warn(
            `[curriculum-scope] source unreachable for ${userId}, failing OPEN (no taxonomy filter applied): ${(err as Error).message}`,
        );
        // A stale-but-known answer is still better than dropping a real scope down to
        // "unfiltered" for no reason — but if there's nothing cached either, empty
        // (unfiltered) is exactly the right fallback, not an error.
        return cached?.nodeIds ?? [];
    }
}

export async function invalidateUser(userId: string): Promise<void> {
    await cache.del(cacheKey(userId));
}

/** Called when an admin changes an institute's scope — drops every affected
 *  student's cache so the change is near-instant rather than waiting out the TTL. */
export async function invalidateInstitution(institutionId: string): Promise<number> {
    const students = await prisma.student.findMany({
        where: { institutionId },
        select: { userId: true },
    });
    const linkedUserIds = students.map((s) => s.userId).filter((id): id is string => id !== null);
    await Promise.all(linkedUserIds.map((userId) => invalidateUser(userId)));
    return linkedUserIds.length;
}

// ── Admin CRUD ──────────────────────────────────────────────────────────────────

export async function getInstitutionScope(institutionId: string): Promise<string[]> {
    const rows = await prisma.institutionCurriculumScope.findMany({
        where: { institutionId },
        select: { taxonomyNodeId: true },
    });
    return rows.map((r) => r.taxonomyNodeId);
}

/** Replace the full scope for an institute in one call — same replace-the-set shape
 *  as the Taxonomy Service's book-tagging endpoint, for the same reason: a picker
 *  UI naturally produces "here is everything the scope should be now". */
export async function setInstitutionScope(
    institutionId: string,
    taxonomyNodeIds: string[],
    createdBy?: string,
): Promise<string[]> {
    await prisma.$transaction([
        prisma.institutionCurriculumScope.deleteMany({ where: { institutionId } }),
        ...(taxonomyNodeIds.length > 0
            ? [
                  prisma.institutionCurriculumScope.createMany({
                      data: taxonomyNodeIds.map((taxonomyNodeId) => ({ institutionId, taxonomyNodeId, createdBy })),
                  }),
              ]
            : []),
    ]);

    const affected = await invalidateInstitution(institutionId);
    logger.info(`[curriculum-scope] set scope for institution ${institutionId} (${taxonomyNodeIds.length} nodes), invalidated ${affected} students`);

    return taxonomyNodeIds;
}
