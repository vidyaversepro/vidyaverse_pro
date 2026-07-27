import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML } from '../../utils/pdf-generator.js';
import { generateStudentQRCode } from '../../utils/qrcode.js';
import { storage } from '../../config/minio.js';
import { buildBrandingContext } from '../../lib/branding-context.js';
import { toDataUri } from '../../lib/asset-inline.js';
import { logger } from '../../utils/logger.js';
import type {
    MarkEntryInput,
    BulkMarkEntryInput,
    GenerateMarksheetInput,
    BulkGenerateMarksheetsInput,
    MarksheetQueryInput,
    CalculationEngineCreateInput,
} from '@vidyaverse/shared-validation';

interface GradeMapping {
    minPercent: number;
    maxPercent: number;
    grade: string;
    gradePoint?: number;
    remarks?: string;
}

interface CalculationResult {
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    gradePoint?: number;
    remarks?: string;
    isPassed: boolean;
    subjectResults: SubjectResult[];
}

interface SubjectResult {
    subjectId: string;
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    isPassed: boolean;
}

export const createMarksheetService = (tx: any = prisma) => ({
    // ============================================================================
    // CALCULATION ENGINE MANAGEMENT
    // ============================================================================

    async createCalculationEngine(institutionId: string, data: CalculationEngineCreateInput) {
        const engine = await tx.calculationEngine.create({
            data: {
                institutionId,
                academicYear: (data as any).academicYear || '2023-2024',
                cgpaFormula: (data as any).formula || '',
                percentageFormula: (data as any).formula || '',
                percentileFormula: (data as any).formula || '',
                gradeScale: (data as any).gradeMapping || {},
            },
        });

        logger.info('Calculation engine created', { engineId: engine.id });
        return engine;
    },

    async getCalculationEngine(id: string, institutionId: string) {
        const engine = await tx.calculationEngine.findFirst({
            where: { id, institutionId },
        });

        if (!engine) {
            throw new NotFoundError('Calculation engine not found');
        }

        return engine;
    },

    async listCalculationEngines(institutionId: string) {
        return tx.calculationEngine.findMany({
            where: { institutionId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    },

    // Get-or-create the institution's calculation engine. Marksheet.calculationEngineId
    // is a required FK, so every institution needs one; created lazily with the
    // standard CBSE-style grade scale (matches calculateResults' built-in default).
    async ensureCalculationEngine(institutionId: string, academicYear: string) {
        const existing = await tx.calculationEngine.findFirst({
            where: { institutionId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        if (existing) return existing;

        const now = new Date().getFullYear();
        return tx.calculationEngine.create({
            data: {
                institutionId,
                academicYear: academicYear || `${now}-${now + 1}`,
                cgpaFormula: 'sum(gradePoints)/subjectCount',
                percentageFormula: 'sum(obtained)/sum(max)*100',
                percentileFormula: 'rankBasedPercentile',
                gradeScale: [
                    { minPercent: 91, maxPercent: 100, grade: 'A+', gradePoint: 10, remarks: 'Outstanding' },
                    { minPercent: 81, maxPercent: 90, grade: 'A', gradePoint: 9, remarks: 'Excellent' },
                    { minPercent: 71, maxPercent: 80, grade: 'B+', gradePoint: 8, remarks: 'Very Good' },
                    { minPercent: 61, maxPercent: 70, grade: 'B', gradePoint: 7, remarks: 'Good' },
                    { minPercent: 51, maxPercent: 60, grade: 'C+', gradePoint: 6, remarks: 'Above Average' },
                    { minPercent: 41, maxPercent: 50, grade: 'C', gradePoint: 5, remarks: 'Average' },
                    { minPercent: 33, maxPercent: 40, grade: 'D', gradePoint: 4, remarks: 'Pass' },
                    { minPercent: 0, maxPercent: 32, grade: 'F', gradePoint: 0, remarks: 'Fail' },
                ],
            },
        });
    },

    // ============================================================================
    // MARKS ENTRY
    // ============================================================================

    async enterMark(institutionId: string, data: MarkEntryInput) {
        // Verify student exists
        const student = await tx.student.findFirst({
            where: { id: data.studentId, institutionId },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Check for existing mark
        const existing = await tx.mark.findFirst({
            where: {
                studentId: data.studentId,
                examScheduleId: data.examScheduleId,
                subjectId: data.subjectId,
            },
        });

        if (existing) {
            // Update existing mark
            return tx.mark.update({
                where: { id: existing.id },
                data: {
                    theoryObtainedMarks: data.marksObtained,
                    practicalObtainedMarks: data.practicalMarks,
                    theoryMaxMarks: data.theoryMarks,
                    grade: data.gradeOverride,
                },
            });
        }

        // Create new mark
        return tx.mark.create({
            data: {
                studentId: data.studentId,
                examScheduleId: data.examScheduleId,
                subjectId: data.subjectId,
                theoryObtainedMarks: data.marksObtained,
                practicalObtainedMarks: data.practicalMarks,
                theoryMaxMarks: data.theoryMarks,
                grade: data.gradeOverride,
            },
        });
    },

    async enterMarksBulk(institutionId: string, data: BulkMarkEntryInput) {
        const results = {
            successful: 0,
            failed: [] as { studentId: string; error: string }[],
        };

        for (const entry of data.entries) {
            try {
                await this.enterMark(institutionId, {
                    studentId: entry.studentId,
                    examScheduleId: data.examScheduleId,
                    subjectId: data.subjectId,
                    marksObtained: entry.marksObtained,
                    practicalMarks: entry.practicalMarks,
                    theoryMarks: entry.theoryMarks,
                });
                results.successful++;
            } catch (error: any) {
                results.failed.push({
                    studentId: entry.studentId,
                    error: error.message,
                });
            }
        }

        return results;
    },

    async getMarksForEntry(institutionId: string, examScheduleId: string, sectionId: string, subjectId: string) {
        // Find all students in this section
        const students = await tx.student.findMany({
            where: {
                sectionId,
                institutionId,
                status: 'active'
            },
            select: {
                id: true,
                enrollmentNumber: true,
                rollNumber: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: [{ rollNumber: 'asc' }, { user: { name: 'asc' } }]
        });

        // Find existing marks for these students for this exam & subject
        const studentIds = students.map((s: any) => s.id);
        const marks = await tx.mark.findMany({
            where: {
                examScheduleId,
                subjectId,
                studentId: { in: studentIds }
            }
        });

        // Map them together
        return students.map((student: any) => {
            const mark = marks.find((m: any) => m.studentId === student.id);
            return {
                studentId: student.id,
                enrollmentNumber: student.enrollmentNumber,
                rollNumber: student.rollNumber,
                studentName: student.user.name,
                marksObtained: mark && mark.theoryObtainedMarks ? Number(mark.theoryObtainedMarks) : null,
                practicalMarks: mark && mark.practicalObtainedMarks ? Number(mark.practicalObtainedMarks) : null,
                theoryMarks: mark && mark.theoryMaxMarks ? mark.theoryMaxMarks : null,
                markId: mark && mark.id ? mark.id : null,
            };
        });
    },


    async listSubjects(institutionId: string, classId: string) {
        return tx.subject.findMany({
            where: { institutionId, classId },
            orderBy: { subjectName: 'asc' },
        });
    },

    // ============================================================================
    // RESULT CALCULATION
    // ============================================================================

    async calculateResults(
        studentId: string,
        examScheduleId: string,
        institutionId: string,
        engineId?: string
    ): Promise<CalculationResult> {
        // Get all marks for this student in this exam
        const marks = await tx.mark.findMany({
            where: { studentId, examScheduleId },
            include: {
                subject: true,
            },
        });

        if (marks.length === 0) {
            throw new BadRequestError('No marks found for this student');
        }

        // Get exam subjects to know max marks
        const examSchedule = await tx.examSchedule.findFirst({
            where: { id: examScheduleId, institutionId },
            include: {
                subjects: true,
            },
        });

        if (!examSchedule) {
            throw new NotFoundError('Exam schedule not found');
        }

        // Get calculation engine
        let gradeMapping: GradeMapping[] = [
            { minPercent: 91, maxPercent: 100, grade: 'A+', gradePoint: 10, remarks: 'Outstanding' },
            { minPercent: 81, maxPercent: 90, grade: 'A', gradePoint: 9, remarks: 'Excellent' },
            { minPercent: 71, maxPercent: 80, grade: 'B+', gradePoint: 8, remarks: 'Very Good' },
            { minPercent: 61, maxPercent: 70, grade: 'B', gradePoint: 7, remarks: 'Good' },
            { minPercent: 51, maxPercent: 60, grade: 'C+', gradePoint: 6, remarks: 'Above Average' },
            { minPercent: 41, maxPercent: 50, grade: 'C', gradePoint: 5, remarks: 'Average' },
            { minPercent: 33, maxPercent: 40, grade: 'D', gradePoint: 4, remarks: 'Pass' },
            { minPercent: 0, maxPercent: 32, grade: 'F', gradePoint: 0, remarks: 'Fail' },
        ];
        let passingPercent = 33;

        if (engineId) {
            const engine = await this.getCalculationEngine(engineId, institutionId);
            gradeMapping = engine.gradeScale as unknown as GradeMapping[];
            passingPercent = 33;
        }

        // Calculate subject-wise results
        const subjectResults: SubjectResult[] = [];
        let totalMarks = 0;
        let totalMaxMarks = 0;
        let allSubjectsPassed = true;

        for (const mark of marks) {
            const examSubject = examSchedule.subjects.find((s: any) => s.subjectId === mark.subjectId) as any;
            if (!examSubject) {
                throw new Error(`Subject ${mark.subjectId} not found in exam schedule — cannot calculate marks`);
            }
            const maxMarks = examSubject.maxMarks || 100;
            const marksObtained = Number(mark.theoryObtainedMarks || mark.totalObtainedMarks || 0);
            const percentage = (marksObtained / maxMarks) * 100;
            const grade = this.getGrade(percentage, gradeMapping);
            const isPassed = percentage >= passingPercent;

            if (!isPassed) {
                allSubjectsPassed = false;
            }

            subjectResults.push({
                subjectId: mark.subjectId,
                subjectName: mark.subject.subjectName,
                marksObtained: marksObtained,
                maxMarks,
                percentage: Math.round(percentage * 100) / 100,
                grade: mark.grade || grade,
                isPassed,
            });

            totalMarks += marksObtained;
            totalMaxMarks += maxMarks;
        }

        const overallPercentage = (totalMarks / totalMaxMarks) * 100;
        const overallGrade = this.getGrade(overallPercentage, gradeMapping);
        const gradeInfo = gradeMapping.find(
            (g) => overallPercentage >= g.minPercent && overallPercentage <= g.maxPercent
        );

        return {
            totalMarks,
            maxMarks: totalMaxMarks,
            percentage: Math.round(overallPercentage * 100) / 100,
            grade: overallGrade,
            gradePoint: gradeInfo?.gradePoint,
            remarks: gradeInfo?.remarks,
            isPassed: allSubjectsPassed && overallPercentage >= passingPercent,
            subjectResults,
        };
    },

    getGrade(percentage: number, gradeMapping: GradeMapping[]): string {
        for (const mapping of gradeMapping) {
            if (percentage >= mapping.minPercent && percentage <= mapping.maxPercent) {
                return mapping.grade;
            }
        }
        return 'F';
    },

    // ============================================================================
    // MARKSHEET GENERATION
    // ============================================================================

    async generate(institutionId: string, data: GenerateMarksheetInput) {
        const { studentId, examScheduleId, templateId } = data;

        // Get student
        const student = await tx.student.findFirst({
            where: { id: studentId, institutionId },
            include: {
                section: {
                    include: {
                        class: true,
                        stream: true,
                    },
                },
                institution: true,
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Calculate results
        const results = await this.calculateResults(studentId, examScheduleId, institutionId);

        // Get exam schedule
        const examSchedule = await tx.examSchedule.findFirst({
            where: { id: examScheduleId },
        });

        // Ensure the required calculation-engine FK is satisfied (was '' before).
        const calculationEngine = await this.ensureCalculationEngine(
            institutionId,
            examSchedule?.academicYear || ''
        );

        // Check if marksheet already exists
        const existing = await tx.marksheet.findFirst({
            where: { studentId, examScheduleId },
        });

        if (existing) {
            return existing;
        }

        // Get template — resolveTemplate auto-seeds the curated default for any
        // institution that has none yet (same path certificate/hall-ticket use).
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'marksheet', audience: 'STUDENT' });

        // Generate marksheet number
        const marksheetNumber = await this.generateMarksheetNumber(institutionId, examScheduleId);

        // Generate QR code
        // QR data for verification (preserved for future use)
        // const qrData = JSON.stringify({
        //     m: marksheetNumber,
        //     s: student.admissionNumber,
        //     p: results.percentage,
        //     g: results.grade,
        // });
        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV'
        });

        // Prepare template data — shared branding context + flat keys the curated
        // template expects, plus marksheet-specific data.
        const branding = await buildBrandingContext(institutionId, tx);
        const studentPhoto = await toDataUri(student.photoUrl);
        const templateData = {
            ...branding,
            examName: examSchedule?.examName || 'Examination',
            academicYear: examSchedule?.academicYear || (student.institution as any)?.academicYear || '',
            studentPhoto,
            student: {
                id: student.id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                photoUrl: student.photoUrl,
                fatherName: student.fatherName,
                motherName: student.motherName,
                dob: student.dob,
            },
            section: student.section,
            class: student.section.class,
            stream: student.section.stream,
            institution: student.institution,
            exam: {
                name: examSchedule?.examName,
                type: examSchedule?.examType,
                academicYear: examSchedule?.academicYear,
            },
            results: {
                ...results,
                marksheetNumber,
                qrCode,
            },
            subjects: results.subjectResults,
        };

        if (!template) {
            throw new Error('No marksheet template found. Please create a template first.');
        }

        // Render template
        const html = await templateService.render(template.id, institutionId, templateData);

        // Generate PDF
        const pdfBuffer = await generatePDFFromHTML(html, {
            width: Number(template.widthMm),
            height: Number(template.heightMm),
            orientation: template.orientation as 'portrait' | 'landscape',
        });

        // Upload to MinIO
        const objectName = storage.generateObjectName(
            institutionId,
            'pdfs',
            `marksheet-${marksheetNumber}.pdf`
        );
        const pdfUrl = await storage.uploadFile(objectName, pdfBuffer, 'application/pdf');

        // Create database record
        const marksheet = await tx.marksheet.create({
            data: {
                studentId,
                institutionId,
                examScheduleId,
                templateId: template.id,
                calculationEngineId: calculationEngine.id,
                totalPercentage: results.percentage,
                grade: results.grade,
                cgpa: results.gradePoint,
                classRank: null, // Calculated separately
                pdfUrl,
                status: 'generated',
            },
            include: {
                student: true,
                examSchedule: true,
            },
        });

        logger.info('Marksheet generated', { marksheetNumber, studentId });
        await this.calculateRanks(examScheduleId);
        return marksheet;
    },

    async generateBulk(institutionId: string, data: BulkGenerateMarksheetsInput) {
        const { studentIds, examScheduleId, templateId } = data;
        const results = {
            successful: [] as Record<string, unknown>[],
            failed: [] as { studentId: string; error: string }[],
        };

        for (const studentId of studentIds) {
            try {
                const marksheet = await this.generate(institutionId, {
                    studentId,
                    examScheduleId,
                    templateId,
                });
                results.successful.push(marksheet);
            } catch (error: any) {
                results.failed.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        // Calculate ranks after all marksheets are generated
        await this.calculateRanks(examScheduleId);

        return results;
    },

    async calculateRanks(examScheduleId: string) {
        const marksheets = await tx.marksheet.findMany({
            where: { examScheduleId },
            orderBy: { totalPercentage: 'desc' },
        });

        for (let i = 0; i < marksheets.length; i++) {
            await tx.marksheet.update({
                where: { id: marksheets[i].id },
                data: { classRank: i + 1 },
            });
        }
    },

    async list(institutionId: string, query: MarksheetQueryInput) {
        const { examScheduleId, sectionId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(examScheduleId && { examScheduleId }),
            ...(sectionId && { student: { sectionId } }),
            ...(status && { status }),
        };

        const [marksheets, total] = await Promise.all([
            tx.marksheet.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            admissionNumber: true,
                            section: {
                                include: { class: true },
                            },
                        },
                    },
                    examSchedule: {
                        select: {
                            examName: true,
                            examType: true,
                        },
                    },
                },
                orderBy: [{ totalPercentage: 'desc' } as any, { classRank: 'asc' } as any],
            }),
            tx.marksheet.count({ where }),
        ]);

        return {
            marksheets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(id: string, institutionId: string) {
        const marksheet = await tx.marksheet.findFirst({
            where: { id, institutionId },
            include: {
                student: {
                    include: {
                        section: {
                            include: { class: true },
                        },
                    },
                },
                examSchedule: true,
            },
        });

        if (!marksheet) {
            throw new NotFoundError('Marksheet not found');
        }

        return marksheet;
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    async generateMarksheetNumber(institutionId: string, examScheduleId: string): Promise<string> {
        const count = await tx.marksheet.count({
            where: { institutionId, examScheduleId },
        });

        const year = new Date().getFullYear();
        const sequence = String(count + 1).padStart(5, '0');

        return `MS${year}${sequence}`;
    },
});

export const marksheetService = createMarksheetService();
