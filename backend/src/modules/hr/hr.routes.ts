// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { hrService } from './hr.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

// HR data is sensitive → admin-only.
const G = (fastify: any) => [fastify.requireInstitution, requireFeature('hr_payroll'), fastify.requireRole(['main_admin', 'school_admin'])];

const hrRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Staff
  fastify.get('/staff', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await hrService.listStaff(req.institutionId, req.query) }) });
  fastify.post('/staff', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      if (!req.body?.firstName) return reply.status(400).send({ success: false, error: 'firstName is required' });
      return reply.status(201).send({ success: true, data: await hrService.createStaff(req.institutionId, req.body) });
    },
  });
  fastify.get('/staff/:id', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await hrService.getStaff(req.institutionId, req.params.id) }) });
  fastify.patch('/staff/:id', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await hrService.updateStaff(req.institutionId, req.params.id, req.body) }) });
  fastify.post('/staff/:id/salary-structure', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      if (req.body?.basic == null) return reply.status(400).send({ success: false, error: 'basic is required' });
      return reply.status(201).send({ success: true, data: await hrService.setSalaryStructure(req.institutionId, req.params.id, req.body) });
    },
  });

  // Payroll
  fastify.get('/payslips', {
    preHandler: G(fastify),
    handler: async (req) => ({
      success: true,
      data: await hrService.listPayslips(req.institutionId, {
        staffId: req.query?.staffId,
        month: req.query?.month ? Number(req.query.month) : undefined,
        year: req.query?.year ? Number(req.query.year) : undefined,
      }),
    }),
  });
  fastify.post('/staff/:id/payslips', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { month, year } = req.body || {};
      if (!month || !year) return reply.status(400).send({ success: false, error: 'month and year are required' });
      return { success: true, data: await hrService.generatePayslip(req.institutionId, req.params.id, Number(month), Number(year)) };
    },
  });
  fastify.post('/payroll/run', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { month, year } = req.body || {};
      if (!month || !year) return reply.status(400).send({ success: false, error: 'month and year are required' });
      return { success: true, data: await hrService.runPayroll(req.institutionId, Number(month), Number(year)) };
    },
  });
  fastify.patch('/payslips/:id/status', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { status } = req.body || {};
      if (status !== 'finalized' && status !== 'paid') return reply.status(400).send({ success: false, error: 'status must be finalized or paid' });
      return { success: true, data: await hrService.setPayslipStatus(req.institutionId, req.params.id, status) };
    },
  });

  // Leave
  fastify.get('/leaves', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await hrService.listLeaves(req.institutionId, req.query) }) });
  fastify.post('/staff/:id/leaves', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { fromDate, toDate } = req.body || {};
      if (!fromDate || !toDate) return reply.status(400).send({ success: false, error: 'fromDate and toDate are required' });
      return reply.status(201).send({ success: true, data: await hrService.requestLeave(req.institutionId, req.params.id, req.body) });
    },
  });
  fastify.post('/leaves/:id/review', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { decision } = req.body || {};
      if (decision !== 'approved' && decision !== 'rejected') return reply.status(400).send({ success: false, error: 'decision must be approved or rejected' });
      return { success: true, data: await hrService.reviewLeave(req.institutionId, req.params.id, decision, req.user?.userId) };
    },
  });
};

export default hrRoutes;
