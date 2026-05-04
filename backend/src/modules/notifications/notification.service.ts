import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import type {
    SendEmailInput,
    SendBulkEmailInput,
    SendSmsInput,
    SendBulkSmsInput,
    SendNotificationInput,
    NotificationTemplateInput,
    NotificationQueryInput,
} from '@vidyaverse/shared-validation';

// Email provider interface
interface EmailProvider {
    send(options: {
        to: string;
        subject: string;
        html: string;
        attachments?: any[];
    }): Promise<{ messageId: string }>;
}

// SMS provider interface
interface SmsProvider {
    send(options: {
        to: string;
        message: string;
    }): Promise<{ messageId: string }>;
}

// Mock email provider (replace with real provider like Nodemailer, SendGrid, etc.)
const mockEmailProvider: EmailProvider = {
    async send(options) {
        logger.info('Email sent (mock)', { to: options.to, subject: options.subject });
        return { messageId: `mock-${Date.now()}` };
    },
};

// Mock SMS provider (replace with real provider like Twilio, MSG91, etc.)
const mockSmsProvider: SmsProvider = {
    async send(options) {
        logger.info('SMS sent (mock)', { to: options.to });
        return { messageId: `mock-${Date.now()}` };
    },
};

export const notificationService = {
    // ============================================================================
    // EMAIL
    // ============================================================================

    async sendEmail(institutionId: string, data: SendEmailInput) {
        const { recipientEmail, recipientName, subject, body, templateId, templateData, attachments, priority } = data;

        let htmlContent = body;

        // If template specified, render it
        if (templateId) {
            const template = await prisma.notificationTemplate.findFirst({
                where: { id: templateId, institutionId },
            });

            if (template) {
                htmlContent = this.renderTemplate(template.content, templateData || {});
            }
        }

        try {
            const result = await mockEmailProvider.send({
                to: recipientEmail,
                subject,
                html: htmlContent,
                attachments,
            });

            // Log notification
            await prisma.notificationLog.create({
                data: {
                    institutionId,
                    type: 'email',
                    recipient: recipientEmail,
                    recipientName,
                    subject,
                    content: htmlContent,
                    status: 'sent',
                    messageId: result.messageId,
                    priority,
                    sentAt: new Date(),
                },
            });

            // Update usage
            await prisma.institution.update({
                where: { id: institutionId },
                data: { monthlyEmailSent: { increment: 1 } },
            });

            return { success: true, messageId: result.messageId };
        } catch (error: any) {
            // Log failed attempt
            await prisma.notificationLog.create({
                data: {
                    institutionId,
                    type: 'email',
                    recipient: recipientEmail,
                    recipientName,
                    subject,
                    content: htmlContent,
                    status: 'failed',
                    errorMessage: error.message,
                    priority,
                },
            });

            throw error;
        }
    },

    async sendBulkEmail(institutionId: string, data: SendBulkEmailInput) {
        const { recipients, subject, body, templateId, priority } = data;

        const results = {
            sent: 0,
            failed: 0,
            errors: [] as { email: string; error: string }[],
        };

        // Get template if specified
        let template: any = null;
        if (templateId) {
            template = await prisma.notificationTemplate.findFirst({
                where: { id: templateId, institutionId },
            });
        }

        for (const recipient of recipients) {
            try {
                let htmlContent = body || '';
                if (template) {
                    htmlContent = this.renderTemplate(template.content, {
                        ...recipient.data,
                        name: recipient.name,
                    });
                }

                await mockEmailProvider.send({
                    to: recipient.email,
                    subject,
                    html: htmlContent,
                });

                results.sent++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({ email: recipient.email, error: error.message });
            }
        }

        // Log bulk operation
        await prisma.notificationLog.create({
            data: {
                institutionId,
                type: 'email',
                recipient: `bulk:${recipients.length}`,
                subject,
                content: `Bulk email to ${recipients.length} recipients`,
                status: results.failed === 0 ? 'sent' : 'partial',
                metadata: results as import('@prisma/client').Prisma.InputJsonValue,
                priority,
                sentAt: new Date(),
            },
        });

        // Update usage
        await prisma.institution.update({
            where: { id: institutionId },
            data: { monthlyEmailSent: { increment: results.sent } },
        });

        return results;
    },

    // ============================================================================
    // SMS
    // ============================================================================

    async sendSms(institutionId: string, data: SendSmsInput) {
        const { phoneNumber, message, templateId, templateData } = data;

        let smsContent = message;

        if (templateId) {
            const template = await prisma.notificationTemplate.findFirst({
                where: { id: templateId, institutionId, type: 'sms' },
            });

            if (template) {
                smsContent = this.renderTemplate(template.content, templateData || {});
            }
        }

        try {
            const result = await mockSmsProvider.send({
                to: phoneNumber,
                message: smsContent,
            });

            await prisma.notificationLog.create({
                data: {
                    institutionId,
                    type: 'sms',
                    recipient: phoneNumber,
                    content: smsContent,
                    status: 'sent',
                    messageId: result.messageId,
                    sentAt: new Date(),
                },
            });

            return { success: true, messageId: result.messageId };
        } catch (error: any) {
            await prisma.notificationLog.create({
                data: {
                    institutionId,
                    type: 'sms',
                    recipient: phoneNumber,
                    content: smsContent,
                    status: 'failed',
                    errorMessage: error.message,
                },
            });

            throw error;
        }
    },

    async sendBulkSms(institutionId: string, data: SendBulkSmsInput) {
        const { recipients, message, templateId } = data;

        const results = {
            sent: 0,
            failed: 0,
            errors: [] as { phone: string; error: string }[],
        };

        let template: any = null;
        if (templateId) {
            template = await prisma.notificationTemplate.findFirst({
                where: { id: templateId, institutionId, type: 'sms' },
            });
        }

        for (const recipient of recipients) {
            try {
                let smsContent = message;
                if (template) {
                    smsContent = this.renderTemplate(template.content, recipient.data || {});
                }

                await mockSmsProvider.send({
                    to: recipient.phoneNumber,
                    message: smsContent,
                });

                results.sent++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({ phone: recipient.phoneNumber, error: error.message });
            }
        }

        await prisma.notificationLog.create({
            data: {
                institutionId,
                type: 'sms',
                recipient: `bulk:${recipients.length}`,
                content: `Bulk SMS to ${recipients.length} recipients`,
                status: results.failed === 0 ? 'sent' : 'partial',
                metadata: results as import('@prisma/client').Prisma.InputJsonValue,
                sentAt: new Date(),
            },
        });

        return results;
    },

    // ============================================================================
    // IN-APP NOTIFICATIONS
    // ============================================================================

    async sendNotification(institutionId: string, data: SendNotificationInput) {
        const { userId, title, message, type, actionUrl, metadata } = data;

        const notification = await prisma.notification.create({
            data: {
                userId,
                institutionId,
                title,
                message,
                type,
                actionUrl,
                metadata: metadata as import('@prisma/client').Prisma.InputJsonValue,
                isRead: false,
            },
        });

        // Could emit WebSocket event here for real-time notifications
        logger.info('In-app notification created', { notificationId: notification.id, userId });

        return notification;
    },

    async getUserNotifications(userId: string, query: { unreadOnly?: boolean; page?: number; limit?: number }) {
        const { unreadOnly = false, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (unreadOnly) where.isRead = false;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
        ]);

        return {
            notifications,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            unreadCount: await prisma.notification.count({ where: { userId, isRead: false } }),
        };
    },

    async markAsRead(notificationId: string, userId: string) {
        return prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    },

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    },

    // ============================================================================
    // TEMPLATES
    // ============================================================================

    async createTemplate(institutionId: string, data: NotificationTemplateInput) {
        return prisma.notificationTemplate.create({
            data: {
                institutionId,
                name: data.name,
                type: data.type,
                subject: data.subject,
                content: data.content,
                variables: data.variables || [],
                isActive: data.isActive ?? true,
            },
        });
    },

    async listTemplates(institutionId: string, type?: string) {
        return prisma.notificationTemplate.findMany({
            where: {
                institutionId,
                ...(type && { type: type as any }),
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    // ============================================================================
    // NOTIFICATION LOG
    // ============================================================================

    async getNotificationLog(institutionId: string, query: NotificationQueryInput) {
        const { type, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = { institutionId };
        if (type) where.type = type;
        if (status) where.status = status;

        const [logs, total] = await Promise.all([
            prisma.notificationLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notificationLog.count({ where }),
        ]);

        return {
            logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    renderTemplate(template: string, data: Record<string, any>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
            return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
        });
    },
};
