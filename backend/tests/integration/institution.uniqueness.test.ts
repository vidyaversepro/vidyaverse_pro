import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { service } from '../../src/modules/institution/service';

const prisma = new PrismaClient();

describe('Institution Service - Uniqueness Validation', () => {
    const testCode = `TEST_CODE_${Date.now()}`;
    const testAdminEmail = `admin_${Date.now()}@test.com`;
    const testContactEmail = `contact_${Date.now()}@test.com`;
    let createdInstitutionId: string;

    beforeAll(async () => {
        // Ensure clean state for our specific test data, though unique suffixes help
        await prisma.adminInvitation.deleteMany({
            where: { email: testAdminEmail }
        });
        await prisma.institution.deleteMany({
            where: {
                OR: [
                    { code: testCode },
                    { contactEmail: testContactEmail }
                ]
            }
        });
    });

    afterAll(async () => {
        // Cleanup after tests
        if (createdInstitutionId) {
            await prisma.institution.delete({
                where: { id: createdInstitutionId }
            }).catch(() => { });
        }
        await prisma.adminInvitation.deleteMany({
            where: { email: testAdminEmail }
        }).catch(() => { });

        await prisma.$disconnect();
    });

    it('should validate uniqueness correctly when no duplicates exist', async () => {
        const result = await service.checkUniqueness(
            testCode,
            testAdminEmail,
            testContactEmail
        );
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should create an institution and admin invitation successfully', async () => {
        const institution = await service.create({
            name: 'Test Uniqueness Institution',
            code: testCode,
            contactEmail: testContactEmail,
            adminEmail: testAdminEmail,
            academicYear: '2025-2026',
            subscriptionTier: 'starter',
            subscriptionStatus: 'trial',
        });

        expect(institution).toBeDefined();
        expect(institution.id).toBeDefined();
        expect(institution.code).toBe(testCode);

        createdInstitutionId = institution.id;
    }, 15000);

    it('should identify a duplicate institution code', async () => {
        const result = await service.checkUniqueness(
            testCode,
            `another_${Date.now()}@test.com`,
            `another2_${Date.now()}@test.com`
        );

        expect(result.isValid).toBe(false);
        expect(result.errors.code).toBeDefined();
        expect(result.errors.code).toContain(testCode);
    });

    it('should identify a duplicate admin email (via pending invitation)', async () => {
        const result = await service.checkUniqueness(
            `ANOTHER_CODE_${Date.now()}`,
            testAdminEmail,
            `another3_${Date.now()}@test.com`
        );

        expect(result.isValid).toBe(false);
        expect(result.errors.adminEmail).toBeDefined();
        expect(result.errors.adminEmail).toContain(testAdminEmail);
    });

    it('should identify a duplicate contact email', async () => {
        const result = await service.checkUniqueness(
            `YET_ANOTHER_CODE_${Date.now()}`,
            `yet_another_${Date.now()}@test.com`,
            testContactEmail
        );

        expect(result.isValid).toBe(false);
        expect(result.errors.contactEmail).toBeDefined();
        expect(result.errors.contactEmail).toContain(testContactEmail);
    });

    it('should NOT flag duplicates if excludeInstitutionId matches the existing record', async () => {
        const result = await service.checkUniqueness(
            testCode,
            undefined, // admin invitation is not tied to institution ID in the check, so we omit to test purely exclusion logic on code/contact
            testContactEmail,
            createdInstitutionId
        );

        expect(result.isValid).toBe(true);
        expect(result.errors.code).toBeUndefined();
        expect(result.errors.contactEmail).toBeUndefined();
    });

    it('should throw an explicit 409 error with validation tracking when attempting to create duplicate via service', async () => {
        await expect(service.create({
            name: 'Duplicate Attempt',
            code: testCode,
            adminEmail: testAdminEmail,
            contactEmail: testContactEmail,
            academicYear: '2025-2026',
        })).rejects.toMatchObject({
            status: 409,
            validationErrors: expect.objectContaining({
                code: expect.any(String),
                adminEmail: expect.any(String),
                contactEmail: expect.any(String),
            })
        });
    });
});
