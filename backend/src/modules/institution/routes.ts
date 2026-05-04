import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    app.get('/', controller.list);
    app.get('/check-uniqueness', controller.checkUniqueness);
    app.post('/', controller.create);
    app.get('/:id', controller.getOne);
    app.patch('/:id', controller.update);
    app.delete('/:id', controller.delete);

    // Onboarding & Branding
    app.patch('/:id/complete-onboarding', controller.completeOnboarding);
    app.post('/:id/branding', controller.updateBranding);

    // Authorities
    app.get('/:id/authorities', controller.getAuthorities);
    app.post('/:id/authorities', controller.createAuthority);
    app.patch('/:id/authorities/:authorityId', controller.updateAuthority);
    app.delete('/:id/authorities/:authorityId', controller.deleteAuthority);
}
