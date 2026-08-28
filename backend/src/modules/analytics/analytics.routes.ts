// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/database.js';
import { analyticsService } from './analytics.service.js';
const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    /**
     * Platform-wide overview (super_admin only — no institution required)
     */
    fastify.get('/platform', {
        handler: async (request) => {
            // Only super_admin can access platform-wide stats
            if (request.user?.globalRole !== 'super_admin') {
                throw new Error('Access denied');
            }
            const [totalStudents, totalInstitutions, pendingApprovals, recentIdCards, recentCertificates, recentApprovals,] = await Promise.all([
                prisma.student.count(),
                prisma.institution.count(),
                prisma.approvalRequest.count({ where: { status: 'pending' } }),
                prisma.idCard.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        createdAt: true,
                        student: { select: { name: true } },
                        institution: { select: { name: true } },
                    },
                }),
                prisma.certificate.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        certificateType: true,
                        createdAt: true,
                        student: { select: { name: true } },
                        institution: { select: { name: true } },
                    },
                }),
                prisma.approvalRequest.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        createdAt: true,
                        requester: { select: { name: true } },
                    },
                }),
            ]);
            // Merge recent activity
            const recentActivity = [
                ...recentIdCards.map((i) => ({
                    type: 'id_card',
                    description: `ID card generated for ${i.student.name} (${i.institution.name})`,
                    timestamp: i.createdAt,
                })),
                ...recentCertificates.map((c) => ({
                    type: 'certificate',
                    description: `${c.certificateType} certificate for ${c.student.name} (${c.institution.name})`,
                    timestamp: c.createdAt,
                })),
                ...recentApprovals.map((a) => ({
                    type: 'approval',
                    description: `${a.type} request ${a.status} by ${a.requester.name}`,
                    timestamp: a.createdAt,
                })),
            ]
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 10);
            // Monthly enrollments (last 12 months across all institutions)
            const monthlyEnrollments = [];
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                const count = await prisma.student.count({
                    where: { dateOfAdmission: { gte: start, lte: end } },
                });
                monthlyEnrollments.push({
                    month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                    count,
                });
            }
            return {
                success: true,
                data: {
                    overview: {
                        totalStudents,
                        totalInstitutions,
                        pendingApprovals,
                    },
                    recentActivity,
                    monthlyEnrollments,
                },
            };
        },
    });
    /**
     * Dashboard overview
     */
    fastify.get('/dashboard', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const data = await analyticsService.getDashboardOverview(institutionId, query);
            return { success: true, data };
        },
    });
    /**
     * Student analytics
     */
    fastify.get('/students', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const data = await analyticsService.getStudentAnalytics(institutionId, query);
            return { success: true, data };
        },
    });
    /**
     * Document analytics
     */
    fastify.get('/documents', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const data = await analyticsService.getDocumentAnalytics(institutionId, query);
            return { success: true, data };
        },
    });
    /**
     * Attendance analytics
     */
    fastify.get('/attendance', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const data = await analyticsService.getAttendanceAnalytics(institutionId, query);
            return { success: true, data };
        },
    });
    /**
     * Usage analytics
     */
    fastify.get('/usage', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const data = await analyticsService.getUsageAnalytics(institutionId, query);
            return { success: true, data };
        },
    });
    /**
     * Generate custom report
     */
    fastify.post('/reports', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const input = request.body;
            const report = await analyticsService.generateCustomReport(institutionId, input);
            return { success: true, data: report };
        },
    });
};
export default analyticsRoutes;
