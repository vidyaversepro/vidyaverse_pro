import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateResolverService } from '../../src/modules/templates/template-resolver';
import { NotFoundError } from '../../src/utils/errors';

// Mock prisma and logger
vi.mock('../../src/config/database', () => ({
    prisma: {
        template: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock('../../src/utils/logger', () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as {
    template: {
        findFirst: ReturnType<typeof vi.fn>;
    };
};

describe('TemplateResolverService', () => {
    let resolver: TemplateResolverService;
    const mockInstitutionId = 'inst-123';

    beforeEach(() => {
        vi.clearAllMocks();
        // Since CircuitBreaker uses timeouts, we instantiate a fresh resolver to avoid cross-test state issues
        resolver = new TemplateResolverService();
    });

    describe('resolveTemplate', () => {
        const ctx = {
            institutionId: mockInstitutionId,
            productType: 'visiting_card' as const,
            audience: 'STUDENT' as const,
        };

        it('should resolve via Strategy 1 (Institution + Specific Audience + Default)', async () => {
            const mockTemplate = { id: 'tpl-1', name: 'Strategy 1 Template' };
            
            // Strategy 1 succeeds
            mockPrisma.template.findFirst.mockResolvedValueOnce(mockTemplate);

            const result = await resolver.resolveTemplate(ctx);

            expect(result).toEqual(mockTemplate);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledTimes(1);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        institutionId: ctx.institutionId,
                        serviceType: ctx.productType,
                        targetAudience: ctx.audience,
                        isDefault: true,
                        isActive: true,
                    }
                })
            );
        });

        it('should resolve via Strategy 2 (Institution + ALL Audience + Default) when Strategy 1 fails', async () => {
            const mockTemplate = { id: 'tpl-2', name: 'Strategy 2 Template' };
            
            // Strategy 1 fails (returns null)
            mockPrisma.template.findFirst.mockResolvedValueOnce(null);
            // Strategy 2 succeeds
            mockPrisma.template.findFirst.mockResolvedValueOnce(mockTemplate);

            const result = await resolver.resolveTemplate(ctx);

            expect(result).toEqual(mockTemplate);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledTimes(2);
            expect(mockPrisma.template.findFirst).toHaveBeenNthCalledWith(2,
                expect.objectContaining({
                    where: {
                        institutionId: ctx.institutionId,
                        serviceType: ctx.productType,
                        targetAudience: 'ALL',
                        isDefault: true,
                        isActive: true,
                    }
                })
            );
        });

        it('should resolve via Strategy 3 (Fallback to any active) when Strategies 1 & 2 fail', async () => {
            const mockTemplate = { id: 'tpl-3', name: 'Strategy 3 Template' };
            
            // Strategy 1 fails
            mockPrisma.template.findFirst.mockResolvedValueOnce(null);
            // Strategy 2 fails
            mockPrisma.template.findFirst.mockResolvedValueOnce(null);
            // Strategy 3 succeeds
            mockPrisma.template.findFirst.mockResolvedValueOnce(mockTemplate);

            const result = await resolver.resolveTemplate(ctx);

            expect(result).toEqual(mockTemplate);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledTimes(3);
        });

        it('should throw NotFoundError when all strategies fail', async () => {
            // All 3 strategies fail
            mockPrisma.template.findFirst.mockResolvedValue(null);

            await expect(resolver.resolveTemplate(ctx)).rejects.toThrow(NotFoundError);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledTimes(3);
        });
    });

    describe('resolveById', () => {
        it('should successfully resolve a template by ID', async () => {
            const mockTemplate = { id: 'tpl-exact', institutionId: mockInstitutionId };
            mockPrisma.template.findFirst.mockResolvedValue(mockTemplate);

            const result = await resolver.resolveById('tpl-exact', mockInstitutionId);

            expect(result).toEqual(mockTemplate);
            expect(mockPrisma.template.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        id: 'tpl-exact',
                        institutionId: mockInstitutionId,
                        isActive: true,
                    }
                })
            );
        });

        it('should throw NotFoundError if template is not found by ID', async () => {
            mockPrisma.template.findFirst.mockResolvedValue(null);

            await expect(resolver.resolveById('invalid-id', mockInstitutionId)).rejects.toThrow(NotFoundError);
        });
    });
});
