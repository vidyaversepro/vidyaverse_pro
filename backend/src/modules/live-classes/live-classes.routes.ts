// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { liveClassesService } from './live-classes.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const L = (fastify: any) => [fastify.requireInstitution, requireFeature('live_classes')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const liveClassesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', {
    preHandler: L(fastify),
    handler: async (req) => ({ success: true, data: await liveClassesService.list(req.institutionId, { sectionId: req.query?.sectionId, status: req.query?.status, upcoming: req.query?.upcoming === 'true' }) }),
  });
  fastify.post('/', {
    preHandler: [...L(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { sectionId, subjectName, title, scheduledAt } = req.body || {};
      if (!sectionId || !subjectName || !title || !scheduledAt) return reply.status(400).send({ success: false, error: 'sectionId, subjectName, title, scheduledAt required' });
      return reply.status(201).send({ success: true, data: await liveClassesService.schedule(req.institutionId, { hostId: req.user?.userId, ...req.body }) });
    },
  });
  fastify.post('/:id/status', {
    preHandler: [...L(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.status) return reply.status(400).send({ success: false, error: 'status is required' });
      return { success: true, data: await liveClassesService.setStatus(req.institutionId, req.params.id, req.body.status) };
    },
  });
  fastify.post('/:id/recording', {
    preHandler: [...L(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.recordingUrl) return reply.status(400).send({ success: false, error: 'recordingUrl is required' });
      return { success: true, data: await liveClassesService.attachRecording(req.institutionId, req.params.id, req.body.recordingUrl) };
    },
  });
};

export default liveClassesRoutes;
