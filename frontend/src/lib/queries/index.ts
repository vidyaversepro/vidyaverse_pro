// =============================================================================
// Vidyaverse Pro — Modular Query Barrel Export
// =============================================================================
// This file re-exports all query hooks and types from their domain-specific
// modules. Import from '@/lib/queries' for convenience, or from the specific
// module for tree-shaking and clarity.
// =============================================================================

// Shared types
export type { PaginatedResponse } from './shared/types';

// Student queries & types
export {
    useStudents,
    useStudent,
    useCreateStudent,
    useCreateBulkStudents,
    useApprovalQueue,
    useUpdateStudent,
    useDeleteStudent,
    useBulkDeleteStudents,
    useUpdateStudentDataStatus,
    useStudentCountsBySection,
    useGenerateSectionForms,
    useBulkUploadCsv,
    useAdmissionSlots,
    useBulkRequestPhotos,
} from './student/student-queries';
export type { Student, DataStatus, StudentStatus, AdmissionSlot } from './student/student-queries';

// Branch queries & types
export {
    useBranches,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch,
} from './institution/branch-queries';
export type { Branch } from './institution/branch-queries';

// Institution, Class, Stream, Section queries & types
export {
    useInstitution,
    useInstitutions,
    checkInstitutionUniqueness,
    useCreateInstitution,
    useUpdateInstitution,
    useDeleteInstitution,
    useClasses,
    useCreateClass,
    useUpdateClass,
    useDeleteClass,
    useStreams,
    useCreateStream,
    useUpdateStream,
    useDeleteStream,
    useSections,
    useCreateSection,
    useUpdateSection,
    useCreateBulkSections,
    useDeleteSection,
} from './institution/institution-queries';
export type { Institution, InstitutionFilters } from './institution/institution-queries';

// Template queries & types
export { useTemplates, useSetDefaultTemplate, useTemplate, useUpdateTemplate, useCreateTemplate, useUploadTemplateAsset } from './templates/template-queries';
export type { Template } from './templates/template-queries';


// ID Card queries & types
export {
    useIdCards,
    useGenerateIdCard,
    useGenerateBulkIdCards,
    useUpdateIdCard,
    useDeleteIdCard,
} from './id-cards/id-card-queries';
export type { IdCard } from './id-cards/id-card-queries';

// Visiting Card queries & types
export {
    useVisitingCards,
    useCreateVisitingCard,
    useGenerateBulkVisitingCards,
    useDeleteVisitingCard,
} from './visiting-cards/visiting-card-queries';
export type { VisitingCard } from './visiting-cards/visiting-card-queries';

// Certificate queries & types
export {
    useCertificates,
    useCreateCertificate,
    useGenerateBulkCertificates,
} from './certificates/certificate-queries';
export type { Certificate } from './certificates/certificate-queries';

// User queries & types
export {
    useUserStats,
    useUsers,
    useTeachers,
    useCreateUser,
    useUpdateUser,
    useAssignRole,
    useDeleteUser,
} from './auth/user-queries';
export type { User, UserFilters, UserStats } from './auth/user-queries';

// Group Photo queries & types
export {
    useGroupPhotos,
    useCreateGroupPhoto,
    useUpdateGroupPhoto,
    useDeleteGroupPhoto,
    useGroupPhotoFaces,
    useUpdateFaceMapping,
    useExtractFaces,
} from './group-photo/group-photo-queries';
export type { GroupPhoto, GroupPhotoFilters, Face } from './group-photo/group-photo-queries';

// Auth, Notification & Invitation queries & types
export {
    useUpdateProfile,
    useChangePassword,
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useValidateInvitation,
    useAcceptInvitation,
} from './auth/auth-queries';
export type { AppNotification } from './auth/auth-queries';

// Analytics queries & types
export {
    useDashboardStats,
    useStudentAnalytics,
} from './analytics/analytics-queries';
export type { DashboardOverviewResponse, StudentAnalyticsResponse, DashboardStatsQueryInput } from './analytics/analytics-queries';

// Hall Ticket queries & types
export {
    useExamSchedules,
    useExamSchedule,
    useCreateExamSchedule,
    useUpdateExamSchedule,
    usePublishExamSchedule,
    useAddExamSubject,
    useGenerateHallTicket,
    useBulkGenerateHallTickets
} from './hall-tickets/hall-ticket-queries';
export type { ExamSchedule, ExamSubject } from './hall-tickets/hall-ticket-queries';

// Library Card queries & types
export {
    useLibraryCards,
    useLibraryCard,
    useGenerateLibraryCard,
    useBulkGenerateLibraryCards,
    useSuspendLibraryCard,
    useReactivateLibraryCard
} from './library-cards/library-card-queries';
export type { LibraryCard } from './library-cards/library-card-queries';

// Transfer Certificate queries & types
export {
    useTransferCertificates,
    useTransferCertificate,
    useGenerateTransferCertificate,
    useBulkGenerateTransferCertificates,
    useIssueTransferCertificate,
    useCancelTransferCertificate
} from './transfer-certificates/transfer-certificate-queries';
export type { TransferCertificate } from './transfer-certificates/transfer-certificate-queries';

// Marksheet queries
export * from './marksheets/marksheet-queries';
