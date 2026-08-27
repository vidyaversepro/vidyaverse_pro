import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import type {
    DashboardQueryInput,
    StudentAnalyticsQueryInput,
    DocumentAnalyticsQueryInput,
    UsageAnalyticsQueryInput,
    CustomReportInput,
} from '@vidyaverse/shared-validation';

export const analyticsService = {
    // ============================================================================
    // DASHBOARD OVERVIEW
    // ============================================================================

    async getDashboardOverview(institutionId: string, query: DashboardQueryInput) {
        const { period, startDate, endDate } = query;
        const dateRange = this.getDateRange(period, startDate, endDate);

        const [
            totalStudents,
            activeStudents,
            totalClasses,
            totalSections,
            documentsGenerated,
            pendingApprovals,
            todayAttendance,
            recentActivity,
        ] = await Promise.all([
            prisma.student.count({ where: { institutionId } }),
            prisma.student.count({ where: { institutionId, status: 'active' } }),
            prisma.class.count({ where: { institutionId } }),
            prisma.section.count({ where: { class: { institutionId } } }),
            this.getDocumentStats(institutionId, dateRange),
            prisma.approvalRequest.count({ where: { institutionId, status: 'pending' } }),
            this.getTodayAttendanceRate(institutionId),
            this.getRecentActivity(institutionId, 10),
        ]);

        return {
            overview: {
                totalStudents,
                activeStudents,
                totalClasses,
                totalSections,
                pendingApprovals,
                todayAttendanceRate: todayAttendance,
            },
            documents: documentsGenerated,
            recentActivity,
            dateRange,
        };
    },

    async getDocumentStats(institutionId: string, dateRange: { start: Date; end: Date }) {
        const where = {
            institutionId,
            createdAt: { gte: dateRange.start, lte: dateRange.end },
        };

        const [idCards, certificates, hallTickets, marksheets, libraryCards, transferCerts] = await Promise.all([
            prisma.idCard.count({ where }),
            prisma.certificate.count({ where }),
            prisma.hallTicket.count({ where }),
            prisma.marksheet.count({ where }),
            prisma.libraryCard.count({ where }),
            prisma.transferCertificate.count({ where }),
        ]);

        return {
            idCards,
            certificates,
            hallTickets,
            marksheets,
            libraryCards,
            transferCerts,
            total: idCards + certificates + hallTickets + marksheets + libraryCards + transferCerts,
        };
    },

    async getTodayAttendanceRate(institutionId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessions = await prisma.attendanceSession.findMany({
            where: { institutionId, date: today },
            include: { records: true },
        });

        if (sessions.length === 0) return 0;

        let totalRecords = 0;
        let presentOrLate = 0;

        sessions.forEach((session) => {
            totalRecords += session.records.length;
            presentOrLate += session.records.filter(
                (r) => r.status === 'present' || r.status === 'late'
            ).length;
        });

        return totalRecords > 0 ? Math.round((presentOrLate / totalRecords) * 100) : 0;
    },

    async getRecentActivity(institutionId: string, limit: number) {
        // Combine recent documents from various tables
        const [idCards, certificates, approvals] = await Promise.all([
            prisma.idCard.findMany({
                where: { institutionId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    student: { select: { name: true } },
                },
            }),
            prisma.certificate.findMany({
                where: { institutionId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    certificateType: true,
                    createdAt: true,
                    student: { select: { name: true } },
                },
            }),
            prisma.approvalRequest.findMany({
                where: { institutionId },
                take: limit,
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

        // Merge and sort by date
        const activities = [
            ...idCards.map((i) => ({
                type: 'id_card',
                description: `ID card generated for ${i.student.name}`,
                timestamp: i.createdAt,
            })),
            ...certificates.map((c) => ({
                type: 'certificate',
                description: `${c.certificateType} certificate for ${c.student.name}`,
                timestamp: c.createdAt,
            })),
            ...approvals.map((a) => ({
                type: 'approval',
                description: `${a.type} request ${a.status} by ${a.requester.name}`,
                timestamp: a.createdAt,
            })),
        ];

        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    },

    // ============================================================================
    // STUDENT ANALYTICS
    // ============================================================================

    async getStudentAnalytics(institutionId: string, query: StudentAnalyticsQueryInput) {
        const { sectionId, classId } = query;

        const where: Record<string, unknown> = { institutionId, status: 'active' };
        if (sectionId) where.sectionId = sectionId;
        if (classId) where.section = { classId };

        // Get student counts by section
        const studentsBySection = await prisma.section.findMany({
            where: { class: { institutionId } },
            include: {
                class: true,
                _count: { select: { students: { where: { status: 'active' } } } },
            },
        });

        // Get gender distribution
        const genderDist = await prisma.student.groupBy({
            by: ['sex'],
            where,
            _count: true,
        });

        // Get monthly enrollments (last 12 months)
        const monthlyEnrollments = await this.getMonthlyEnrollments(institutionId);

        return {
            bySection: studentsBySection.map((s) => ({
                class: s.class.name,
                section: s.name,
                count: s._count.students,
            })),
            genderDistribution: genderDist.map((g) => ({
                gender: g.sex,
                count: g._count,
            })),
            monthlyEnrollments,
        };
    },

    async getMonthlyEnrollments(institutionId: string) {
        const months: { month: string; count: number }[] = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const count = await prisma.student.count({
                where: {
                    institutionId,
                    dateOfAdmission: { gte: start, lte: end },
                },
            });

            months.push({
                month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                count,
            });
        }

        return months;
    },

    // ============================================================================
    // DOCUMENT ANALYTICS
    // ============================================================================

    async getDocumentAnalytics(institutionId: string, query: DocumentAnalyticsQueryInput) {
        const { startDate, endDate, groupBy } = query;
        const dateRange = this.getDateRange('month', startDate, endDate);

        // Get document generation trends
        const trends = await this.getDocumentTrends(institutionId, dateRange, groupBy);

        // Get type breakdown
        const typeBreakdown = await this.getDocumentStats(institutionId, dateRange);

        // Get top templates
        const topTemplates = await prisma.template.findMany({
            where: { institutionId },
            take: 5,
            select: { id: true, name: true, serviceType: true },
        });

        return {
            dateRange,
            trends,
            typeBreakdown,
            topTemplates,
        };
    },

    async getDocumentTrends(
        institutionId: string,
        dateRange: { start: Date; end: Date },
        groupBy: string = 'day'
    ) {
        // This is a simplified implementation
        // In production, you'd use raw SQL for proper date grouping
        const idCards = await prisma.idCard.findMany({
            where: {
                institutionId,
                createdAt: { gte: dateRange.start, lte: dateRange.end },
            },
            select: { createdAt: true },
        });

        const certificates = await prisma.certificate.findMany({
            where: {
                institutionId,
                createdAt: { gte: dateRange.start, lte: dateRange.end },
            },
            select: { createdAt: true },
        });

        // Group by date
        const trendMap = new Map<string, number>();

        [...idCards, ...certificates].forEach((doc) => {
            const key = this.formatDateKey(doc.createdAt, groupBy);
            trendMap.set(key, (trendMap.get(key) || 0) + 1);
        });

        return Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    formatDateKey(date: Date, groupBy: string): string {
        switch (groupBy) {
            case 'week': {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                return weekStart.toISOString().split('T')[0];
            }
            case 'month':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            default:
                return date.toISOString().split('T')[0];
        }
    },

    // ============================================================================
    // USAGE ANALYTICS
    // ============================================================================

    async getUsageAnalytics(institutionId: string, _query: UsageAnalyticsQueryInput) {
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId },
            select: {
                storageUsedMb: true,
                monthlyEmailSent: true,
            },
        });

        if (!institution) {
            return null;
        }

        // Get API usage from audit logs
        const apiCalls = await prisma.auditLog.count({
            where: {
                institutionId,
                timestamp: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
            },
        });

        return {
            storage: {
                used: Number(institution.storageUsedMb) || 0,
                limit: 10240, // 10GB default in MB
                percentage: Math.round(((Number(institution.storageUsedMb) || 0) / 10240) * 100),
            },
            email: {
                sent: institution.monthlyEmailSent || 0,
                limit: 1000,
                percentage: Math.round(((institution.monthlyEmailSent || 0) / 1000) * 100),
            },
            apiCalls: {
                thisMonth: apiCalls,
            },
        };
    },

    // ============================================================================
    // ATTENDANCE ANALYTICS
    // ============================================================================

    async getAttendanceAnalytics(institutionId: string, query: StudentAnalyticsQueryInput) {
        const dateRange = this.getDateRange('month', query.startDate, query.endDate);

        // Get attendance by day of week
        const sessions = await prisma.attendanceSession.findMany({
            where: {
                institutionId,
                date: { gte: dateRange.start, lte: dateRange.end },
            },
            include: { records: true },
        });

        const dayOfWeekStats = [0, 1, 2, 3, 4, 5, 6].map((day) => {
            const daySessions = sessions.filter((s) => s.date.getDay() === day);
            let total = 0;
            let present = 0;

            daySessions.forEach((s) => {
                total += s.records.length;
                present += s.records.filter((r) => r.status === 'present' || r.status === 'late').length;
            });

            return {
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
                rate: total > 0 ? Math.round((present / total) * 100) : 0,
                sessions: daySessions.length,
            };
        });

        // Get sections with lowest attendance
        const sectionStats = await prisma.section.findMany({
            where: { class: { institutionId } },
            include: {
                class: true,
                _count: { select: { students: { where: { status: 'active' } } } },
            },
        });

        const sectionAttendance = await Promise.all(
            sectionStats.map(async (section) => {
                const sectionSessions = sessions.filter((s) => s.sectionId === section.id);
                let total = 0;
                let present = 0;

                sectionSessions.forEach((s) => {
                    total += s.records.length;
                    present += s.records.filter((r) => r.status === 'present' || r.status === 'late').length;
                });

                return {
                    class: section.class.name,
                    section: section.name,
                    studentCount: section._count.students,
                    rate: total > 0 ? Math.round((present / total) * 100) : 0,
                };
            })
        );

        return {
            dateRange,
            byDayOfWeek: dayOfWeekStats,
            bySection: sectionAttendance.sort((a, b) => a.rate - b.rate),
        };
    },

    // ============================================================================
    // CUSTOM REPORTS
    // ============================================================================

    async generateCustomReport(institutionId: string, input: CustomReportInput) {
        const { name, type, filters, sortBy, sortOrder } = input;

        logger.info('Generating custom report', { institutionId, type, name });

        let data: any[] = [];

        switch (type) {
            case 'students':
                data = await this.generateStudentReport(institutionId, filters);
                break;
            case 'attendance':
                data = await this.generateAttendanceReport(institutionId, filters);
                break;
            case 'documents':
                data = await this.generateDocumentReport(institutionId, filters);
                break;
        }

        // Sort if requested
        if (sortBy && data.length > 0) {
            data.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];
                const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return sortOrder === 'desc' ? -cmp : cmp;
            });
        }

        return {
            name,
            type,
            generatedAt: new Date(),
            rowCount: data.length,
            data,
        };
    },

    async generateStudentReport(institutionId: string, filters?: Record<string, any>) {
        const where: Record<string, unknown> = { institutionId };
        if (filters?.sectionId) where.sectionId = filters.sectionId;
        if (filters?.status !== undefined) where.status = filters.status;

        const students = await prisma.student.findMany({
            where,
            include: {
                section: { include: { class: true } },
            },
        });

        return students.map((s) => ({
            id: s.id,
            name: s.name,
            admissionNumber: s.admissionNumber,
            class: s.section.class.name,
            section: s.section.name,
            gender: s.sex,
            status: s.status,
            admissionDate: s.dateOfAdmission,
        }));
    },

    async generateAttendanceReport(institutionId: string, filters?: Record<string, any>) {
        const where: any = { session: { institutionId } };
        if (filters?.sectionId) where.session = { ...where.session, sectionId: filters.sectionId };
        if (filters?.startDate && filters?.endDate) {
            where.session = {
                ...where.session,
                date: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) },
            };
        }

        const records = await prisma.attendanceRecord.findMany({
            where,
            include: {
                student: { select: { name: true, admissionNumber: true } },
                session: { select: { date: true, type: true } },
            },
        });

        return records.map((r) => ({
            date: r.session.date,
            student: r.student.name,
            admissionNumber: r.student.admissionNumber,
            status: r.status,
            arrivalTime: r.arrivalTime,
        }));
    },

    async generateDocumentReport(institutionId: string, filters?: Record<string, any>) {
        const where: any = { institutionId };
        if (filters?.startDate && filters?.endDate) {
            where.createdAt = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
        }

        const [idCards, certificates] = await Promise.all([
            prisma.idCard.findMany({
                where,
                include: { student: { select: { name: true } } },
            }),
            prisma.certificate.findMany({
                where,
                include: { student: { select: { name: true } } },
            }),
        ]);

        return [
            ...idCards.map((i) => ({
                type: 'ID Card',
                student: i.student.name,
                status: i.status,
                createdAt: i.createdAt,
            })),
            ...certificates.map((c) => ({
                type: c.certificateType,
                student: c.student.name,
                status: c.status,
                createdAt: c.createdAt,
            })),
        ];
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    getDateRange(
        period: string,
        startDate?: string,
        endDate?: string
    ): { start: Date; end: Date } {
        if (startDate && endDate) {
            return { start: new Date(startDate), end: new Date(endDate) };
        }

        const now = new Date();
        let start: Date;
        const end = now;

        switch (period) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        return { start, end };
    },
};
