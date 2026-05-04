import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approvalService } from '../../src/modules/approvals/approval.service';

// Mock prisma
// Mock prisma
vi.mock('../../src/config/database', () => ({
    prisma: {
        approvalWorkflow: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
        },
        approvalRequest: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        approvalStep: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}));

import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as {
    approvalWorkflow: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        updateMany: ReturnType<typeof vi.fn>;
    };
    approvalRequest: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        count: ReturnType<typeof vi.fn>;
    };
    approvalStep: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        count: ReturnType<typeof vi.fn>;
    };
    user: {
        findUnique: ReturnType<typeof vi.fn>;
    };
};

describe('Approval Service', () => {
    const mockInstitutionId = 'inst-123';
    const mockUserId = 'user-123';
    const mockWorkflowId = 'workflow-123';
    const mockRequestId = 'request-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createWorkflow', () => {
        it('should create a new approval workflow', async () => {
            const workflowData = {
                name: 'TC Approval',
                type: 'transfer_certificate' as const,
                description: 'Transfer certificate approval process',
                steps: [
                    { order: 1, name: 'Class Teacher', approverRole: 'teacher' as const, isRequired: true },
                    { order: 2, name: 'Principal', approverRole: 'school_admin' as const, isRequired: true },
                ],
                isActive: true,
            };

            const mockCreatedWorkflow = {
                id: mockWorkflowId,
                institutionId: mockInstitutionId,
                ...workflowData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.approvalWorkflow.findFirst.mockResolvedValue(null);
            mockPrisma.approvalWorkflow.create.mockResolvedValue(mockCreatedWorkflow);

            const result = await approvalService.createWorkflow(mockInstitutionId, workflowData);

            expect(result).toBeDefined();
            expect(result.id).toBe(mockWorkflowId);
            expect(result.name).toBe('TC Approval');
            expect(mockPrisma.approvalWorkflow.create).toHaveBeenCalled();
        });

        it('should throw error if active workflow already exists', async () => {
            mockPrisma.approvalWorkflow.findFirst.mockResolvedValue({
                id: 'existing-workflow',
            });

            await expect(
                approvalService.createWorkflow(mockInstitutionId, {
                    name: 'Another TC Workflow',
                    type: 'transfer_certificate',
                    steps: [{ order: 1, name: 'Step 1', approverRole: 'teacher', isRequired: true }],
                    isActive: true,
                })
            ).rejects.toThrow('Active workflow already exists');
        });
    });

    describe('listWorkflows', () => {
        it('should list all workflows for an institution', async () => {
            const mockWorkflows = [
                { id: 'w1', name: 'Workflow 1', type: 'id_card' },
                { id: 'w2', name: 'Workflow 2', type: 'certificate' },
            ];

            mockPrisma.approvalWorkflow.findMany.mockResolvedValue(mockWorkflows);

            const result = await approvalService.listWorkflows(mockInstitutionId);

            expect(result).toHaveLength(2);
            expect(mockPrisma.approvalWorkflow.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { institutionId: mockInstitutionId },
                })
            );
        });

        it('should filter by type when provided', async () => {
            mockPrisma.approvalWorkflow.findMany.mockResolvedValue([]);

            await approvalService.listWorkflows(mockInstitutionId, 'id_card');

            expect(mockPrisma.approvalWorkflow.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { institutionId: mockInstitutionId, type: 'id_card' },
                })
            );
        });
    });

    describe('getApprovalStats', () => {
        it('should return approval statistics', async () => {
            mockPrisma.approvalRequest.count
                .mockResolvedValueOnce(10) // pending
                .mockResolvedValueOnce(25) // approved
                .mockResolvedValueOnce(5)  // rejected
                .mockResolvedValueOnce(3); // changes_requested

            mockPrisma.user.findUnique.mockResolvedValue({
                id: mockUserId,
                role: 'school_admin',
            });

            mockPrisma.approvalStep.count.mockResolvedValue(8);

            const stats = await approvalService.getApprovalStats(mockInstitutionId, mockUserId);

            expect(stats.total).toBe(43);
            expect(stats.pending).toBe(10);
            expect(stats.approved).toBe(25);
            expect(stats.rejected).toBe(5);
            expect(stats.changesRequested).toBe(3);
            expect(stats.assignedToUser).toBe(8);
        });
    });
});
