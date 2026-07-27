import { z } from "zod";

export const feeCategorySchema = z.enum([
  "tuition",
  "transport",
  "exam",
  "misc",
  "lab",
  "library",
]);

export const feeFrequencySchema = z.enum([
  "one_time",
  "monthly",
  "quarterly",
  "annual",
]);

export const invoiceStatusSchema = z.enum([
  "unpaid",
  "partial",
  "paid",
  "waived",
  "cancelled",
]);

export const createFeeStructureSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category: feeCategorySchema,
  amount: z.number().positive("Amount must be positive"),
  frequency: feeFrequencySchema,
  academicYear: z
    .string()
    .min(1, "Academic year is required")
    .max(20)
    .regex(/^\d{4}-\d{2,4}$/, "Format: 2024-25"),
  classId: z.string().uuid().optional(),
  dueDayOfMonth: z.number().int().min(1).max(31).optional(),
  lateFeeAmount: z.number().nonnegative().optional(),
  lateFeeAfterDays: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true),
});

export const createFeeInvoiceSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  feeStructureId: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  discount: z.number().nonnegative().default(0),
  lateFee: z.number().nonnegative().default(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  notes: z.string().max(1000).optional(),
});

export const listInvoicesQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  status: invoiceStatusSchema.optional(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type CreateFeeInvoiceInput = z.infer<typeof createFeeInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type FeeCategory = z.infer<typeof feeCategorySchema>;
export type FeeFrequency = z.infer<typeof feeFrequencySchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
