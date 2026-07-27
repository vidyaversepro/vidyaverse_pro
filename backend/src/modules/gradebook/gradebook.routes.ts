// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { gradebookService } from './gradebook.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const G = (fastify: any) => [fastify.requireInstitution, requireFeature('gradebook_cce')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const gradebookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/assessments', {
    preHandler: G(fastify),
    handler: async (req) => ({ success: true, data: await gradebookService.listAssessments(req.institutionId, req.query) }),
  });
  fastify.post('/assessments', {
    preHandler: [...G(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { sectionId, subjectName, name, termType } = req.body || {};
      if (!sectionId || !subjectName || !name || !termType) return reply.status(400).send({ success: false, error: 'sectionId, subjectName, name, termType required' });
      return reply.status(201).send({ success: true, data: await gradebookService.createAssessment(req.institutionId, req.body) });
    },
  });

  fastify.get('/assessments/:id/marks', {
    preHandler: G(fastify),
    handler: async (req) => ({ success: true, data: await gradebookService.listMarks(req.institutionId, req.params.id) }),
  });
  fastify.post('/assessments/:id/marks', {
    preHandler: [...G(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const body = req.body || {};
      if (Array.isArray(body.marks)) {
        return reply.status(201).send({ success: true, data: await gradebookService.bulkEnterMarks(req.institutionId, req.params.id, body.marks) });
      }
      if (!body.studentId || body.marksObtained == null) return reply.status(400).send({ success: false, error: 'studentId and marksObtained (or marks[]) required' });
      return reply.status(201).send({ success: true, data: await gradebookService.enterMark(req.institutionId, { assessmentId: req.params.id, ...body }) });
    },
  });

  // Report card
  fastify.get('/report-card', {
    preHandler: G(fastify),
    handler: async (req, reply) => {
      const { sectionId, studentId } = req.query || {};
      if (!sectionId || !studentId) return reply.status(400).send({ success: false, error: 'sectionId and studentId required' });
      return { success: true, data: await gradebookService.getReportCard(req.institutionId, sectionId, studentId) };
    },
  });
};

export default gradebookRoutes;
