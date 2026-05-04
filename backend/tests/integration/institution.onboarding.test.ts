import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { service } from '../../src/modules/institution/service';

const prisma = new PrismaClient();

describe('Institution Service - Secondary Onboarding', () => {
    let institutionId: string;

    beforeAll(async () => {
        // Create a dummy institution for testing
        const institution = await prisma.institution.create({
            data: {
                name: 'Test Onboarding Institution',
                code: `ONB_${Date.now()} `,
                academicYear: '2025-2026',
                subscriptionTier: 'starter',
                subscriptionStatus: 'trial',
            },
        });
        institutionId = institution.id;
    });

    afterAll(async () => {
        if (institutionId) {
            await prisma.institution.delete({
                where: { id: institutionId },
            }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    it('should complete onboarding and update the institution type', async () => {
        const result = await service.completeOnboarding(institutionId, { institutionType: 'UNIVERSITY' });

        expect(result).toBeDefined();
        expect(result.onboardingCompleted).toBe(true);
        expect(result.institutionType).toBe('UNIVERSITY');
    });

    it('should be able to create an authority profile', async () => {
        const result = await service.createAuthority(institutionId, {
            name: 'Jane Doe',
            designation: 'Chief Dean',
            roleType: 'DEAN',
            email: 'jane@test.edu',
            phone: '1234567890',
            signatureUrl: 'http://example.com/sig.png',
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Jane Doe');
        expect(result.institutionId).toBe(institutionId);
        expect(result.roleType).toBe('DEAN');
    });

    it('should fetch the created authorities', async () => {
        const results = await service.getAuthorities(institutionId);
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toBe('Jane Doe');
    });

    // We skip testing actual MinIO upload in these simple unit/integration wrappers
    // but we can test the branding DB update method
    it('should update the branding URLs', async () => {
        const result = await service.updateBranding(institutionId, {
            logoUrl: 'http://example.com/logo.png',
            darkLogoUrl: 'http://example.com/dark-logo.png'
        });

        expect(result.logoUrl).toBe('http://example.com/logo.png');
        expect(result.darkLogoUrl).toBe('http://example.com/dark-logo.png');
    });
});
