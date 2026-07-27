import { FastifyPluginAsync } from 'fastify';
import { admissionsService } from './admissions.service.js';
import { requireFeature } from '../entitlements/require-feature.js';
import {
  createEnquirySchema,
  updateEnquirySchema,
  addActivitySchema,
  convertToStudentSchema,
  listEnquiriesQuerySchema,
} from '@vidyaverse/shared-validation';

const GATE = (fastify: any) => [fastify.requireInstitution, requireFeature('admissions_crm')];
const WRITE_ROLES = ['main_admin', 'school_admin', 'teacher'];

const admissionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/enquiries', {
    preHandler: GATE(fastify),
    schema: { querystring: listEnquiriesQuerySchema },
    handler: async (request) => ({
      success: true,
      data: await admissionsService.listEnquiries(request.institutionId!, request.query as any),
    }),
  });

  fastify.get('/stats', {
    preHandler: GATE(fastify),
    handler: async (request) => ({
      success: true,
      data: await admissionsService.pipelineStats(request.institutionId!),
    }),
  });

  fastify.get('/enquiries/:id', {
    preHandler: GATE(fastify),
    handler: async (request) => ({
      success: true,
      data: await admissionsService.getEnquiry(request.institutionId!, (request.params as any).id),
    }),
  });

  fastify.post('/enquiries', {
    preHandler: [...GATE(fastify), fastify.requireRole(WRITE_ROLES)],
    schema: { body: createEnquirySchema },
    handler: async (request, reply) => {
      const data = await admissionsService.createEnquiry(
        request.institutionId!,
        request.body as any,
        request.user?.userId,
      );
      return reply.status(201).send({ success: true, data });
    },
  });

  fastify.patch('/enquiries/:id', {
    preHandler: [...GATE(fastify), fastify.requireRole(WRITE_ROLES)],
    schema: { body: updateEnquirySchema },
    handler: async (request) => ({
      success: true,
      data: await admissionsService.updateEnquiry(
        request.institutionId!,
        (request.params as any).id,
        request.body as any,
        request.user?.userId,
      ),
    }),
  });

  fastify.post('/enquiries/:id/activities', {
    preHandler: [...GATE(fastify), fastify.requireRole(WRITE_ROLES)],
    schema: { body: addActivitySchema },
    handler: async (request) => ({
      success: true,
      data: await admissionsService.addActivity(
        request.institutionId!,
        (request.params as any).id,
        request.body as any,
        request.user?.userId,
      ),
    }),
  });

  fastify.post('/enquiries/:id/convert', {
    preHandler: [...GATE(fastify), fastify.requireRole(['main_admin', 'school_admin'])],
    schema: { body: convertToStudentSchema },
    handler: async (request) => ({
      success: true,
      data: await admissionsService.convertToStudent(
        request.institutionId!,
        (request.params as any).id,
        request.body as any,
        request.user?.userId,
      ),
    }),
  });
};

export default admissionsRoutes;
