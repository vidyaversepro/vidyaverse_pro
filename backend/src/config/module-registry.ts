import { InstitutionType } from '@prisma/client';

/**
 * SINGLE SOURCE OF TRUTH for every toggleable Vidyaverse module.
 *
 * Effective access for a tenant is resolved by the entitlement service as:
 *   (tier defaults ∪ super-admin grants) − super-admin revokes,
 * then filtered by the institution's type. `core` modules are always on.
 */

export type ModuleTier = 'starter' | 'professional' | 'enterprise' | 'addon';

export type ModuleCategory =
  | 'core'
  | 'academics'
  | 'admissions_finance'
  | 'operations'
  | 'documents'
  | 'communication'
  | 'insights'
  | 'learning';

/** Metered resource a module consumes (for quota enforcement). */
export type MeteredResource = 'students' | 'whatsapp' | 'pdf' | 'storage' | 'ai' | null;

export interface ModuleDef {
  key: string;
  name: string;
  category: ModuleCategory;
  description: string;
  appliesTo: InstitutionType[];
  defaultTier: ModuleTier;
  metered?: MeteredResource;
  /** Add-ons are OFF by default at every tier; super-admin enables à la carte. */
  addOn?: boolean;
  /** Core modules are always on and cannot be toggled off. */
  core?: boolean;
}

const ALL_TYPES: InstitutionType[] = [
  InstitutionType.SCHOOL,
  InstitutionType.COLLEGE,
  InstitutionType.UNIVERSITY,
  InstitutionType.COACHING_INSTITUTE,
  InstitutionType.TRAINING_CENTER,
];
const SCHOOLISH: InstitutionType[] = [InstitutionType.SCHOOL, InstitutionType.COLLEGE, InstitutionType.UNIVERSITY];
const HIGHER_ED: InstitutionType[] = [InstitutionType.COLLEGE, InstitutionType.UNIVERSITY];

export const MODULE_REGISTRY: ModuleDef[] = [
  // ── Core (always on) ──────────────────────────────────────────────────────
  { key: 'institution_core', name: 'Institution & Branches', category: 'core', description: 'Institution profile, branches, settings', appliesTo: ALL_TYPES, defaultTier: 'starter', core: true },
  { key: 'user_rbac', name: 'Users & Roles', category: 'core', description: 'Staff/users, role-based access', appliesTo: ALL_TYPES, defaultTier: 'starter', core: true },
  { key: 'sis', name: 'Student Information System', category: 'core', description: 'Student records, bulk import', appliesTo: ALL_TYPES, defaultTier: 'starter', core: true },
  { key: 'academics_structure', name: 'Classes / Batches', category: 'core', description: 'Classes, sections, streams or coaching batches', appliesTo: ALL_TYPES, defaultTier: 'starter', core: true },
  { key: 'comm_core', name: 'Notifications & Email', category: 'core', description: 'In-app + email notifications', appliesTo: ALL_TYPES, defaultTier: 'starter', core: true },

  // ── Academics ─────────────────────────────────────────────────────────────
  { key: 'attendance', name: 'Attendance (QR)', category: 'academics', description: 'Session/QR attendance', appliesTo: ALL_TYPES, defaultTier: 'starter' },
  { key: 'attendance_biometric', name: 'Biometric / RFID Attendance', category: 'academics', description: 'Device-based + staff attendance', appliesTo: SCHOOLISH, defaultTier: 'addon', addOn: true },
  { key: 'timetable', name: 'Timetable & Substitution', category: 'academics', description: 'Auto-generated schedules, substitutions', appliesTo: SCHOOLISH, defaultTier: 'professional' },
  { key: 'examination', name: 'Examinations & Marksheets', category: 'academics', description: 'Exams, hall tickets, marksheets, ranks', appliesTo: SCHOOLISH, defaultTier: 'professional', metered: 'pdf' },
  { key: 'gradebook_cce', name: 'Continuous Assessment (CCE)', category: 'academics', description: 'Continuous gradebook + CBSE report cards', appliesTo: [InstitutionType.SCHOOL], defaultTier: 'professional' },
  { key: 'assessments_online', name: 'Online Tests & Question Bank', category: 'academics', description: 'Test series, question bank', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'assignments', name: 'Assignments & Homework', category: 'academics', description: 'Submission + grading workflow', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'ai_tutor', name: 'AI Tutor (DigiClassroom)', category: 'learning', description: 'NCERT RAG AI tutor (integration)', appliesTo: [InstitutionType.SCHOOL, InstitutionType.COACHING_INSTITUTE], defaultTier: 'addon', addOn: true, metered: 'ai' },
  { key: 'live_classes', name: 'Live Online Classes', category: 'learning', description: 'Virtual classroom + recordings', appliesTo: [InstitutionType.COLLEGE, InstitutionType.UNIVERSITY, InstitutionType.COACHING_INSTITUTE], defaultTier: 'addon', addOn: true },

  // ── Admissions & Finance ──────────────────────────────────────────────────
  { key: 'admissions_crm', name: 'Admissions & Enquiry CRM', category: 'admissions_finance', description: 'Lead capture, follow-up, online admission', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'fees', name: 'Fee Management', category: 'admissions_finance', description: 'Fee heads, invoices, due dates', appliesTo: ALL_TYPES, defaultTier: 'starter' },
  { key: 'fees_advanced', name: 'Concessions & Installments', category: 'admissions_finance', description: 'Scholarships, installments, defaulter tracking', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'payments', name: 'Online Payments (UPI/Razorpay)', category: 'admissions_finance', description: 'UPI/Razorpay + WhatsApp payment links', appliesTo: ALL_TYPES, defaultTier: 'starter' },
  { key: 'hr_payroll', name: 'HR & Payroll', category: 'admissions_finance', description: 'Staff salary, payslips, PF/ESI/TDS, leave', appliesTo: ALL_TYPES, defaultTier: 'enterprise' },
  { key: 'finance_accounting', name: 'Finance & Accounting', category: 'admissions_finance', description: 'Ledgers, expense/income, budgeting, P&L', appliesTo: ALL_TYPES, defaultTier: 'enterprise' },

  // ── Operations & Facilities ───────────────────────────────────────────────
  { key: 'transport', name: 'Transport Management', category: 'operations', description: 'Routes, vehicles, drivers, transport fees', appliesTo: SCHOOLISH, defaultTier: 'professional' },
  { key: 'transport_gps', name: 'GPS Live Tracking', category: 'operations', description: 'Live bus tracking + parent ETA alerts', appliesTo: SCHOOLISH, defaultTier: 'addon', addOn: true },
  { key: 'hostel', name: 'Hostel & Mess', category: 'operations', description: 'Rooms, allotment, mess billing', appliesTo: SCHOOLISH, defaultTier: 'enterprise' },
  { key: 'inventory', name: 'Inventory & Assets', category: 'operations', description: 'Store, assets, procurement', appliesTo: ALL_TYPES, defaultTier: 'enterprise' },
  { key: 'health', name: 'Infirmary / Health', category: 'operations', description: 'Clinic visits, vaccination, checkups', appliesTo: SCHOOLISH, defaultTier: 'enterprise' },
  { key: 'visitor', name: 'Visitor / Gate Pass', category: 'operations', description: 'Visitor logs, gate passes', appliesTo: SCHOOLISH, defaultTier: 'addon', addOn: true },
  { key: 'library', name: 'Library (PDLMS)', category: 'operations', description: 'Catalog, AI book-chat, audiobooks (integration)', appliesTo: ALL_TYPES, defaultTier: 'professional' },

  // ── Identity & Documents ──────────────────────────────────────────────────
  { key: 'id_card', name: 'ID Cards', category: 'documents', description: 'Student/staff ID cards', appliesTo: ALL_TYPES, defaultTier: 'starter', metered: 'pdf' },
  { key: 'visiting_card', name: 'Visiting Cards', category: 'documents', description: 'Staff visiting cards', appliesTo: ALL_TYPES, defaultTier: 'professional', metered: 'pdf' },
  { key: 'certificate', name: 'Certificates', category: 'documents', description: 'Achievement/event certificates', appliesTo: ALL_TYPES, defaultTier: 'starter', metered: 'pdf' },
  { key: 'library_card', name: 'Library Cards', category: 'documents', description: 'Library membership cards', appliesTo: ALL_TYPES, defaultTier: 'starter', metered: 'pdf' },
  { key: 'group_photo', name: 'Group Photos / Yearbook', category: 'documents', description: 'AI face-detection group photos', appliesTo: [InstitutionType.SCHOOL, InstitutionType.COLLEGE], defaultTier: 'professional', metered: 'storage' },
  { key: 'hall_ticket', name: 'Hall Tickets', category: 'documents', description: 'Exam hall tickets', appliesTo: SCHOOLISH, defaultTier: 'professional', metered: 'pdf' },
  { key: 'marksheet', name: 'Marksheets', category: 'documents', description: 'Marksheets / report cards', appliesTo: SCHOOLISH, defaultTier: 'professional', metered: 'pdf' },
  { key: 'transfer_certificate', name: 'Transfer Certificates', category: 'documents', description: 'TC generation', appliesTo: [InstitutionType.SCHOOL], defaultTier: 'professional', metered: 'pdf' },
  { key: 'portfolio', name: 'Student Portfolios', category: 'documents', description: 'Public student portfolios', appliesTo: ALL_TYPES, defaultTier: 'professional' },

  // ── Communication & Engagement ────────────────────────────────────────────
  { key: 'whatsapp_messaging', name: 'WhatsApp Parent Comms', category: 'communication', description: 'Templates, digests, delivery (Urmi rail)', appliesTo: ALL_TYPES, defaultTier: 'starter', metered: 'whatsapp' },
  { key: 'inbound_ai', name: 'Inbound AI Assistant', category: 'communication', description: 'Auto-answers parent queries from data', appliesTo: ALL_TYPES, defaultTier: 'professional', metered: 'ai' },
  { key: 'voice', name: 'Voice Notes / IVR', category: 'communication', description: 'Voice transcription (Bhashini/Azure)', appliesTo: ALL_TYPES, defaultTier: 'addon', addOn: true },
  { key: 'notices_events', name: 'Notices & Calendar', category: 'communication', description: 'Circulars, academic calendar, events', appliesTo: ALL_TYPES, defaultTier: 'starter' },
  { key: 'mobile_app', name: 'Parent/Student Mobile App', category: 'communication', description: 'Native app access', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'social', name: 'Student Social (Saathi)', category: 'communication', description: 'Student social feed & connections', appliesTo: [InstitutionType.SCHOOL], defaultTier: 'addon', addOn: true },
  { key: 'visionarium', name: 'Visionarium Magazine', category: 'communication', description: 'Student magazine & submissions', appliesTo: [InstitutionType.SCHOOL], defaultTier: 'addon', addOn: true },

  // ── Insights & Governance ─────────────────────────────────────────────────
  { key: 'approvals', name: 'Approval Workflows', category: 'insights', description: 'Multi-step approval chains', appliesTo: ALL_TYPES, defaultTier: 'professional' },
  { key: 'analytics', name: 'Dashboards & Analytics', category: 'insights', description: 'Operational dashboards', appliesTo: ALL_TYPES, defaultTier: 'starter' },
  { key: 'reports_bi', name: 'Custom Reports / BI', category: 'insights', description: 'Cross-module report builder', appliesTo: ALL_TYPES, defaultTier: 'enterprise' },
  { key: 'alumni', name: 'Alumni Management', category: 'insights', description: 'Alumni network, events, donations', appliesTo: HIGHER_ED, defaultTier: 'enterprise' },
  { key: 'placement', name: 'Placement / Career', category: 'insights', description: 'Placement drives, career services', appliesTo: [InstitutionType.COLLEGE, InstitutionType.UNIVERSITY, InstitutionType.COACHING_INSTITUTE], defaultTier: 'enterprise' },
];

const TIER_RANK: Record<ModuleTier, number> = { starter: 1, professional: 2, enterprise: 3, addon: 99 };

const REGISTRY_BY_KEY = new Map(MODULE_REGISTRY.map((m) => [m.key, m]));

export function getModule(key: string): ModuleDef | undefined {
  return REGISTRY_BY_KEY.get(key);
}

export const CORE_MODULE_KEYS: string[] = MODULE_REGISTRY.filter((m) => m.core).map((m) => m.key);

export const TOGGLEABLE_MODULES: ModuleDef[] = MODULE_REGISTRY.filter((m) => !m.core);

/** Modules a tier includes by default: every non-core, non-add-on module at or below the tier rank. */
export function getTierModules(tier: 'starter' | 'professional' | 'enterprise'): string[] {
  const max = TIER_RANK[tier];
  return MODULE_REGISTRY.filter((m) => !m.core && !m.addOn && TIER_RANK[m.defaultTier] <= max).map((m) => m.key);
}

export function isApplicable(key: string, institutionType: InstitutionType): boolean {
  const m = REGISTRY_BY_KEY.get(key);
  return m ? m.appliesTo.includes(institutionType) : false;
}
