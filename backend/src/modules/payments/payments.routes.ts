import { FastifyPluginAsync } from 'fastify';
import { paymentsService } from './payments.service.js';
import {
  createFeeStructureSchema,
  createFeeInvoiceSchema,
  listInvoicesQuerySchema,
} from '@vidyaverse/shared-validation';

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/structures', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => ({
      success: true,
      data: await paymentsService.listFeeStructures(request.institutionId!),
    }),
  });

  fastify.post('/structures', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    schema: { body: createFeeStructureSchema },
    handler: async (request) => ({
      success: true,
      data: await paymentsService.createFeeStructure(request.institutionId!, request.body as any),
    }),
  });

  fastify.get('/invoices', {
    preHandler: [fastify.requireInstitution],
    schema: { querystring: listInvoicesQuerySchema },
    handler: async (request) => ({
      success: true,
      data: await paymentsService.listInvoices(request.institutionId!, request.query as any),
    }),
  });

  fastify.post('/invoices', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    schema: { body: createFeeInvoiceSchema },
    handler: async (request) => ({
      success: true,
      data: await paymentsService.createInvoice(request.institutionId!, request.body as any),
    }),
  });

  fastify.get('/summary', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => ({
      success: true,
      data: await paymentsService.feeSummary(request.institutionId!),
    }),
  });

  fastify.get('/student/:studentId', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => ({
      success: true,
      data: await paymentsService.listInvoices(request.institutionId!, {
        studentId: (request.params as any).studentId,
      }),
    }),
  });

  fastify.post('/invoices/:id/payment-link', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    handler: async (request) => ({
      success: true,
      data: await paymentsService.createPaymentLink(request.institutionId!, (request.params as any).id),
    }),
  });

  fastify.post('/invoices/:id/remind', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
    handler: async (request) => ({
      success: true,
      data: await paymentsService.sendFeeReminder(request.institutionId!, (request.params as any).id),
    }),
  });
};

export default paymentsRoutes;
