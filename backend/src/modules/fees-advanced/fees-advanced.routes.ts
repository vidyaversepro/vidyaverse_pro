// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { feesAdvancedService } from './fees-advanced.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const F = (fastify: any) => [fastify.requireInstitution, requireFeature('fees_advanced')];
const ADMIN = ['main_admin', 'school_admin'];

const feesAdvancedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Concessions
  fastify.get('/concessions', {
    preHandler: F(fastify),
    handler: async (req) => ({ success: true, data: await feesAdvancedService.listConcessions(req.institutionId, req.query?.studentId) }),
  });
  fastify.post('/concessions', {
    preHandler: [...F(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { studentId, name, academicYear } = req.body || {};
      if (!studentId || !name || !academicYear) return reply.status(400).send({ success: false, error: 'studentId, name, academicYear required' });
      return reply.status(201).send({ success: true, data: await feesAdvancedService.createConcession(req.institutionId, req.body) });
    },
  });
  fastify.post('/concessions/:id/expire', {
    preHandler: [...F(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await feesAdvancedService.expireConcession(req.institutionId, req.params.id) }),
  });

  // Installment plans
  fastify.get('/plans', {
    preHandler: F(fastify),
    handler: async (req) => ({ success: true, data: await feesAdvancedService.listPlans(req.institutionId, req.query?.studentId) }),
  });
  fastify.post('/plans', {
    preHandler: [...F(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { studentId, totalAmount, numInstallments, academicYear } = req.body || {};
      if (!studentId || totalAmount == null || !numInstallments || !academicYear) return reply.status(400).send({ success: false, error: 'studentId, totalAmount, numInstallments, academicYear required' });
      return reply.status(201).send({ success: true, data: await feesAdvancedService.createInstallmentPlan(req.institutionId, req.body) });
    },
  });
  fastify.post('/installments/:id/pay', {
    preHandler: [...F(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await feesAdvancedService.markInstallmentPaid(req.institutionId, req.params.id) }),
  });

  // Defaulters
  fastify.get('/defaulters', {
    preHandler: F(fastify),
    handler: async (req) => ({ success: true, data: await feesAdvancedService.getDefaulters(req.institutionId) }),
  });
};

export default feesAdvancedRoutes;
