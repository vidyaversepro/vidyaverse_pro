// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { biometricService } from './biometric.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const B = (fastify: any) => [fastify.requireInstitution, requireFeature('attendance_biometric')];
const ADMIN = ['main_admin', 'school_admin'];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const biometricRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Devices
  fastify.get('/devices', {
    preHandler: B(fastify),
    handler: async (req) => ({ success: true, data: await biometricService.listDevices(req.institutionId) }),
  });
  fastify.post('/devices', {
    preHandler: [...B(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await biometricService.registerDevice(req.institutionId, req.body) });
    },
  });

  // Punches
  fastify.get('/punches', {
    preHandler: B(fastify),
    handler: async (req) => ({ success: true, data: await biometricService.listPunches(req.institutionId, req.query) }),
  });
  fastify.post('/punches', {
    preHandler: [...B(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { deviceId, personType, personId } = req.body || {};
      if (!deviceId || !personType || !personId) return reply.status(400).send({ success: false, error: 'deviceId, personType, personId required' });
      return reply.status(201).send({ success: true, data: await biometricService.recordPunch(req.institutionId, req.body) });
    },
  });

  // Staff attendance
  fastify.get('/staff-attendance', {
    preHandler: B(fastify),
    handler: async (req, reply) => {
      if (!req.query?.date) return reply.status(400).send({ success: false, error: 'date is required' });
      return { success: true, data: await biometricService.staffAttendanceForDate(req.institutionId, req.query.date) };
    },
  });
  fastify.post('/staff-attendance', {
    preHandler: [...B(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { staffId, attendanceDate, status } = req.body || {};
      if (!staffId || !attendanceDate || !status) return reply.status(400).send({ success: false, error: 'staffId, attendanceDate, status required' });
      return reply.status(201).send({ success: true, data: await biometricService.markStaffAttendance(req.institutionId, req.body) });
    },
  });
};

export default biometricRoutes;
