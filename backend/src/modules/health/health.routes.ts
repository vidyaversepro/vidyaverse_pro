// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { healthService } from './health.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const HX = (fastify: any) => [fastify.requireInstitution, requireFeature('health')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Health records
  fastify.get('/records/:studentId', {
    preHandler: HX(fastify),
    handler: async (req) => ({ success: true, data: await healthService.getRecord(req.institutionId, req.params.studentId) }),
  });
  fastify.put('/records', {
    preHandler: [...HX(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return { success: true, data: await healthService.upsertRecord(req.institutionId, req.body) };
    },
  });

  // Clinic visits
  fastify.get('/visits', {
    preHandler: HX(fastify),
    handler: async (req) => ({ success: true, data: await healthService.listVisits(req.institutionId, req.query?.studentId) }),
  });
  fastify.post('/visits', {
    preHandler: [...HX(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return reply.status(201).send({ success: true, data: await healthService.recordVisit(req.institutionId, req.body) });
    },
  });

  // Vaccinations
  fastify.get('/vaccinations', {
    preHandler: HX(fastify),
    handler: async (req) => ({ success: true, data: await healthService.listVaccinations(req.institutionId, req.query?.studentId) }),
  });
  fastify.get('/vaccinations/due', {
    preHandler: HX(fastify),
    handler: async (req) => ({ success: true, data: await healthService.getDueVaccinations(req.institutionId, req.query?.days ? Number(req.query.days) : 30) }),
  });
  fastify.post('/vaccinations', {
    preHandler: [...HX(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { studentId, vaccineName } = req.body || {};
      if (!studentId || !vaccineName) return reply.status(400).send({ success: false, error: 'studentId and vaccineName are required' });
      return reply.status(201).send({ success: true, data: await healthService.addVaccination(req.institutionId, req.body) });
    },
  });
};

export default healthRoutes;
