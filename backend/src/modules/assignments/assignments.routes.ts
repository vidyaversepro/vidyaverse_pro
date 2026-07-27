// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { assignmentsService } from './assignments.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const A = (fastify: any) => [fastify.requireInstitution, requireFeature('assignments')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const assignmentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', {
    preHandler: A(fastify),
    handler: async (req) => ({ success: true, data: await assignmentsService.list(req.institutionId, req.query) }),
  });
  fastify.post('/', {
    preHandler: [...A(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { sectionId, subjectName, title } = req.body || {};
      if (!sectionId || !subjectName || !title) return reply.status(400).send({ success: false, error: 'sectionId, subjectName, title required' });
      return reply.status(201).send({ success: true, data: await assignmentsService.create(req.institutionId, { assignedBy: req.user?.userId, ...req.body }) });
    },
  });
  fastify.post('/:id/publish', {
    preHandler: [...A(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await assignmentsService.setStatus(req.institutionId, req.params.id, 'published') }),
  });
  fastify.post('/:id/close', {
    preHandler: [...A(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await assignmentsService.setStatus(req.institutionId, req.params.id, 'closed') }),
  });

  // Submissions
  fastify.get('/:id/submissions', {
    preHandler: A(fastify),
    handler: async (req) => ({ success: true, data: await assignmentsService.listSubmissions(req.institutionId, req.params.id) }),
  });
  fastify.post('/:id/submit', {
    preHandler: A(fastify),
    handler: async (req, reply) => {
      if (!req.body?.studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return reply.status(201).send({ success: true, data: await assignmentsService.submit(req.institutionId, req.params.id, req.body) });
    },
  });
  fastify.post('/submissions/:submissionId/grade', {
    preHandler: [...A(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (req.body?.marksObtained == null) return reply.status(400).send({ success: false, error: 'marksObtained is required' });
      return { success: true, data: await assignmentsService.grade(req.institutionId, req.params.submissionId, req.body) };
    },
  });
  fastify.get('/student/:studentId', {
    preHandler: A(fastify),
    handler: async (req) => ({ success: true, data: await assignmentsService.getStudentSubmissions(req.institutionId, req.params.studentId) }),
  });
};

export default assignmentsRoutes;
