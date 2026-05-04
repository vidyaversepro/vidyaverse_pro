import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import type {
    ApprovalRequestCreateInput,
    ApprovalRequestUpdateInput,
    ProcessApprovalInput,
    ApprovalWorkflowCreateInput,
    ApprovalQueryInput,
} from '@vidyaverse/shared-validation';

export const approvalService = {
    // ============================================================================
    // APPROVAL WORKFLOWS
    // ============================================================================

    async createWorkflow(institutionId: string, data: ApprovalWorkflowCreateInput) {
        const { name, type, description, steps, isActive } = data;

        // Check for existing active workflow for this type
        const existing = await prisma.approvalWorkflow.findFirst({
            where: { institutionId, type, isActive: true },
        });

        if (existing && isActive) {
            throw new BadRequestError(`Active workflow already exists for type: ${type}`);
        }

        const workflow = await prisma.approvalWorkflow.create({
            data: {
                institutionId,
                name,
                type,
                description,
                steps: steps as import('@prisma/client').Prisma.InputJsonValue,
                isActive: isActive ?? true,
            },
        });

        logger.info('Approval workflow created', { workflowId: workflow.id, type });
        return workflow;
    },

    async listWorkflows(institutionId: string, type?: string) {
        const where: any = { institutionId };
        if (type) where.type = type;

        return prisma.approvalWorkflow.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    },

    async getWorkflow(id: string, institutionId: string) {
        const workflow = await prisma.approvalWorkflow.findFirst({
            where: { id, institutionId },
        });

        if (!workflow) {
            throw new NotFoundError('Workflow not found');
        }

        return workflow;
    },

    async toggleWorkflow(id: string, institutionId: string, isActive: boolean) {
        const workflow = await this.getWorkflow(id, institutionId);

        if (isActive) {
            // Deactivate other workflows of same type
            await prisma.approvalWorkflow.updateMany({
                where: { institutionId, type: workflow.type, isActive: true },
                data: { isActive: false },
            });
        }

        return prisma.approvalWorkflow.update({
            where: { id },
            data: { isActive },
        });
    },

    // ============================================================================
    // APPROVAL REQUESTS
    // ============================================================================

    async createRequest(institutionId: string, requesterId: string, data: ApprovalRequestCreateInput) {
        const { type, title, description, entityType, entityId, metadata, priority, dueDate } = data;

        // Find active workflow for this type
        const workflow = await prisma.approvalWorkflow.findFirst({
            where: { institutionId, type, isActive: true },
        });

        if (!workflow) {
            throw new BadRequestError(`No active approval workflow for type: ${type}`);
        }

        const steps = workflow.steps as Record<string, any>[];
        const firstStep = steps.find((s: any) => s.order === 1);

        if (!firstStep) {
            throw new BadRequestError('Workflow has no steps configured');
        }

        // Create request
        const request = await prisma.approvalRequest.create({
            data: {
                institutionId,
                requesterId,
                workflowId: workflow.id,
                type,
                title,
                description,
                entityType,
                entityId,
                metadata: metadata as import('@prisma/client').Prisma.InputJsonValue,
                priority: priority || 'normal',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                status: 'pending',
                currentStep: 1,
                totalSteps: steps.length,
            },
            include: {
                requester: { select: { id: true, name: true, email: true } },
            },
        });

        // Create first approval step record
        await prisma.approvalStep.create({
            data: {
                requestId: request.id,
                stepNumber: 1,
                name: firstStep.name,
                approverRole: firstStep.approverRole,
                approverUserId: firstStep.approverUserId,
                isRequired: firstStep.isRequired,
                status: 'pending',
            },
        });

        logger.info('Approval request created', { requestId: request.id, type, requesterId });
        return request;
    },

    async updateRequest(id: string, institutionId: string, requesterId: string, data: ApprovalRequestUpdateInput) {
        const request = await this.getRequest(id, institutionId);

        if (request.requesterId !== requesterId) {
            throw new ForbiddenError('Only requester can update the request');
        }

        if (request.status !== 'pending' && request.status !== 'changes_requested') {
            throw new BadRequestError('Cannot update request in current status');
        }

        return prisma.approvalRequest.update({
            where: { id },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
        });
    },

    async getRequest(id: string, institutionId: string) {
        const request = await prisma.approvalRequest.findFirst({
            where: { id, institutionId },
            include: {
                requester: { select: { id: true, name: true, email: true } },
                steps: { orderBy: { stepNumber: 'asc' } },
                workflow: true,
            },
        });

        if (!request) {
            throw new NotFoundError('Approval request not found');
        }

        return request;
    },

    async listRequests(institutionId: string, userId: string, userRole: string, query: ApprovalQueryInput) {
        const { type, status, priority, requesterId, assignedToMe, page, limit } = query;
        const skip = (page - 1) * limit;

        let where: any = { institutionId };

        if (type) where.type = type;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (requesterId) where.requesterId = requesterId;

        // If user wants to see requests assigned to them
        if (assignedToMe) {
            const pendingSteps = await prisma.approvalStep.findMany({
                where: {
                    status: 'pending',
                    OR: [
                        { approverUserId: userId },
                        { approverRole: userRole },
                    ],
                },
                select: { requestId: true },
            });

            const requestIds = pendingSteps.map((s) => s.requestId);
            where.id = { in: requestIds };
        }

        const [requests, total] = await Promise.all([
            prisma.approvalRequest.findMany({
                where,
                skip,
                take: limit,
                include: {
                    requester: { select: { id: true, name: true } },
                    steps: {
                        where: { status: 'pending' },
                        take: 1,
                    },
                },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.approvalRequest.count({ where }),
        ]);

        return {
            requests,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },

    async processApproval(
        requestId: string,
        institutionId: string,
        userId: string,
        userRole: string,
        data: ProcessApprovalInput
    ) {
        const { action, comments, conditions } = data;

        const request = await this.getRequest(requestId, institutionId);

        if (request.status !== 'pending' && request.status !== 'changes_requested') {
            throw new BadRequestError('Request is not pending approval');
        }

        // Find current pending step
        const currentStep = request.steps.find((s) => s.stepNumber === request.currentStep && s.status === 'pending');

        if (!currentStep) {
            throw new BadRequestError('No pending step found');
        }

        // Check if user can approve this step
        const canApprove =
            currentStep.approverUserId === userId ||
            currentStep.approverRole === userRole;

        if (!canApprove) {
            throw new ForbiddenError('You are not authorized to approve this step');
        }

        const workflow = request.workflow;
        const workflowSteps = workflow?.steps as Record<string, any>[];

        if (action === 'approve') {
            // Update current step
            await prisma.approvalStep.update({
                where: { id: currentStep.id },
                data: {
                    status: 'approved',
                    approverId: userId,
                    comments,
                    conditions: conditions as import('@prisma/client').Prisma.InputJsonValue,
                    processedAt: new Date(),
                },
            });

            // Check if there are more steps
            if (request.currentStep < request.totalSteps) {
                const nextStepDef = workflowSteps.find((s: any) => s.order === request.currentStep + 1);

                if (!nextStepDef) {
                    throw new BadRequestError('Next workflow step definition not found');
                }

                // Create next step
                await prisma.approvalStep.create({
                    data: {
                        requestId,
                        stepNumber: request.currentStep + 1,
                        name: nextStepDef.name,
                        approverRole: nextStepDef.approverRole,
                        approverUserId: nextStepDef.approverUserId,
                        isRequired: nextStepDef.isRequired,
                        status: 'pending',
                    },
                });

                // Update request to next step
                await prisma.approvalRequest.update({
                    where: { id: requestId },
                    data: { currentStep: request.currentStep + 1 },
                });
            } else {
                // All steps completed - mark as approved
                await prisma.approvalRequest.update({
                    where: { id: requestId },
                    data: { status: 'approved', completedAt: new Date() },
                });
            }
        } else if (action === 'reject') {
            await prisma.approvalStep.update({
                where: { id: currentStep.id },
                data: {
                    status: 'rejected',
                    approverId: userId,
                    comments,
                    processedAt: new Date(),
                },
            });

            await prisma.approvalRequest.update({
                where: { id: requestId },
                data: { status: 'rejected', completedAt: new Date() },
            });
        } else if (action === 'request_changes') {
            await prisma.approvalStep.update({
                where: { id: currentStep.id },
                data: {
                    status: 'changes_requested',
                    approverId: userId,
                    comments,
                    processedAt: new Date(),
                },
            });

            await prisma.approvalRequest.update({
                where: { id: requestId },
                data: { status: 'changes_requested' },
            });
        }

        logger.info('Approval processed', { requestId, action, userId });
        return this.getRequest(requestId, institutionId);
    },

    async cancelRequest(id: string, institutionId: string, requesterId: string) {
        const request = await this.getRequest(id, institutionId);

        if (request.requesterId !== requesterId) {
            throw new ForbiddenError('Only requester can cancel the request');
        }

        if (request.status === 'approved' || request.status === 'rejected') {
            throw new BadRequestError('Cannot cancel completed request');
        }

        return prisma.approvalRequest.update({
            where: { id },
            data: { status: 'cancelled', completedAt: new Date() },
        });
    },

    // ============================================================================
    // STATS
    // ============================================================================

    async getApprovalStats(institutionId: string, userId?: string) {
        const where: any = { institutionId };

        const [pending, approved, rejected, changesRequested] = await Promise.all([
            prisma.approvalRequest.count({ where: { ...where, status: 'pending' } }),
            prisma.approvalRequest.count({ where: { ...where, status: 'approved' } }),
            prisma.approvalRequest.count({ where: { ...where, status: 'rejected' } }),
            prisma.approvalRequest.count({ where: { ...where, status: 'changes_requested' } }),
        ]);

        // Get pending requests assigned to user if userId provided
        let assignedToUser = 0;
        if (userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                assignedToUser = await prisma.approvalStep.count({
                    where: {
                        status: 'pending',
                        OR: [
                            { approverUserId: userId },
                            { approverRole: user.globalRole || 'user' },
                        ],
                    },
                });
            }
        }

        return {
            total: pending + approved + rejected + changesRequested,
            pending,
            approved,
            rejected,
            changesRequested,
            assignedToUser,
        };
    },
};
