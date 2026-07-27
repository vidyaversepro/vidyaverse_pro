// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { placementService } from './placement.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const P = (fastify: any) => [fastify.requireInstitution, requireFeature('placement')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const placementRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/drives', {
    preHandler: P(fastify),
    handler: async (req) => ({ success: true, data: await placementService.listDrives(req.institutionId, req.query?.status) }),
  });
  fastify.get('/stats', {
    preHandler: P(fastify),
    handler: async (req) => ({ success: true, data: await placementService.stats(req.institutionId) }),
  });
  fastify.post('/drives', {
    preHandler: [...P(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { companyName, role } = req.body || {};
      if (!companyName || !role) return reply.status(400).send({ success: false, error: 'companyName and role are required' });
      return reply.status(201).send({ success: true, data: await placementService.createDrive(req.institutionId, req.body) });
    },
  });
  fastify.post('/drives/:id/status', {
    preHandler: [...P(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.status) return reply.status(400).send({ success: false, error: 'status is required' });
      return { success: true, data: await placementService.setDriveStatus(req.institutionId, req.params.id, req.body.status) };
    },
  });

  // Applications
  fastify.get('/drives/:id/applications', {
    preHandler: P(fastify),
    handler: async (req) => ({ success: true, data: await placementService.listApplications(req.institutionId, req.params.id) }),
  });
  fastify.post('/drives/:id/apply', {
    preHandler: [...P(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return reply.status(201).send({ success: true, data: await placementService.apply(req.institutionId, req.params.id, req.body.studentId) });
    },
  });
  fastify.post('/applications/:applicationId/status', {
    preHandler: [...P(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.status) return reply.status(400).send({ success: false, error: 'status is required' });
      return { success: true, data: await placementService.setApplicationStatus(req.institutionId, req.params.applicationId, req.body.status, req.body.notes) };
    },
  });
};

export default placementRoutes;
