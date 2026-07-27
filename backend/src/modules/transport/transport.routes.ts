// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { transportService } from './transport.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const T = (fastify: any) => [fastify.requireInstitution, requireFeature('transport')];
const GPS = (fastify: any) => [fastify.requireInstitution, requireFeature('transport_gps')];
const ADMIN = ['main_admin', 'school_admin'];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const transportRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/routes', {
    preHandler: T(fastify),
    handler: async (req) => ({ success: true, data: await transportService.listRoutes(req.institutionId) }),
  });

  fastify.post('/routes', {
    preHandler: [...T(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await transportService.createRoute(req.institutionId, req.body) });
    },
  });

  fastify.patch('/routes/:id', {
    preHandler: [...T(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await transportService.updateRoute(req.institutionId, req.params.id, req.body) }),
  });

  fastify.post('/routes/:id/stops', {
    preHandler: [...T(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await transportService.addStop(req.institutionId, req.params.id, req.body) });
    },
  });

  fastify.get('/assignments', {
    preHandler: T(fastify),
    handler: async (req) => ({ success: true, data: await transportService.listAssignments(req.institutionId, req.query) }),
  });

  fastify.post('/assignments', {
    preHandler: [...T(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { studentId, routeId } = req.body || {};
      if (!studentId || !routeId) return reply.status(400).send({ success: false, error: 'studentId and routeId are required' });
      return reply.status(201).send({ success: true, data: await transportService.assignStudent(req.institutionId, req.body) });
    },
  });

  fastify.get('/trips/active', {
    preHandler: T(fastify),
    handler: async (req) => ({ success: true, data: await transportService.getActiveTrips(req.institutionId) }),
  });

  fastify.post('/routes/:id/start-trip', {
    preHandler: [...T(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await transportService.startTrip(req.institutionId, { routeId: req.params.id, ...req.body }) }),
  });

  fastify.post('/trips/:id/complete', {
    preHandler: [...T(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await transportService.completeTrip(req.institutionId, req.params.id) }),
  });

  // GPS position ingest — add-on feature (transport_gps)
  fastify.post('/trips/:id/gps', {
    preHandler: GPS(fastify),
    handler: async (req, reply) => {
      const { latitude, longitude } = req.body || {};
      if (latitude == null || longitude == null) return reply.status(400).send({ success: false, error: 'latitude and longitude are required' });
      return { success: true, data: await transportService.recordGpsPing(req.institutionId, req.params.id, { latitude, longitude }) };
    },
  });
};

export default transportRoutes;
