import { FastifyInstance } from 'fastify';
import attendanceRoutes from './attendance.routes.js';
export { attendanceService } from './attendance.service.js';

export async function attendanceModule(app: FastifyInstance) {
    app.register(attendanceRoutes, { prefix: '/api/v1/attendance' });
}
