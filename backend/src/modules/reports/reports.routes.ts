// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { reportsService } from './reports.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const R = (fastify: any) => [fastify.requireInstitution, requireFeature('reports_bi')];
const ADMIN = ['main_admin', 'school_admin'];

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/overview', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.overview(req.institutionId) }),
  });
  fastify.get('/students-by-status', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.studentsByStatus(req.institutionId) }),
  });
  fastify.get('/fee-collection', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.feeCollectionSummary(req.institutionId) }),
  });
  fastify.get('/admissions-funnel', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.admissionsFunnel(req.institutionId) }),
  });
  fastify.get('/staff-by-department', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.staffByDepartment(req.institutionId) }),
  });

  // Saved reports
  fastify.get('/saved', {
    preHandler: R(fastify),
    handler: async (req) => ({ success: true, data: await reportsService.listSavedReports(req.institutionId) }),
  });
  fastify.post('/saved', {
    preHandler: [...R(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { name, reportType } = req.body || {};
      if (!name || !reportType) return reply.status(400).send({ success: false, error: 'name and reportType are required' });
      return reply.status(201).send({ success: true, data: await reportsService.saveReport(req.institutionId, { createdBy: req.user?.userId, ...req.body }) });
    },
  });
  fastify.delete('/saved/:id', {
    preHandler: [...R(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await reportsService.deleteSavedReport(req.institutionId, req.params.id) }),
  });
};

export default reportsRoutes;
