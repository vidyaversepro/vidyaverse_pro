import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../src/config/database';
// Named imports, matching every other integration suite. tests/setup.ts exports
// these helpers; it never assigned them to globalThis, so the global.* calls this
// file used to make were always undefined.
import { createTestInstitution, createTestClass, createTestSection, createTestStudent, cleanupTestData } from '../setup';

describe('Student Service', () => {
    let institutionId: string;
    let classId: string;
    let sectionId: string;

    beforeAll(async () => {
        // Create test data
        const institution = await createTestInstitution();
        institutionId = institution.id;

        const cls = await createTestClass(institutionId);
        classId = cls.id;

        const section = await createTestSection(classId);
        sectionId = section.id;
    });

    afterAll(async () => {
        await cleanupTestData(institutionId);
    });

    describe('create', () => {
        it('should create a new student', async () => {
            const student = await prisma.student.create({
                data: {
                    institutionId,
                    sectionId,
                    admissionNumber: `STU${Math.random().toString(36).substring(7)}`,
                    name: 'John Doe',
                    sex: 'male',
                    dob: new Date('2010-05-15'),
                    status: 'active',
                },
            });

            expect(student).toBeDefined();
            expect(student.name).toBe('John Doe');
            expect(student.institutionId).toBe(institutionId);
        });

        it('should fail with duplicate admission number', async () => {
            const admissionNumber = `DUP${Math.random().toString(36).substring(7)}`;

            await prisma.student.create({
                data: {
                    institutionId,
                    sectionId,
                    admissionNumber,
                    name: 'First Student',
                    sex: 'female',
                    dob: new Date('2010-01-01'),
                    status: 'active',
                },
            });

            await expect(
                prisma.student.create({
                    data: {
                        institutionId,
                        sectionId,
                        admissionNumber, // Duplicate
                        name: 'Second Student',
                        sex: 'male',
                        dob: new Date('2010-02-01'),
                        status: 'active',
                    },
                })
            ).rejects.toThrow();
        });
    });

    describe('update', () => {
        it('should update student details', async () => {
            const student = await prisma.student.create({
                data: {
                    institutionId,
                    sectionId,
                    admissionNumber: `UPD${Math.random().toString(36).substring(7)}`,
                    name: 'Original Name',
                    sex: 'male',
                    dob: new Date('2010-01-01'),
                    status: 'active',
                },
            });

            const updated = await prisma.student.update({
                where: { id: student.id },
                data: { name: 'Updated Name' },
            });

            expect(updated.name).toBe('Updated Name');
        });
    });

    describe('query', () => {
        it('should find students by section', async () => {
            // Create multiple students
            await Promise.all([
                createTestStudent(institutionId, sectionId),
                createTestStudent(institutionId, sectionId),
            ]);

            const students = await prisma.student.findMany({
                where: { sectionId },
            });

            expect(students.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter active students only', async () => {
            // Create active and inactive students
            await prisma.student.create({
                data: {
                    institutionId,
                    sectionId,
                    admissionNumber: `ACT${Math.random().toString(36).substring(7)}`,
                    name: 'Active Student',
                    sex: 'male',
                    dob: new Date('2010-01-01'),
                    status: 'active',
                },
            });

            await prisma.student.create({
                data: {
                    institutionId,
                    sectionId,
                    admissionNumber: `INACT${Math.random().toString(36).substring(7)}`,
                    name: 'Inactive Student',
                    sex: 'female',
                    dob: new Date('2010-01-01'),
                    status: 'suspended',
                },
            });

            const activeOnly = await prisma.student.findMany({
                where: { sectionId, status: 'active' },
            });

            const allStudents = await prisma.student.findMany({
                where: { sectionId },
            });

            expect(activeOnly.length).toBeLessThan(allStudents.length);
        });
    });
});
