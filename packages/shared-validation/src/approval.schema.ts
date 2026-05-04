import { z } from 'zod';

// Approval request types
export const approvalRequestTypes = [
    'id_card',
    'certificate',
    'hall_ticket',
    'marksheet',
    'library_card',
    'transfer_certificate',
    'leave_application',
    'document_correction',
    'fee_waiver',
    'custom',
] as const;

// Create approval request
export const approvalRequestCreateSchema = z.object({
    type: z.enum(approvalRequestTypes),
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    entityType: z.string().max(50).optional(), // e.g., 'Student', 'Certificate'
    entityId: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    dueDate: z.string().datetime().optional(),
});

// Update approval request
export const approvalRequestUpdateSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().optional(),
});

// Process approval (approve/reject)
export const processApprovalSchema = z.object({
    action: z.enum(['approve', 'reject', 'request_changes']),
    comments: z.string().max(1000).optional(),
    conditions: z.array(z.string()).optional(), // conditions for approval
});

// Approval workflow definition
export const approvalWorkflowCreateSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(approvalRequestTypes),
    description: z.string().max(500).optional(),
    steps: z.array(z.object({
        order: z.number().int().min(1),
        name: z.string().max(100),
        approverRole: z.enum(['main_admin', 'school_admin', 'teacher', 'accountant']),
        approverUserId: z.string().uuid().optional(), // specific user override
        isRequired: z.boolean().default(true),
        autoApproveAfterDays: z.number().int().min(1).max(30).optional(),
    })).min(1).max(5),
    isActive: z.boolean().default(true),
});

// Query approvals
export const approvalQuerySchema = z.object({
    type: z.enum(approvalRequestTypes).optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'changes_requested', 'cancelled']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    requesterId: z.string().uuid().optional(),
    assignedToMe: z.string().transform((v) => v === 'true').optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export type ApprovalRequestType = typeof approvalRequestTypes[number];
export type ApprovalRequestCreateInput = z.infer<typeof approvalRequestCreateSchema>;
export type ApprovalRequestUpdateInput = z.infer<typeof approvalRequestUpdateSchema>;
export type ProcessApprovalInput = z.infer<typeof processApprovalSchema>;
export type ApprovalWorkflowCreateInput = z.infer<typeof approvalWorkflowCreateSchema>;
export type ApprovalQueryInput = z.infer<typeof approvalQuerySchema>;
