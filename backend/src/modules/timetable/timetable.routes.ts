// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { timetableService } from './timetable.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const G = (fastify: any) => [fastify.requireInstitution, requireFeature('timetable')];
const ADMIN = ['main_admin', 'school_admin'];

const timetableRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/periods', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await timetableService.listPeriods(req.institutionId) }) });
  fastify.post('/periods', {
    preHandler: [...G(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { name, startTime, endTime } = req.body || {};
      if (!name || !startTime || !endTime) return reply.status(400).send({ success: false, error: 'name, startTime and endTime are required' });
      return reply.status(201).send({ success: true, data: await timetableService.createPeriod(req.institutionId, req.body) });
    },
  });

  fastify.get('/sections/:sectionId', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await timetableService.getSectionTimetable(req.institutionId, req.params.sectionId) }) });
  fastify.get('/teachers/:teacherId', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await timetableService.getTeacherTimetable(req.institutionId, req.params.teacherId) }) });

  fastify.post('/slots', {
    preHandler: [...G(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { sectionId, dayOfWeek, periodId, subjectName } = req.body || {};
      if (!sectionId || !dayOfWeek || !periodId || !subjectName) return reply.status(400).send({ success: false, error: 'sectionId, dayOfWeek, periodId and subjectName are required' });
      return reply.status(201).send({ success: true, data: await timetableService.setSlot(req.institutionId, req.body) });
    },
  });
  fastify.post('/slots/clear', {
    preHandler: [...G(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { sectionId, dayOfWeek, periodId } = req.body || {};
      if (!sectionId || !dayOfWeek || !periodId) return reply.status(400).send({ success: false, error: 'sectionId, dayOfWeek and periodId are required' });
      return { success: true, data: await timetableService.clearSlot(req.institutionId, sectionId, dayOfWeek, periodId) };
    },
  });

  fastify.get('/substitutions', { preHandler: G(fastify), handler: async (req) => ({ success: true, data: await timetableService.listSubstitutions(req.institutionId, req.query) }) });
  fastify.post('/substitutions', {
    preHandler: [...G(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { slotId, date, substituteTeacherId } = req.body || {};
      if (!slotId || !date || !substituteTeacherId) return reply.status(400).send({ success: false, error: 'slotId, date and substituteTeacherId are required' });
      return reply.status(201).send({ success: true, data: await timetableService.createSubstitution(req.institutionId, req.body) });
    },
  });
};

export default timetableRoutes;
