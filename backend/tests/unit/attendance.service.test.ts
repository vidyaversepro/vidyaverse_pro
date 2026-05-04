import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attendanceService } from '../../src/modules/attendance/attendance.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
    prisma: {
        section: { findFirst: vi.fn() },
        attendanceSession: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        attendanceRecord: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
        },
        student: { findFirst: vi.fn(), findMany: vi.fn() },
    },
}));

vi.mock('../../src/config/redis', () => {
    const mockRedisClient = {
        get: vi.fn(),
        setex: vi.fn(),
        del: vi.fn(),
    };
    return {
        getRedisClient: vi.fn(() => mockRedisClient),
        cache: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            delPattern: vi.fn(),
        },
    };
});

import { prisma } from '../../src/config/database';
import { cache, getRedisClient } from '../../src/config/redis';

const mockPrisma = prisma as unknown as {
    section: { findFirst: ReturnType<typeof vi.fn> };
    attendanceSession: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        count: ReturnType<typeof vi.fn>;
    };
    attendanceRecord: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
    };
    student: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
};
const mockCache = cache as unknown as {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    delPattern: ReturnType<typeof vi.fn>;
};
const mockGetRedisClient = getRedisClient as ReturnType<typeof vi.fn>;
const mockRedisClient = mockGetRedisClient() as {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
};

describe('Attendance Service', () => {
    const mockInstitutionId = 'inst-123';
    const mockUserId = 'user-123';
    const mockSessionId = 'session-123';
    const mockSectionId = 'section-123';
    const mockStudentId = 'student-123';
    const mockClassId = 'class-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create a new attendance session with QR code', async () => {
            const sessionData = {
                classId: mockClassId,
                sectionId: mockSectionId,
                date: '2024-01-15',
                type: 'class' as const,
                startTime: '09:00',
            };

            const mockSection = {
                id: mockSectionId,
                classId: mockClassId,
                class: { institutionId: mockInstitutionId },
            };

            const mockCreatedSession = {
                id: mockSessionId,
                institutionId: mockInstitutionId,
                ...sessionData,
                status: 'open',
                section: { class: { name: 'Class 10' }, name: 'A' },
            };

            mockPrisma.section.findFirst.mockResolvedValue(mockSection);
            mockPrisma.attendanceSession.findFirst.mockResolvedValue(null);
            mockPrisma.attendanceSession.create.mockResolvedValue(mockCreatedSession);
            mockRedisClient.setex.mockResolvedValue('OK');

            const result = await attendanceService.createSession(mockInstitutionId, mockUserId, sessionData);

            expect(result).toBeDefined();
            expect(result.id).toBe(mockSessionId);
            expect(result.qrCode).toBeDefined();
            expect(mockRedisClient.setex).toHaveBeenCalled();
        });

        it('should throw error if section not found', async () => {
            mockPrisma.section.findFirst.mockResolvedValue(null);

            await expect(
                attendanceService.createSession(mockInstitutionId, mockUserId, {
                    classId: mockClassId,
                    sectionId: 'invalid-section',
                    date: '2024-01-15',
                    type: 'class',
                    startTime: '09:00',
                })
            ).rejects.toThrow('Section not found');
        });

        it('should throw error if duplicate session exists', async () => {
            mockPrisma.section.findFirst.mockResolvedValue({
                id: mockSectionId,
                classId: mockClassId,
                class: { institutionId: mockInstitutionId },
            });
            mockPrisma.attendanceSession.findFirst.mockResolvedValue({
                id: 'existing-session',
            });

            await expect(
                attendanceService.createSession(mockInstitutionId, mockUserId, {
                    classId: mockClassId,
                    sectionId: mockSectionId,
                    date: '2024-01-15',
                    type: 'class',
                    startTime: '09:00',
                })
            ).rejects.toThrow('Attendance session already exists');
        });
    });

    describe('closeSession', () => {
        it('should close session and invalidate QR code', async () => {
            const mockSession = {
                id: mockSessionId,
                institutionId: mockInstitutionId,
                status: 'open',
                records: [],
            };

            mockPrisma.attendanceSession.findFirst.mockResolvedValue(mockSession);
            mockCache.delPattern.mockResolvedValue(undefined);
            mockPrisma.attendanceSession.update.mockResolvedValue({
                ...mockSession,
                status: 'closed',
            });

            const result = await attendanceService.closeSession(mockSessionId, mockInstitutionId);

            expect(result.status).toBe('closed');
            expect(mockCache.delPattern).toHaveBeenCalledWith(`attendance:qr:${mockSessionId}`);
        });
    });

    describe('getStudentAttendance', () => {
        it('should calculate attendance stats correctly', async () => {
            const mockRecords = [
                { status: 'present', session: { date: new Date(), type: 'class' } },
                { status: 'present', session: { date: new Date(), type: 'class' } },
                { status: 'late', session: { date: new Date(), type: 'class' } },
                { status: 'absent', session: { date: new Date(), type: 'class' } },
                { status: 'excused', session: { date: new Date(), type: 'class' } },
            ];

            mockPrisma.attendanceRecord.findMany.mockResolvedValue(mockRecords);

            const result = await attendanceService.getStudentAttendance(mockStudentId, mockInstitutionId);

            expect(result.stats.total).toBe(5);
            expect(result.stats.present).toBe(2);
            expect(result.stats.late).toBe(1);
            expect(result.stats.absent).toBe(1);
            expect(result.stats.excused).toBe(1);
            expect(parseFloat(result.stats.attendanceRate)).toBe(60); // (2+1)/5 = 60%
        });
    });
});
