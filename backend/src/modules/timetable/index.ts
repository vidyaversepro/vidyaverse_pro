import { FastifyInstance } from 'fastify';
import timetableRoutes from './timetable.routes.js';

export async function timetableModule(app: FastifyInstance) {
    app.register(timetableRoutes, { prefix: '/api/v1/timetable' });
}
