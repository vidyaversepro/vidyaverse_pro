import { FastifyInstance } from 'fastify';
import hostelRoutes from './hostel.routes.js';

export async function hostelModule(app: FastifyInstance) {
    app.register(hostelRoutes, { prefix: '/api/v1/hostel' });
}
