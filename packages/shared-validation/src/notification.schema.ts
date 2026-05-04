import { z } from 'zod';

// Email notification
export const sendEmailSchema = z.object({
    recipientEmail: z.string().email(),
    recipientName: z.string().max(255).optional(),
    subject: z.string().min(1).max(255),
    body: z.string().min(1).max(10000),
    templateId: z.string().uuid().optional(),
    templateData: z.record(z.any()).optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(), // base64 or URL
        contentType: z.string().optional(),
    })).max(5).optional(),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

// Bulk email
export const sendBulkEmailSchema = z.object({
    recipients: z.array(z.object({
        email: z.string().email(),
        name: z.string().max(255).optional(),
        data: z.record(z.any()).optional(), // template personalization
    })).min(1).max(500),
    subject: z.string().min(1).max(255),
    body: z.string().min(1).max(10000).optional(),
    templateId: z.string().uuid().optional(),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

// SMS notification
export const sendSmsSchema = z.object({
    phoneNumber: z.string().regex(/^\+?[1-9]\d{6,14}$/),
    message: z.string().min(1).max(160),
    templateId: z.string().uuid().optional(),
    templateData: z.record(z.any()).optional(),
});

// Bulk SMS
export const sendBulkSmsSchema = z.object({
    recipients: z.array(z.object({
        phoneNumber: z.string().regex(/^\+?[1-9]\d{6,14}$/),
        data: z.record(z.any()).optional(),
    })).min(1).max(1000),
    message: z.string().min(1).max(160),
    templateId: z.string().uuid().optional(),
});

// In-app notification
export const sendNotificationSchema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
    type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
    actionUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
});

// Notification template
export const notificationTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['email', 'sms', 'push']),
    subject: z.string().max(255).optional(), // for email
    content: z.string().min(1).max(10000),
    variables: z.array(z.string()).optional(), // placeholder variables
    isActive: z.boolean().default(true),
});

// Query schemas
export const notificationQuerySchema = z.object({
    userId: z.string().uuid().optional(),
    type: z.enum(['email', 'sms', 'push']).optional(),
    status: z.enum(['pending', 'sent', 'failed', 'read']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendBulkEmailInput = z.infer<typeof sendBulkEmailSchema>;
export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type SendBulkSmsInput = z.infer<typeof sendBulkSmsSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type NotificationTemplateInput = z.infer<typeof notificationTemplateSchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
