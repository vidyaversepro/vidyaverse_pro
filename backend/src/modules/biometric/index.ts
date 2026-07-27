import { FastifyInstance } from 'fastify';
import biometricRoutes from './biometric.routes.js';

export async function biometricModule(app: FastifyInstance) {
    app.register(biometricRoutes, { prefix: '/api/v1/biometric' });
}
