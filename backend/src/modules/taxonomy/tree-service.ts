/**
 * The classification tree — read/write for TaxonomyNode.
 *
 * Reads are cached (the tree changes rarely — new boards/exams/subjects, not every
 * request) so that PDLMS/DCP polling `GET /tree` to render a tagging picker doesn't
 * hit Postgres on every call. Writes are low-volume (Vidyaverse super-admin only) and
 * go straight to Postgres, invalidating the relevant cache entries.
 *
 * Unlike entitlements' capability cache, this service does NOT implement a fail-open
 * policy itself — that decision belongs to each RP's own client (lib/taxonomy/client.ts
 * in PDLMS/DCP), which decides what "the tree is unreachable" should mean for ITS
 * caller (for retrieval-scoping, it should mean "no filter"; for an admin tagging UI,
 * it should mean "show an error"). This service just answers or throws.
 */
// Type-only — erased at compile time, so this carries none of the "runtime import of
// the generated client can take the whole backend down at boot" risk documented in
// client.ts. Used only to satisfy Prisma's strict Json input typing below.
import type { Prisma } from '../../../node_modules/.prisma/taxonomy-client/index.js';
import { cache } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { taxonomyDb } from './client.js';
import type { TaxonomyDomain, TaxonomyNodeDTO, TaxonomyNodeType } from './types.js';

/** Tree structure changes rarely; cache aggressively but not forever. */
const TREE_TTL_SECONDS = 10 * 60;
const treeCacheKey = (domain: TaxonomyDomain) => `taxonomy:tree:${domain}`;
const nodeCacheKey = (id: string) => `taxonomy:node:${id}`;

export class TaxonomyNotFoundError extends Error {
    readonly statusCode = 404;
    constructor(id: string) {
        super(`Taxonomy node ${id} not found`);
        this.name = 'TaxonomyNotFoundError';
    }
}

interface FlatNode {
    id: string;
    domain: string;
    nodeType: string;
    name: string;
    slug: string;
    parentId: string | null;
    ancestorIds: string[];
    sortOrder: number;
    isActive: boolean;
    metadata: unknown;
}

function toDTO(n: FlatNode): TaxonomyNodeDTO {
    return {
        id: n.id,
        domain: n.domain as TaxonomyDomain,
        nodeType: n.nodeType as TaxonomyNodeType,
        name: n.name,
        slug: n.slug,
        parentId: n.parentId,
        ancestorIds: n.ancestorIds,
        sortOrder: n.sortOrder,
        isActive: n.isActive,
        metadata: (n.metadata as Record<string, unknown> | null) ?? null,
    };
}

function nest(flat: TaxonomyNodeDTO[]): TaxonomyNodeDTO[] {
    const byId = new Map(flat.map((n) => [n.id, { ...n, children: [] as TaxonomyNodeDTO[] }]));
    const roots: TaxonomyNodeDTO[] = [];
    for (const node of byId.values()) {
        if (node.parentId && byId.has(node.parentId)) {
            byId.get(node.parentId)!.children!.push(node);
        } else {
            roots.push(node);
        }
    }
    const bySort = (a: TaxonomyNodeDTO, b: TaxonomyNodeDTO) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    const sortTree = (nodes: TaxonomyNodeDTO[]) => {
        nodes.sort(bySort);
        for (const n of nodes) if (n.children?.length) sortTree(n.children);
    };
    sortTree(roots);
    return roots;
}

/** Full subtree for a domain, nested. */
export async function getTree(domain: TaxonomyDomain): Promise<TaxonomyNodeDTO[]> {
    const key = treeCacheKey(domain);
    const cached = await cache.get<TaxonomyNodeDTO[]>(key);
    if (cached) return cached;

    const rows = await taxonomyDb().taxonomyNode.findMany({
        where: { domain, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const flat = rows.map((r) => toDTO(r as unknown as FlatNode));
    const tree = nest(flat);
    await cache.set(key, tree, TREE_TTL_SECONDS);
    return tree;
}

/** A single node, flat (no children populated). */
export async function getNode(id: string): Promise<TaxonomyNodeDTO> {
    const key = nodeCacheKey(id);
    const cached = await cache.get<TaxonomyNodeDTO>(key);
    if (cached) return cached;

    const row = await taxonomyDb().taxonomyNode.findUnique({ where: { id } });
    if (!row) throw new TaxonomyNotFoundError(id);
    const dto = toDTO(row as unknown as FlatNode);
    await cache.set(key, dto, TREE_TTL_SECONDS);
    return dto;
}

async function invalidateDomain(domain: TaxonomyDomain): Promise<void> {
    await cache.del(treeCacheKey(domain));
}

export interface CreateNodeInput {
    domain: TaxonomyDomain;
    nodeType: TaxonomyNodeType;
    name: string;
    slug: string;
    parentId?: string | null;
    sortOrder?: number;
    metadata?: Record<string, unknown> | null;
}

export async function createNode(input: CreateNodeInput): Promise<TaxonomyNodeDTO> {
    const db = taxonomyDb();

    let ancestorIds: string[] = [];
    if (input.parentId) {
        const parent = await db.taxonomyNode.findUnique({ where: { id: input.parentId } });
        if (!parent) throw new TaxonomyNotFoundError(input.parentId);
        if (parent.domain !== input.domain) {
            throw new Error(`Parent node belongs to domain '${parent.domain}', not '${input.domain}'`);
        }
        ancestorIds = [...parent.ancestorIds, parent.id];
    }

    const created = await db.taxonomyNode.create({
        data: {
            domain: input.domain,
            nodeType: input.nodeType,
            name: input.name,
            slug: input.slug,
            parentId: input.parentId ?? null,
            ancestorIds,
            sortOrder: input.sortOrder ?? 0,
            metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
    });

    await invalidateDomain(input.domain);
    logger.info(`[taxonomy] created node ${created.id} (${input.domain}/${input.nodeType}/${input.slug})`);
    return toDTO(created as unknown as FlatNode);
}

export interface UpdateNodeInput {
    name?: string;
    slug?: string;
    sortOrder?: number;
    isActive?: boolean;
    metadata?: Record<string, unknown> | null;
}

export async function updateNode(id: string, input: UpdateNodeInput): Promise<TaxonomyNodeDTO> {
    const db = taxonomyDb();
    const existing = await db.taxonomyNode.findUnique({ where: { id } });
    if (!existing) throw new TaxonomyNotFoundError(id);

    const updated = await db.taxonomyNode.update({
        where: { id },
        data: {
            name: input.name,
            slug: input.slug,
            sortOrder: input.sortOrder,
            isActive: input.isActive,
            // Prisma's nullable-Json update type wants a `NullableJsonNullValueInput`
            // sentinel rather than plain `null` for the clear case — the runtime
            // accepts a plain JS null/object fine, this cast is purely to satisfy that
            // stricter compile-time union without pulling in the sentinel value (which
            // would mean a runtime import of the generated client — see the note atop
            // this file's Prisma type import).
            metadata: (input.metadata === undefined ? undefined : input.metadata) as
                | Prisma.InputJsonValue
                | undefined,
        },
    });

    await Promise.all([invalidateDomain(existing.domain as TaxonomyDomain), cache.del(nodeCacheKey(id))]);
    return toDTO(updated as unknown as FlatNode);
}

/** Cascades to children and links via the schema's onDelete: Cascade. */
export async function deleteNode(id: string): Promise<void> {
    const db = taxonomyDb();
    const existing = await db.taxonomyNode.findUnique({ where: { id } });
    if (!existing) throw new TaxonomyNotFoundError(id);

    await db.taxonomyNode.delete({ where: { id } });
    await Promise.all([invalidateDomain(existing.domain as TaxonomyDomain), cache.del(nodeCacheKey(id))]);
    logger.info(`[taxonomy] deleted node ${id} and its descendants/links`);
}
