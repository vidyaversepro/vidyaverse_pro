import { prisma } from '../config/database.js';
import { logger } from './logger.js';

export interface AuditLogPayload {
    action: string;
    userId?: string;
    institutionId?: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}

/**
 * Fire-and-forget asynchronous audit logger.
 * Does not block the main execution thread.
 */
export function logAudit(data: AuditLogPayload): void {
    // Escape standard error tracking to not crash main thread
    setImmediate(async () => {
        try {
            await prisma.auditLog.create({
                data: {
                    action: data.action.substring(0, 100),
                    userId: data.userId,
                    institutionId: data.institutionId,
                    entityType: data.entityType.substring(0, 100),
                    entityId: data.entityId,
                    changes: data.changes || undefined,
                    ipAddress: data.ipAddress?.substring(0, 50),
                    userAgent: data.userAgent?.substring(0, 500),
                    requestId: data.requestId?.substring(0, 100),
                    timestamp: new Date()
                }
            });
        } catch (error) {
            // Just log to console/winston, do not throw
            logger.error(`Failed to write audit log [${data.action}]: ${error}`);
        }
    });
}
