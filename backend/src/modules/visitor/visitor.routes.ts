// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { visitorService } from './visitor.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const V = (fastify: any) => [fastify.requireInstitution, requireFeature('visitor')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const visitorRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Visitor logs
  fastify.get('/logs', {
    preHandler: V(fastify),
    handler: async (req) => ({ success: true, data: await visitorService.listVisitors(req.institutionId, req.query) }),
  });
  fastify.get('/inside', {
    preHandler: V(fastify),
    handler: async (req) => ({ success: true, data: await visitorService.getCurrentlyInside(req.institutionId) }),
  });
  fastify.post('/check-in', {
    preHandler: [...V(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.visitorName) return reply.status(400).send({ success: false, error: 'visitorName is required' });
      return reply.status(201).send({ success: true, data: await visitorService.checkIn(req.institutionId, req.body) });
    },
  });
  fastify.post('/logs/:id/check-out', {
    preHandler: [...V(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await visitorService.checkOut(req.institutionId, req.params.id) }),
  });

  // Gate passes
  fastify.get('/gate-passes', {
    preHandler: V(fastify),
    handler: async (req) => ({ success: true, data: await visitorService.listGatePasses(req.institutionId, req.query?.studentId) }),
  });
  fastify.post('/gate-passes', {
    preHandler: [...V(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return reply.status(201).send({ success: true, data: await visitorService.issueGatePass(req.institutionId, { approvedBy: req.user?.userId, ...req.body }) });
    },
  });
};

export default visitorRoutes;
