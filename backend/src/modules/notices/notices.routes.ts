// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { noticesService } from './notices.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const N = (fastify: any) => [fastify.requireInstitution, requireFeature('notices_events')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const noticesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Notices
  fastify.get('/notices', {
    preHandler: N(fastify),
    handler: async (req) => ({ success: true, data: await noticesService.listNotices(req.institutionId, req.query) }),
  });
  fastify.post('/notices', {
    preHandler: [...N(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.title || !req.body?.body) return reply.status(400).send({ success: false, error: 'title and body are required' });
      return reply.status(201).send({ success: true, data: await noticesService.createNotice(req.institutionId, req.body) });
    },
  });
  fastify.post('/notices/:id/pin', {
    preHandler: [...N(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await noticesService.togglePin(req.institutionId, req.params.id, req.body?.isPinned !== false) }),
  });
  fastify.post('/notices/:id/archive', {
    preHandler: [...N(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await noticesService.setNoticeStatus(req.institutionId, req.params.id, 'archived') }),
  });

  // Calendar events
  fastify.get('/events', {
    preHandler: N(fastify),
    handler: async (req) => ({ success: true, data: await noticesService.listEvents(req.institutionId, req.query) }),
  });
  fastify.get('/events/upcoming', {
    preHandler: N(fastify),
    handler: async (req) => ({ success: true, data: await noticesService.upcomingEvents(req.institutionId, req.query?.days ? Number(req.query.days) : 30) }),
  });
  fastify.post('/events', {
    preHandler: [...N(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.title || !req.body?.eventDate) return reply.status(400).send({ success: false, error: 'title and eventDate are required' });
      return reply.status(201).send({ success: true, data: await noticesService.createEvent(req.institutionId, req.body) });
    },
  });
};

export default noticesRoutes;
