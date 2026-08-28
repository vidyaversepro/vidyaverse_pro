// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { notificationService } from './notification.service.js';
import { sendEmailSchema, sendBulkEmailSchema, sendSmsSchema, sendBulkSmsSchema, sendNotificationSchema, notificationTemplateSchema, notificationQuerySchema, } from '@vidyaverse/shared-validation';
const notificationRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    // ============================================================================
    // EMAIL
    // ============================================================================
    /**
     * Send single email
     */
    fastify.post('/email', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const result = await notificationService.sendEmail(institutionId, data);
            return reply.status(201).send({ success: true, data: result });
        },
    });
    /**
     * Send bulk email
     */
    fastify.post('/email/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const result = await notificationService.sendBulkEmail(institutionId, data);
            return { success: true, data: result };
        },
    });
    // ============================================================================
    // SMS
    // ============================================================================
    /**
     * Send single SMS
     */
    fastify.post('/sms', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const result = await notificationService.sendSms(institutionId, data);
            return reply.status(201).send({ success: true, data: result });
        },
    });
    /**
     * Send bulk SMS
     */
    fastify.post('/sms/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const result = await notificationService.sendBulkSms(institutionId, data);
            return { success: true, data: result };
        },
    });
    // ============================================================================
    // IN-APP NOTIFICATIONS
    // ============================================================================
    /**
     * Send in-app notification
     */
    fastify.post('/push', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const result = await notificationService.sendNotification(institutionId, data);
            return reply.status(201).send({ success: true, data: result });
        },
    });
    /**
     * Get user's notifications
     */
    fastify.get('/my', {
        handler: async (request) => {
            const userId = request.user.userId;
            const { unreadOnly, page, limit } = request.query;
            const result = await notificationService.getUserNotifications(userId, {
                unreadOnly: unreadOnly === 'true',
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
            });
            return { success: true, data: result.notifications, pagination: result.pagination, unreadCount: result.unreadCount };
        },
    });
    /**
     * Mark notification as read
     */
    fastify.post('/my/:id/read', {
        handler: async (request) => {
            const { id } = request.params;
            const userId = request.user.userId;
            await notificationService.markAsRead(id, userId);
            return { success: true, message: 'Notification marked as read' };
        },
    });
    /**
     * Mark all notifications as read
     */
    fastify.post('/my/read-all', {
        handler: async (request) => {
            const userId = request.user.userId;
            await notificationService.markAllAsRead(userId);
            return { success: true, message: 'All notifications marked as read' };
        },
    });
    // ============================================================================
    // TEMPLATES
    // ============================================================================
    /**
     * Create notification template
     */
    fastify.post('/templates', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const template = await notificationService.createTemplate(institutionId, data);
            return reply.status(201).send({ success: true, data: template });
        },
    });
    /**
     * List notification templates
     */
    fastify.get('/templates', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const { type } = request.query;
            const templates = await notificationService.listTemplates(institutionId, type);
            return { success: true, data: templates };
        },
    });
    // ============================================================================
    // LOGS
    // ============================================================================
    /**
     * Get notification logs
     */
    fastify.get('/logs', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const result = await notificationService.getNotificationLog(institutionId, query);
            return { success: true, data: result.logs, pagination: result.pagination };
        },
    });
};
export default notificationRoutes;
