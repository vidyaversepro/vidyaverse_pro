import { z } from 'zod';

// ==========================================
// TAB 1: ACADEMIC
// ==========================================
export const academicTabSchema = z.object({
    institutionId: z.string().uuid("Invalid institution ID"),
    sectionId: z.string().uuid("Select a valid section").optional(),
    rollNo: z.coerce.number().int().positive("Roll number must be positive").optional(),
    admissionNumber: z.string().optional().nullable(),
    dateOfAdmission: z.coerce.date().refine(d => d <= new Date(), "Date cannot be in the future").optional().nullable(),
    status: z.enum(['pending', 'active']).optional(),
    previousSchool: z.string().optional().nullable(),
    transportMode: z.enum(['own', 'school bus', 'public', 'walking']).optional().nullable(),
});

// ==========================================
// TAB 2: PERSONAL
// ==========================================
export const personalTabSchema = z.object({
    name: z.string()
        .max(255, "Name too long")
        .regex(/^(?!\d+$).*/, "Name cannot be only numbers")
        .optional()
        .or(z.literal('')),
    sex: z.enum(['male', 'female', 'other']).optional().nullable(),
    dob: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.date().refine(d => {
            const age = (new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            return age >= 3 && age <= 25;
        }, "Age must be between 3 and 25 years").optional().nullable()
    ),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional().nullable(),
    aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar must be exactly 12 digits").optional().nullable().or(z.literal('')),
});

// ==========================================
// TAB 3: FAMILY
// ==========================================
export const familyTabSchema = z.object({
    fatherName: z.string().max(255).optional().nullable(),
    motherName: z.string().max(255).optional().nullable(),
    guardianName: z.string().max(255).optional().nullable(),
    guardianRelation: z.string().max(50).optional().nullable(),
    consentGiven: z.boolean().optional(),
    consentGivenBy: z.string().max(255).optional().nullable(),
});

// ==========================================
// TAB 4: CONTACT
// ==========================================
export const contactTabSchema = z.object({
    contact: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number").optional().nullable().or(z.literal('')),
    parentEmail: z.string().email("Invalid email format").optional().nullable().or(z.literal('')),
    address: z.string().min(5, "Address must be at least 5 characters").optional().nullable().or(z.literal('')),
    city: z.string().min(2, "City is required").optional().nullable().or(z.literal('')),
    // Real Indian states could be an enum, using generic string for brevity mapping here
    state: z.string().min(2, "State is required").optional().nullable().or(z.literal('')),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits").optional().nullable().or(z.literal('')),
});

// ==========================================
// PHOTO
// ==========================================
export const photoTabSchema = z.object({
    photoUrl: z.string().optional().nullable(),
});

// ==========================================
// TAB 6: OTHER
// ==========================================
// Photo validation usually occurs via separate status checks and the photo API,
// but the tab schema captures generic metadata saves or signatures.
export const otherTabSchema = z.object({
    customData: z.record(z.any()).optional().nullable(),
});

// Map for dynamic lookup based on active tab Name
export const schemaByTab: Record<string, z.ZodTypeAny> = {
    academic: academicTabSchema,
    personal: personalTabSchema,
    photo: photoTabSchema,
    family: familyTabSchema,
    contact: contactTabSchema,
    other: otherTabSchema,
};
