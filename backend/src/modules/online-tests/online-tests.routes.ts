// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { onlineTestsService } from './online-tests.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const O = (fastify: any) => [fastify.requireInstitution, requireFeature('assessments_online')];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const onlineTestsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // ── Question bank ──────────────────────────────────────────────────────────────
  fastify.get('/questions', {
    preHandler: O(fastify),
    handler: async (req) => ({ success: true, data: await onlineTestsService.listQuestions(req.institutionId, req.query) }),
  });
  fastify.post('/questions', {
    preHandler: [...O(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { subject, questionText } = req.body || {};
      if (!subject || !questionText) return reply.status(400).send({ success: false, error: 'subject and questionText required' });
      return reply.status(201).send({ success: true, data: await onlineTestsService.createQuestion(req.institutionId, req.body) });
    },
  });

  // ── Tests ───────────────────────────────────────────────────────────────────────
  fastify.get('/tests', {
    preHandler: O(fastify),
    handler: async (req) => ({ success: true, data: await onlineTestsService.listTests(req.institutionId, req.query) }),
  });
  fastify.post('/tests', {
    preHandler: [...O(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { title, questionIds } = req.body || {};
      if (!title || !Array.isArray(questionIds) || questionIds.length === 0) return reply.status(400).send({ success: false, error: 'title and non-empty questionIds required' });
      return reply.status(201).send({ success: true, data: await onlineTestsService.createTest(req.institutionId, req.body) });
    },
  });
  fastify.post('/tests/:id/status', {
    preHandler: [...O(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      if (!req.body?.status) return reply.status(400).send({ success: false, error: 'status is required' });
      return { success: true, data: await onlineTestsService.setTestStatus(req.institutionId, req.params.id, req.body.status) };
    },
  });
  fastify.get('/tests/:id/attempts', {
    preHandler: O(fastify),
    handler: async (req) => ({ success: true, data: await onlineTestsService.listAttempts(req.institutionId, req.params.id) }),
  });

  // ── Attempts ──────────────────────────────────────────────────────────────────
  fastify.post('/tests/:id/start', {
    preHandler: O(fastify),
    handler: async (req, reply) => {
      const studentId = req.body?.studentId;
      if (!studentId) return reply.status(400).send({ success: false, error: 'studentId is required' });
      return reply.status(201).send({ success: true, data: await onlineTestsService.startAttempt(req.institutionId, req.params.id, studentId) });
    },
  });
  fastify.post('/attempts/:attemptId/submit', {
    preHandler: O(fastify),
    handler: async (req) => ({ success: true, data: await onlineTestsService.submitAttempt(req.institutionId, req.params.attemptId, req.body?.answers || {}) }),
  });
};

export default onlineTestsRoutes;
