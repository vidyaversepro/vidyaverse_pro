// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { inventoryService } from './inventory.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const I = (fastify: any) => [fastify.requireInstitution, requireFeature('inventory')];
const ADMIN = ['main_admin', 'school_admin'];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Categories
  fastify.get('/categories', {
    preHandler: I(fastify),
    handler: async (req) => ({ success: true, data: await inventoryService.listCategories(req.institutionId) }),
  });
  fastify.post('/categories', {
    preHandler: [...I(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await inventoryService.createCategory(req.institutionId, req.body) });
    },
  });

  // Items
  fastify.get('/items', {
    preHandler: I(fastify),
    handler: async (req) => ({ success: true, data: await inventoryService.listItems(req.institutionId, { categoryId: req.query?.categoryId, lowStock: req.query?.lowStock === 'true' }) }),
  });
  fastify.post('/items', {
    preHandler: [...I(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { categoryId, name } = req.body || {};
      if (!categoryId || !name) return reply.status(400).send({ success: false, error: 'categoryId and name are required' });
      return reply.status(201).send({ success: true, data: await inventoryService.createItem(req.institutionId, req.body) });
    },
  });

  // Stock transactions
  fastify.get('/transactions', {
    preHandler: I(fastify),
    handler: async (req) => ({ success: true, data: await inventoryService.listTransactions(req.institutionId, req.query?.itemId) }),
  });
  fastify.post('/items/:id/stock', {
    preHandler: [...I(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { type, quantity } = req.body || {};
      if (!type || quantity == null) return reply.status(400).send({ success: false, error: 'type and quantity are required' });
      return reply.status(201).send({ success: true, data: await inventoryService.recordStock(req.institutionId, { itemId: req.params.id, performedBy: req.user?.userId, ...req.body }) });
    },
  });

  // Valuation summary
  fastify.get('/valuation', {
    preHandler: I(fastify),
    handler: async (req) => ({ success: true, data: await inventoryService.getValuation(req.institutionId) }),
  });
};

export default inventoryRoutes;
