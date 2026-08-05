/**
 * Taxonomy API — what the relying parties (PDLMS, DigiClassroom) and Vidyaverse's own
 * admin UI call.
 *
 * Every route here authenticates itself (service API key or admin session, see
 * service-auth.ts) rather than relying on the global session wall, so its prefix must
 * be added to PUBLIC_PREFIXES in src/index.ts — the same trap documented there for
 * the capabilities endpoint.
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticateServiceOrAdmin } from './service-auth.js';
import {
    createNode,
    deleteNode,
    getNode,
    getTree,
    TaxonomyNotFoundError,
    updateNode,
} from './tree-service.js';
import { getBookLinks, InvalidLinksError, setBookLinks } from './links-service.js';
import { TAXONOMY_APPS, TAXONOMY_DOMAINS, TAXONOMY_NODE_TYPES } from './types.js';

const treeQuerySchema = z.object({ domain: z.enum(TAXONOMY_DOMAINS) });

const createNodeSchema = z.object({
    domain: z.enum(TAXONOMY_DOMAINS),
    nodeType: z.enum(TAXONOMY_NODE_TYPES),
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
    parentId: z.string().uuid().nullish(),
    sortOrder: z.number().int().optional(),
    metadata: z.record(z.unknown()).nullish(),
});

const updateNodeSchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.unknown()).nullish(),
});

const setLinksSchema = z.object({
    links: z
        .array(z.object({ nodeId: z.string().uuid(), isPrimary: z.boolean().optional() }))
        .min(1),
});

function handleKnownErrors(err: unknown, reply: import('fastify').FastifyReply) {
    if (err instanceof TaxonomyNotFoundError) {
        return reply.status(404).send({ success: false, error: err.message });
    }
    if (err instanceof InvalidLinksError) {
        return reply.status(400).send({ success: false, error: err.message });
    }
    throw err;
}

const taxonomyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', authenticateServiceOrAdmin);

    /** Full nested subtree for one domain. */
    fastify.get('/tree', async (request, reply) => {
        const parsed = treeQuerySchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                error: `query parameter 'domain' must be one of: ${TAXONOMY_DOMAINS.join(', ')}`,
            });
        }
        const tree = await getTree(parsed.data.domain);
        return reply.send({ success: true, data: tree });
    });

    fastify.get('/nodes/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const node = await getNode(id);
            return reply.send({ success: true, data: node });
        } catch (err) {
            return handleKnownErrors(err, reply);
        }
    });

    /** Vidyaverse super-admin only in practice — service API keys are meant for
     *  reads/tagging, not tree authoring, though the auth hook does not distinguish
     *  (a leaked API key granting write access to the classification tree is a much
     *  smaller blast radius than granting it capabilities admin, so this is accepted
     *  rather than building a second permission tier for Phase 1). */
    fastify.post('/nodes', async (request, reply) => {
        const parsed = createNodeSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ success: false, error: parsed.error.message });
        }
        try {
            const node = await createNode(parsed.data);
            return reply.status(201).send({ success: true, data: node });
        } catch (err) {
            return handleKnownErrors(err, reply);
        }
    });

    fastify.patch('/nodes/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const parsed = updateNodeSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ success: false, error: parsed.error.message });
        }
        try {
            const node = await updateNode(id, parsed.data);
            return reply.send({ success: true, data: node });
        } catch (err) {
            return handleKnownErrors(err, reply);
        }
    });

    fastify.delete('/nodes/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await deleteNode(id);
            return reply.status(204).send();
        } catch (err) {
            return handleKnownErrors(err, reply);
        }
    });

    /** Which nodes a book is tagged onto. */
    fastify.get('/books/:app/:bookId/links', async (request, reply) => {
        const { app, bookId } = request.params as { app: string; bookId: string };
        if (!TAXONOMY_APPS.includes(app as (typeof TAXONOMY_APPS)[number])) {
            return reply.status(400).send({
                success: false,
                error: `app must be one of: ${TAXONOMY_APPS.join(', ')}`,
            });
        }
        const links = await getBookLinks(app as (typeof TAXONOMY_APPS)[number], bookId);
        return reply.send({ success: true, data: links });
    });

    /** Replace the full tag set for a book — called by PDLMS/DCP's own admin UIs
     *  when a catalog editor changes a book's taxonomy. */
    fastify.put('/books/:app/:bookId/links', async (request, reply) => {
        const { app, bookId } = request.params as { app: string; bookId: string };
        if (!TAXONOMY_APPS.includes(app as (typeof TAXONOMY_APPS)[number])) {
            return reply.status(400).send({
                success: false,
                error: `app must be one of: ${TAXONOMY_APPS.join(', ')}`,
            });
        }
        const parsed = setLinksSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ success: false, error: parsed.error.message });
        }
        try {
            const links = await setBookLinks(app as (typeof TAXONOMY_APPS)[number], bookId, parsed.data);
            return reply.send({ success: true, data: links });
        } catch (err) {
            return handleKnownErrors(err, reply);
        }
    });
};

export default taxonomyRoutes;
