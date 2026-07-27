// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { auth } from '../../lib/auth.js';
import { prisma } from '../../config/database.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
    // Get Current User attached to Better Auth session
    fastify.get('/me', async (request, reply) => {
        // Build generic Request so auth can infer correctly on fastify
        const url = new URL(request.url, process.env.API_BASE_URL || 'http://localhost:3002');
        const webReq = new Request(url, { method: request.method, headers: request.headers as HeadersInit });
        const session = await auth.api.getSession({ headers: webReq.headers });
        
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const user = session.user as any;
        return reply.send({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                globalRole: user.globalRole,
                roles: [], 
            }
        });
    });

    fastify.get('/me/institution-role', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const user = request.user as any;
            const institutionId = request.headers['x-institution-id'] as string;

            if (!institutionId) {
                return reply.send({ success: true, data: { role: null } });
            }

            const record = await prisma.userInstitutionRole.findFirst({
                where: { userId: user.userId, institutionId },
                select: { role: true },
            });

            return reply.send({
                success: true,
                data: { role: record?.role ?? null },
            });
        },
    });
    // GET /me/student — returns the Student record linked to the authenticated user.
    // Returns 404 if no Student row has been linked to this user account yet.
    fastify.get('/me/student', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            request.log.info({ user: request.user }, '/me/student called with user');
            console.log('DEBUG /me/student user:', request.user);
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: {
                    id: true,
                    name: true,
                    admissionNumber: true,
                    rollNumber: true,
                    section: {
                        select: {
                            id: true,
                            name: true,
                            class: { select: { id: true, name: true } },
                        },
                    },
                    institution: {
                        select: { id: true, name: true, code: true },
                    },
                },
            });

            if (!student) {
                return reply.status(404).send({
                    success: false,
                    message: 'No student profile is linked to this account. Contact your school administrator.',
                });
            }

            return reply.send({ success: true, data: student });
        },
    });

    fastify.get('/me/attendance', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const query = request.query as { startDate?: string; endDate?: string };
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { id: true, institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const { attendanceService } = await import('../attendance/attendance.service.js');
            const data = await attendanceService.getStudentAttendance(student.institutionId, student.id, query.startDate, query.endDate);
            return reply.send({ success: true, data });
        },
    });

    fastify.get('/me/timetable/today', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { sectionId: true, institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
            const todayEnum = days[new Date().getDay()];

            const slots = await prisma.timetableSlot.findMany({
                where: { sectionId: student.sectionId, dayOfWeek: todayEnum },
                include: { period: true },
                orderBy: { period: { sequence: 'asc' } },
            });

            // Filter out breaks if needed, or just return all and let frontend decide. Returning all.
            const activeSlots = slots.filter(s => !s.period.isBreak);
            return reply.send({ success: true, data: activeSlots });
        },
    });

    fastify.get('/me/notices', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const query = request.query as { limit?: string };
            const limit = parseInt(query.limit || '5', 10);
            
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const notices = await prisma.notice.findMany({
                where: {
                    institutionId: student.institutionId,
                    status: 'published',
                    audience: { in: ['all', 'students'] },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: new Date() } }
                    ]
                },
                orderBy: [
                    { isPinned: 'desc' },
                    { publishedAt: 'desc' }
                ],
                take: limit,
            });
            return reply.send({ success: true, data: notices });
        },
    });

    fastify.get('/me/transport', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { id: true, institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const assignment = await prisma.studentTransport.findFirst({
                where: { studentId: student.id, isActive: true },
                include: {
                    route: true,
                    stop: true,
                },
            });
            if (!assignment || !assignment.route) {
                return reply.status(404).send({ success: false, message: 'No transport assigned' });
            }

            return reply.send({
                success: true,
                data: {
                    routeName: assignment.route.name,
                    routeCode: assignment.route.code,
                    vehicleNumber: assignment.route.vehicleNumber,
                    driverName: assignment.route.driverName,
                    driverPhone: assignment.route.driverPhone,
                    stop: assignment.stop ? {
                        name: assignment.stop.name,
                        pickupTime: assignment.stop.pickupTime,
                        dropTime: assignment.stop.dropTime,
                    } : null
                }
            });
        },
    });

    fastify.get('/me/hostel', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { id: true, institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const allotment = await prisma.hostelAllotment.findFirst({
                where: { studentId: student.id, status: 'active' },
                include: {
                    room: {
                        include: {
                            block: true
                        }
                    }
                },
            });

            if (!allotment || !allotment.room) {
                return reply.status(404).send({ success: false, message: 'No hostel assigned' });
            }

            return reply.send({
                success: true,
                data: {
                    hostelBlockName: allotment.room.block.name,
                    blockCode: allotment.room.block.code,
                    roomNumber: allotment.room.roomNumber,
                    floor: allotment.room.floor,
                    bedNumber: allotment.bedNumber,
                    wardenName: allotment.room.block.wardenName,
                    wardenPhone: allotment.room.block.wardenPhone,
                }
            });
        },
    });

    fastify.get('/me/documents', {
        preHandler: [fastify.authenticate],
        handler: async (request, reply) => {
            const student = await prisma.student.findUnique({
                where: { userId: request.user.userId },
                select: { id: true, institutionId: true },
            });
            if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });

            const [idCards, hallTickets, certificates, transferCertificates] = await Promise.all([
                prisma.idCard.findMany({
                    where: { studentId: student.id, pdfUrl: { not: null } },
                    select: { id: true, cardNumber: true, pdfUrl: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.hallTicket.findMany({
                    where: { studentId: student.id, pdfUrl: { not: null } },
                    select: { id: true, hallTicketNumber: true, pdfUrl: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.certificate.findMany({
                    where: { studentId: student.id, pdfUrl: { not: null } },
                    select: { id: true, title: true, certificateNumber: true, pdfUrl: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.transferCertificate.findMany({
                    where: { studentId: student.id, pdfUrl: { not: null } },
                    select: { id: true, tcSerialNumber: true, pdfUrl: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                })
            ]);

            return reply.send({
                success: true,
                data: {
                    idCards,
                    hallTickets,
                    certificates,
                    transferCertificates
                }
            });
        },
    });
};

export default authRoutes;
