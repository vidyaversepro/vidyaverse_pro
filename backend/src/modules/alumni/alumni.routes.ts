// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { alumniService } from './alumni.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const AL = (fastify: any) => [fastify.requireInstitution, requireFeature('alumni')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const alumniRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', {
    preHandler: AL(fastify),
    handler: async (req) => ({ success: true, data: await alumniService.list(req.institutionId, { graduationYear: req.query?.graduationYear ? Number(req.query.graduationYear) : undefined, mentorsOnly: req.query?.mentorsOnly === 'true' }) }),
  });
  fastify.get('/stats', {
    preHandler: AL(fastify),
    handler: async (req) => ({ success: true, data: await alumniService.stats(req.institutionId) }),
  });
  fastify.post('/', {
    preHandler: [...AL(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await alumniService.create(req.institutionId, req.body) });
    },
  });
  fastify.patch('/:id', {
    preHandler: [...AL(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await alumniService.update(req.institutionId, req.params.id, req.body) }),
  });

  // Events
  fastify.get('/events', {
    preHandler: AL(fastify),
    handler: async (req) => ({ success: true, data: await alumniService.listEvents(req.institutionId) }),
  });
  fastify.post('/events', {
    preHandler: [...AL(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.title || !req.body?.eventDate) return reply.status(400).send({ success: false, error: 'title and eventDate are required' });
      return reply.status(201).send({ success: true, data: await alumniService.createEvent(req.institutionId, req.body) });
    },
  });
  fastify.post('/events/:id/rsvp', {
    preHandler: AL(fastify),
    handler: async (req) => ({ success: true, data: await alumniService.rsvp(req.institutionId, req.params.id) }),
  });
};

export default alumniRoutes;
