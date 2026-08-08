import { prisma } from '../../config/database';
import { Prisma, DataStatus, SlotStatus } from '@prisma/client';
import { enrollmentService } from '../../lib/enrollment.js';
import { nanoid } from 'nanoid';
import { BadRequestError, ForbiddenError, ConflictError, NotFoundError } from '../../utils/errors.js';
import { logAudit } from '../../utils/audit.js';
import { checkDuplicates } from './duplicateDetection.js';
import { schemaByTab } from '@vidyaverse/shared-validation';
import { processPhoto, generateThumbnail, uploadProcessedPhoto, uploadProcessedThumb } from '../../utils/photo-processor.js';
import { deleteObject, extractKey } from '../../config/minio.js';
import { logger } from '../../utils/logger.js';



// Valid data status transitions (state machine)
const VALID_DATA_TRANSITIONS: Record<DataStatus, DataStatus[]> = {
    pending: ['filled'],
    filled: ['enhanced', 'submitted'],
    enhanced: ['submitted'],
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: ['pending', 'filled'],
};

export const createStudentService = (tx: any = prisma) => ({
    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        institutionId?: string;
        branchId?: string;
        sectionId?: string;
        classId?: string;
        streamId?: string;
        status?: string;
        dataStatus?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const skip = (page - 1) * limit;

        // Build section filter combining classId and streamId
        const sectionFilter: any = {};
        if (params?.classId) sectionFilter.classId = params.classId;
        if (params?.streamId) sectionFilter.streamId = params.streamId;

        const where: Prisma.StudentWhereInput = {
            ...(params?.institutionId && { institutionId: params.institutionId }),
            ...(params?.branchId && { branchId: params.branchId }),
            ...(params?.sectionId && { sectionId: params.sectionId }),
            ...(Object.keys(sectionFilter).length > 0 && { section: sectionFilter }),
            ...(params?.status && { status: params.status as import('@prisma/client').StudentStatus }),
            ...(params?.dataStatus && { dataStatus: params.dataStatus as any }),
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search } },
                    { admissionNumber: { contains: params.search } },
                    { fatherName: { contains: params.search } },
                    { motherName: { contains: params.search } },
                ],
            }),
        };

        // Map frontend sort columns to Prisma fields
        let orderBy: any = { admissionSlot: { rollNo: 'asc' } }; // Default

        if (params?.sortBy) {
            const order = params.sortOrder === 'desc' ? 'desc' : 'asc';
            switch (params.sortBy) {
                case 'name':
                    orderBy = { name: order };
                    break;
                case 'status':
                    orderBy = { status: order };
                    break;
                case 'dataStatus':
                    orderBy = { dataStatus: order };
                    break;
                case 'rollNo':
                    orderBy = { admissionSlot: { rollNo: order } };
                    break;
                case 'admissionNumber':
                    orderBy = { admissionNumber: order };
                    break;
                case 'class':
                    orderBy = { section: { class: { name: order } } };
                    break;
            }
        }

        const [data, total] = await Promise.all([
            tx.student.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    admissionSlot: { select: { rollNo: true, status: true } },
                    institution: { select: { id: true, name: true } },
                    section: {
                        select: {
                            id: true,
                            name: true,
                            stream: { select: { id: true, name: true } },
                            class: { select: { id: true, name: true } },
                        },
                    },
                    branch: { select: { id: true, name: true } },
                },
            }),
            tx.student.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getAdmissionSlots(sectionId: string, params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }) {
        if (!sectionId) throw new BadRequestError('Section ID is required');

        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 100;
        const skip = (page - 1) * limit;

        const where: Prisma.AdmissionSlotWhereInput = {
            sectionId,
            ...(params?.status && { status: params.status as SlotStatus }),
            ...(params?.search && {
                student: {
                    OR: [
                        { name: { contains: params.search } },
                        { admissionNumber: { contains: params.search } },
                    ],
                },
            }),
        };

        const [data, total] = await Promise.all([
            tx.admissionSlot.findMany({
                where,
                skip,
                take: limit,
                orderBy: { rollNo: 'asc' },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            admissionNumber: true,
                            dataStatus: true,
                            status: true
                        }
                    }
                }
            }),
            tx.admissionSlot.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getApprovalQueue(params: {
        institutionId?: string;
        sectionId?: string;
        productId: string;
    }) {
        if (!params.institutionId) throw new BadRequestError('Institution ID is required');

        const institution = await tx.institution.findUnique({
            where: { id: params.institutionId },
            select: { enabledFields: true }
        });

        if (!institution) throw new BadRequestError('Institution not found');

        // Determine required fields based on productId
        // Hardcoding standard requirements for ID Cards for now
        let requiredFields: string[] = ['name', 'rollNo', 'admissionNumber', 'dob', 'bloodGroup', 'photoUrl'];
        if (params.productId === 'certificate') {
            requiredFields = ['name', 'rollNo', 'admissionNumber'];
        }

        const where: Prisma.StudentWhereInput = {
            institutionId: params.institutionId,
            ...(params.sectionId && { sectionId: params.sectionId }),
        };

        const studentsRaw = await tx.student.findMany({
            where,
            orderBy: { admissionSlot: { rollNo: 'asc' } },
            select: {
                id: true,
                name: true,
                admissionNumber: true,
                dob: true,
                bloodGroup: true,
                photoUrl: true,
                contact: true,
                fatherName: true,
                status: true,
                dataStatus: true,
                admissionSlot: { select: { rollNo: true } },
                section: { select: { id: true, name: true, class: { select: { name: true } } } }
            }
        });

        const students = studentsRaw.map((s: any) => ({
            ...s,
            rollNo: s.admissionSlot?.rollNo,
            admissionSlot: undefined
        }));

        const queue = students.map((student: any) => {
            const missingFields: string[] = [];
            requiredFields.forEach(field => {
                if (!student[field as keyof typeof student]) {
                    missingFields.push(field);
                }
            });

            return {
                ...student,
                isReady: missingFields.length === 0,
                missingFields,
            };
        });

        return {
            productId: params.productId,
            totalStudents: queue.length,
            readyCount: queue.filter((s: any) => s.isReady).length,
            students: queue
        };
    },

    async findById(id: string) {
        return tx.student.findUnique({
            where: { id },
            include: {
                admissionSlot: { select: { rollNo: true, status: true } },
                section: {
                    select: {
                        id: true,
                        name: true,
                        class: { select: { id: true, name: true } },
                        stream: { select: { id: true, name: true } },
                    },
                },
                institution: { select: { id: true, name: true, code: true, academicYear: true } },
                branch: { select: { id: true, name: true } },
                onboardingToken: { select: { token: true, mode: true, expiresAt: true } },
                formProgress: true,
            },
        });
    },

    async create(data: {
        institutionId: string;
        sectionId: string;
        branchId?: string;
        admissionNumber?: string;
        name: string;
        academicYear?: string;
        fatherName?: string;
        motherName?: string;
        guardianName?: string;
        guardianRelation?: string;
        guardianPhone?: string;
        sex?: string;
        dob?: string;
        bloodGroup?: string;
        aadharNumber?: string;
        caste?: string;
        religion?: string;
        contact?: string;
        parentEmail?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        dateOfAdmission?: string;
        previousSchool?: string;
        transportMode?: string;
        medicalNotes?: string;
        photoUrl?: string;
    }, userId?: string) {
        // Duplicate detection before enrollment
        const dupResult = await checkDuplicates(data.institutionId, {
            aadharNumber: data.aadharNumber,
            name: data.name,
            dob: data.dob ? new Date(data.dob) : undefined,
        });
        if (dupResult.isDuplicate) {
            const matchInfo = dupResult.matches.map(m => `${m.matchType}: ${m.name} (${m.admissionNumber})`).join('; ');
            throw new ConflictError(`Potential duplicate student found: ${matchInfo}`);
        }

        const result = await enrollmentService.enrollStudent({
            institutionId: data.institutionId,
            sectionId: data.sectionId,
            mode: 'manual',
            data: {
                name: data.name,
                admissionNumber: data.admissionNumber || null,
                academicYear: data.academicYear || '2025-2026',
                fatherName: data.fatherName || null,
                motherName: data.motherName || null,
                guardianName: data.guardianName || null,
                guardianRelation: data.guardianRelation || null,
                guardianPhone: data.guardianPhone || null,
                sex: data.sex as import('@prisma/client').Sex,
                dob: data.dob ? new Date(data.dob) : undefined,
                bloodGroup: data.bloodGroup || null,
                aadharNumber: data.aadharNumber || null,
                caste: data.caste || null,
                religion: data.religion || null,
                contact: data.contact || null,
                parentEmail: data.parentEmail || null,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                pincode: data.pincode || null,
                dateOfAdmission: data.dateOfAdmission ? new Date(data.dateOfAdmission) : undefined,
                previousSchool: data.previousSchool || null,
                transportMode: data.transportMode || null,
                medicalNotes: data.medicalNotes || null,
                photoUrl: data.photoUrl || null,
                customData: {},
            }
        });

        const createdStudent = await tx.student.findUnique({
            where: { id: result.student!.id },
            include: {
                section: {
                    select: {
                        id: true,
                        name: true,
                        class: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (createdStudent) {
            logAudit({
                action: 'STUDENT_CREATED',
                userId,
                institutionId: data.institutionId,
                entityType: 'student',
                entityId: createdStudent.id,
                changes: { name: data.name, admissionNumber: data.admissionNumber }
            });
        }

        return createdStudent;
    },

    async createBulk(dataArray: Array<Record<string, unknown>>) {
        if (!dataArray.length) throw new BadRequestError('No student data provided');

        const institutionId = dataArray[0].institutionId as string;
        if (!institutionId) throw new BadRequestError('institutionId is required');

        const results: { index: number; success: boolean; error?: string; studentId?: string; admissionNumber?: string | null }[] = [];

        for (let i = 0; i < dataArray.length; i++) {
            const data = dataArray[i];

            // Validation: name is required
            const name = data.name as string | undefined;
            if (!name?.trim()) {
                results.push({ index: i, success: false, error: 'Student name is required' });
                continue;
            }

            try {
                // Duplicate detection before enrollment
                const dupResult = await checkDuplicates(institutionId, {
                    aadharNumber: (data.aadharNumber as string) || undefined,
                    name: name.trim(),
                    dob: data.dob ? new Date(data.dob as string) : undefined,
                });
                if (dupResult.isDuplicate) {
                    const matchInfo = dupResult.matches.map(m => `${m.matchType}: ${m.name} (${m.admissionNumber})`).join('; ');
                    results.push({ index: i, success: false, error: `Duplicate: ${matchInfo}` });
                    continue;
                }

                const res = await enrollmentService.enrollStudent({
                    institutionId,
                    sectionId: data.sectionId as string,
                    mode: 'manual',
                    data: {
                        name: name.trim(),
                        admissionNumber: (data.admissionNumber as string) || null,
                        academicYear: (data.academicYear as string) || '2025-2026',
                        fatherName: (data.fatherName as string) || null,
                        motherName: (data.motherName as string) || null,
                        guardianName: (data.guardianName as string) || null,
                        guardianRelation: (data.guardianRelation as string) || null,
                        guardianPhone: (data.guardianPhone as string) || null,
                        sex: (data.sex as import('@prisma/client').Sex) || undefined,
                        dob: data.dob ? new Date(data.dob as string) : undefined,
                        bloodGroup: (data.bloodGroup as string) || null,
                        aadharNumber: (data.aadharNumber as string) || null,
                        caste: (data.caste as string) || null,
                        religion: (data.religion as string) || null,
                        contact: (data.contact as string) || null,
                        parentEmail: (data.parentEmail as string) || null,
                        address: (data.address as string) || null,
                        city: (data.city as string) || null,
                        state: (data.state as string) || null,
                        pincode: (data.pincode as string) || null,
                        dateOfAdmission: data.dateOfAdmission ? new Date(data.dateOfAdmission as string) : undefined,
                        previousSchool: (data.previousSchool as string) || null,
                        transportMode: (data.transportMode as string) || null,
                        medicalNotes: (data.medicalNotes as string) || null,
                        customData: {},
                    }
                });

                results.push({
                    index: i,
                    success: true,
                    studentId: res.student?.id,
                    admissionNumber: res.student?.admissionNumber,
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown enrollment error';
                results.push({ index: i, success: false, error: message });
            }
        }

        results.sort((a, b) => a.index - b.index);

        return {
            totalProvided: dataArray.length,
            created: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };
    },

    async getStudentCountsBySection(institutionId: string) {
        const counts = await tx.student.groupBy({
            by: ['sectionId'],
            where: { institutionId },
            _count: true,
        });

        return counts.map((c: any) => ({ sectionId: c.sectionId, count: c._count }));
    },

    async update(id: string, data: Prisma.StudentUpdateInput) {
        return tx.student.update({
            where: { id },
            data,
            include: {
                section: {
                    select: {
                        id: true,
                        name: true,
                        class: { select: { id: true, name: true } },
                    },
                },
            },
        });
    },

    async saveTab(id: string, tabName: 'academic' | 'personal' | 'photo' | 'family' | 'contact' | 'other', tabData: any, institutionId?: string, userRole?: { role: string; assignedSections: string[] | null }) {
        // 1. Validate data against the specific Zod schema
        const schema = schemaByTab[tabName];
        if (!schema) {
            throw new BadRequestError(`Invalid tab name: ${tabName}`);
        }

        const validatedData = schema.parse(tabData);

        // 2. Fetch current student and their form progress
        const student = await tx.student.findUnique({
            where: { id },
            include: { formProgress: true }
        });

        if (!student) throw new BadRequestError('Student not found');
        if (institutionId && student.institutionId !== institutionId) {
            throw new BadRequestError('Unauthorized to update this student');
        }

        if (userRole && userRole.role === 'teacher') {
            const assignedSections = userRole.assignedSections || [];
            if (!student.sectionId || !assignedSections.includes(student.sectionId)) {
                throw new ForbiddenError('Not assigned to this section');
            }
        }

        // 3. Update the student core data based on the tab
        // Note: we selectively pick fields from `validatedData` depending on what they are
        const updatePayload: Prisma.StudentUpdateInput = {};
        const parsedData = validatedData as Record<string, any>;

        // Transform the date fields if present
        if (parsedData.dob) updatePayload.dob = new Date(parsedData.dob);
        if (parsedData.dateOfAdmission) updatePayload.dateOfAdmission = new Date(parsedData.dateOfAdmission);

        // Explicitly handle admissionNumber clearing
        if (parsedData.admissionNumber === "") {
            updatePayload.admissionNumber = null;
        } else if (parsedData.admissionNumber !== undefined) {
            updatePayload.admissionNumber = parsedData.admissionNumber;
        }

        // Intercept base64 photo payloads and upload to MinIO with canonical pipeline
        if (tabName === 'photo' && parsedData.photoUrl && parsedData.photoUrl.startsWith('data:image')) {
            const base64Data = parsedData.photoUrl.replace(/^data:image\/\w+;base64,/, "");
            const rawBuffer = Buffer.from(base64Data, 'base64');

            // Delete old photo + thumb objects to prevent storage leaks
            if (student.photoUrl) {
                const oldKey = extractKey(student.photoUrl);
                if (oldKey) await deleteObject(oldKey).catch(() => {});
            }
            if ((student as any).thumbUrl) {
                const oldThumbKey = extractKey((student as any).thumbUrl);
                if (oldThumbKey) await deleteObject(oldThumbKey).catch(() => {});
            }

            // Process through canonical pipeline (Tier 2 for single upload)
            const result = await processPhoto(rawBuffer, { tier: 2 });
            const thumbBuffer = await generateThumbnail(result.buffer);

            // Compute next version
            const nextVersion = ((student as any).photoVersion ?? 0) + 1;

            // Upload to canonical versioned keys
            const photoUrl = await uploadProcessedPhoto(result.buffer, student.institutionId, id, nextVersion);
            const thumbUrl = await uploadProcessedThumb(thumbBuffer, student.institutionId, id, nextVersion);

            // Set URLs and metadata on update payload
            parsedData.photoUrl = photoUrl;
            updatePayload.thumbUrl = thumbUrl;
            updatePayload.photoVersion = nextVersion;
            updatePayload.photoUpdatedAt = new Date();
            updatePayload.photoHash = result.hash;
            updatePayload.photoMetadata = result.metadata;
            updatePayload.dataStatus = 'enhanced';
        }

        // Copy everything else directly, deleting special relations if needed
        for (const [key, value] of Object.entries(parsedData)) {
            if (key !== 'dob' && key !== 'dateOfAdmission' && key !== 'institutionId' && key !== 'sectionId' && key !== 'classId' && key !== 'streamId' && key !== 'customData') {
                (updatePayload as Record<string, any>)[key] = value;
            }
        }

        if (parsedData.sectionId) {
            updatePayload.section = { connect: { id: parsedData.sectionId } };
        }
        if (parsedData.customData) {
            updatePayload.customData = parsedData.customData;
        }

        // Calculate the next tab for sequential flow
        const tabOrder = ['academic', 'personal', 'photo', 'family', 'contact', 'other'];
        const currentIndex = tabOrder.indexOf(tabName);
        const nextTab = currentIndex < tabOrder.length - 1 ? tabOrder[currentIndex + 1] : tabOrder[currentIndex];

        // 4. Update both in a transaction
        return tx.$transaction(async (tx: any) => {
            const updatedStudent = await tx.student.update({
                where: { id },
                data: updatePayload
            });

            // Upsert form progress
            const tabKey = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;

            const progressData: any = {
                institutionId: student.institutionId,
                activeTab: nextTab as any,
                [tabKey]: true
            };

            // If this is the final tab ('other'), mark as filled and set completedAt
            if (tabName === 'other') {
                progressData.completedAt = new Date();
                await tx.student.update({
                    where: { id },
                    data: { dataStatus: 'filled' }
                });
            }

            const updatedProgress = await tx.studentFormProgress.upsert({
                where: { studentId: id },
                create: {
                    studentId: id,
                    ...progressData
                },
                update: progressData
            });

            return { student: updatedStudent, progress: updatedProgress };
        });
    },

    async uploadPhoto(id: string, buffer: Buffer, institutionId?: string, userRole?: { role: string; assignedSections: string[] | null }) {
        const student = await tx.student.findUnique({
            where: { id },
            select: { institutionId: true, sectionId: true, photoUrl: true, thumbUrl: true, photoVersion: true }
        });

        if (!student) throw new BadRequestError('Student not found');
        if (institutionId && student.institutionId !== institutionId) {
            throw new BadRequestError('Unauthorized to update this student');
        }

        if (userRole && userRole.role === 'teacher') {
            const assignedSections = userRole.assignedSections || [];
            if (!assignedSections.includes(student.sectionId)) {
                throw new ForbiddenError('Not assigned to this section');
            }
        }

        const nextVersion = (student.photoVersion || 0) + 1;
        const processed = await processPhoto(buffer, { tier: 2 });
        const thumbBuffer = await generateThumbnail(processed.buffer);

        const photoUrl = await uploadProcessedPhoto(processed.buffer, student.institutionId, id, nextVersion);
        const thumbUrl = await uploadProcessedThumb(thumbBuffer, student.institutionId, id, nextVersion);

        const updated = await tx.student.update({
            where: { id },
            data: {
                photoUrl,
                thumbUrl,
                photoHash: processed.hash,
                photoVersion: nextVersion,
                photoUpdatedAt: new Date(),
                photoMetadata: processed.metadata as any,
                dataStatus: 'enhanced'
            }
        });

        // Cleanup old photos
        if (student.photoUrl) {
            const oldKey = extractKey(student.photoUrl) || student.photoUrl;
            deleteObject(oldKey).catch(err => logger.error({ err, oldKey }, 'Failed to delete old photo'));
        }
        if (student.thumbUrl) {
            const oldThumbKey = extractKey(student.thumbUrl) || student.thumbUrl;
            deleteObject(oldThumbKey).catch(err => logger.error({ err, oldThumbKey }, 'Failed to delete old thumb'));
        }

        return updated;
    },

    // PUBLIC ONBOARDING METHODS
    async findByToken(token: string) {
        const slot = await tx.admissionSlot.findUnique({
            where: { token },
            include: {
                student: {
                    include: {
                        formProgress: true,
                    }
                },
                section: { include: { class: true, institution: { select: { name: true, code: true, logoUrl: true } } } }
            }
        });

        if (!slot) {
            throw new BadRequestError('Invalid or expired token');
        }

        if (slot.tokenExpiresAt && slot.tokenExpiresAt < new Date()) {
            throw new BadRequestError('This onboarding link has expired. Please request a new one from your institution.');
        }

        if (!slot.student) {
            return {
                isNewDraft: true,
                slotId: slot.id,
                sectionId: slot.sectionId,
                institutionId: slot.section.institutionId,
                section: slot.section,
                institution: slot.section.institution
            };
        }

        const studentData = slot.student;
        (studentData as any).section = slot.section;
        (studentData as any).institution = slot.section.institution;
        return studentData as any;
    },

    async saveTabByToken(token: string, tabName: string, tabData: any) {
        const studentOrDraft = await service.findByToken(token);

        let studentId = studentOrDraft.id;

        if (studentOrDraft.isNewDraft) {
            const prefix = studentOrDraft.institution.code.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
            const academicYear = studentOrDraft.institution.academicYear || '2025-2026';
            const yearPart = academicYear.replace(/-/g, '').substring(2, 6) || '2526';

            const lastStudent = await tx.student.findFirst({
                where: { institutionId: studentOrDraft.institutionId, admissionNumber: { startsWith: `${prefix}-${yearPart}-` } },
                orderBy: { admissionNumber: 'desc' },
                select: { admissionNumber: true }
            });

            const lastSeq = lastStudent?.admissionNumber ? parseInt(lastStudent.admissionNumber.split('-').pop() || '0', 10) : 0;
            const finalAdmissionNumber = `${prefix}-${yearPart}-${String(lastSeq + 1).padStart(4, '0')}`;

            const newStudent = await tx.student.create({
                data: {
                    institutionId: studentOrDraft.institutionId,
                    sectionId: studentOrDraft.sectionId,
                    branchId: studentOrDraft.section.class.branchId,
                    name: tabData.name || 'Draft Student',
                    admissionNumber: finalAdmissionNumber,
                    academicYear,
                    status: 'active',
                    dataStatus: 'filled',
                    slotId: studentOrDraft.slotId
                }
            });

            await tx.admissionSlot.update({
                where: { id: studentOrDraft.slotId },
                data: { status: SlotStatus.FILLED }
            });

            studentId = newStudent.id;
        }

        return service.saveTab(studentId, tabName as any, tabData, studentOrDraft.institutionId);
    },

    async uploadPhotoByToken(token: string, buffer: Buffer) {
        const studentOrDraft = await service.findByToken(token);
        if (studentOrDraft.isNewDraft) {
            throw new BadRequestError('Cannot upload photo before basic student details are saved.');
        }
        return service.uploadPhoto(studentOrDraft.id, buffer, studentOrDraft.institutionId);
    },

    async updateDataStatus(id: string, newStatus: DataStatus, userId?: string) {
        const student = await tx.student.findUnique({
            where: { id },
            select: { dataStatus: true, institutionId: true },
        });

        if (!student) {
            throw new BadRequestError('Student not found');
        }

        const validTransitions = VALID_DATA_TRANSITIONS[student.dataStatus as DataStatus];
        if (!validTransitions.includes(newStatus)) {
            throw new BadRequestError(
                `Invalid status transition: ${student.dataStatus} → ${newStatus}. ` +
                `Allowed transitions: ${validTransitions.join(', ') || 'none'}`
            );
        }

        const updatedStudent = await tx.student.update({
            where: { id },
            data: { dataStatus: newStatus },
        });

        logAudit({
            action: 'STUDENT_STATUS_CHANGED',
            userId,
            institutionId: student.institutionId,
            entityType: 'student',
            entityId: id,
            changes: { oldStatus: student.dataStatus, newStatus }
        });

        return updatedStudent;
    },

    async delete(id: string, userId?: string) {
        const student = await tx.student.findUnique({
            where: { id },
            select: {
                institutionId: true,
                name: true,
                photoUrl: true,
                thumbUrl: true,
                studentSignatureUrl: true,
                parentSignatureUrl: true,
            }
        });

        if (student) {
            // Clean up MinIO objects to prevent permanent storage leaks
            const urlsToDelete = [
                student.photoUrl,
                student.thumbUrl,
                student.studentSignatureUrl,
                student.parentSignatureUrl,
            ].filter(Boolean) as string[];

            await Promise.allSettled(
                urlsToDelete.map(url => {
                    const key = extractKey(url);
                    return key ? deleteObject(key) : Promise.resolve();
                })
            );

            logAudit({
                action: 'STUDENT_DELETED',
                userId,
                institutionId: student.institutionId,
                entityType: 'student',
                entityId: id,
                changes: { name: student.name, cleanedUpObjects: urlsToDelete.length }
            });
        }

        return tx.student.delete({
            where: { id },
        });
    },

    async bulkDelete(ids: string[], userId?: string) {
        if (!ids.length) throw new BadRequestError('No student IDs provided');
        if (ids.length > 200) throw new BadRequestError('Cannot delete more than 200 students at once');

        // Fetch all students to clean up their assets
        const students = await tx.student.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                institutionId: true,
                name: true,
                photoUrl: true,
                thumbUrl: true,
                studentSignatureUrl: true,
                parentSignatureUrl: true,
            },
        });

        if (students.length === 0) throw new NotFoundError('No students found for the given IDs');

        // Clean up MinIO objects for all students.
        // `tx` is typed `any` (see createStudentService), so findMany's result
        // carries no shape and these callbacks would be implicitly any. Naming
        // the four fields actually selected above is precise and local; retyping
        // the whole transaction client is a separate change.
        type StudentAssetRow = {
            photoUrl: string | null;
            thumbUrl: string | null;
            studentSignatureUrl: string | null;
            parentSignatureUrl: string | null;
        };
        const allUrls = (students as StudentAssetRow[]).flatMap((s) => [
            s.photoUrl,
            s.thumbUrl,
            s.studentSignatureUrl,
            s.parentSignatureUrl,
        ].filter(Boolean) as string[]);

        await Promise.allSettled(
            allUrls.map(url => {
                const key = extractKey(url);
                return key ? deleteObject(key) : Promise.resolve();
            })
        );

        // Log audit for each deleted student
        for (const student of students) {
            logAudit({
                action: 'STUDENT_DELETED',
                userId,
                institutionId: student.institutionId,
                entityType: 'student',
                entityId: student.id,
                changes: { name: student.name, bulkDelete: true },
            });
        }

        // Delete all students
        const result = await tx.student.deleteMany({
            where: { id: { in: ids } },
        });

        return { count: result.count };
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Advanced Onboarding - Auto Generation & CSV
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates empty placeholder forms for a section based on its expected capacity.
     * Only creates missing forms (e.g., if capacity is 40 and 5 exist, creates 35).
     */
    async generateSectionForms(sectionId: string, institutionId: string) {
        return tx.$transaction(async (tx: any) => {
            console.log(`[generateSectionForms] Started transaction for section ${sectionId}`);

            const section = await tx.section.findUnique({
                where: { id: sectionId },
                include: { class: { select: { branchId: true } }, institution: true }
            });

            if (!section || section.institutionId !== institutionId) {
                throw new BadRequestError('Section not found or unauthorized');
            }

            if (section.expectedStudentCount <= 0) {
                throw new BadRequestError('Section expected capacity must be greater than 0 to generate forms');
            }

            const existingSlots = await tx.admissionSlot.findMany({
                where: { sectionId },
                select: { rollNo: true },
                orderBy: { rollNo: 'asc' }
            });

            const currentCount = existingSlots.length;
            const missingCount = section.expectedStudentCount - currentCount;

            if (missingCount <= 0) {
                return {
                    message: 'Section is already at or above capacity. No new slots generated.',
                    generatedCount: 0,
                    totalForms: currentCount
                };
            }
            const existingRollNos = new Set(existingSlots.map((s: any) => s.rollNo));
            let nextRollNo = 1;

            const newSlotsData: Prisma.AdmissionSlotCreateManyInput[] = [];

            for (let i = 0; i < missingCount; i++) {
                while (existingRollNos.has(nextRollNo)) {
                    nextRollNo++;
                }

                const tokenExpiresAt = new Date();
                tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // 30 days from now

                newSlotsData.push({
                    sectionId,
                    rollNo: nextRollNo,
                    status: SlotStatus.EMPTY,
                    token: nanoid(10),
                    tokenExpiresAt
                });

                existingRollNos.add(nextRollNo);
                nextRollNo++;
            }

            if (newSlotsData.length > 0) {
                await tx.admissionSlot.createMany({
                    data: newSlotsData,
                    skipDuplicates: true
                });
            }

            return {
                message: `Successfully generated ${missingCount} new empty slots for section ${section.name}.`,
                generatedCount: missingCount,
                totalForms: section.expectedStudentCount
            };
        });
    },

    /**
     * Accepts a raw CSV stream, stores it in MinIO, and enqueues a background job.
     */
    async enqueueCsvImportJob(data: {
        institutionId: string;
        sectionId: string;
        file: any; // fastify multipart file
        initiatedBy?: string;
    }): Promise<string> {
        const { institutionId, sectionId, file, initiatedBy } = data;

        const section = await tx.section.findUnique({
            where: { id: sectionId },
            include: { institution: { select: { code: true, academicYear: true } }, class: { select: { branchId: true } } }
        });

        if (!section || section.institutionId !== institutionId) {
            throw new BadRequestError('Section not found or unauthorized');
        }

        const fileKey = `csv-imports/${institutionId}/${nanoid(10)}-${file.filename}`;

        const fileBuffer = await file.toBuffer();

        const { uploadToMinio } = await import('../../config/minio.js');
        await uploadToMinio(fileKey, fileBuffer, file.mimetype);

        const jobExecution = await tx.jobExecution.create({
            data: {
                jobId: nanoid(14),
                jobType: 'csv_import',
                institutionId,
                sectionId,
                initiatedBy,
                status: 'queued',
                totalItems: 0,
                progress: 0
            }
        });

        const { csvImportQueue } = await import('../../config/queue.js');

        const jobData = {
            jobExecutionId: jobExecution.id,
            institutionId,
            sectionId,
            fileKey,
            expectedCount: 1,
            initiatedBy: initiatedBy || 'system'
        };

        const job = await csvImportQueue.add(jobExecution.id, jobData);

        await tx.jobExecution.update({
            where: { id: jobExecution.id },
            data: { jobId: String(job.id) }
        });

        return jobExecution.id;
    },

    async enqueuePhotoZipImportJob(data: {
        institutionId: string;
        file: any; // fastify multipart file
        initiatedBy?: string;
    }): Promise<string> {
        const { institutionId, file, initiatedBy } = data;

        const fileKey = `photo-zips/${institutionId}/${nanoid(10)}-${file.filename}`;
        const fileBuffer = await file.toBuffer();

        const { uploadToMinio } = await import('../../config/minio.js');
        await uploadToMinio(fileKey, fileBuffer, file.mimetype);

        const jobExecution = await tx.jobExecution.create({
            data: {
                jobId: nanoid(14),
                jobType: 'photo_zip_import',
                institutionId,
                initiatedBy,
                status: 'queued',
                totalItems: 0,
                progress: 0
            }
        });

        const { addJob, QUEUE_NAMES } = await import('../../utils/job-queue.js');

        const jobData = {
            institutionId,
            zipFilePath: fileKey,
            userId: initiatedBy || 'system'
        };

        const job = await addJob(QUEUE_NAMES.PHOTO_ZIP_IMPORT, 'import-zip', jobData, { jobId: jobExecution.id });

        await tx.jobExecution.update({
            where: { id: jobExecution.id },
            data: { jobId: String(job.id) }
        });

        return jobExecution.id;
    },

    async getImportProgress(jobExecutionId: string, institutionId?: string) {
        const job = await tx.jobExecution.findUnique({
            where: { id: jobExecutionId }
        });

        if (!job || (institutionId && job.institutionId !== institutionId)) {
            throw new BadRequestError('Job not found or unauthorized');
        }

        return {
            id: job.id,
            status: job.status,
            progress: job.progress,
            totalItems: job.totalItems,
            processedItems: job.processedItems,
            successfulItems: job.successfulItems,
            failedItems: job.failedItems,
            createdAt: job.createdAt,
            completedAt: job.completedAt
        };
    },

    /**
     * Export students as CSV rows using cursor-based streaming.
     * Returns header + data rows as string arrays.
     */
    async exportStudents(params: {
        institutionId: string;
        sectionId?: string;
        columns: string[];
    }): Promise<string[][]> {
        const { institutionId, sectionId, columns } = params;

        // All exportable columns
        const ALL_COLUMNS: Record<string, string> = {
            rollNo: 'Roll No',
            admissionNumber: 'Admission No',
            name: 'Name',
            sex: 'Sex',
            dob: 'Date of Birth',
            bloodGroup: 'Blood Group',
            aadharNumber: 'Aadhar Number',
            fatherName: 'Father Name',
            motherName: 'Mother Name',
            guardianName: 'Guardian Name',
            guardianRelation: 'Guardian Relation',
            guardianPhone: 'Guardian Phone',
            contact: 'Contact',
            parentEmail: 'Parent Email',
            address: 'Address',
            city: 'City',
            state: 'State',
            pincode: 'Pincode',
            dateOfAdmission: 'Date of Admission',
            previousSchool: 'Previous School',
            transportMode: 'Transport Mode',
            caste: 'Caste',
            religion: 'Religion',
            status: 'Status',
            dataStatus: 'Data Status',
            academicYear: 'Academic Year',
        };

        // Validate requested columns
        const validColumns = columns.filter(c => c in ALL_COLUMNS);
        if (validColumns.length === 0) {
            throw new BadRequestError('No valid columns specified for export');
        }

        // Build the select object
        const select: Record<string, boolean> = { id: true };
        for (const col of validColumns) {
            select[col] = true;
        }

        // Header row
        const header = validColumns.map(c => ALL_COLUMNS[c]);

        // Fetch matching records (cursor-based batching for large datasets)
        const BATCH_SIZE = 500;
        const rows: string[][] = [header];
        let cursor: string | undefined;

        if (sectionId) {
            // Export slots for this section as a prefillable bulk-import template
            while (true) {
                const batch = await tx.admissionSlot.findMany({
                    where: { sectionId, section: { institutionId } },
                    include: { student: true },
                    take: BATCH_SIZE,
                    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
                    orderBy: { rollNo: 'asc' },
                });

                if (batch.length === 0) break;

                for (const slot of batch) {
                    const row = validColumns.map(col => {
                        if (col === 'rollNo') return String(slot.rollNo);
                        if (col === 'status' && !slot.student) return slot.status; // Show EMPTY instead of nothing when no student exists

                        if (slot.student) {
                            const val = (slot.student as Record<string, any>)[col];
                            if (val === null || val === undefined) return '';
                            if (val instanceof Date) return val.toISOString().split('T')[0];
                            return String(val);
                        }
                        return '';
                    });
                    rows.push(row);
                }

                cursor = batch[batch.length - 1].id;
                if (batch.length < BATCH_SIZE) break;
            }
        } else {
            // General student export across institution
            const where: Prisma.StudentWhereInput = { institutionId };

            while (true) {
                const batch = await tx.student.findMany({
                    where,
                    select,
                    take: BATCH_SIZE,
                    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
                    orderBy: { admissionNumber: 'asc' },
                });

                if (batch.length === 0) break;

                for (const student of batch) {
                    const row = validColumns.map(col => {
                        const val = (student as Record<string, any>)[col];
                        if (val === null || val === undefined) return '';
                        if (val instanceof Date) return val.toISOString().split('T')[0];
                        return String(val);
                    });
                    rows.push(row);
                }

                cursor = (batch[batch.length - 1] as any).id as string;
                if (batch.length < BATCH_SIZE) break;
            }
        }

        return rows;
    },

    async getStudentAuditLog(studentId: string, params?: { page?: number; limit?: number }) {
        const page = Number(params?.page) || 1;
        const limit = Math.min(Number(params?.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            tx.auditLog.findMany({
                where: { entityType: 'student', entityId: studentId },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            tx.auditLog.count({
                where: { entityType: 'student', entityId: studentId }
            })
        ]);

        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    },

    async bulkRequestPhotos(studentIds: string[], institutionId?: string) {
        const students = await tx.student.findMany({
            where: {
                id: { in: studentIds },
                institutionId: institutionId ? institutionId : undefined
            },
            include: {
                admissionSlot: true,
                institution: true,
            }
        });

        const results = { sent: 0, failed: 0, details: [] as any[] };
        const { sendPhotoRequestEmail } = await import('../../utils/mailer.js');

        for (const student of students) {
            try {
                if (student.photoUrl) {
                    results.failed++;
                    results.details.push({ id: student.id, status: 'failed', reason: 'Student already has a photo' });
                    continue;
                }

                let token = student.admissionSlot?.token;

                if (!token) {
                    const maxSlot = await tx.admissionSlot.aggregate({
                        where: { sectionId: student.sectionId },
                        _max: { rollNo: true }
                    });
                    const nextRollNo = (maxSlot._max.rollNo || 0) + 1;

                    const newSlot = await tx.admissionSlot.create({
                        data: {
                            sectionId: student.sectionId,
                            rollNo: nextRollNo,
                            status: 'FILLED',
                        }
                    });

                    await tx.student.update({
                        where: { id: student.id },
                        data: { slotId: newSlot.id }
                    });

                    token = newSlot.token;
                }

                if (student.parentEmail) {
                    await sendPhotoRequestEmail(
                        student.parentEmail,
                        student.name,
                        student.institution.name,
                        token
                    );
                    results.sent++;
                    results.details.push({ id: student.id, status: 'sent', token });
                } else {
                    results.failed++;
                    results.details.push({ id: student.id, status: 'failed', reason: 'No parent email found' });
                }
            } catch (error: any) {
                results.failed++;
                results.details.push({ id: student.id, status: 'failed', reason: error.message });
            }
        }

        return results;
    },

    async linkUser(studentId: string, userId: string | null) {
        // Confirm the student exists within this institution's scope
        const student = await tx.student.findUnique({
            where: { id: studentId },
            select: { id: true, userId: true },
        });
        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Confirm the target user account exists if linking
        if (userId) {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true, globalRole: true },
            });
            if (!user) {
                throw new NotFoundError('User account not found');
            }
        }

        // Prisma enforces @unique on userId — will throw P2002 if already
        // linked to a different student. Let that bubble as a 500 for now;
        // a more specific error can be added when the admin UI is built.
        const updated = await tx.student.update({
            where: { id: studentId },
            data: { userId },
            select: {
                id: true,
                admissionNumber: true,
                userId: true,
                section: {
                    select: {
                        name: true,
                        class: { select: { name: true } },
                    },
                },
            },
        });

        return updated;
    }
});

export const service = createStudentService();
