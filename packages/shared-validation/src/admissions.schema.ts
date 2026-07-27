import { z } from "zod";

export const enquirySourceSchema = z.enum([
  "walk_in",
  "website",
  "referral",
  "whatsapp",
  "phone",
  "social",
  "other",
]);

export const enquiryStatusSchema = z.enum([
  "new",
  "contacted",
  "visited",
  "application",
  "admitted",
  "lost",
]);

export const enquiryActivityTypeSchema = z.enum([
  "created",
  "note",
  "call",
  "visit",
  "whatsapp",
  "status_change",
  "converted",
]);

export const createEnquirySchema = z.object({
  studentName: z.string().min(1, "Student name is required").max(255),
  guardianName: z.string().max(255).optional().nullable(),
  phone: z.string().min(1, "Phone is required").max(20),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  classInterested: z.string().max(255).optional().nullable(),
  classId: z.string().uuid().optional().nullable(),
  source: enquirySourceSchema.optional(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  followUpAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateEnquirySchema = z.object({
  status: enquiryStatusSchema.optional(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  followUpAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  studentName: z.string().max(255).optional(),
  guardianName: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  classInterested: z.string().max(255).optional().nullable(),
  source: enquirySourceSchema.optional(),
});

export const addActivitySchema = z.object({
  type: enquiryActivityTypeSchema.optional(),
  description: z.string().min(1, "Description is required"),
});

export const convertToStudentSchema = z.object({
  sectionId: z.string().uuid("Section ID is required"),
});

export const listEnquiriesQuerySchema = z.object({
  status: enquiryStatusSchema.optional(),
  source: enquirySourceSchema.optional(),
  assignedToUserId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
