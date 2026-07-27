// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { financeService } from './finance.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const G = (fastify: any) => [fastify.requireInstitution, requireFeature('finance_accounting'), fastify.requireRole(['main_admin', 'school_admin'])];

const financeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/accounts', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await financeService.listAccounts(req.institutionId, req.query?.type) }) });
  fastify.post('/accounts', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { name, type } = req.body || {};
      if (!name || !type) return reply.status(400).send({ success: false, error: 'name and type are required' });
      return reply.status(201).send({ success: true, data: await financeService.createAccount(req.institutionId, req.body) });
    },
  });
  fastify.post('/accounts/ensure-system', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await financeService.ensureSystemAccounts(req.institutionId) }) });

  fastify.get('/entries', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await financeService.listEntries(req.institutionId) }) });
  fastify.post('/entries', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      if (!Array.isArray(req.body?.lines)) return reply.status(400).send({ success: false, error: 'lines[] is required' });
      return reply.status(201).send({ success: true, data: await financeService.postEntry(req.institutionId, { ...req.body, createdByUserId: req.user?.userId }) });
    },
  });

  fastify.post('/expense', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      if (req.body?.amount == null) return reply.status(400).send({ success: false, error: 'amount is required' });
      return reply.status(201).send({ success: true, data: await financeService.recordExpense(req.institutionId, { ...req.body, createdByUserId: req.user?.userId }) });
    },
  });
  fastify.post('/income', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      if (req.body?.amount == null) return reply.status(400).send({ success: false, error: 'amount is required' });
      return reply.status(201).send({ success: true, data: await financeService.recordIncome(req.institutionId, { ...req.body, createdByUserId: req.user?.userId }) });
    },
  });

  fastify.get('/trial-balance', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await financeService.trialBalance(req.institutionId) }) });
  fastify.get('/pnl', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await financeService.profitAndLoss(req.institutionId) }) });
};

export default financeRoutes;
