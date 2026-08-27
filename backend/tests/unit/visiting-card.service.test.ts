import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVisitingCardService } from '../../src/modules/visiting-card/service';
import { NotFoundError } from '../../src/utils/errors';
import { templateResolver } from '../../src/modules/templates/template-resolver';

vi.mock('../../src/config/minio', () => ({
    s3Client: {
        putObject: vi.fn(),
        getObject: vi.fn(),
    },
    uploadToMinio: vi.fn(),
    getMinioFileUrl: vi.fn().mockResolvedValue('http://mock-minio/file.pdf'),
    downloadFromMinio: vi.fn(),
    getMinioClient: vi.fn(),
    initializeMinio: vi.fn(),
    storage: {
        uploadFile: vi.fn(),
        deleteFile: vi.fn(),
        getSignedUrl: vi.fn(),
        fileExists: vi.fn(),
        generateObjectName: vi.fn().mockReturnValue('mock-object-name.png'),
    },
}));

vi.mock('../../src/utils/pdf-generator', () => ({
    generatePDFFromHTML: vi.fn().mockResolvedValue(Buffer.from('pdf')),
    generateImageFromHTML: vi.fn().mockResolvedValue(Buffer.from('image')),
}));

vi.mock('../../src/utils/qrcode', () => ({
    generateVerificationQRCode: vi.fn().mockResolvedValue('http://mock-qrcode-url'),
}));

// Mock prisma and dependencies
vi.mock('../../src/config/database', () => ({
    prisma: {
        visitingCard: {
            create: vi.fn(),
            createMany: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        institution: {
            findUnique: vi.fn(),
        },
        student: {
            findFirst: vi.fn(),
        },
        userInstitutionRole: {
            findFirst: vi.fn(),
        },
        template: {
            findFirst: vi.fn(),
        },
        // buildBrandingContext() reads this for every printable, to resolve the
        // signing authority. Omitting it made create() throw on undefined.findMany.
        institutionAuthority: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('../../src/modules/templates/template-resolver', () => ({
    templateResolver: {
        resolveTemplate: vi.fn(),
        resolveById: vi.fn(),
    },
}));

import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as {
    visitingCard: {
        create: ReturnType<typeof vi.fn>;
        createMany: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        findFirst: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    user: {
        findUnique: ReturnType<typeof vi.fn>;
    };
    institution: {
        findUnique: ReturnType<typeof vi.fn>;
    };
    student: {
        findFirst: ReturnType<typeof vi.fn>;
    };
    userInstitutionRole: {
        findFirst: ReturnType<typeof vi.fn>;
    };
    template: {
        findFirst: ReturnType<typeof vi.fn>;
    };
    institutionAuthority: {
        findMany: ReturnType<typeof vi.fn>;
    };
};

describe('VisitingCardService', () => {
    let service: ReturnType<typeof createVisitingCardService>;
    const mockInstitutionId = 'inst-123';

    beforeEach(() => {
        vi.clearAllMocks();
        // No signing authorities configured is the common real case; the branding
        // builder falls back to the institution signature and title.
        mockPrisma.institutionAuthority.findMany.mockResolvedValue([]);
        service = createVisitingCardService(prisma as any);
    });

    describe('create', () => {
        it('should resolve template and create visiting card', async () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                designation: 'Principal',
                department: 'Administration',
                email: 'john@school.edu',
                phone: '1234567890',
                userId: 'user-123',
            };

            const mockTemplate = { id: 'tpl-1', serviceType: 'visiting_card' };
            const mockCreatedCard = { id: 'vc-1', ...data, templateId: 'tpl-1', institutionId: mockInstitutionId };

            (templateResolver.resolveTemplate as any).mockResolvedValue(mockTemplate);
            mockPrisma.institution.findUnique.mockResolvedValue({ id: mockInstitutionId, name: 'Test Inst' });
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123' });
            mockPrisma.userInstitutionRole.findFirst.mockResolvedValue({ role: 'teacher', user: { name: 'John Doe' } });
            mockPrisma.template.findFirst.mockResolvedValue({ id: 'tpl-1', content: '{"shapes":[]}', templateType: 'json' });
            mockPrisma.visitingCard.create.mockResolvedValue(mockCreatedCard);
            mockPrisma.visitingCard.update.mockResolvedValue({ ...mockCreatedCard, frontSideUrl: 'http://url' });

            const result = await service.create(mockInstitutionId, data);

            expect(result).toBeDefined();
            expect(result.visitingCard).toHaveProperty('id');
            expect(templateResolver.resolveTemplate).toHaveBeenCalledWith({
                institutionId: mockInstitutionId,
                productType: 'visiting_card',
                audience: 'TEACHER',
            });
            expect(mockPrisma.visitingCard.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ templateId: 'tpl-1', institutionId: mockInstitutionId }),
            });
        });

        it('should use explicit templateId if provided', async () => {
            const data = {
                firstName: 'Jane',
                lastName: 'Smith',
                designation: 'Teacher',
                templateId: 'custom-tpl',
                userId: 'user-456',
            };

            const mockTemplate = { id: 'custom-tpl', serviceType: 'visiting_card' };
            const mockCreatedCard = { id: 'vc-2', ...data, institutionId: mockInstitutionId };

            (templateResolver.resolveById as any).mockResolvedValue(mockTemplate);
            mockPrisma.institution.findUnique.mockResolvedValue({ id: mockInstitutionId, name: 'Test Inst' });
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-456' });
            mockPrisma.userInstitutionRole.findFirst.mockResolvedValue({ role: 'teacher', user: { name: 'Jane Smith' } });
            mockPrisma.template.findFirst.mockResolvedValue({ id: 'custom-tpl', content: '{"shapes":[]}', templateType: 'json' });
            mockPrisma.visitingCard.create.mockResolvedValue(mockCreatedCard);
            mockPrisma.visitingCard.update.mockResolvedValue({ ...mockCreatedCard, frontSideUrl: 'http://url' });

            const result = await service.create(mockInstitutionId, data);
    
            expect(result.visitingCard).toHaveProperty('id');
            expect(templateResolver.resolveById).toHaveBeenCalledWith('custom-tpl', mockInstitutionId);
            expect(mockPrisma.visitingCard.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ templateId: 'custom-tpl' }),
            });
        });
    });

    describe('getById', () => {
        it('should return card when found', async () => {
            const mockCard = { id: 'vc-1', institutionId: mockInstitutionId };
            mockPrisma.visitingCard.findFirst.mockResolvedValue(mockCard);

            const result = await service.getById('vc-1', mockInstitutionId);

            expect(result).toEqual(mockCard);
        });

        it('should throw NotFoundError when card not found', async () => {
            mockPrisma.visitingCard.findFirst.mockResolvedValue(null);

            await expect(service.getById('invalid', mockInstitutionId)).rejects.toThrow(NotFoundError);
        });
    });
});
