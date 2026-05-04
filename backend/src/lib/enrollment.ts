import { prisma } from '../config/database.js';
import { CircuitBreaker } from '../utils/circuit-breaker.js';
import { BadRequestError } from '../utils/errors.js';
import { Prisma, SlotStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger.js';

// Circuit breaker for database operations to prevent event loop blocking on external boundary
const dbBreaker = new CircuitBreaker('enrollmentDb', { failureThreshold: 3, resetTimeoutMs: 30000 });

export type EnrollmentMode = 'self-service' | 'manual' | 'csv' | 'quick-add';

export interface EnrollStudentOptions {
    sectionId: string;
    institutionId: string;
    mode: EnrollmentMode;
    data?: Omit<Prisma.StudentUncheckedCreateInput, 'institutionId' | 'sectionId' | 'branchId' | 'slotId' | 'status' | 'dataStatus' | 'admissionNumber'> & { admissionNumber?: string | null } | null;
}

export const enrollmentService = {
    /**
     * Core shared service function to handle student enrollment and slot allocation.
     * All entries route through here to guarantee capacity safety and UI grid state consistency.
     */
    async enrollStudent(options: EnrollStudentOptions) {
        return dbBreaker.execute(async () => {
            const { sectionId, institutionId, mode, data } = options;

            // Enforce that we cannot submit full entry data without a student name
            if (data && (!data.name || String(data.name).trim() === '')) {
                throw new BadRequestError('Student name is required for enrollment.');
            }

            return await prisma.$transaction(async (tx) => {
                // 1. Verify section and get capacity info
                const section = await tx.section.findUnique({
                    where: { id: sectionId },
                    select: {
                        id: true,
                        institutionId: true,
                        expectedStudentCount: true,
                        class: { select: { branchId: true } },
                        institution: { select: { code: true, academicYear: true } }
                    }
                });

                if (!section || section.institutionId !== institutionId) {
                    throw new BadRequestError('Section not found or unauthorized');
                }

                // 2. Find the next EMPTY slot
                let slot = await tx.admissionSlot.findFirst({
                    where: { sectionId, status: SlotStatus.EMPTY },
                    orderBy: { rollNo: 'asc' }
                });

                if (!slot) {
                    // 3. No empty slots -> Auto-increment capacity with a soft warning
                    logger.warn(`Section ${sectionId} is at capacity. Auto-expanding capacity for new enrollment.`);

                    const lastSlot = await tx.admissionSlot.findFirst({
                        where: { sectionId },
                        orderBy: { rollNo: 'desc' }
                    });

                    const nextRollNo = (lastSlot?.rollNo || 0) + 1;

                    // Expand capacity
                    await tx.section.update({
                        where: { id: sectionId },
                        data: { expectedStudentCount: { increment: 1 } }
                    });

                    // Create the new empty slot
                    slot = await tx.admissionSlot.create({
                        data: {
                            sectionId,
                            rollNo: nextRollNo,
                            status: SlotStatus.EMPTY,
                            token: nanoid(10)
                        }
                    });
                }

                // 4. Mode routing
                if (mode === 'self-service') {
                    // Reserve seat, return token URL
                    const updatedSlot = await tx.admissionSlot.update({
                        where: { id: slot.id },
                        data: { status: SlotStatus.INVITED }
                    });

                    return {
                        message: 'Seat reserved for self-service onboarding',
                        slot: updatedSlot,
                        tokenUrl: `/onboard/${updatedSlot.token}`
                    };
                }

                // For 'quick-add' when data is null, we reserve seat for manual entry UI
                if (!data) {
                    // A quick-add reserves an invited seat so the Teacher can fill it via Modal
                    const updatedSlot = await tx.admissionSlot.update({
                        where: { id: slot.id },
                        data: { status: SlotStatus.INVITED }
                    });

                    return {
                        message: 'Seat reserved for manual entry',
                        slot: updatedSlot
                    };
                }

                // If we need to generate admission number
                let finalAdmissionNumber = data.admissionNumber || null;
                if (!finalAdmissionNumber) {
                    // Try to generate one
                    const prefix = section.institution.code.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
                    const academicYear = section.institution.academicYear || '2025-2026';
                    const yearPart = academicYear.replace(/-/g, '').substring(2, 6) || '2526';

                    const lastStudent = await tx.student.findFirst({
                        where: { institutionId, admissionNumber: { startsWith: `${prefix}-${yearPart}-` } },
                        orderBy: { admissionNumber: 'desc' },
                        select: { admissionNumber: true }
                    });

                    const lastSeq = lastStudent?.admissionNumber ? parseInt(lastStudent.admissionNumber.split('-').pop() || '0', 10) : 0;
                    finalAdmissionNumber = `${prefix}-${yearPart}-${String(lastSeq + 1).padStart(4, '0')}`;
                }

                // 5. Create student record
                const newStudent = await tx.student.create({
                    data: {
                        ...data,
                        admissionNumber: finalAdmissionNumber,
                        institutionId,
                        sectionId,
                        branchId: section.class.branchId,
                        status: 'active',
                        dataStatus: 'filled',
                        slotId: slot.id
                    }
                });

                // Update slot to FILLED
                const filledSlot = await tx.admissionSlot.update({
                    where: { id: slot.id },
                    data: { status: SlotStatus.FILLED }
                });

                return {
                    message: 'Student successfully enrolled',
                    slot: filledSlot,
                    student: newStudent
                };
            });
        });
    }
};
