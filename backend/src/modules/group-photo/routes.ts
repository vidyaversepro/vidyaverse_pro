import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';

export async function routes(app: FastifyInstance) {
    app.get('/', controller.list);
    app.post('/', controller.create);
    app.get('/:id', controller.getOne);
    app.patch('/:id', controller.update);
    app.delete('/:id', controller.delete);

    // Face Extraction Routes
    app.get('/:id/faces', controller.getFaces);
    app.patch('/faces/:id', controller.updateFaceMapping);
    app.post('/:id/extract', controller.extractFaces);
}
