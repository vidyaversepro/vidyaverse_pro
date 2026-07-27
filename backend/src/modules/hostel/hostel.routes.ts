// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { hostelService } from './hostel.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const H = (fastify: any) => [fastify.requireInstitution, requireFeature('hostel')];
const ADMIN = ['main_admin', 'school_admin'];
const STAFF = ['main_admin', 'school_admin', 'teacher'];

const hostelRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Blocks
  fastify.get('/blocks', {
    preHandler: H(fastify),
    handler: async (req) => ({ success: true, data: await hostelService.listBlocks(req.institutionId) }),
  });
  fastify.post('/blocks', {
    preHandler: [...H(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.name) return reply.status(400).send({ success: false, error: 'name is required' });
      return reply.status(201).send({ success: true, data: await hostelService.createBlock(req.institutionId, req.body) });
    },
  });

  // Rooms
  fastify.get('/rooms', {
    preHandler: H(fastify),
    handler: async (req) => ({ success: true, data: await hostelService.listRooms(req.institutionId, req.query?.blockId) }),
  });
  fastify.post('/blocks/:id/rooms', {
    preHandler: [...H(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      if (!req.body?.roomNumber) return reply.status(400).send({ success: false, error: 'roomNumber is required' });
      return reply.status(201).send({ success: true, data: await hostelService.addRoom(req.institutionId, req.params.id, req.body) });
    },
  });

  // Allotments
  fastify.get('/allotments', {
    preHandler: H(fastify),
    handler: async (req) => ({ success: true, data: await hostelService.listAllotments(req.institutionId, req.query) }),
  });
  fastify.post('/allotments', {
    preHandler: [...H(fastify), fastify.requireRole(STAFF)],
    handler: async (req, reply) => {
      const { roomId, studentId } = req.body || {};
      if (!roomId || !studentId) return reply.status(400).send({ success: false, error: 'roomId and studentId are required' });
      return reply.status(201).send({ success: true, data: await hostelService.allotRoom(req.institutionId, req.body) });
    },
  });
  fastify.post('/allotments/:id/vacate', {
    preHandler: [...H(fastify), fastify.requireRole(STAFF)],
    handler: async (req) => ({ success: true, data: await hostelService.vacateRoom(req.institutionId, req.params.id) }),
  });

  // Mess bills
  fastify.get('/mess-bills', {
    preHandler: H(fastify),
    handler: async (req) => ({ success: true, data: await hostelService.listMessBills(req.institutionId, req.query) }),
  });
  fastify.post('/mess-bills', {
    preHandler: [...H(fastify), fastify.requireRole(ADMIN)],
    handler: async (req, reply) => {
      const { studentId, billMonth, amount } = req.body || {};
      if (!studentId || !billMonth || amount == null) return reply.status(400).send({ success: false, error: 'studentId, billMonth, amount required' });
      return reply.status(201).send({ success: true, data: await hostelService.createMessBill(req.institutionId, req.body) });
    },
  });
  fastify.post('/mess-bills/:id/pay', {
    preHandler: [...H(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await hostelService.markMessBillPaid(req.institutionId, req.params.id) }),
  });

  // Occupancy summary
  fastify.get('/occupancy', {
    preHandler: H(fastify),
    handler: async (req) => ({ success: true, data: await hostelService.getOccupancySummary(req.institutionId) }),
  });
};

export default hostelRoutes;
