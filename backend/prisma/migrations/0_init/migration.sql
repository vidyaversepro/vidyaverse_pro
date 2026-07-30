-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('direct', 'group');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'file', 'voice', 'call_started', 'call_ended');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read');

-- CreateEnum
CREATE TYPE "GuardianRole" AS ENUM ('mother', 'father', 'grandparent_paternal', 'grandparent_maternal', 'uncle', 'aunt', 'legal_guardian', 'hostel_warden', 'step_parent', 'sibling_adult', 'other');

-- CreateEnum
CREATE TYPE "PreferredMedium" AS ENUM ('text', 'voice');

-- CreateEnum
CREATE TYPE "GuardianSource" AS ENUM ('backfill', 'manual', 'import', 'inbound');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('utility', 'authentication', 'marketing', 'service');

-- CreateEnum
CREATE TYPE "TemplateChannel" AS ENUM ('whatsapp', 'sms');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "OutboxChannel" AS ENUM ('whatsapp', 'sms', 'ivr');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('guardian', 'staff');

-- CreateEnum
CREATE TYPE "OutboxPriority" AS ENUM ('critical', 'high', 'normal', 'low');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('pending', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('outbound', 'inbound');

-- CreateEnum
CREATE TYPE "FeeCategory" AS ENUM ('tuition', 'transport', 'exam', 'misc', 'lab', 'library');

-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('one_time', 'monthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('unpaid', 'partial', 'paid', 'waived', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('upi', 'card', 'netbanking', 'cash', 'cheque', 'bank_transfer');

-- CreateEnum
CREATE TYPE "GatewayProvider" AS ENUM ('razorpay', 'cashfree');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('initiated', 'success', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'audio', 'pdf', 'excel', 'video', 'other');

-- CreateEnum
CREATE TYPE "InboundMediaStatus" AS ENUM ('received', 'downloading', 'stored', 'processed', 'failed');

-- CreateEnum
CREATE TYPE "FeeClaimStatus" AS ENUM ('pending_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "SubstitutionStatus" AS ENUM ('planned', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('asset', 'liability', 'income', 'expense', 'equity');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('receipt', 'payment', 'journal', 'contra');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('posted', 'void');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'visiting');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('active', 'on_leave', 'resigned', 'terminated');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('draft', 'finalized', 'paid');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('casual', 'sick', 'earned', 'unpaid', 'maternity', 'other');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TransportAssignmentType" AS ENUM ('pickup', 'drop', 'both');

-- CreateEnum
CREATE TYPE "TransportTripStatus" AS ENUM ('scheduled', 'started', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('walk_in', 'website', 'referral', 'whatsapp', 'phone', 'social', 'other');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('new', 'contacted', 'visited', 'application', 'admitted', 'lost');

-- CreateEnum
CREATE TYPE "EnquiryActivityType" AS ENUM ('created', 'note', 'call', 'visit', 'whatsapp', 'status_change', 'converted');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'COACHING_INSTITUTE', 'TRAINING_CENTER');

-- CreateEnum
CREATE TYPE "InstitutionAuthorityRole" AS ENUM ('PRINCIPAL', 'VICE_CHANCELLOR', 'HOD', 'REGISTRAR', 'DEAN', 'DIRECTOR', 'COORDINATOR', 'TEACHER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('starter', 'professional', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trial', 'active', 'suspended', 'cancelled');

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('super_admin', 'admin', 'support', 'student', 'user');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'expired');

-- CreateEnum
CREATE TYPE "InstitutionRole" AS ENUM ('main_admin', 'school_admin', 'teacher', 'student');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('EMPTY', 'INVITED', 'FILLED');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('pending', 'active', 'graduated', 'transferred', 'withdrawn', 'suspended');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('pending', 'filled', 'enhanced', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('visiting_card', 'id_card', 'certificate', 'group_photo', 'portfolio', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate');

-- CreateEnum
CREATE TYPE "TemplateAudience" AS ENUM ('ALL', 'STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('html', 'svg', 'json');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('portrait', 'landscape');

-- CreateEnum
CREATE TYPE "IdCardStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'printed', 'issued', 'cancelled');

-- CreateEnum
CREATE TYPE "VisitingCardStatus" AS ENUM ('draft', 'generated', 'approved', 'printed', 'issued', 'cancelled');

-- CreateEnum
CREATE TYPE "GroupPhotoPackage" AS ENUM ('basic', 'standard', 'premium');

-- CreateEnum
CREATE TYPE "GroupPhotoProcessingStatus" AS ENUM ('uploaded', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('academic_excellence', 'sports', 'cultural', 'attendance', 'character', 'transfer', 'scholarship', 'topper', 'participation', 'custom');

-- CreateEnum
CREATE TYPE "CertificatePackage" AS ENUM ('standard', 'premium');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('draft', 'generated', 'sent', 'downloaded');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('internal', 'board', 'competitive');

-- CreateEnum
CREATE TYPE "ExamScheduleStatus" AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "HallTicketStatus" AS ENUM ('generated', 'sent', 'downloaded', 'verified');

-- CreateEnum
CREATE TYPE "HallTicketSentVia" AS ENUM ('sms', 'email', 'both');

-- CreateEnum
CREATE TYPE "RankCalculationScope" AS ENUM ('section', 'class_all_sections', 'institution');

-- CreateEnum
CREATE TYPE "RoundingMethod" AS ENUM ('round', 'floor', 'ceil');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('theory', 'practical', 'combined');

-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('draft', 'submitted', 'approved', 'published');

-- CreateEnum
CREATE TYPE "MarksheetStatus" AS ENUM ('draft', 'generated', 'approved', 'published', 'sent');

-- CreateEnum
CREATE TYPE "LibraryCardStatus" AS ENUM ('active', 'suspended', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "ConductRemarks" AS ENUM ('excellent', 'good', 'satisfactory', 'needs_improvement');

-- CreateEnum
CREATE TYPE "FeeClearanceStatus" AS ENUM ('cleared', 'pending', 'dues_outstanding');

-- CreateEnum
CREATE TYPE "TransferCertificateStatus" AS ENUM ('draft', 'pending_approval', 'issued', 'cancelled');

-- CreateEnum
CREATE TYPE "ApprovalEntityType" AS ENUM ('student', 'id_card', 'certificate', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected', 'changes_requested', 'cancelled');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('entry', 'exit', 'checkpoint');

-- CreateEnum
CREATE TYPE "QrSource" AS ENUM ('id_card', 'library_card', 'hall_ticket', 'mobile_app');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('photo_enhancement', 'bulk_pdf_generation', 'csv_import', 'facial_recognition', 'group_photo_processing', 'bulk_certificate_generation', 'bulk_hall_ticket_generation', 'bulk_marksheet_generation', 'monthly_usage_reset', 'email_batch');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ImageAnalysisMethod" AS ENUM ('opencv', 'gemini');

-- CreateEnum
CREATE TYPE "ConfigDataType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateEnum
CREATE TYPE "PortfolioTheme" AS ENUM ('modern', 'classic', 'minimal', 'colorful', 'professional');

-- CreateEnum
CREATE TYPE "PortfolioStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PortfolioSectionType" AS ENUM ('about', 'education', 'skills', 'achievements', 'projects', 'gallery', 'contact', 'custom');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "NotificationTemplateType" AS ENUM ('email', 'sms', 'push');

-- CreateEnum
CREATE TYPE "NotificationLogStatus" AS ENUM ('pending', 'sent', 'partial', 'failed');

-- CreateEnum
CREATE TYPE "ApprovalPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ApprovalStepStatus" AS ENUM ('pending', 'approved', 'rejected', 'changes_requested');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('class', 'event', 'exam', 'activity');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "AttendanceRecordStatus" AS ENUM ('present', 'absent', 'late', 'excused', 'half_day');

-- CreateEnum
CREATE TYPE "FormTab" AS ENUM ('academic', 'personal', 'photo', 'family', 'contact', 'other');

-- CreateEnum
CREATE TYPE "OnboardingMode" AS ENUM ('volunteer', 'selfservice');

-- CreateEnum
CREATE TYPE "VisionariumLanguage" AS ENUM ('hi', 'en', 'hi_en');

-- CreateEnum
CREATE TYPE "VisionariumSubject" AS ENUM ('science', 'mathematics', 'life_sciences', 'history', 'political_science', 'economics', 'information_technology', 'languages');

-- CreateEnum
CREATE TYPE "VisionariumArticleType" AS ENUM ('article', 'story', 'poem', 'artwork', 'interview');

-- CreateEnum
CREATE TYPE "VisionariumPerspective" AS ENUM ('student', 'teacher', 'expert', 'alumni');

-- CreateEnum
CREATE TYPE "VisionariumArticleStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "VisionariumPlan" AS ENUM ('basic', 'premium');

-- CreateEnum
CREATE TYPE "VisionariumSubmissionType" AS ENUM ('article', 'poem', 'story', 'artwork', 'other');

-- CreateEnum
CREATE TYPE "VisionariumSubmissionStatus" AS ENUM ('submitted', 'accepted', 'rejected', 'published');

-- CreateEnum
CREATE TYPE "SocialRelationshipType" AS ENUM ('guardian_of', 'ward_of', 'sibling', 'teacher_of', 'student_of', 'batchmate', 'schoolmate');

-- CreateEnum
CREATE TYPE "SaathiLinkStatus" AS ENUM ('pending', 'accepted', 'rejected', 'blocked', 'cancelled');

-- CreateEnum
CREATE TYPE "SaathiContext" AS ENUM ('student', 'teacher', 'parent', 'alumni', 'other');

-- CreateEnum
CREATE TYPE "SocialPostScope" AS ENUM ('class_only', 'institution_only', 'my_saathi', 'public_vidyaverse');

-- CreateEnum
CREATE TYPE "SocialReactionType" AS ENUM ('prerna');

-- CreateEnum
CREATE TYPE "HostelType" AS ENUM ('boys', 'girls', 'mixed');

-- CreateEnum
CREATE TYPE "AllotmentStatus" AS ENUM ('active', 'vacated');

-- CreateEnum
CREATE TYPE "MessBillStatus" AS ENUM ('pending', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('consumable', 'asset');

-- CreateEnum
CREATE TYPE "StockTxnType" AS ENUM ('stock_in', 'stock_out', 'adjustment');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('checked_in', 'checked_out');

-- CreateEnum
CREATE TYPE "GatePassType" AS ENUM ('early_leave', 'late_entry', 'day_out');

-- CreateEnum
CREATE TYPE "CceTermType" AS ENUM ('FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2');

-- CreateEnum
CREATE TYPE "CceStatus" AS ENUM ('open', 'locked');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('submitted', 'graded', 'late');

-- CreateEnum
CREATE TYPE "NoticeAudience" AS ENUM ('all', 'staff', 'students', 'parents');

-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('circular', 'event', 'holiday', 'exam');

-- CreateEnum
CREATE TYPE "NoticeStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('holiday', 'exam', 'event', 'meeting');

-- CreateEnum
CREATE TYPE "PlacementDriveStatus" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PlacementApplicationStatus" AS ENUM ('applied', 'shortlisted', 'selected', 'rejected');

-- CreateEnum
CREATE TYPE "BiometricType" AS ENUM ('fingerprint', 'rfid', 'face');

-- CreateEnum
CREATE TYPE "PunchPersonType" AS ENUM ('student', 'staff');

-- CreateEnum
CREATE TYPE "PunchDirection" AS ENUM ('in', 'out');

-- CreateEnum
CREATE TYPE "StaffAttendanceStatus" AS ENUM ('present', 'absent', 'half_day', 'leave');

-- CreateEnum
CREATE TYPE "ConcessionType" AS ENUM ('scholarship', 'sibling', 'staff_ward', 'merit', 'need_based');

-- CreateEnum
CREATE TYPE "ConcessionStatus" AS ENUM ('active', 'expired');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('pending', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "LiveClassPlatform" AS ENUM ('zoom', 'meet', 'jitsi', 'other');

-- CreateEnum
CREATE TYPE "LiveClassStatus" AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'true_false', 'short_answer');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "OnlineTestStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('in_progress', 'submitted', 'graded');

-- CreateTable
CREATE TABLE "institutions" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "institution_type" "InstitutionType" NOT NULL DEFAULT 'SCHOOL',
    "address" TEXT,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "academic_year" VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    "logo_url" VARCHAR(500),
    "dark_logo_url" VARCHAR(500),
    "signature_url" VARCHAR(500),
    "signature_title" VARCHAR(100) NOT NULL DEFAULT 'Principal',
    "seal_url" VARCHAR(500),
    "enabled_fields" JSONB NOT NULL,
    "custom_fields" JSONB NOT NULL,
    "enabled_services" JSONB NOT NULL,
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'starter',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "monthly_ai_usage" INTEGER NOT NULL DEFAULT 0,
    "monthly_pdf_pages" INTEGER NOT NULL DEFAULT 0,
    "monthly_email_sent" INTEGER NOT NULL DEFAULT 0,
    "storage_used_mb" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "whatsapp_phone_number_id" VARCHAR(50),
    "whatsapp_waba_id" VARCHAR(50),
    "razorpay_account_id" VARCHAR(100),
    "monthly_whatsapp_sent" INTEGER NOT NULL DEFAULT 0,
    "feature_overrides" JSONB,
    "module_config" JSONB,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'direct',
    "name" VARCHAR(255),
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "sender_id" VARCHAR(36) NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36),
    "livekit_room_name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'video',
    "host_id" VARCHAR(36) NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "participants" JSONB NOT NULL,

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_authorities" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "designation" VARCHAR(255) NOT NULL,
    "role_type" "InstitutionAuthorityRole" NOT NULL DEFAULT 'CUSTOM',
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "signature_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_authorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "address" TEXT,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" VARCHAR(255),
    "password_reset_token" VARCHAR(255),
    "password_reset_expires" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" VARCHAR(255),
    "global_role" "GlobalRole" DEFAULT 'student',
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" VARCHAR(50),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alternate_emails" JSONB,
    "external_subjects" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_invitations" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "email" CITEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_institution_roles" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "role" "InstitutionRole" NOT NULL,
    "assigned_classes" JSONB,
    "assigned_sections" JSONB,
    "student_access_enabled" BOOLEAN NOT NULL DEFAULT false,
    "student_access_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_institution_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "branch_id" VARCHAR(36),
    "name" VARCHAR(100) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "streams_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "class_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "class_id" VARCHAR(36) NOT NULL,
    "stream_id" VARCHAR(36),
    "name" VARCHAR(50) NOT NULL,
    "expected_student_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "class_teacher_id" VARCHAR(36),

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_slots" (
    "id" CHAR(30) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "roll_no" INTEGER NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "token" VARCHAR(50) NOT NULL,
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "branch_id" VARCHAR(36),
    "slot_id" CHAR(30),
    "admission_number" VARCHAR(50),
    "name" VARCHAR(255) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    "father_name" VARCHAR(255),
    "mother_name" VARCHAR(255),
    "guardian_name" VARCHAR(255),
    "guardian_relation" VARCHAR(50),
    "guardian_phone" VARCHAR(20),
    "sex" "Sex",
    "dob" DATE,
    "blood_group" VARCHAR(10),
    "aadhar_number" VARCHAR(12),
    "caste" VARCHAR(100),
    "religion" VARCHAR(100),
    "contact" VARCHAR(20),
    "parent_email" CITEXT,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(10),
    "date_of_admission" DATE,
    "previous_school" TEXT,
    "transport_mode" VARCHAR(50),
    "photo_url" VARCHAR(500),
    "photo_hash" VARCHAR(64),
    "student_signature_url" VARCHAR(500),
    "parent_signature_url" VARCHAR(500),
    "medical_notes" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'active',
    "data_status" "DataStatus" NOT NULL DEFAULT 'filled',
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "consent_timestamp" TIMESTAMP(3),
    "consent_given_by" VARCHAR(255),
    "custom_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "photo_metadata" JSONB,
    "photo_updated_at" TIMESTAMP(3),
    "photo_version" INTEGER NOT NULL DEFAULT 0,
    "thumb_url" VARCHAR(500),
    "user_id" VARCHAR(36),
    "roll_number" VARCHAR(50),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "template_type" "TemplateType" NOT NULL DEFAULT 'html',
    "content" TEXT NOT NULL,
    "css_styles" TEXT,
    "width_mm" DECIMAL(7,2) NOT NULL DEFAULT 85.60,
    "height_mm" DECIMAL(7,2) NOT NULL DEFAULT 54.00,
    "orientation" "Orientation" NOT NULL DEFAULT 'landscape',
    "thumbnail_url" VARCHAR(500),
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "target_audience" "TemplateAudience" NOT NULL DEFAULT 'ALL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_cards" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "card_number" VARCHAR(50),
    "valid_from" DATE,
    "valid_until" DATE,
    "qr_code_data" TEXT,
    "barcode_data" VARCHAR(100),
    "card_front_url" VARCHAR(500),
    "card_back_url" VARCHAR(500),
    "pdf_url" VARCHAR(500),
    "status" "IdCardStatus" NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pdf_object_path" VARCHAR(500),
    "card_back_object_path" VARCHAR(500),
    "card_front_object_path" VARCHAR(500),

    CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visiting_cards" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36),
    "user_id" VARCHAR(36),
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "card_number" VARCHAR(50) NOT NULL,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "website" VARCHAR(255),
    "linkedin_url" VARCHAR(500),
    "front_pdf_url" VARCHAR(500),
    "back_pdf_url" VARCHAR(500),
    "thumbnail_url" VARCHAR(500),
    "qr_code_data" TEXT,
    "status" "VisitingCardStatus" NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visiting_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_photos" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36),
    "class_id" VARCHAR(36),
    "name" VARCHAR(255) NOT NULL,
    "event_name" VARCHAR(255),
    "event_date" DATE,
    "description" TEXT,
    "photo_session_name" VARCHAR(255),
    "photo_date" DATE,
    "location" VARCHAR(255),
    "photographer" VARCHAR(255),
    "photo_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "raw_group_photo_url" VARCHAR(500),
    "processed_group_photo_url" VARCHAR(500),
    "perceptual_hash" VARCHAR(64),
    "package_tier" "GroupPhotoPackage" NOT NULL DEFAULT 'basic',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "processing_status" "GroupPhotoProcessingStatus" NOT NULL DEFAULT 'uploaded',
    "face_detection_completed" BOOLEAN NOT NULL DEFAULT false,
    "individual_extraction_completed" BOOLEAN NOT NULL DEFAULT false,
    "total_students_detected" INTEGER NOT NULL DEFAULT 0,
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "teacher_detected" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_photo_extractions" (
    "id" VARCHAR(36) NOT NULL,
    "group_photo_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36),
    "row_number" INTEGER,
    "position_in_row" INTEGER,
    "bounding_box" JSONB,
    "confidence_score" DECIMAL(3,2),
    "face_hash" VARCHAR(64),
    "match_confidence" INTEGER,
    "is_auto_matched" BOOLEAN NOT NULL DEFAULT false,
    "is_rejected" BOOLEAN NOT NULL DEFAULT false,
    "manual_label" VARCHAR(255),
    "individual_photo_url" VARCHAR(500),
    "enhanced_photo_url" VARCHAR(500),
    "framed_photo_url" VARCHAR(500),
    "yearbook_format_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_photo_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "certificate_type" "CertificateType" NOT NULL,
    "certificate_number" VARCHAR(50),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "achievement_details" TEXT,
    "awarded_for_period" VARCHAR(100),
    "issue_date" DATE NOT NULL,
    "verification_qr_code" TEXT,
    "verification_url" VARCHAR(500),
    "digital_signature_url" VARCHAR(500),
    "pdf_url" VARCHAR(500),
    "package_tier" "CertificatePackage" NOT NULL DEFAULT 'standard',
    "status" "CertificateStatus" NOT NULL DEFAULT 'draft',
    "email_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_schedules" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "exam_name" VARCHAR(255) NOT NULL,
    "exam_type" "ExamType" NOT NULL DEFAULT 'internal',
    "academic_year" VARCHAR(20),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "instructions" TEXT,
    "reporting_time" TIME(0),
    "status" "ExamScheduleStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_subjects" (
    "id" VARCHAR(36) NOT NULL,
    "exam_schedule_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "subject_code" VARCHAR(50),
    "exam_date" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "venue" VARCHAR(255),
    "max_marks" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_tickets" (
    "id" VARCHAR(36) NOT NULL,
    "exam_schedule_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "hall_ticket_number" VARCHAR(50),
    "roll_number_for_exam" VARCHAR(50),
    "exam_center" VARCHAR(255),
    "seat_number" VARCHAR(50),
    "qr_code_data" TEXT,
    "barcode_data" VARCHAR(100),
    "pdf_url" VARCHAR(500),
    "status" "HallTicketStatus" NOT NULL DEFAULT 'generated',
    "sent_via" "HallTicketSentVia",
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hall_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_engines" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "cgpa_formula" TEXT NOT NULL,
    "percentage_formula" TEXT NOT NULL,
    "percentile_formula" TEXT NOT NULL,
    "grade_scale" JSONB NOT NULL,
    "theory_weightage" DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    "practical_weightage" DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    "internal_weightage" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "rank_calculation_scope" "RankCalculationScope" NOT NULL DEFAULT 'class_all_sections',
    "grace_marks_enabled" BOOLEAN NOT NULL DEFAULT false,
    "max_grace_marks" INTEGER NOT NULL DEFAULT 0,
    "grace_marks_rules" JSONB,
    "decimal_precision" INTEGER NOT NULL DEFAULT 2,
    "rounding_method" "RoundingMethod" NOT NULL DEFAULT 'round',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculation_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "class_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "subject_code" VARCHAR(50),
    "subject_type" "SubjectType" NOT NULL DEFAULT 'theory',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marks" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "subject_id" VARCHAR(36) NOT NULL,
    "exam_schedule_id" VARCHAR(36) NOT NULL,
    "theory_max_marks" INTEGER,
    "theory_obtained_marks" DECIMAL(5,2),
    "practical_max_marks" INTEGER,
    "practical_obtained_marks" DECIMAL(5,2),
    "internal_max_marks" INTEGER,
    "internal_obtained_marks" DECIMAL(5,2),
    "total_max_marks" INTEGER,
    "total_obtained_marks" DECIMAL(5,2),
    "percentage" DECIMAL(5,2),
    "grade" VARCHAR(10),
    "status" "MarkStatus" NOT NULL DEFAULT 'draft',
    "entered_by" VARCHAR(36),
    "approved_by" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marksheets" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "exam_schedule_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36) NOT NULL,
    "calculation_engine_id" VARCHAR(36) NOT NULL,
    "total_percentage" DECIMAL(5,2),
    "cgpa" DECIMAL(4,2),
    "grade" VARCHAR(10),
    "class_rank" INTEGER,
    "section_rank" INTEGER,
    "overall_rank" INTEGER,
    "percentile" DECIMAL(5,2),
    "total_students_in_comparison" INTEGER,
    "pdf_url" VARCHAR(500),
    "digital_signature_url" VARCHAR(500),
    "status" "MarksheetStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marksheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_cards" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36) NOT NULL,
    "library_card_number" VARCHAR(50) NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "max_books_allowed" INTEGER NOT NULL DEFAULT 3,
    "borrowing_period_days" INTEGER NOT NULL DEFAULT 14,
    "qr_code_data" TEXT,
    "barcode_data" VARCHAR(100),
    "pdf_url" VARCHAR(500),
    "status" "LibraryCardStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_certificates" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "tc_serial_number" VARCHAR(50) NOT NULL,
    "admission_date" DATE NOT NULL,
    "leaving_date" DATE NOT NULL,
    "last_class_studied" VARCHAR(100),
    "reason_for_leaving" TEXT,
    "conduct_remarks" "ConductRemarks" NOT NULL DEFAULT 'good',
    "character_remarks" TEXT,
    "fee_clearance_status" "FeeClearanceStatus" NOT NULL DEFAULT 'pending',
    "outstanding_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_working_days" INTEGER,
    "total_present_days" INTEGER,
    "attendance_percentage" DECIMAL(5,2),
    "principal_signature_url" VARCHAR(500),
    "seal_url" VARCHAR(500),
    "pdf_url" VARCHAR(500),
    "issued_by" VARCHAR(36),
    "issued_at" TIMESTAMP(3),
    "duplicate_issued" BOOLEAN NOT NULL DEFAULT false,
    "original_tc_id" VARCHAR(36),
    "status" "TransferCertificateStatus" NOT NULL DEFAULT 'draft',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "entity_type" "ApprovalEntityType" NOT NULL,
    "entity_id" VARCHAR(36) NOT NULL,
    "submitted_by" VARCHAR(36),
    "reviewed_by" VARCHAR(36),
    "status" "ApprovalStatus" NOT NULL,
    "review_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "attendance_date" DATE NOT NULL,
    "attendance_time" TIME(0) NOT NULL,
    "scan_type" "ScanType" NOT NULL DEFAULT 'entry',
    "scanner_id" VARCHAR(100),
    "scanner_location" VARCHAR(255),
    "qr_source" "QrSource" NOT NULL DEFAULT 'id_card',
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_executions" (
    "id" VARCHAR(36) NOT NULL,
    "job_id" VARCHAR(255) NOT NULL,
    "job_type" "JobType" NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36),
    "initiated_by" VARCHAR(36),
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "processed_items" INTEGER NOT NULL DEFAULT 0,
    "successful_items" INTEGER NOT NULL DEFAULT 0,
    "failed_items" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error_stack" TEXT,
    "result_data" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(36) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "user_id" VARCHAR(36),
    "institution_id" VARCHAR(36),
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(36) NOT NULL,
    "changes" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "request_id" VARCHAR(100),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_cache" (
    "id" VARCHAR(36) NOT NULL,
    "perceptual_hash" VARCHAR(64) NOT NULL,
    "quality_score" DECIMAL(3,2) NOT NULL,
    "is_approved" BOOLEAN NOT NULL,
    "issues" JSONB,
    "analysis_method" "ImageAnalysisMethod" NOT NULL,
    "hit_count" INTEGER NOT NULL DEFAULT 1,
    "last_accessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" VARCHAR(36) NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" TEXT NOT NULL,
    "data_type" "ConfigDataType" NOT NULL DEFAULT 'string',
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "slug" VARCHAR(100) NOT NULL,
    "theme" "PortfolioTheme" NOT NULL DEFAULT 'modern',
    "theme_config" JSONB,
    "custom_domain" VARCHAR(100),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" "PortfolioStatus" NOT NULL DEFAULT 'draft',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_sections" (
    "id" VARCHAR(36) NOT NULL,
    "portfolio_id" VARCHAR(36) NOT NULL,
    "type" "PortfolioSectionType" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "action_url" VARCHAR(500),
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "NotificationTemplateType" NOT NULL,
    "subject" VARCHAR(255),
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "type" "NotificationTemplateType" NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "recipient_name" VARCHAR(255),
    "subject" VARCHAR(255),
    "content" TEXT NOT NULL,
    "status" "NotificationLogStatus" NOT NULL DEFAULT 'pending',
    "message_id" VARCHAR(100),
    "error_message" TEXT,
    "metadata" JSONB,
    "priority" VARCHAR(20),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_workflows" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "steps" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "requester_id" VARCHAR(36) NOT NULL,
    "workflow_id" VARCHAR(36) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "entity_type" VARCHAR(50),
    "entity_id" VARCHAR(36),
    "metadata" JSONB,
    "priority" "ApprovalPriority" NOT NULL DEFAULT 'normal',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" VARCHAR(36) NOT NULL,
    "request_id" VARCHAR(36) NOT NULL,
    "step_number" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "approver_role" VARCHAR(50) NOT NULL,
    "approver_user_id" VARCHAR(36),
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "status" "ApprovalStepStatus" NOT NULL DEFAULT 'pending',
    "approver_id" VARCHAR(36),
    "comments" TEXT,
    "conditions" JSONB,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "class_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "subject_id" VARCHAR(36),
    "created_by_id" VARCHAR(36) NOT NULL,
    "date" DATE NOT NULL,
    "type" "AttendanceType" NOT NULL DEFAULT 'class',
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5),
    "location" VARCHAR(255),
    "notes" VARCHAR(500),
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'open',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" VARCHAR(36) NOT NULL,
    "session_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "status" "AttendanceRecordStatus" NOT NULL DEFAULT 'present',
    "remarks" VARCHAR(200),
    "arrival_time" VARCHAR(5),
    "check_in_method" VARCHAR(20),
    "marked_by_id" VARCHAR(36),
    "marked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_form_progress" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "tab_academic" BOOLEAN NOT NULL DEFAULT false,
    "tab_personal" BOOLEAN NOT NULL DEFAULT false,
    "tab_photo" BOOLEAN NOT NULL DEFAULT false,
    "tab_family" BOOLEAN NOT NULL DEFAULT false,
    "tab_contact" BOOLEAN NOT NULL DEFAULT false,
    "tab_other" BOOLEAN NOT NULL DEFAULT false,
    "active_tab" "FormTab" NOT NULL DEFAULT 'academic',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_form_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_onboarding_tokens" (
    "id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "mode" "OnboardingMode" NOT NULL DEFAULT 'selfservice',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "used_by_ip" VARCHAR(50),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_onboarding_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_issues" (
    "id" VARCHAR(36) NOT NULL,
    "issue_code" VARCHAR(50) NOT NULL,
    "cover_image_url" VARCHAR(500),
    "publish_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "number" INTEGER,
    "title_english" VARCHAR(255) NOT NULL,
    "title_hindi" VARCHAR(255),
    "volume" INTEGER,

    CONSTRAINT "visionarium_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_articles" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36),
    "author_user_id" VARCHAR(36),
    "author_student_id" VARCHAR(36),
    "issue_id" VARCHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "language" "VisionariumLanguage" NOT NULL DEFAULT 'en',
    "category" "VisionariumSubject" NOT NULL DEFAULT 'science',
    "status" "VisionariumArticleStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "article_type" "VisionariumArticleType",
    "perspective" "VisionariumPerspective",
    "translation_of_id" VARCHAR(36),

    CONSTRAINT "visionarium_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_school_subscriptions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "plan" "VisionariumPlan" NOT NULL DEFAULT 'basic',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visionarium_school_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_test_series" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "class_id" VARCHAR(36),
    "subject_id" VARCHAR(36),
    "language" "VisionariumLanguage" NOT NULL DEFAULT 'en',
    "total_marks" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visionarium_test_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_test_attempts" (
    "id" VARCHAR(36) NOT NULL,
    "test_series_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "score_obtained" DECIMAL(5,2),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "response_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visionarium_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visionarium_submissions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "submitted_by_user_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "submission_type" "VisionariumSubmissionType" NOT NULL DEFAULT 'article',
    "body" TEXT,
    "content_url" VARCHAR(500),
    "status" "VisionariumSubmissionStatus" NOT NULL DEFAULT 'submitted',
    "linked_article_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visionarium_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_relationships" (
    "id" VARCHAR(36) NOT NULL,
    "from_user_id" VARCHAR(36) NOT NULL,
    "to_user_id" VARCHAR(36) NOT NULL,
    "relationship_type" "SocialRelationshipType" NOT NULL,
    "institution_id" VARCHAR(36),
    "since_academic_year" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_saathi_links" (
    "id" VARCHAR(36) NOT NULL,
    "requester_user_id" VARCHAR(36) NOT NULL,
    "target_user_id" VARCHAR(36) NOT NULL,
    "status" "SaathiLinkStatus" NOT NULL DEFAULT 'pending',
    "context" "SaathiContext" NOT NULL DEFAULT 'other',
    "message" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_saathi_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_posts" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36),
    "author_user_id" VARCHAR(36) NOT NULL,
    "author_student_id" VARCHAR(36),
    "scope" "SocialPostScope" NOT NULL DEFAULT 'institution_only',
    "class_id" VARCHAR(36),
    "section_id" VARCHAR(36),
    "title" VARCHAR(255),
    "body" TEXT NOT NULL,
    "media_url" VARCHAR(500),
    "linked_article_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_comments" (
    "id" VARCHAR(36) NOT NULL,
    "post_id" VARCHAR(36) NOT NULL,
    "author_user_id" VARCHAR(36) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_reactions" (
    "id" VARCHAR(36) NOT NULL,
    "post_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "reaction_type" "SocialReactionType" NOT NULL DEFAULT 'prerna',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" VARCHAR(36) NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_applications" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(500),
    "metadata" TEXT,
    "client_id" VARCHAR(255) NOT NULL,
    "client_secret" VARCHAR(512),
    "redirect_urls" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'web',
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "user_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_access_tokens" (
    "id" VARCHAR(36) NOT NULL,
    "access_token" VARCHAR(512) NOT NULL,
    "refresh_token" VARCHAR(512) NOT NULL,
    "access_token_expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(36),
    "scopes" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_consents" (
    "id" VARCHAR(36) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "scopes" TEXT NOT NULL,
    "consent_given" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" VARCHAR(36) NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_card_batches" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "template_id" VARCHAR(36) NOT NULL,
    "total_requested" INTEGER NOT NULL,
    "total_succeeded" INTEGER NOT NULL DEFAULT 0,
    "total_failed" INTEGER NOT NULL DEFAULT 0,
    "failed_student_ids" VARCHAR(10000) NOT NULL DEFAULT '[]',
    "pdf_url" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "processing_time_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_card_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "whatsapp_number" VARCHAR(20) NOT NULL,
    "role" "GuardianRole" NOT NULL DEFAULT 'other',
    "preferred_language" VARCHAR(10),
    "preferred_dialect" VARCHAR(50),
    "preferred_medium" "PreferredMedium",
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_verified" BOOLEAN NOT NULL DEFAULT false,
    "source" "GuardianSource" NOT NULL DEFAULT 'backfill',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_student_links" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "guardian_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "notify_attendance" BOOLEAN NOT NULL DEFAULT true,
    "notify_fees" BOOLEAN NOT NULL DEFAULT true,
    "notify_homework" BOOLEAN NOT NULL DEFAULT true,
    "notify_exams" BOOLEAN NOT NULL DEFAULT true,
    "notify_transport" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardian_student_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "meta_template_name" VARCHAR(255),
    "category" "TemplateCategory" NOT NULL,
    "channel" "TemplateChannel" NOT NULL DEFAULT 'whatsapp',
    "language" VARCHAR(10) NOT NULL,
    "dialect" VARCHAR(50),
    "body_text" TEXT NOT NULL,
    "placeholders" JSONB,
    "button_config" JSONB,
    "status" "TemplateStatus" NOT NULL DEFAULT 'draft',
    "meta_template_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "recipient_type" "RecipientType" NOT NULL,
    "recipient_id" VARCHAR(36) NOT NULL,
    "channel" "OutboxChannel" NOT NULL DEFAULT 'whatsapp',
    "template_code" VARCHAR(100) NOT NULL,
    "variables" JSONB,
    "category" "TemplateCategory",
    "priority" "OutboxPriority" NOT NULL DEFAULT 'normal',
    "idempotency_key" VARCHAR(255) NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'pending',
    "window_used" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "outbox_id" VARCHAR(36),
    "guardian_id" VARCHAR(36),
    "staff_id" VARCHAR(36),
    "channel" "OutboxChannel" NOT NULL,
    "template_code" VARCHAR(100),
    "wa_message_id" VARCHAR(255),
    "direction" "MessageDirection" NOT NULL,
    "category" "TemplateCategory",
    "status" VARCHAR(50) NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digest_queue" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "guardian_id" VARCHAR(36) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "event_payload" JSONB NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "outbox_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digest_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "class_id" VARCHAR(36),
    "name" VARCHAR(255) NOT NULL,
    "category" "FeeCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" "FeeFrequency" NOT NULL,
    "due_day_of_month" INTEGER,
    "late_fee_amount" DECIMAL(10,2),
    "late_fee_after_days" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_invoices" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "fee_structure_id" VARCHAR(36),
    "invoice_number" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "late_fee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "net_amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'unpaid',
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "payment_link_url" VARCHAR(500),
    "gateway_order_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "invoice_id" VARCHAR(36) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_by_guardian_id" VARCHAR(36),
    "method" "PaymentMethod" NOT NULL,
    "gateway_provider" "GatewayProvider",
    "gateway_payment_id" VARCHAR(255),
    "gateway_order_id" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'initiated',
    "paid_at" TIMESTAMP(3),
    "receipt_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_media" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "guardian_id" VARCHAR(36) NOT NULL,
    "wa_media_id" VARCHAR(255) NOT NULL,
    "object_path" VARCHAR(500),
    "media_type" "MediaType" NOT NULL,
    "mime_type" VARCHAR(100),
    "file_size_bytes" INTEGER,
    "intent_detected" VARCHAR(100),
    "action_taken" VARCHAR(255),
    "vision_used" BOOLEAN NOT NULL DEFAULT false,
    "status" "InboundMediaStatus" NOT NULL DEFAULT 'received',
    "transcript" TEXT,
    "extracted_text" TEXT,
    "metadata" JSONB,
    "error_message" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "guardian_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36),
    "last_intent" VARCHAR(100),
    "last_message_at" TIMESTAMP(3),
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "context" JSONB,
    "service_window_expires_at" TIMESTAMP(3),
    "open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "text" VARCHAR(2000) NOT NULL,
    "intent" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payment_claims" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "invoice_id" VARCHAR(36) NOT NULL,
    "submitted_by_guardian_id" VARCHAR(36) NOT NULL,
    "object_path" VARCHAR(500) NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "claim_amount" DECIMAL(10,2),
    "payment_method_claimed" "PaymentMethod",
    "status" "FeeClaimStatus" NOT NULL DEFAULT 'pending_review',
    "reviewed_by" VARCHAR(36),
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_payment_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_periods" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "period_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "subject_id" VARCHAR(36),
    "teacher_id" VARCHAR(36),
    "room" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substitutions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "slot_id" VARCHAR(36) NOT NULL,
    "date" DATE NOT NULL,
    "original_teacher_id" VARCHAR(36),
    "substitute_teacher_id" VARCHAR(36) NOT NULL,
    "reason" TEXT,
    "status" "SubstitutionStatus" NOT NULL DEFAULT 'planned',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "voucher_number" VARCHAR(50) NOT NULL,
    "entry_date" DATE NOT NULL,
    "type" "VoucherType" NOT NULL DEFAULT 'journal',
    "narration" TEXT,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" VARCHAR(36),
    "status" "JournalStatus" NOT NULL DEFAULT 'posted',
    "created_by_user_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "entry_id" VARCHAR(36) NOT NULL,
    "account_id" VARCHAR(36) NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255),
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'full_time',
    "date_of_joining" DATE,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "status" "StaffStatus" NOT NULL DEFAULT 'active',
    "user_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "staff_id" VARCHAR(36) NOT NULL,
    "effective_from" DATE NOT NULL,
    "basic" DECIMAL(12,2) NOT NULL,
    "hra" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "conveyance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "special" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "other_allowances" JSONB,
    "pf_enabled" BOOLEAN NOT NULL DEFAULT true,
    "esi_enabled" BOOLEAN NOT NULL DEFAULT false,
    "professional_tax" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "tds" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "other_deductions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "staff_id" VARCHAR(36) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "gross_earnings" DECIMAL(12,2) NOT NULL,
    "total_deductions" DECIMAL(12,2) NOT NULL,
    "net_pay" DECIMAL(12,2) NOT NULL,
    "breakdown" JSONB NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'draft',
    "pdf_url" VARCHAR(500),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "staff_id" VARCHAR(36) NOT NULL,
    "type" "LeaveType" NOT NULL DEFAULT 'casual',
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by_user_id" VARCHAR(36),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_routes" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "vehicle_number" VARCHAR(50),
    "driver_name" VARCHAR(255),
    "driver_phone" VARCHAR(20),
    "capacity" INTEGER,
    "fee_amount" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_stops" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "route_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "pickup_time" VARCHAR(5),
    "drop_time" VARCHAR(5),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_transport" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "route_id" VARCHAR(36) NOT NULL,
    "stop_id" VARCHAR(36),
    "type" "TransportAssignmentType" NOT NULL DEFAULT 'both',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_trips" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "route_id" VARCHAR(36) NOT NULL,
    "trip_date" DATE NOT NULL,
    "direction" "TransportAssignmentType" NOT NULL DEFAULT 'pickup',
    "status" "TransportTripStatus" NOT NULL DEFAULT 'scheduled',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "last_latitude" DOUBLE PRECISION,
    "last_longitude" DOUBLE PRECISION,
    "last_ping_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "enquiry_number" VARCHAR(50) NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "guardian_name" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "class_interested" VARCHAR(255),
    "class_id" VARCHAR(36),
    "source" "EnquirySource" NOT NULL DEFAULT 'other',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'new',
    "assigned_to_user_id" VARCHAR(36),
    "follow_up_at" TIMESTAMP(3),
    "notes" TEXT,
    "converted_student_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiry_activities" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "enquiry_id" VARCHAR(36) NOT NULL,
    "type" "EnquiryActivityType" NOT NULL DEFAULT 'note',
    "description" TEXT NOT NULL,
    "created_by_user_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_blocks" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "type" "HostelType" NOT NULL DEFAULT 'boys',
    "warden_name" VARCHAR(255),
    "warden_phone" VARCHAR(20),
    "total_rooms" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "block_id" VARCHAR(36) NOT NULL,
    "room_number" VARCHAR(50) NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "room_type" VARCHAR(50),
    "monthly_rent" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_allotments" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "room_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "bed_number" VARCHAR(20),
    "status" "AllotmentStatus" NOT NULL DEFAULT 'active',
    "allotted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vacated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_allotments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_bills" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "bill_month" VARCHAR(7) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "MessBillStatus" NOT NULL DEFAULT 'pending',
    "due_date" DATE,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mess_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "InventoryType" NOT NULL DEFAULT 'consumable',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "category_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "unit" VARCHAR(50) NOT NULL DEFAULT 'pcs',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(10,2),
    "location" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "item_id" VARCHAR(36) NOT NULL,
    "type" "StockTxnType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reason" VARCHAR(500),
    "performed_by" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "blood_group" VARCHAR(10),
    "allergies" TEXT,
    "conditions" TEXT,
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "last_checkup" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_visits" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "attended_by" VARCHAR(255),
    "guardian_notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccination_records" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "vaccine_name" VARCHAR(255) NOT NULL,
    "date_administered" DATE,
    "next_due" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccination_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_logs" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "visitor_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "purpose" VARCHAR(500),
    "whom_to_meet" VARCHAR(255),
    "badge_number" VARCHAR(50),
    "status" "VisitorStatus" NOT NULL DEFAULT 'checked_in',
    "check_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_passes" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "type" "GatePassType" NOT NULL DEFAULT 'early_leave',
    "reason" TEXT,
    "approved_by" VARCHAR(255),
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cce_assessments" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "term_type" "CceTermType" NOT NULL,
    "max_marks" DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    "weightage" INTEGER NOT NULL DEFAULT 100,
    "conducted_on" DATE,
    "status" "CceStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cce_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cce_marks" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "assessment_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "marks_obtained" DECIMAL(6,2) NOT NULL,
    "grade" VARCHAR(4),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cce_marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "assigned_by" VARCHAR(36),
    "due_date" TIMESTAMP(3),
    "max_marks" DECIMAL(6,2),
    "attachment_url" VARCHAR(500),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "assignment_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "content" TEXT,
    "attachment_url" VARCHAR(500),
    "marks_obtained" DECIMAL(6,2),
    "feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'submitted',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "NoticeAudience" NOT NULL DEFAULT 'all',
    "category" "NoticeCategory" NOT NULL DEFAULT 'circular',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "NoticeStatus" NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_type" "EventType" NOT NULL DEFAULT 'event',
    "event_date" DATE NOT NULL,
    "end_date" DATE,
    "all_day" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "report_type" VARCHAR(100) NOT NULL,
    "config" JSONB,
    "created_by" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "graduation_year" INTEGER,
    "current_organization" VARCHAR(255),
    "designation" VARCHAR(255),
    "location" VARCHAR(255),
    "linkedin_url" VARCHAR(500),
    "willing_to_mentor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_events" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "venue" VARCHAR(255),
    "rsvp_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_drives" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "package_lpa" DECIMAL(8,2),
    "drive_date" DATE,
    "eligibility_criteria" TEXT,
    "status" "PlacementDriveStatus" NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_applications" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "drive_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "status" "PlacementApplicationStatus" NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_devices" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "device_code" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255),
    "device_type" "BiometricType" NOT NULL DEFAULT 'fingerprint',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_punches" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "device_id" VARCHAR(36) NOT NULL,
    "person_type" "PunchPersonType" NOT NULL,
    "person_id" VARCHAR(36) NOT NULL,
    "punch_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direction" "PunchDirection" NOT NULL DEFAULT 'in',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_attendances" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "staff_id" VARCHAR(36) NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "StaffAttendanceStatus" NOT NULL DEFAULT 'present',
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_concessions" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "ConcessionType" NOT NULL DEFAULT 'scholarship',
    "amount" DECIMAL(10,2),
    "percent" DECIMAL(5,2),
    "academic_year" VARCHAR(20) NOT NULL,
    "status" "ConcessionStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_concessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installment_plans" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "num_installments" INTEGER NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installments" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "plan_id" VARCHAR(36) NOT NULL,
    "installment_no" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_classes" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36) NOT NULL,
    "subject_name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "platform" "LiveClassPlatform" NOT NULL DEFAULT 'meet',
    "join_url" VARCHAR(500),
    "recording_url" VARCHAR(500),
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_mins" INTEGER NOT NULL DEFAULT 45,
    "host_id" VARCHAR(36),
    "status" "LiveClassStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank_items" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "topic" VARCHAR(150),
    "class_level" VARCHAR(20),
    "question_text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'mcq',
    "options" JSONB,
    "correct_option" VARCHAR(255),
    "marks" INTEGER NOT NULL DEFAULT 1,
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'medium',
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_tests" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "section_id" VARCHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "subject" VARCHAR(100),
    "question_ids" JSONB NOT NULL,
    "total_marks" INTEGER NOT NULL DEFAULT 0,
    "duration_mins" INTEGER NOT NULL DEFAULT 30,
    "status" "OnlineTestStatus" NOT NULL DEFAULT 'draft',
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_test_attempts" (
    "id" VARCHAR(36) NOT NULL,
    "institution_id" VARCHAR(36) NOT NULL,
    "test_id" VARCHAR(36) NOT NULL,
    "student_id" VARCHAR(36) NOT NULL,
    "answers" JSONB,
    "score" INTEGER,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "status" "AttemptStatus" NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_suppressions" (
    "id" VARCHAR(36) NOT NULL,
    "email" CITEXT NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "detail" TEXT,
    "source" VARCHAR(50) NOT NULL DEFAULT 'resend',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE INDEX "institutions_code_idx" ON "institutions"("code");

-- CreateIndex
CREATE INDEX "institutions_subscription_status_subscription_tier_idx" ON "institutions"("subscription_status", "subscription_tier");

-- CreateIndex
CREATE INDEX "institutions_is_active_idx" ON "institutions"("is_active");

-- CreateIndex
CREATE INDEX "chat_participants_user_id_idx" ON "chat_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_conversation_id_user_id_key" ON "chat_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "call_sessions_host_id_idx" ON "call_sessions"("host_id");

-- CreateIndex
CREATE INDEX "institution_authorities_institution_id_idx" ON "institution_authorities"("institution_id");

-- CreateIndex
CREATE INDEX "institution_authorities_role_type_idx" ON "institution_authorities"("role_type");

-- CreateIndex
CREATE INDEX "branches_institution_id_idx" ON "branches"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_institution_id_code_key" ON "branches"("institution_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_password_reset_token_idx" ON "users"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "admin_invitations_token_key" ON "admin_invitations"("token");

-- CreateIndex
CREATE INDEX "admin_invitations_email_idx" ON "admin_invitations"("email");

-- CreateIndex
CREATE INDEX "admin_invitations_token_idx" ON "admin_invitations"("token");

-- CreateIndex
CREATE INDEX "admin_invitations_institution_id_idx" ON "admin_invitations"("institution_id");

-- CreateIndex
CREATE INDEX "user_institution_roles_role_idx" ON "user_institution_roles"("role");

-- CreateIndex
CREATE INDEX "user_institution_roles_institution_id_idx" ON "user_institution_roles"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_institution_roles_user_id_institution_id_key" ON "user_institution_roles"("user_id", "institution_id");

-- CreateIndex
CREATE INDEX "classes_institution_id_idx" ON "classes"("institution_id");

-- CreateIndex
CREATE INDEX "classes_branch_id_idx" ON "classes"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_institution_id_name_key" ON "classes"("institution_id", "name");

-- CreateIndex
CREATE INDEX "streams_institution_id_idx" ON "streams"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "streams_class_id_name_key" ON "streams"("class_id", "name");

-- CreateIndex
CREATE INDEX "sections_class_teacher_id_idx" ON "sections"("class_teacher_id");

-- CreateIndex
CREATE INDEX "sections_institution_id_idx" ON "sections"("institution_id");

-- CreateIndex
CREATE INDEX "sections_stream_id_idx" ON "sections"("stream_id");

-- CreateIndex
CREATE UNIQUE INDEX "sections_class_id_stream_id_name_key" ON "sections"("class_id", "stream_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "admission_slots_token_key" ON "admission_slots"("token");

-- CreateIndex
CREATE INDEX "admission_slots_section_id_idx" ON "admission_slots"("section_id");

-- CreateIndex
CREATE INDEX "admission_slots_status_idx" ON "admission_slots"("status");

-- CreateIndex
CREATE INDEX "admission_slots_token_idx" ON "admission_slots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "admission_slots_section_id_roll_no_key" ON "admission_slots"("section_id", "roll_no");

-- CreateIndex
CREATE UNIQUE INDEX "students_slot_id_key" ON "students"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_number_key" ON "students"("admission_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE INDEX "students_institution_id_idx" ON "students"("institution_id");

-- CreateIndex
CREATE INDEX "students_branch_id_idx" ON "students"("branch_id");

-- CreateIndex
CREATE INDEX "students_section_id_idx" ON "students"("section_id");

-- CreateIndex
CREATE INDEX "students_slot_id_idx" ON "students"("slot_id");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_data_status_idx" ON "students"("data_status");

-- CreateIndex
CREATE INDEX "students_photo_hash_idx" ON "students"("photo_hash");

-- CreateIndex
CREATE INDEX "students_institution_id_status_idx" ON "students"("institution_id", "status");

-- CreateIndex
CREATE INDEX "students_institution_id_data_status_idx" ON "students"("institution_id", "data_status");

-- CreateIndex
CREATE INDEX "templates_institution_id_idx" ON "templates"("institution_id");

-- CreateIndex
CREATE INDEX "templates_service_type_idx" ON "templates"("service_type");

-- CreateIndex
CREATE INDEX "templates_is_default_idx" ON "templates"("is_default");

-- CreateIndex
CREATE INDEX "templates_target_audience_idx" ON "templates"("target_audience");

-- CreateIndex
CREATE INDEX "templates_institution_id_service_type_idx" ON "templates"("institution_id", "service_type");

-- CreateIndex
CREATE INDEX "id_cards_student_id_idx" ON "id_cards"("student_id");

-- CreateIndex
CREATE INDEX "id_cards_status_idx" ON "id_cards"("status");

-- CreateIndex
CREATE INDEX "id_cards_institution_id_idx" ON "id_cards"("institution_id");

-- CreateIndex
CREATE INDEX "id_cards_institution_id_status_idx" ON "id_cards"("institution_id", "status");

-- CreateIndex
CREATE INDEX "id_cards_template_id_idx" ON "id_cards"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "id_cards_institution_id_card_number_key" ON "id_cards"("institution_id", "card_number");

-- CreateIndex
CREATE INDEX "visiting_cards_institution_id_idx" ON "visiting_cards"("institution_id");

-- CreateIndex
CREATE INDEX "visiting_cards_status_idx" ON "visiting_cards"("status");

-- CreateIndex
CREATE INDEX "visiting_cards_user_id_idx" ON "visiting_cards"("user_id");

-- CreateIndex
CREATE INDEX "visiting_cards_student_id_idx" ON "visiting_cards"("student_id");

-- CreateIndex
CREATE INDEX "visiting_cards_template_id_idx" ON "visiting_cards"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "visiting_cards_institution_id_card_number_key" ON "visiting_cards"("institution_id", "card_number");

-- CreateIndex
CREATE INDEX "group_photos_institution_id_idx" ON "group_photos"("institution_id");

-- CreateIndex
CREATE INDEX "group_photos_section_id_idx" ON "group_photos"("section_id");

-- CreateIndex
CREATE INDEX "group_photos_processing_status_idx" ON "group_photos"("processing_status");

-- CreateIndex
CREATE INDEX "group_photos_perceptual_hash_idx" ON "group_photos"("perceptual_hash");

-- CreateIndex
CREATE INDEX "group_photos_class_id_idx" ON "group_photos"("class_id");

-- CreateIndex
CREATE INDEX "group_photo_extractions_group_photo_id_idx" ON "group_photo_extractions"("group_photo_id");

-- CreateIndex
CREATE INDEX "group_photo_extractions_student_id_idx" ON "group_photo_extractions"("student_id");

-- CreateIndex
CREATE INDEX "group_photo_extractions_face_hash_idx" ON "group_photo_extractions"("face_hash");

-- CreateIndex
CREATE INDEX "certificates_student_id_idx" ON "certificates"("student_id");

-- CreateIndex
CREATE INDEX "certificates_certificate_type_idx" ON "certificates"("certificate_type");

-- CreateIndex
CREATE INDEX "certificates_status_idx" ON "certificates"("status");

-- CreateIndex
CREATE INDEX "certificates_institution_id_idx" ON "certificates"("institution_id");

-- CreateIndex
CREATE INDEX "certificates_template_id_idx" ON "certificates"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_institution_id_certificate_number_key" ON "certificates"("institution_id", "certificate_number");

-- CreateIndex
CREATE INDEX "exam_schedules_institution_id_idx" ON "exam_schedules"("institution_id");

-- CreateIndex
CREATE INDEX "exam_subjects_exam_schedule_id_idx" ON "exam_subjects"("exam_schedule_id");

-- CreateIndex
CREATE INDEX "hall_tickets_student_id_idx" ON "hall_tickets"("student_id");

-- CreateIndex
CREATE INDEX "hall_tickets_status_idx" ON "hall_tickets"("status");

-- CreateIndex
CREATE INDEX "hall_tickets_institution_id_idx" ON "hall_tickets"("institution_id");

-- CreateIndex
CREATE INDEX "hall_tickets_template_id_idx" ON "hall_tickets"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "hall_tickets_exam_schedule_id_student_id_key" ON "hall_tickets"("exam_schedule_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "hall_tickets_institution_id_hall_ticket_number_key" ON "hall_tickets"("institution_id", "hall_ticket_number");

-- CreateIndex
CREATE INDEX "calculation_engines_institution_id_idx" ON "calculation_engines"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "calculation_engines_institution_id_academic_year_key" ON "calculation_engines"("institution_id", "academic_year");

-- CreateIndex
CREATE INDEX "subjects_class_id_idx" ON "subjects"("class_id");

-- CreateIndex
CREATE INDEX "subjects_institution_id_idx" ON "subjects"("institution_id");

-- CreateIndex
CREATE INDEX "marks_student_id_idx" ON "marks"("student_id");

-- CreateIndex
CREATE INDEX "marks_exam_schedule_id_idx" ON "marks"("exam_schedule_id");

-- CreateIndex
CREATE INDEX "marks_status_idx" ON "marks"("status");

-- CreateIndex
CREATE INDEX "marks_subject_id_idx" ON "marks"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "marks_student_id_subject_id_exam_schedule_id_key" ON "marks"("student_id", "subject_id", "exam_schedule_id");

-- CreateIndex
CREATE INDEX "marksheets_student_id_idx" ON "marksheets"("student_id");

-- CreateIndex
CREATE INDEX "marksheets_exam_schedule_id_idx" ON "marksheets"("exam_schedule_id");

-- CreateIndex
CREATE INDEX "marksheets_calculation_engine_id_idx" ON "marksheets"("calculation_engine_id");

-- CreateIndex
CREATE INDEX "marksheets_institution_id_idx" ON "marksheets"("institution_id");

-- CreateIndex
CREATE INDEX "marksheets_template_id_idx" ON "marksheets"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "marksheets_student_id_exam_schedule_id_key" ON "marksheets"("student_id", "exam_schedule_id");

-- CreateIndex
CREATE INDEX "library_cards_student_id_idx" ON "library_cards"("student_id");

-- CreateIndex
CREATE INDEX "library_cards_status_idx" ON "library_cards"("status");

-- CreateIndex
CREATE INDEX "library_cards_institution_id_idx" ON "library_cards"("institution_id");

-- CreateIndex
CREATE INDEX "library_cards_template_id_idx" ON "library_cards"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_cards_student_id_institution_id_key" ON "library_cards"("student_id", "institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_cards_institution_id_library_card_number_key" ON "library_cards"("institution_id", "library_card_number");

-- CreateIndex
CREATE INDEX "transfer_certificates_student_id_idx" ON "transfer_certificates"("student_id");

-- CreateIndex
CREATE INDEX "transfer_certificates_tc_serial_number_idx" ON "transfer_certificates"("tc_serial_number");

-- CreateIndex
CREATE INDEX "transfer_certificates_status_idx" ON "transfer_certificates"("status");

-- CreateIndex
CREATE INDEX "transfer_certificates_institution_id_idx" ON "transfer_certificates"("institution_id");

-- CreateIndex
CREATE INDEX "transfer_certificates_template_id_idx" ON "transfer_certificates"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_certificates_institution_id_tc_serial_number_key" ON "transfer_certificates"("institution_id", "tc_serial_number");

-- CreateIndex
CREATE INDEX "approvals_institution_id_idx" ON "approvals"("institution_id");

-- CreateIndex
CREATE INDEX "approvals_entity_type_entity_id_idx" ON "approvals"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_reviewed_by_idx" ON "approvals"("reviewed_by");

-- CreateIndex
CREATE INDEX "approvals_submitted_by_idx" ON "approvals"("submitted_by");

-- CreateIndex
CREATE INDEX "attendance_logs_student_id_idx" ON "attendance_logs"("student_id");

-- CreateIndex
CREATE INDEX "attendance_logs_institution_id_attendance_date_idx" ON "attendance_logs"("institution_id", "attendance_date");

-- CreateIndex
CREATE INDEX "attendance_logs_attendance_date_idx" ON "attendance_logs"("attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "job_executions_job_id_key" ON "job_executions"("job_id");

-- CreateIndex
CREATE INDEX "job_executions_job_id_idx" ON "job_executions"("job_id");

-- CreateIndex
CREATE INDEX "job_executions_status_idx" ON "job_executions"("status");

-- CreateIndex
CREATE INDEX "job_executions_institution_id_idx" ON "job_executions"("institution_id");

-- CreateIndex
CREATE INDEX "job_executions_job_type_status_idx" ON "job_executions"("job_type", "status");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_institution_id_idx" ON "audit_logs"("institution_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "image_cache_perceptual_hash_key" ON "image_cache"("perceptual_hash");

-- CreateIndex
CREATE INDEX "image_cache_perceptual_hash_idx" ON "image_cache"("perceptual_hash");

-- CreateIndex
CREATE INDEX "image_cache_expires_at_idx" ON "image_cache"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_config_key_key" ON "system_config"("config_key");

-- CreateIndex
CREATE INDEX "system_config_config_key_idx" ON "system_config"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_student_id_key" ON "portfolios"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_slug_key" ON "portfolios"("slug");

-- CreateIndex
CREATE INDEX "portfolios_institution_id_idx" ON "portfolios"("institution_id");

-- CreateIndex
CREATE INDEX "portfolios_slug_idx" ON "portfolios"("slug");

-- CreateIndex
CREATE INDEX "portfolios_status_idx" ON "portfolios"("status");

-- CreateIndex
CREATE INDEX "portfolios_template_id_idx" ON "portfolios"("template_id");

-- CreateIndex
CREATE INDEX "portfolio_sections_portfolio_id_idx" ON "portfolio_sections"("portfolio_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_institution_id_idx" ON "notifications"("institution_id");

-- CreateIndex
CREATE INDEX "notification_templates_institution_id_idx" ON "notification_templates"("institution_id");

-- CreateIndex
CREATE INDEX "notification_logs_institution_id_idx" ON "notification_logs"("institution_id");

-- CreateIndex
CREATE INDEX "notification_logs_type_status_idx" ON "notification_logs"("type", "status");

-- CreateIndex
CREATE INDEX "approval_workflows_institution_id_idx" ON "approval_workflows"("institution_id");

-- CreateIndex
CREATE INDEX "approval_workflows_type_is_active_idx" ON "approval_workflows"("type", "is_active");

-- CreateIndex
CREATE INDEX "approval_requests_institution_id_idx" ON "approval_requests"("institution_id");

-- CreateIndex
CREATE INDEX "approval_requests_requester_id_idx" ON "approval_requests"("requester_id");

-- CreateIndex
CREATE INDEX "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex
CREATE INDEX "approval_requests_workflow_id_idx" ON "approval_requests"("workflow_id");

-- CreateIndex
CREATE INDEX "approval_steps_request_id_idx" ON "approval_steps"("request_id");

-- CreateIndex
CREATE INDEX "approval_steps_approver_id_idx" ON "approval_steps"("approver_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_institution_id_idx" ON "attendance_sessions"("institution_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_section_id_date_idx" ON "attendance_sessions"("section_id", "date");

-- CreateIndex
CREATE INDEX "attendance_sessions_class_id_idx" ON "attendance_sessions"("class_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_created_by_id_idx" ON "attendance_sessions"("created_by_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_subject_id_idx" ON "attendance_sessions"("subject_id");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_idx" ON "attendance_records"("student_id");

-- CreateIndex
CREATE INDEX "attendance_records_marked_by_id_idx" ON "attendance_records"("marked_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "attendance_records"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_form_progress_student_id_key" ON "student_form_progress"("student_id");

-- CreateIndex
CREATE INDEX "student_form_progress_institution_id_idx" ON "student_form_progress"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_onboarding_tokens_student_id_key" ON "student_onboarding_tokens"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_onboarding_tokens_token_key" ON "student_onboarding_tokens"("token");

-- CreateIndex
CREATE INDEX "student_onboarding_tokens_token_idx" ON "student_onboarding_tokens"("token");

-- CreateIndex
CREATE INDEX "student_onboarding_tokens_student_id_idx" ON "student_onboarding_tokens"("student_id");

-- CreateIndex
CREATE INDEX "student_onboarding_tokens_institution_id_idx" ON "student_onboarding_tokens"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "visionarium_issues_issue_code_key" ON "visionarium_issues"("issue_code");

-- CreateIndex
CREATE INDEX "visionarium_issues_issue_code_idx" ON "visionarium_issues"("issue_code");

-- CreateIndex
CREATE UNIQUE INDEX "visionarium_articles_slug_key" ON "visionarium_articles"("slug");

-- CreateIndex
CREATE INDEX "visionarium_articles_institution_id_idx" ON "visionarium_articles"("institution_id");

-- CreateIndex
CREATE INDEX "visionarium_articles_author_user_id_idx" ON "visionarium_articles"("author_user_id");

-- CreateIndex
CREATE INDEX "visionarium_articles_category_idx" ON "visionarium_articles"("category");

-- CreateIndex
CREATE INDEX "visionarium_articles_status_idx" ON "visionarium_articles"("status");

-- CreateIndex
CREATE INDEX "visionarium_articles_language_idx" ON "visionarium_articles"("language");

-- CreateIndex
CREATE INDEX "visionarium_articles_author_student_id_idx" ON "visionarium_articles"("author_student_id");

-- CreateIndex
CREATE INDEX "visionarium_articles_issue_id_idx" ON "visionarium_articles"("issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "visionarium_articles_translation_of_id_language_key" ON "visionarium_articles"("translation_of_id", "language");

-- CreateIndex
CREATE INDEX "visionarium_school_subscriptions_institution_id_idx" ON "visionarium_school_subscriptions"("institution_id");

-- CreateIndex
CREATE INDEX "visionarium_school_subscriptions_is_active_idx" ON "visionarium_school_subscriptions"("is_active");

-- CreateIndex
CREATE INDEX "visionarium_test_series_institution_id_idx" ON "visionarium_test_series"("institution_id");

-- CreateIndex
CREATE INDEX "visionarium_test_series_class_id_idx" ON "visionarium_test_series"("class_id");

-- CreateIndex
CREATE INDEX "visionarium_test_series_subject_id_idx" ON "visionarium_test_series"("subject_id");

-- CreateIndex
CREATE INDEX "visionarium_test_attempts_test_series_id_idx" ON "visionarium_test_attempts"("test_series_id");

-- CreateIndex
CREATE INDEX "visionarium_test_attempts_student_id_idx" ON "visionarium_test_attempts"("student_id");

-- CreateIndex
CREATE INDEX "visionarium_submissions_institution_id_idx" ON "visionarium_submissions"("institution_id");

-- CreateIndex
CREATE INDEX "visionarium_submissions_submitted_by_user_id_idx" ON "visionarium_submissions"("submitted_by_user_id");

-- CreateIndex
CREATE INDEX "visionarium_submissions_status_idx" ON "visionarium_submissions"("status");

-- CreateIndex
CREATE INDEX "visionarium_submissions_linked_article_id_idx" ON "visionarium_submissions"("linked_article_id");

-- CreateIndex
CREATE INDEX "visionarium_submissions_student_id_idx" ON "visionarium_submissions"("student_id");

-- CreateIndex
CREATE INDEX "social_relationships_from_user_id_idx" ON "social_relationships"("from_user_id");

-- CreateIndex
CREATE INDEX "social_relationships_to_user_id_idx" ON "social_relationships"("to_user_id");

-- CreateIndex
CREATE INDEX "social_relationships_institution_id_idx" ON "social_relationships"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_relationships_from_user_id_to_user_id_relationship_t_key" ON "social_relationships"("from_user_id", "to_user_id", "relationship_type");

-- CreateIndex
CREATE INDEX "social_saathi_links_requester_user_id_idx" ON "social_saathi_links"("requester_user_id");

-- CreateIndex
CREATE INDEX "social_saathi_links_target_user_id_idx" ON "social_saathi_links"("target_user_id");

-- CreateIndex
CREATE INDEX "social_saathi_links_status_idx" ON "social_saathi_links"("status");

-- CreateIndex
CREATE UNIQUE INDEX "social_saathi_links_requester_user_id_target_user_id_key" ON "social_saathi_links"("requester_user_id", "target_user_id");

-- CreateIndex
CREATE INDEX "social_posts_institution_id_idx" ON "social_posts"("institution_id");

-- CreateIndex
CREATE INDEX "social_posts_author_user_id_idx" ON "social_posts"("author_user_id");

-- CreateIndex
CREATE INDEX "social_posts_scope_idx" ON "social_posts"("scope");

-- CreateIndex
CREATE INDEX "social_posts_class_id_idx" ON "social_posts"("class_id");

-- CreateIndex
CREATE INDEX "social_posts_created_at_idx" ON "social_posts"("created_at");

-- CreateIndex
CREATE INDEX "social_posts_author_student_id_idx" ON "social_posts"("author_student_id");

-- CreateIndex
CREATE INDEX "social_posts_linked_article_id_idx" ON "social_posts"("linked_article_id");

-- CreateIndex
CREATE INDEX "social_posts_section_id_idx" ON "social_posts"("section_id");

-- CreateIndex
CREATE INDEX "social_comments_post_id_idx" ON "social_comments"("post_id");

-- CreateIndex
CREATE INDEX "social_comments_author_user_id_idx" ON "social_comments"("author_user_id");

-- CreateIndex
CREATE INDEX "social_reactions_post_id_idx" ON "social_reactions"("post_id");

-- CreateIndex
CREATE INDEX "social_reactions_user_id_idx" ON "social_reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_reactions_post_id_user_id_key" ON "social_reactions"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accountId_providerId_key" ON "accounts"("accountId", "providerId");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_applications_client_id_key" ON "oauth_applications"("client_id");

-- CreateIndex
CREATE INDEX "oauth_applications_user_id_idx" ON "oauth_applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_access_tokens_access_token_key" ON "oauth_access_tokens"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_access_tokens_refresh_token_key" ON "oauth_access_tokens"("refresh_token");

-- CreateIndex
CREATE INDEX "oauth_access_tokens_client_id_idx" ON "oauth_access_tokens"("client_id");

-- CreateIndex
CREATE INDEX "oauth_access_tokens_user_id_idx" ON "oauth_access_tokens"("user_id");

-- CreateIndex
CREATE INDEX "oauth_consents_user_id_idx" ON "oauth_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_consents_client_id_user_id_key" ON "oauth_consents"("client_id", "user_id");

-- CreateIndex
CREATE INDEX "id_card_batches_institution_id_idx" ON "id_card_batches"("institution_id");

-- CreateIndex
CREATE INDEX "id_card_batches_institution_id_status_idx" ON "id_card_batches"("institution_id", "status");

-- CreateIndex
CREATE INDEX "id_card_batches_template_id_idx" ON "id_card_batches"("template_id");

-- CreateIndex
CREATE INDEX "guardians_institution_id_idx" ON "guardians"("institution_id");

-- CreateIndex
CREATE INDEX "guardians_whatsapp_number_idx" ON "guardians"("whatsapp_number");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_institution_id_whatsapp_number_key" ON "guardians"("institution_id", "whatsapp_number");

-- CreateIndex
CREATE INDEX "guardian_student_links_institution_id_idx" ON "guardian_student_links"("institution_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_guardian_id_idx" ON "guardian_student_links"("guardian_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_student_id_idx" ON "guardian_student_links"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_student_links_guardian_id_student_id_key" ON "guardian_student_links"("guardian_id", "student_id");

-- CreateIndex
CREATE INDEX "message_templates_institution_id_idx" ON "message_templates"("institution_id");

-- CreateIndex
CREATE INDEX "message_templates_code_idx" ON "message_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_institution_id_code_language_key" ON "message_templates"("institution_id", "code", "language");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_idempotency_key_key" ON "outbox"("idempotency_key");

-- CreateIndex
CREATE INDEX "outbox_institution_id_idx" ON "outbox"("institution_id");

-- CreateIndex
CREATE INDEX "outbox_status_idx" ON "outbox"("status");

-- CreateIndex
CREATE INDEX "outbox_recipient_type_recipient_id_idx" ON "outbox"("recipient_type", "recipient_id");

-- CreateIndex
CREATE INDEX "messages_institution_id_idx" ON "messages"("institution_id");

-- CreateIndex
CREATE INDEX "messages_guardian_id_idx" ON "messages"("guardian_id");

-- CreateIndex
CREATE INDEX "messages_wa_message_id_idx" ON "messages"("wa_message_id");

-- CreateIndex
CREATE INDEX "messages_outbox_id_idx" ON "messages"("outbox_id");

-- CreateIndex
CREATE INDEX "digest_queue_institution_id_idx" ON "digest_queue"("institution_id");

-- CreateIndex
CREATE INDEX "digest_queue_guardian_id_idx" ON "digest_queue"("guardian_id");

-- CreateIndex
CREATE INDEX "digest_queue_outbox_id_idx" ON "digest_queue"("outbox_id");

-- CreateIndex
CREATE INDEX "fee_structures_institution_id_idx" ON "fee_structures"("institution_id");

-- CreateIndex
CREATE INDEX "fee_structures_class_id_idx" ON "fee_structures"("class_id");

-- CreateIndex
CREATE INDEX "fee_invoices_institution_id_idx" ON "fee_invoices"("institution_id");

-- CreateIndex
CREATE INDEX "fee_invoices_student_id_idx" ON "fee_invoices"("student_id");

-- CreateIndex
CREATE INDEX "fee_invoices_status_idx" ON "fee_invoices"("status");

-- CreateIndex
CREATE INDEX "fee_invoices_gateway_order_id_idx" ON "fee_invoices"("gateway_order_id");

-- CreateIndex
CREATE INDEX "fee_invoices_fee_structure_id_idx" ON "fee_invoices"("fee_structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_invoices_institution_id_invoice_number_key" ON "fee_invoices"("institution_id", "invoice_number");

-- CreateIndex
CREATE INDEX "fee_payments_institution_id_idx" ON "fee_payments"("institution_id");

-- CreateIndex
CREATE INDEX "fee_payments_invoice_id_idx" ON "fee_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "fee_payments_gateway_payment_id_idx" ON "fee_payments"("gateway_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_media_wa_media_id_key" ON "inbound_media"("wa_media_id");

-- CreateIndex
CREATE INDEX "inbound_media_institution_id_idx" ON "inbound_media"("institution_id");

-- CreateIndex
CREATE INDEX "inbound_media_guardian_id_idx" ON "inbound_media"("guardian_id");

-- CreateIndex
CREATE INDEX "conversations_institution_id_idx" ON "conversations"("institution_id");

-- CreateIndex
CREATE INDEX "conversations_guardian_id_idx" ON "conversations"("guardian_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_institution_id_guardian_id_key" ON "conversations"("institution_id", "guardian_id");

-- CreateIndex
CREATE INDEX "conversation_messages_institution_id_idx" ON "conversation_messages"("institution_id");

-- CreateIndex
CREATE INDEX "conversation_messages_conversation_id_idx" ON "conversation_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "fee_payment_claims_institution_id_idx" ON "fee_payment_claims"("institution_id");

-- CreateIndex
CREATE INDEX "fee_payment_claims_invoice_id_idx" ON "fee_payment_claims"("invoice_id");

-- CreateIndex
CREATE INDEX "fee_payment_claims_status_idx" ON "fee_payment_claims"("status");

-- CreateIndex
CREATE INDEX "timetable_periods_institution_id_idx" ON "timetable_periods"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_periods_institution_id_name_key" ON "timetable_periods"("institution_id", "name");

-- CreateIndex
CREATE INDEX "timetable_slots_institution_id_idx" ON "timetable_slots"("institution_id");

-- CreateIndex
CREATE INDEX "timetable_slots_section_id_idx" ON "timetable_slots"("section_id");

-- CreateIndex
CREATE INDEX "timetable_slots_teacher_id_idx" ON "timetable_slots"("teacher_id");

-- CreateIndex
CREATE INDEX "timetable_slots_period_id_idx" ON "timetable_slots"("period_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_slots_section_id_day_of_week_period_id_key" ON "timetable_slots"("section_id", "day_of_week", "period_id");

-- CreateIndex
CREATE INDEX "substitutions_institution_id_idx" ON "substitutions"("institution_id");

-- CreateIndex
CREATE INDEX "substitutions_date_idx" ON "substitutions"("date");

-- CreateIndex
CREATE INDEX "substitutions_substitute_teacher_id_idx" ON "substitutions"("substitute_teacher_id");

-- CreateIndex
CREATE INDEX "substitutions_slot_id_idx" ON "substitutions"("slot_id");

-- CreateIndex
CREATE INDEX "ledger_accounts_institution_id_idx" ON "ledger_accounts"("institution_id");

-- CreateIndex
CREATE INDEX "ledger_accounts_type_idx" ON "ledger_accounts"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_institution_id_code_key" ON "ledger_accounts"("institution_id", "code");

-- CreateIndex
CREATE INDEX "journal_entries_institution_id_idx" ON "journal_entries"("institution_id");

-- CreateIndex
CREATE INDEX "journal_entries_entry_date_idx" ON "journal_entries"("entry_date");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_institution_id_voucher_number_key" ON "journal_entries"("institution_id", "voucher_number");

-- CreateIndex
CREATE INDEX "journal_lines_institution_id_idx" ON "journal_lines"("institution_id");

-- CreateIndex
CREATE INDEX "journal_lines_entry_id_idx" ON "journal_lines"("entry_id");

-- CreateIndex
CREATE INDEX "journal_lines_account_id_idx" ON "journal_lines"("account_id");

-- CreateIndex
CREATE INDEX "staff_members_institution_id_idx" ON "staff_members"("institution_id");

-- CreateIndex
CREATE INDEX "staff_members_status_idx" ON "staff_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_institution_id_employee_code_key" ON "staff_members"("institution_id", "employee_code");

-- CreateIndex
CREATE INDEX "salary_structures_institution_id_idx" ON "salary_structures"("institution_id");

-- CreateIndex
CREATE INDEX "salary_structures_staff_id_idx" ON "salary_structures"("staff_id");

-- CreateIndex
CREATE INDEX "payslips_institution_id_idx" ON "payslips"("institution_id");

-- CreateIndex
CREATE INDEX "payslips_staff_id_idx" ON "payslips"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_staff_id_month_year_key" ON "payslips"("staff_id", "month", "year");

-- CreateIndex
CREATE INDEX "leave_requests_institution_id_idx" ON "leave_requests"("institution_id");

-- CreateIndex
CREATE INDEX "leave_requests_staff_id_idx" ON "leave_requests"("staff_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "transport_routes_institution_id_idx" ON "transport_routes"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "transport_routes_institution_id_code_key" ON "transport_routes"("institution_id", "code");

-- CreateIndex
CREATE INDEX "transport_stops_institution_id_idx" ON "transport_stops"("institution_id");

-- CreateIndex
CREATE INDEX "transport_stops_route_id_idx" ON "transport_stops"("route_id");

-- CreateIndex
CREATE INDEX "student_transport_institution_id_idx" ON "student_transport"("institution_id");

-- CreateIndex
CREATE INDEX "student_transport_student_id_idx" ON "student_transport"("student_id");

-- CreateIndex
CREATE INDEX "student_transport_route_id_idx" ON "student_transport"("route_id");

-- CreateIndex
CREATE INDEX "transport_trips_institution_id_idx" ON "transport_trips"("institution_id");

-- CreateIndex
CREATE INDEX "transport_trips_route_id_idx" ON "transport_trips"("route_id");

-- CreateIndex
CREATE INDEX "enquiries_institution_id_idx" ON "enquiries"("institution_id");

-- CreateIndex
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");

-- CreateIndex
CREATE INDEX "enquiries_phone_idx" ON "enquiries"("phone");

-- CreateIndex
CREATE INDEX "enquiries_assigned_to_user_id_idx" ON "enquiries"("assigned_to_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_institution_id_enquiry_number_key" ON "enquiries"("institution_id", "enquiry_number");

-- CreateIndex
CREATE INDEX "enquiry_activities_institution_id_idx" ON "enquiry_activities"("institution_id");

-- CreateIndex
CREATE INDEX "enquiry_activities_enquiry_id_idx" ON "enquiry_activities"("enquiry_id");

-- CreateIndex
CREATE INDEX "hostel_blocks_institution_id_idx" ON "hostel_blocks"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_blocks_institution_id_code_key" ON "hostel_blocks"("institution_id", "code");

-- CreateIndex
CREATE INDEX "hostel_rooms_institution_id_idx" ON "hostel_rooms"("institution_id");

-- CreateIndex
CREATE INDEX "hostel_rooms_block_id_idx" ON "hostel_rooms"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_block_id_room_number_key" ON "hostel_rooms"("block_id", "room_number");

-- CreateIndex
CREATE INDEX "hostel_allotments_institution_id_idx" ON "hostel_allotments"("institution_id");

-- CreateIndex
CREATE INDEX "hostel_allotments_room_id_idx" ON "hostel_allotments"("room_id");

-- CreateIndex
CREATE INDEX "hostel_allotments_student_id_idx" ON "hostel_allotments"("student_id");

-- CreateIndex
CREATE INDEX "mess_bills_institution_id_idx" ON "mess_bills"("institution_id");

-- CreateIndex
CREATE INDEX "mess_bills_status_idx" ON "mess_bills"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mess_bills_student_id_bill_month_key" ON "mess_bills"("student_id", "bill_month");

-- CreateIndex
CREATE INDEX "inventory_categories_institution_id_idx" ON "inventory_categories"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_categories_institution_id_name_key" ON "inventory_categories"("institution_id", "name");

-- CreateIndex
CREATE INDEX "inventory_items_institution_id_idx" ON "inventory_items"("institution_id");

-- CreateIndex
CREATE INDEX "inventory_items_category_id_idx" ON "inventory_items"("category_id");

-- CreateIndex
CREATE INDEX "stock_transactions_institution_id_idx" ON "stock_transactions"("institution_id");

-- CreateIndex
CREATE INDEX "stock_transactions_item_id_idx" ON "stock_transactions"("item_id");

-- CreateIndex
CREATE INDEX "stock_transactions_type_idx" ON "stock_transactions"("type");

-- CreateIndex
CREATE INDEX "health_records_institution_id_idx" ON "health_records"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_records_institution_id_student_id_key" ON "health_records"("institution_id", "student_id");

-- CreateIndex
CREATE INDEX "clinic_visits_institution_id_idx" ON "clinic_visits"("institution_id");

-- CreateIndex
CREATE INDEX "clinic_visits_student_id_idx" ON "clinic_visits"("student_id");

-- CreateIndex
CREATE INDEX "vaccination_records_institution_id_idx" ON "vaccination_records"("institution_id");

-- CreateIndex
CREATE INDEX "vaccination_records_student_id_idx" ON "vaccination_records"("student_id");

-- CreateIndex
CREATE INDEX "visitor_logs_institution_id_idx" ON "visitor_logs"("institution_id");

-- CreateIndex
CREATE INDEX "visitor_logs_status_idx" ON "visitor_logs"("status");

-- CreateIndex
CREATE INDEX "gate_passes_institution_id_idx" ON "gate_passes"("institution_id");

-- CreateIndex
CREATE INDEX "gate_passes_student_id_idx" ON "gate_passes"("student_id");

-- CreateIndex
CREATE INDEX "cce_assessments_institution_id_idx" ON "cce_assessments"("institution_id");

-- CreateIndex
CREATE INDEX "cce_assessments_section_id_idx" ON "cce_assessments"("section_id");

-- CreateIndex
CREATE INDEX "cce_assessments_term_type_idx" ON "cce_assessments"("term_type");

-- CreateIndex
CREATE INDEX "cce_marks_institution_id_idx" ON "cce_marks"("institution_id");

-- CreateIndex
CREATE INDEX "cce_marks_student_id_idx" ON "cce_marks"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "cce_marks_assessment_id_student_id_key" ON "cce_marks"("assessment_id", "student_id");

-- CreateIndex
CREATE INDEX "assignments_institution_id_idx" ON "assignments"("institution_id");

-- CreateIndex
CREATE INDEX "assignments_section_id_idx" ON "assignments"("section_id");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "assignment_submissions_institution_id_idx" ON "assignment_submissions"("institution_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key" ON "assignment_submissions"("assignment_id", "student_id");

-- CreateIndex
CREATE INDEX "notices_institution_id_idx" ON "notices"("institution_id");

-- CreateIndex
CREATE INDEX "notices_status_idx" ON "notices"("status");

-- CreateIndex
CREATE INDEX "notices_audience_idx" ON "notices"("audience");

-- CreateIndex
CREATE INDEX "calendar_events_institution_id_idx" ON "calendar_events"("institution_id");

-- CreateIndex
CREATE INDEX "calendar_events_event_date_idx" ON "calendar_events"("event_date");

-- CreateIndex
CREATE INDEX "saved_reports_institution_id_idx" ON "saved_reports"("institution_id");

-- CreateIndex
CREATE INDEX "alumni_institution_id_idx" ON "alumni"("institution_id");

-- CreateIndex
CREATE INDEX "alumni_graduation_year_idx" ON "alumni"("graduation_year");

-- CreateIndex
CREATE INDEX "alumni_events_institution_id_idx" ON "alumni_events"("institution_id");

-- CreateIndex
CREATE INDEX "placement_drives_institution_id_idx" ON "placement_drives"("institution_id");

-- CreateIndex
CREATE INDEX "placement_drives_status_idx" ON "placement_drives"("status");

-- CreateIndex
CREATE INDEX "placement_applications_institution_id_idx" ON "placement_applications"("institution_id");

-- CreateIndex
CREATE INDEX "placement_applications_student_id_idx" ON "placement_applications"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_applications_drive_id_student_id_key" ON "placement_applications"("drive_id", "student_id");

-- CreateIndex
CREATE INDEX "biometric_devices_institution_id_idx" ON "biometric_devices"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_devices_institution_id_device_code_key" ON "biometric_devices"("institution_id", "device_code");

-- CreateIndex
CREATE INDEX "biometric_punches_institution_id_idx" ON "biometric_punches"("institution_id");

-- CreateIndex
CREATE INDEX "biometric_punches_device_id_idx" ON "biometric_punches"("device_id");

-- CreateIndex
CREATE INDEX "biometric_punches_person_id_idx" ON "biometric_punches"("person_id");

-- CreateIndex
CREATE INDEX "biometric_punches_punch_time_idx" ON "biometric_punches"("punch_time");

-- CreateIndex
CREATE INDEX "staff_attendances_institution_id_idx" ON "staff_attendances"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendances_staff_id_attendance_date_key" ON "staff_attendances"("staff_id", "attendance_date");

-- CreateIndex
CREATE INDEX "fee_concessions_institution_id_idx" ON "fee_concessions"("institution_id");

-- CreateIndex
CREATE INDEX "fee_concessions_student_id_idx" ON "fee_concessions"("student_id");

-- CreateIndex
CREATE INDEX "fee_installment_plans_institution_id_idx" ON "fee_installment_plans"("institution_id");

-- CreateIndex
CREATE INDEX "fee_installment_plans_student_id_idx" ON "fee_installment_plans"("student_id");

-- CreateIndex
CREATE INDEX "fee_installments_institution_id_idx" ON "fee_installments"("institution_id");

-- CreateIndex
CREATE INDEX "fee_installments_plan_id_idx" ON "fee_installments"("plan_id");

-- CreateIndex
CREATE INDEX "fee_installments_status_idx" ON "fee_installments"("status");

-- CreateIndex
CREATE INDEX "live_classes_institution_id_idx" ON "live_classes"("institution_id");

-- CreateIndex
CREATE INDEX "live_classes_section_id_idx" ON "live_classes"("section_id");

-- CreateIndex
CREATE INDEX "live_classes_status_idx" ON "live_classes"("status");

-- CreateIndex
CREATE INDEX "question_bank_items_institution_id_idx" ON "question_bank_items"("institution_id");

-- CreateIndex
CREATE INDEX "question_bank_items_subject_idx" ON "question_bank_items"("subject");

-- CreateIndex
CREATE INDEX "online_tests_institution_id_idx" ON "online_tests"("institution_id");

-- CreateIndex
CREATE INDEX "online_tests_section_id_idx" ON "online_tests"("section_id");

-- CreateIndex
CREATE INDEX "online_tests_status_idx" ON "online_tests"("status");

-- CreateIndex
CREATE INDEX "online_test_attempts_institution_id_idx" ON "online_test_attempts"("institution_id");

-- CreateIndex
CREATE INDEX "online_test_attempts_test_id_idx" ON "online_test_attempts"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "online_test_attempts_test_id_student_id_key" ON "online_test_attempts"("test_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_suppressions_email_key" ON "email_suppressions"("email");

-- CreateIndex
CREATE INDEX "email_suppressions_reason_idx" ON "email_suppressions"("reason");

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_authorities" ADD CONSTRAINT "institution_authorities_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_institution_roles" ADD CONSTRAINT "user_institution_roles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_institution_roles" ADD CONSTRAINT "user_institution_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_slots" ADD CONSTRAINT "admission_slots_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "admission_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visiting_cards" ADD CONSTRAINT "visiting_cards_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visiting_cards" ADD CONSTRAINT "visiting_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visiting_cards" ADD CONSTRAINT "visiting_cards_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visiting_cards" ADD CONSTRAINT "visiting_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_photos" ADD CONSTRAINT "group_photos_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_photos" ADD CONSTRAINT "group_photos_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_photos" ADD CONSTRAINT "group_photos_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_photo_extractions" ADD CONSTRAINT "group_photo_extractions_group_photo_id_fkey" FOREIGN KEY ("group_photo_id") REFERENCES "group_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_photo_extractions" ADD CONSTRAINT "group_photo_extractions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subjects" ADD CONSTRAINT "exam_subjects_exam_schedule_id_fkey" FOREIGN KEY ("exam_schedule_id") REFERENCES "exam_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_exam_schedule_id_fkey" FOREIGN KEY ("exam_schedule_id") REFERENCES "exam_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_engines" ADD CONSTRAINT "calculation_engines_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_exam_schedule_id_fkey" FOREIGN KEY ("exam_schedule_id") REFERENCES "exam_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheets" ADD CONSTRAINT "marksheets_calculation_engine_id_fkey" FOREIGN KEY ("calculation_engine_id") REFERENCES "calculation_engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheets" ADD CONSTRAINT "marksheets_exam_schedule_id_fkey" FOREIGN KEY ("exam_schedule_id") REFERENCES "exam_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheets" ADD CONSTRAINT "marksheets_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheets" ADD CONSTRAINT "marksheets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheets" ADD CONSTRAINT "marksheets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_cards" ADD CONSTRAINT "library_cards_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_cards" ADD CONSTRAINT "library_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_cards" ADD CONSTRAINT "library_cards_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_certificates" ADD CONSTRAINT "transfer_certificates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_certificates" ADD CONSTRAINT "transfer_certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_certificates" ADD CONSTRAINT "transfer_certificates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_executions" ADD CONSTRAINT "job_executions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_sections" ADD CONSTRAINT "portfolio_sections_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "approval_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_form_progress" ADD CONSTRAINT "student_form_progress_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_form_progress" ADD CONSTRAINT "student_form_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_onboarding_tokens" ADD CONSTRAINT "student_onboarding_tokens_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_onboarding_tokens" ADD CONSTRAINT "student_onboarding_tokens_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_articles" ADD CONSTRAINT "visionarium_articles_author_student_id_fkey" FOREIGN KEY ("author_student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_articles" ADD CONSTRAINT "visionarium_articles_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_articles" ADD CONSTRAINT "visionarium_articles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_articles" ADD CONSTRAINT "visionarium_articles_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "visionarium_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_articles" ADD CONSTRAINT "visionarium_articles_translation_of_id_fkey" FOREIGN KEY ("translation_of_id") REFERENCES "visionarium_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_school_subscriptions" ADD CONSTRAINT "visionarium_school_subscriptions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_test_series" ADD CONSTRAINT "visionarium_test_series_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_test_series" ADD CONSTRAINT "visionarium_test_series_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_test_series" ADD CONSTRAINT "visionarium_test_series_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_test_attempts" ADD CONSTRAINT "visionarium_test_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_test_attempts" ADD CONSTRAINT "visionarium_test_attempts_test_series_id_fkey" FOREIGN KEY ("test_series_id") REFERENCES "visionarium_test_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_submissions" ADD CONSTRAINT "visionarium_submissions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_submissions" ADD CONSTRAINT "visionarium_submissions_linked_article_id_fkey" FOREIGN KEY ("linked_article_id") REFERENCES "visionarium_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_submissions" ADD CONSTRAINT "visionarium_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visionarium_submissions" ADD CONSTRAINT "visionarium_submissions_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_relationships" ADD CONSTRAINT "social_relationships_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_relationships" ADD CONSTRAINT "social_relationships_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_relationships" ADD CONSTRAINT "social_relationships_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_saathi_links" ADD CONSTRAINT "social_saathi_links_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_saathi_links" ADD CONSTRAINT "social_saathi_links_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_author_student_id_fkey" FOREIGN KEY ("author_student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_linked_article_id_fkey" FOREIGN KEY ("linked_article_id") REFERENCES "visionarium_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_comments" ADD CONSTRAINT "social_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_comments" ADD CONSTRAINT "social_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_reactions" ADD CONSTRAINT "social_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_reactions" ADD CONSTRAINT "social_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_applications" ADD CONSTRAINT "oauth_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_applications"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_applications"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_card_batches" ADD CONSTRAINT "id_card_batches_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_card_batches" ADD CONSTRAINT "id_card_batches_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_outbox_id_fkey" FOREIGN KEY ("outbox_id") REFERENCES "outbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digest_queue" ADD CONSTRAINT "digest_queue_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digest_queue" ADD CONSTRAINT "digest_queue_outbox_id_fkey" FOREIGN KEY ("outbox_id") REFERENCES "outbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "fee_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_media" ADD CONSTRAINT "inbound_media_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payment_claims" ADD CONSTRAINT "fee_payment_claims_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payment_claims" ADD CONSTRAINT "fee_payment_claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "fee_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "timetable_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "timetable_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_stops" ADD CONSTRAINT "transport_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transport" ADD CONSTRAINT "student_transport_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry_activities" ADD CONSTRAINT "enquiry_activities_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry_activities" ADD CONSTRAINT "enquiry_activities_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_blocks" ADD CONSTRAINT "hostel_blocks_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allotments" ADD CONSTRAINT "hostel_allotments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allotments" ADD CONSTRAINT "hostel_allotments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "hostel_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_bills" ADD CONSTRAINT "mess_bills_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_visits" ADD CONSTRAINT "clinic_visits_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cce_assessments" ADD CONSTRAINT "cce_assessments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cce_marks" ADD CONSTRAINT "cce_marks_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "cce_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cce_marks" ADD CONSTRAINT "cce_marks_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_events" ADD CONSTRAINT "alumni_events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_drives" ADD CONSTRAINT "placement_drives_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_applications" ADD CONSTRAINT "placement_applications_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "placement_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_applications" ADD CONSTRAINT "placement_applications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_devices" ADD CONSTRAINT "biometric_devices_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_punches" ADD CONSTRAINT "biometric_punches_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "biometric_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_punches" ADD CONSTRAINT "biometric_punches_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendances" ADD CONSTRAINT "staff_attendances_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_concessions" ADD CONSTRAINT "fee_concessions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_installment_plans" ADD CONSTRAINT "fee_installment_plans_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_installments" ADD CONSTRAINT "fee_installments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_installments" ADD CONSTRAINT "fee_installments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "fee_installment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank_items" ADD CONSTRAINT "question_bank_items_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_tests" ADD CONSTRAINT "online_tests_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_test_attempts" ADD CONSTRAINT "online_test_attempts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_test_attempts" ADD CONSTRAINT "online_test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "online_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

