import { FastifyInstance } from 'fastify';
import { branchRoutes } from './routes.js';

export async function branchModule(fastify: FastifyInstance) {
    await fastify.register(branchRoutes, { prefix: '/api/v1/branch' });
}
