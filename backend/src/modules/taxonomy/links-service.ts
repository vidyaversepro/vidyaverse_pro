/**
 * Which taxonomy nodes a book (in either app) is tagged onto.
 *
 * Low-volume admin writes — tagging a book happens once per catalog change, not per
 * request — so this deliberately has no cache, unlike tree-service. Reads always hit
 * Postgres directly.
 */
import { taxonomyDb } from './client.js';
import { getNode, TaxonomyNotFoundError } from './tree-service.js';
import type { BookTaxonomyLinkDTO, SetBookTaxonomyLinksInput, TaxonomyApp } from './types.js';

export class InvalidLinksError extends Error {
    readonly statusCode = 400;
}

export async function getBookLinks(app: TaxonomyApp, bookId: string): Promise<BookTaxonomyLinkDTO[]> {
    const rows = await taxonomyDb().bookTaxonomyLink.findMany({
        where: { app, bookId },
        include: { node: true },
        orderBy: { createdAt: 'asc' },
    });

    return rows.map((r) => ({
        nodeId: r.nodeId,
        isPrimary: r.isPrimary,
        node: {
            id: r.node.id,
            name: r.node.name,
            slug: r.node.slug,
            nodeType: r.node.nodeType as BookTaxonomyLinkDTO['node']['nodeType'],
            domain: r.node.domain as BookTaxonomyLinkDTO['node']['domain'],
            ancestorIds: r.node.ancestorIds,
        },
    }));
}

/**
 * Replace the full set of taxonomy tags for a book in one call — the natural shape
 * for a tagging UI ("here is everything this book should be tagged as now"), and it
 * makes the "exactly one isPrimary" invariant easy to enforce without a partial
 * unique index (bookId is free-form text scoped by app, which Postgres partial
 * indexes handle awkwardly).
 */
export async function setBookLinks(
    app: TaxonomyApp,
    bookId: string,
    input: SetBookTaxonomyLinksInput,
): Promise<BookTaxonomyLinkDTO[]> {
    if (input.links.length === 0) {
        throw new InvalidLinksError('At least one taxonomy link is required.');
    }

    const primaryCount = input.links.filter((l) => l.isPrimary).length;
    if (primaryCount > 1) {
        throw new InvalidLinksError('At most one link may be marked isPrimary.');
    }

    // Confirm every node exists up front — a bad id should fail the whole write, not
    // leave a partially-applied tag set.
    for (const link of input.links) {
        try {
            await getNode(link.nodeId);
        } catch (err) {
            if (err instanceof TaxonomyNotFoundError) {
                throw new InvalidLinksError(`Taxonomy node ${link.nodeId} does not exist.`);
            }
            throw err;
        }
    }

    const db = taxonomyDb();
    await db.$transaction(async (tx) => {
        await tx.bookTaxonomyLink.deleteMany({ where: { app, bookId } });
        await tx.bookTaxonomyLink.createMany({
            data: input.links.map((l, i) => ({
                app,
                bookId,
                nodeId: l.nodeId,
                // First link becomes primary by default when the caller marks none —
                // a book should never end up with zero primary path.
                isPrimary: l.isPrimary ?? (primaryCount === 0 && i === 0),
            })),
        });
    });

    return getBookLinks(app, bookId);
}
