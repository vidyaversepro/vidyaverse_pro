import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/multipart';
import { service } from './service.js';
import { storage } from '../../config/minio.js';

export const controller = {
    async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string; status?: string; tier?: string } }>, reply: FastifyReply) {
        const data = await service.findAll(request.query);
        return reply.send(data);
    },

    async checkUniqueness(
        request: FastifyRequest<{ Querystring: { code?: string; adminEmail?: string; contactEmail?: string; excludeInstitutionId?: string } }>,
        reply: FastifyReply
    ) {
        const { code, adminEmail, contactEmail, excludeInstitutionId } = request.query;
        const result = await service.checkUniqueness(code, adminEmail, contactEmail, excludeInstitutionId);
        return reply.send(result);
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = await service.create(request.body as never);
            return reply.status(201).send({ data });
        } catch (error: any) {
            if (error.status === 409) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: error.message,
                    validationErrors: error.validationErrors,
                });
            }
            throw error;
        }
    },

    async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.findById(request.params.id);
        if (!data) return reply.status(404).send({ error: 'Not found' });
        return reply.send({ data });
    },

    async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.update(request.params.id, request.body as any);
        return reply.send({ data });
    },

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        await service.delete(request.params.id);
        return reply.status(204).send();
    },

    // ============================================================================
    // ONBOARDING & BRANDING
    // ============================================================================

    async completeOnboarding(request: FastifyRequest<{ Params: { id: string }; Body: { institutionType?: import('@prisma/client').InstitutionType } }>, reply: FastifyReply) {
        const data = await service.completeOnboarding(request.params.id, request.body);
        return reply.send({ data });
    },

    async updateBranding(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const institutionId = request.params.id;
        const parts = (request as any).parts();
        let logoUrl: string | undefined;
        let darkLogoUrl: string | undefined;
        let signatureUrl: string | undefined;
        let sealUrl: string | undefined;
        let signatureTitle: string | undefined;

        for await (const part of parts) {
            if (part.type === 'file') {
                const buffer = await part.toBuffer();
                const folder = (part.fieldname === 'signature' || part.fieldname === 'seal') ? 'signatures' : 'photos';
                const objectName = storage.generateObjectName(institutionId, folder, part.filename);
                const url = await storage.uploadFile(objectName, buffer, part.mimetype);

                if (part.fieldname === 'logo') logoUrl = url;
                if (part.fieldname === 'darkLogo') darkLogoUrl = url;
                if (part.fieldname === 'signature') signatureUrl = url;
                if (part.fieldname === 'seal') sealUrl = url;
            } else if (part.type === 'field' && part.fieldname === 'signatureTitle') {
                signatureTitle = part.value as string;
            }
        }

        const data = await service.updateBranding(institutionId, {
            logoUrl, darkLogoUrl, signatureUrl, sealUrl, signatureTitle,
        });
        return reply.send({ data });
    },

    // ============================================================================
    // AUTHORITIES
    // ============================================================================

    async getAuthorities(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.getAuthorities(request.params.id);
        return reply.send({ data });
    },

    async createAuthority(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const institutionId = request.params.id;
        try {
            // First check if it's a multipart upload for the signature
            if ((request as any).isMultipart()) {
                const parts = (request as any).parts();
                let signatureUrl: string | undefined;
                const bodyData: any = {};

                for await (const part of parts) {
                    if (part.type === 'file' && part.fieldname === 'signature') {
                        const buffer = await part.toBuffer();
                        const objectName = storage.generateObjectName(institutionId, 'signatures', part.filename);
                        signatureUrl = await storage.uploadFile(objectName, buffer, part.mimetype);
                    } else if (part.type === 'field') {
                        bodyData[part.fieldname] = part.value;
                    }
                }
                const data = await service.createAuthority(institutionId, { ...bodyData, signatureUrl });
                return reply.status(201).send({ data });
            } else {
                // If standard JSON
                const data = await service.createAuthority(institutionId, request.body as never);
                return reply.status(201).send({ data });
            }
        } catch (error) {
            throw error;
        }
    },

    async updateAuthority(request: FastifyRequest<{ Params: { id: string; authorityId: string } }>, reply: FastifyReply) {
        const institutionId = request.params.id;
        const authorityId = request.params.authorityId;

        if ((request as any).isMultipart()) {
            const parts = (request as any).parts();
            let signatureUrl: string | undefined;
            const bodyData: any = {};

            for await (const part of parts) {
                if (part.type === 'file' && part.fieldname === 'signature') {
                    const buffer = await part.toBuffer();
                    const objectName = storage.generateObjectName(institutionId, 'signatures', part.filename);
                    signatureUrl = await storage.uploadFile(objectName, buffer, part.mimetype);
                } else if (part.type === 'field') {
                    bodyData[part.fieldname] = part.value;
                }
            }
            const data = await service.updateAuthority(authorityId, { ...bodyData, ...(signatureUrl && { signatureUrl }) });
            return reply.send({ data });
        } else {
            const data = await service.updateAuthority(authorityId, request.body as never);
            return reply.send({ data });
        }
    },

    async deleteAuthority(request: FastifyRequest<{ Params: { authorityId: string } }>, reply: FastifyReply) {
        await service.deleteAuthority(request.params.authorityId);
        return reply.status(204).send();
    }
};
