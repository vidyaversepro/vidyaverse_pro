-- CreateTable
CREATE TABLE `institutions` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `address` TEXT NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `academic_year` VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    `logo_url` VARCHAR(500) NULL,
    `signature_url` VARCHAR(500) NULL,
    `signature_title` VARCHAR(100) NOT NULL DEFAULT 'Principal',
    `seal_url` VARCHAR(500) NULL,
    `enabled_fields` JSON NOT NULL,
    `custom_fields` JSON NOT NULL,
    `enabled_services` JSON NOT NULL,
    `subscription_tier` ENUM('starter', 'professional', 'enterprise') NOT NULL DEFAULT 'starter',
    `subscription_status` ENUM('trial', 'active', 'suspended', 'cancelled') NOT NULL DEFAULT 'trial',
    `trial_ends_at` DATETIME(3) NULL,
    `subscription_start` DATETIME(3) NULL,
    `subscription_end` DATETIME(3) NULL,
    `monthly_ai_usage` INTEGER NOT NULL DEFAULT 0,
    `monthly_pdf_pages` INTEGER NOT NULL DEFAULT 0,
    `monthly_email_sent` INTEGER NOT NULL DEFAULT 0,
    `storage_used_mb` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `institutions_code_key`(`code`),
    INDEX `institutions_code_idx`(`code`),
    INDEX `institutions_subscription_status_subscription_tier_idx`(`subscription_status`, `subscription_tier`),
    INDEX `institutions_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `address` TEXT NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `branches_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `branches_institution_id_code_key`(`institution_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verification_token` VARCHAR(255) NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_secret` VARCHAR(255) NULL,
    `global_role` ENUM('super_admin', 'support') NULL,
    `last_login_at` DATETIME(3) NULL,
    `last_login_ip` VARCHAR(50) NULL,
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_password_reset_token_idx`(`password_reset_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_invitations` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'accepted', 'expired') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_invitations_token_key`(`token`),
    INDEX `admin_invitations_email_idx`(`email`),
    INDEX `admin_invitations_token_idx`(`token`),
    INDEX `admin_invitations_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_institution_roles` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `role` ENUM('main_admin', 'school_admin', 'teacher', 'student') NOT NULL,
    `assigned_classes` JSON NULL,
    `assigned_sections` JSON NULL,
    `student_access_enabled` BOOLEAN NOT NULL DEFAULT false,
    `student_access_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_institution_roles_role_idx`(`role`),
    INDEX `user_institution_roles_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `user_institution_roles_user_id_institution_id_key`(`user_id`, `institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `name` VARCHAR(100) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `classes_institution_id_idx`(`institution_id`),
    INDEX `classes_branch_id_idx`(`branch_id`),
    UNIQUE INDEX `classes_institution_id_name_key`(`institution_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streams` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `streams_class_id_name_key`(`class_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `stream_id` CHAR(36) NULL,
    `name` VARCHAR(50) NOT NULL,
    `expected_student_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sections_class_id_stream_id_name_key`(`class_id`, `stream_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `roll_no` INTEGER NOT NULL,
    `admission_number` VARCHAR(50) NULL,
    `name` VARCHAR(255) NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    `father_name` VARCHAR(255) NULL,
    `mother_name` VARCHAR(255) NULL,
    `guardian_name` VARCHAR(255) NULL,
    `guardian_relation` VARCHAR(50) NULL,
    `guardian_phone` VARCHAR(20) NULL,
    `sex` ENUM('male', 'female', 'other') NULL,
    `dob` DATE NULL,
    `blood_group` VARCHAR(10) NULL,
    `aadhar_number` VARCHAR(12) NULL,
    `caste` VARCHAR(100) NULL,
    `religion` VARCHAR(100) NULL,
    `contact` VARCHAR(20) NULL,
    `parent_email` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `date_of_admission` DATE NULL,
    `previous_school` TEXT NULL,
    `transport_mode` VARCHAR(50) NULL,
    `photo_url` VARCHAR(500) NULL,
    `photo_enhanced_url` VARCHAR(500) NULL,
    `photo_hash` VARCHAR(64) NULL,
    `student_signature_url` VARCHAR(500) NULL,
    `parent_signature_url` VARCHAR(500) NULL,
    `photo_quality_score` DECIMAL(3, 2) NULL,
    `photo_enhancement_method` ENUM('opencv_auto', 'gemini_api', 'manual_approval') NULL,
    `photo_validation_status` ENUM('pending', 'approved', 'rejected', 'failed') NOT NULL DEFAULT 'pending',
    `photo_validation_error` TEXT NULL,
    `medical_notes` TEXT NULL,
    `status` ENUM('pending', 'active', 'graduated', 'transferred', 'withdrawn', 'suspended') NOT NULL DEFAULT 'active',
    `data_status` ENUM('pending', 'filled', 'enhanced', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `consent_given` BOOLEAN NOT NULL DEFAULT false,
    `consent_timestamp` DATETIME(3) NULL,
    `consent_given_by` VARCHAR(255) NULL,
    `custom_data` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `students_admission_number_key`(`admission_number`),
    INDEX `students_institution_id_idx`(`institution_id`),
    INDEX `students_branch_id_idx`(`branch_id`),
    INDEX `students_section_id_idx`(`section_id`),
    INDEX `students_status_idx`(`status`),
    INDEX `students_data_status_idx`(`data_status`),
    INDEX `students_photo_hash_idx`(`photo_hash`),
    UNIQUE INDEX `students_section_id_roll_no_key`(`section_id`, `roll_no`),
    FULLTEXT INDEX `students_name_father_name_mother_name_admission_number_idx`(`name`, `father_name`, `mother_name`, `admission_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `service_type` ENUM('id_card', 'certificate', 'group_photo', 'portfolio', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate') NOT NULL,
    `template_type` ENUM('html', 'svg', 'json') NOT NULL DEFAULT 'html',
    `content` LONGTEXT NOT NULL,
    `css_styles` TEXT NULL,
    `width_mm` DECIMAL(7, 2) NOT NULL DEFAULT 85.60,
    `height_mm` DECIMAL(7, 2) NOT NULL DEFAULT 54.00,
    `orientation` ENUM('portrait', 'landscape') NOT NULL DEFAULT 'landscape',
    `thumbnail_url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `templates_institution_id_idx`(`institution_id`),
    INDEX `templates_service_type_idx`(`service_type`),
    INDEX `templates_is_default_idx`(`is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `id_cards` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `card_number` VARCHAR(50) NULL,
    `valid_from` DATE NULL,
    `valid_until` DATE NULL,
    `qr_code_data` TEXT NULL,
    `barcode_data` VARCHAR(100) NULL,
    `card_front_url` VARCHAR(500) NULL,
    `card_back_url` VARCHAR(500) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `status` ENUM('draft', 'pending_approval', 'approved', 'printed', 'issued', 'cancelled') NOT NULL DEFAULT 'draft',
    `issued_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `id_cards_card_number_key`(`card_number`),
    INDEX `id_cards_student_id_idx`(`student_id`),
    INDEX `id_cards_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_photos` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NULL,
    `class_id` CHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `event_name` VARCHAR(255) NULL,
    `event_date` DATE NULL,
    `description` TEXT NULL,
    `photo_session_name` VARCHAR(255) NULL,
    `photo_date` DATE NULL,
    `location` VARCHAR(255) NULL,
    `photographer` VARCHAR(255) NULL,
    `photo_url` VARCHAR(500) NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `raw_group_photo_url` VARCHAR(500) NULL,
    `processed_group_photo_url` VARCHAR(500) NULL,
    `perceptual_hash` VARCHAR(64) NULL,
    `package_tier` ENUM('basic', 'standard', 'premium') NOT NULL DEFAULT 'basic',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `processing_status` ENUM('uploaded', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'uploaded',
    `face_detection_completed` BOOLEAN NOT NULL DEFAULT false,
    `individual_extraction_completed` BOOLEAN NOT NULL DEFAULT false,
    `total_students_detected` INTEGER NOT NULL DEFAULT 0,
    `row_count` INTEGER NOT NULL DEFAULT 0,
    `teacher_detected` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `group_photos_institution_id_idx`(`institution_id`),
    INDEX `group_photos_section_id_idx`(`section_id`),
    INDEX `group_photos_processing_status_idx`(`processing_status`),
    INDEX `group_photos_perceptual_hash_idx`(`perceptual_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_photo_extractions` (
    `id` CHAR(36) NOT NULL,
    `group_photo_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NULL,
    `row_number` INTEGER NULL,
    `position_in_row` INTEGER NULL,
    `bounding_box` JSON NULL,
    `confidence_score` DECIMAL(3, 2) NULL,
    `face_hash` VARCHAR(64) NULL,
    `match_confidence` INTEGER NULL,
    `is_auto_matched` BOOLEAN NOT NULL DEFAULT false,
    `is_rejected` BOOLEAN NOT NULL DEFAULT false,
    `manual_label` VARCHAR(255) NULL,
    `individual_photo_url` VARCHAR(500) NULL,
    `enhanced_photo_url` VARCHAR(500) NULL,
    `framed_photo_url` VARCHAR(500) NULL,
    `yearbook_format_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `group_photo_extractions_group_photo_id_idx`(`group_photo_id`),
    INDEX `group_photo_extractions_student_id_idx`(`student_id`),
    INDEX `group_photo_extractions_face_hash_idx`(`face_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `certificate_type` ENUM('academic_excellence', 'sports', 'cultural', 'attendance', 'character', 'transfer', 'scholarship', 'topper', 'participation', 'custom') NOT NULL,
    `certificate_number` VARCHAR(50) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `achievement_details` TEXT NULL,
    `awarded_for_period` VARCHAR(100) NULL,
    `issue_date` DATE NOT NULL,
    `verification_qr_code` TEXT NULL,
    `verification_url` VARCHAR(500) NULL,
    `digital_signature_url` VARCHAR(500) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `package_tier` ENUM('standard', 'premium') NOT NULL DEFAULT 'standard',
    `status` ENUM('draft', 'generated', 'sent', 'downloaded') NOT NULL DEFAULT 'draft',
    `email_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `certificates_certificate_number_key`(`certificate_number`),
    INDEX `certificates_student_id_idx`(`student_id`),
    INDEX `certificates_certificate_type_idx`(`certificate_type`),
    INDEX `certificates_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_schedules` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `exam_name` VARCHAR(255) NOT NULL,
    `exam_type` ENUM('internal', 'board', 'competitive') NOT NULL DEFAULT 'internal',
    `academic_year` VARCHAR(20) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `instructions` TEXT NULL,
    `reporting_time` TIME(0) NULL,
    `status` ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exam_schedules_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_subjects` (
    `id` CHAR(36) NOT NULL,
    `exam_schedule_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `subject_code` VARCHAR(50) NULL,
    `exam_date` DATE NOT NULL,
    `start_time` TIME(0) NOT NULL,
    `duration_minutes` INTEGER NOT NULL,
    `venue` VARCHAR(255) NULL,
    `max_marks` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exam_subjects_exam_schedule_id_idx`(`exam_schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hall_tickets` (
    `id` CHAR(36) NOT NULL,
    `exam_schedule_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `hall_ticket_number` VARCHAR(50) NULL,
    `roll_number_for_exam` VARCHAR(50) NULL,
    `exam_center` VARCHAR(255) NULL,
    `seat_number` VARCHAR(50) NULL,
    `qr_code_data` TEXT NULL,
    `barcode_data` VARCHAR(100) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `status` ENUM('generated', 'sent', 'downloaded', 'verified') NOT NULL DEFAULT 'generated',
    `sent_via` ENUM('sms', 'email', 'both') NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hall_tickets_hall_ticket_number_key`(`hall_ticket_number`),
    INDEX `hall_tickets_student_id_idx`(`student_id`),
    INDEX `hall_tickets_status_idx`(`status`),
    UNIQUE INDEX `hall_tickets_exam_schedule_id_student_id_key`(`exam_schedule_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calculation_engines` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `cgpa_formula` TEXT NOT NULL,
    `percentage_formula` TEXT NOT NULL,
    `percentile_formula` TEXT NOT NULL,
    `grade_scale` JSON NOT NULL,
    `theory_weightage` DECIMAL(5, 2) NOT NULL DEFAULT 70.00,
    `practical_weightage` DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
    `internal_weightage` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    `rank_calculation_scope` ENUM('section', 'class_all_sections', 'institution') NOT NULL DEFAULT 'class_all_sections',
    `grace_marks_enabled` BOOLEAN NOT NULL DEFAULT false,
    `max_grace_marks` INTEGER NOT NULL DEFAULT 0,
    `grace_marks_rules` JSON NULL,
    `decimal_precision` INTEGER NOT NULL DEFAULT 2,
    `rounding_method` ENUM('round', 'floor', 'ceil') NOT NULL DEFAULT 'round',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calculation_engines_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `calculation_engines_institution_id_academic_year_key`(`institution_id`, `academic_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `subject_code` VARCHAR(50) NULL,
    `subject_type` ENUM('theory', 'practical', 'combined') NOT NULL DEFAULT 'theory',
    `is_mandatory` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `subjects_class_id_idx`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marks` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `exam_schedule_id` CHAR(36) NOT NULL,
    `theory_max_marks` INTEGER NULL,
    `theory_obtained_marks` DECIMAL(5, 2) NULL,
    `practical_max_marks` INTEGER NULL,
    `practical_obtained_marks` DECIMAL(5, 2) NULL,
    `internal_max_marks` INTEGER NULL,
    `internal_obtained_marks` DECIMAL(5, 2) NULL,
    `total_max_marks` INTEGER NULL,
    `total_obtained_marks` DECIMAL(5, 2) NULL,
    `percentage` DECIMAL(5, 2) NULL,
    `grade` VARCHAR(10) NULL,
    `status` ENUM('draft', 'submitted', 'approved', 'published') NOT NULL DEFAULT 'draft',
    `entered_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `marks_student_id_idx`(`student_id`),
    INDEX `marks_exam_schedule_id_idx`(`exam_schedule_id`),
    INDEX `marks_status_idx`(`status`),
    UNIQUE INDEX `marks_student_id_subject_id_exam_schedule_id_key`(`student_id`, `subject_id`, `exam_schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marksheets` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `exam_schedule_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `calculation_engine_id` CHAR(36) NOT NULL,
    `total_percentage` DECIMAL(5, 2) NULL,
    `cgpa` DECIMAL(4, 2) NULL,
    `grade` VARCHAR(10) NULL,
    `class_rank` INTEGER NULL,
    `section_rank` INTEGER NULL,
    `overall_rank` INTEGER NULL,
    `percentile` DECIMAL(5, 2) NULL,
    `total_students_in_comparison` INTEGER NULL,
    `pdf_url` VARCHAR(500) NULL,
    `digital_signature_url` VARCHAR(500) NULL,
    `status` ENUM('draft', 'generated', 'approved', 'published', 'sent') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `marksheets_student_id_idx`(`student_id`),
    INDEX `marksheets_exam_schedule_id_idx`(`exam_schedule_id`),
    UNIQUE INDEX `marksheets_student_id_exam_schedule_id_key`(`student_id`, `exam_schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `library_cards` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `library_card_number` VARCHAR(50) NOT NULL,
    `issue_date` DATE NOT NULL,
    `expiry_date` DATE NOT NULL,
    `max_books_allowed` INTEGER NOT NULL DEFAULT 3,
    `borrowing_period_days` INTEGER NOT NULL DEFAULT 14,
    `qr_code_data` TEXT NULL,
    `barcode_data` VARCHAR(100) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `status` ENUM('active', 'suspended', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `library_cards_library_card_number_key`(`library_card_number`),
    INDEX `library_cards_student_id_idx`(`student_id`),
    INDEX `library_cards_status_idx`(`status`),
    UNIQUE INDEX `library_cards_student_id_institution_id_key`(`student_id`, `institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfer_certificates` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `tc_serial_number` VARCHAR(50) NOT NULL,
    `admission_date` DATE NOT NULL,
    `leaving_date` DATE NOT NULL,
    `last_class_studied` VARCHAR(100) NULL,
    `reason_for_leaving` TEXT NULL,
    `conduct_remarks` ENUM('excellent', 'good', 'satisfactory', 'needs_improvement') NOT NULL DEFAULT 'good',
    `character_remarks` TEXT NULL,
    `fee_clearance_status` ENUM('cleared', 'pending', 'dues_outstanding') NOT NULL DEFAULT 'pending',
    `outstanding_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_working_days` INTEGER NULL,
    `total_present_days` INTEGER NULL,
    `attendance_percentage` DECIMAL(5, 2) NULL,
    `principal_signature_url` VARCHAR(500) NULL,
    `seal_url` VARCHAR(500) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `issued_by` CHAR(36) NULL,
    `issued_at` DATETIME(3) NULL,
    `duplicate_issued` BOOLEAN NOT NULL DEFAULT false,
    `original_tc_id` CHAR(36) NULL,
    `status` ENUM('draft', 'pending_approval', 'issued', 'cancelled') NOT NULL DEFAULT 'draft',
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transfer_certificates_tc_serial_number_key`(`tc_serial_number`),
    INDEX `transfer_certificates_student_id_idx`(`student_id`),
    INDEX `transfer_certificates_tc_serial_number_idx`(`tc_serial_number`),
    INDEX `transfer_certificates_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('student', 'id_card', 'certificate', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `submitted_by` CHAR(36) NULL,
    `reviewed_by` CHAR(36) NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'changes_requested', 'cancelled') NOT NULL,
    `review_notes` TEXT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,

    INDEX `approvals_institution_id_idx`(`institution_id`),
    INDEX `approvals_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `approvals_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_logs` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `attendance_date` DATE NOT NULL,
    `attendance_time` TIME(0) NOT NULL,
    `scan_type` ENUM('entry', 'exit', 'checkpoint') NOT NULL DEFAULT 'entry',
    `scanner_id` VARCHAR(100) NULL,
    `scanner_location` VARCHAR(255) NULL,
    `qr_source` ENUM('id_card', 'library_card', 'hall_ticket', 'mobile_app') NOT NULL DEFAULT 'id_card',
    `notes` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attendance_logs_student_id_idx`(`student_id`),
    INDEX `attendance_logs_institution_id_attendance_date_idx`(`institution_id`, `attendance_date`),
    INDEX `attendance_logs_attendance_date_idx`(`attendance_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_executions` (
    `id` CHAR(36) NOT NULL,
    `job_id` VARCHAR(255) NOT NULL,
    `job_type` ENUM('photo_enhancement', 'bulk_pdf_generation', 'csv_import', 'facial_recognition', 'group_photo_processing', 'bulk_certificate_generation', 'bulk_hall_ticket_generation', 'bulk_marksheet_generation', 'monthly_usage_reset', 'email_batch') NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NULL,
    `initiated_by` CHAR(36) NULL,
    `status` ENUM('queued', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `total_items` INTEGER NOT NULL DEFAULT 0,
    `processed_items` INTEGER NOT NULL DEFAULT 0,
    `successful_items` INTEGER NOT NULL DEFAULT 0,
    `failed_items` INTEGER NOT NULL DEFAULT 0,
    `error_message` TEXT NULL,
    `error_stack` TEXT NULL,
    `result_data` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `duration_seconds` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_executions_job_id_key`(`job_id`),
    INDEX `job_executions_job_id_idx`(`job_id`),
    INDEX `job_executions_status_idx`(`status`),
    INDEX `job_executions_institution_id_idx`(`institution_id`),
    INDEX `job_executions_job_type_status_idx`(`job_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `user_id` CHAR(36) NULL,
    `institution_id` CHAR(36) NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `changes` JSON NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(100) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_institution_id_idx`(`institution_id`),
    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image_cache` (
    `id` CHAR(36) NOT NULL,
    `perceptual_hash` VARCHAR(64) NOT NULL,
    `quality_score` DECIMAL(3, 2) NOT NULL,
    `is_approved` BOOLEAN NOT NULL,
    `issues` JSON NULL,
    `analysis_method` ENUM('opencv', 'gemini') NOT NULL,
    `hit_count` INTEGER NOT NULL DEFAULT 1,
    `last_accessed` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `image_cache_perceptual_hash_key`(`perceptual_hash`),
    INDEX `image_cache_perceptual_hash_idx`(`perceptual_hash`),
    INDEX `image_cache_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_config` (
    `id` CHAR(36) NOT NULL,
    `config_key` VARCHAR(100) NOT NULL,
    `config_value` TEXT NOT NULL,
    `data_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    `description` TEXT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_config_config_key_key`(`config_key`),
    INDEX `system_config_config_key_idx`(`config_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolios` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `bio` TEXT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `theme` ENUM('modern', 'classic', 'minimal', 'colorful', 'professional') NOT NULL DEFAULT 'modern',
    `theme_config` JSON NULL,
    `custom_domain` VARCHAR(100) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portfolios_student_id_key`(`student_id`),
    UNIQUE INDEX `portfolios_slug_key`(`slug`),
    INDEX `portfolios_institution_id_idx`(`institution_id`),
    INDEX `portfolios_slug_idx`(`slug`),
    INDEX `portfolios_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_sections` (
    `id` CHAR(36) NOT NULL,
    `portfolio_id` CHAR(36) NOT NULL,
    `type` ENUM('about', 'education', 'skills', 'achievements', 'projects', 'gallery', 'contact', 'custom') NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `portfolio_sections_portfolio_id_idx`(`portfolio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
    `action_url` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('email', 'sms', 'push') NOT NULL,
    `subject` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `variables` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notification_templates_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `type` ENUM('email', 'sms', 'push') NOT NULL,
    `recipient` VARCHAR(255) NOT NULL,
    `recipient_name` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('pending', 'sent', 'partial', 'failed') NOT NULL DEFAULT 'pending',
    `message_id` VARCHAR(100) NULL,
    `error_message` TEXT NULL,
    `metadata` JSON NULL,
    `priority` VARCHAR(20) NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_logs_institution_id_idx`(`institution_id`),
    INDEX `notification_logs_type_status_idx`(`type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_workflows` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `description` VARCHAR(500) NULL,
    `steps` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approval_workflows_institution_id_idx`(`institution_id`),
    INDEX `approval_workflows_type_is_active_idx`(`type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_requests` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `requester_id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `entity_type` VARCHAR(50) NULL,
    `entity_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `status` ENUM('pending', 'approved', 'rejected', 'changes_requested', 'cancelled') NOT NULL DEFAULT 'pending',
    `current_step` INTEGER NOT NULL DEFAULT 1,
    `total_steps` INTEGER NOT NULL,
    `due_date` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `approval_requests_institution_id_idx`(`institution_id`),
    INDEX `approval_requests_requester_id_idx`(`requester_id`),
    INDEX `approval_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_steps` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `step_number` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `approver_role` VARCHAR(50) NOT NULL,
    `approver_user_id` CHAR(36) NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('pending', 'approved', 'rejected', 'changes_requested') NOT NULL DEFAULT 'pending',
    `approver_id` CHAR(36) NULL,
    `comments` TEXT NULL,
    `conditions` JSON NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `approval_steps_request_id_idx`(`request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_sessions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `subject_id` CHAR(36) NULL,
    `created_by_id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `type` ENUM('class', 'event', 'exam', 'activity') NOT NULL DEFAULT 'class',
    `start_time` VARCHAR(5) NOT NULL,
    `end_time` VARCHAR(5) NULL,
    `location` VARCHAR(255) NULL,
    `notes` VARCHAR(500) NULL,
    `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attendance_sessions_institution_id_idx`(`institution_id`),
    INDEX `attendance_sessions_section_id_date_idx`(`section_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_records` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `status` ENUM('present', 'absent', 'late', 'excused', 'half_day') NOT NULL DEFAULT 'present',
    `remarks` VARCHAR(200) NULL,
    `arrival_time` VARCHAR(5) NULL,
    `check_in_method` VARCHAR(20) NULL,
    `marked_by_id` CHAR(36) NULL,
    `marked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attendance_records_student_id_idx`(`student_id`),
    UNIQUE INDEX `attendance_records_session_id_student_id_key`(`session_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_invitations` ADD CONSTRAINT `admin_invitations_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_institution_roles` ADD CONSTRAINT `user_institution_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_institution_roles` ADD CONSTRAINT `user_institution_roles_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streams` ADD CONSTRAINT `streams_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streams` ADD CONSTRAINT `streams_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_stream_id_fkey` FOREIGN KEY (`stream_id`) REFERENCES `streams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_cards` ADD CONSTRAINT `id_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_cards` ADD CONSTRAINT `id_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_cards` ADD CONSTRAINT `id_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_photos` ADD CONSTRAINT `group_photos_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_photos` ADD CONSTRAINT `group_photos_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_photos` ADD CONSTRAINT `group_photos_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_photo_extractions` ADD CONSTRAINT `group_photo_extractions_group_photo_id_fkey` FOREIGN KEY (`group_photo_id`) REFERENCES `group_photos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_photo_extractions` ADD CONSTRAINT `group_photo_extractions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_schedules` ADD CONSTRAINT `exam_schedules_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_subjects` ADD CONSTRAINT `exam_subjects_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall_tickets` ADD CONSTRAINT `hall_tickets_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall_tickets` ADD CONSTRAINT `hall_tickets_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall_tickets` ADD CONSTRAINT `hall_tickets_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall_tickets` ADD CONSTRAINT `hall_tickets_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calculation_engines` ADD CONSTRAINT `calculation_engines_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marks` ADD CONSTRAINT `marks_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marks` ADD CONSTRAINT `marks_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marks` ADD CONSTRAINT `marks_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marksheets` ADD CONSTRAINT `marksheets_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marksheets` ADD CONSTRAINT `marksheets_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marksheets` ADD CONSTRAINT `marksheets_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marksheets` ADD CONSTRAINT `marksheets_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marksheets` ADD CONSTRAINT `marksheets_calculation_engine_id_fkey` FOREIGN KEY (`calculation_engine_id`) REFERENCES `calculation_engines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `library_cards` ADD CONSTRAINT `library_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `library_cards` ADD CONSTRAINT `library_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `library_cards` ADD CONSTRAINT `library_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_certificates` ADD CONSTRAINT `transfer_certificates_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_certificates` ADD CONSTRAINT `transfer_certificates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_certificates` ADD CONSTRAINT `transfer_certificates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_executions` ADD CONSTRAINT `job_executions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_sections` ADD CONSTRAINT `portfolio_sections_portfolio_id_fkey` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_workflows` ADD CONSTRAINT `approval_workflows_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `approval_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_marked_by_id_fkey` FOREIGN KEY (`marked_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
