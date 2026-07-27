-- CreateTable: notices
CREATE TABLE `notices` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `audience` ENUM('all', 'staff', 'students', 'parents') NOT NULL DEFAULT 'all',
    `category` ENUM('circular', 'event', 'holiday', 'exam') NOT NULL DEFAULT 'circular',
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notices_institution_id_idx`(`institution_id`),
    INDEX `notices_status_idx`(`status`),
    INDEX `notices_audience_idx`(`audience`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: calendar_events
CREATE TABLE `calendar_events` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `event_type` ENUM('holiday', 'exam', 'event', 'meeting') NOT NULL DEFAULT 'event',
    `event_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `all_day` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_events_institution_id_idx`(`institution_id`),
    INDEX `calendar_events_event_date_idx`(`event_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: saved_reports
CREATE TABLE `saved_reports` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `report_type` VARCHAR(100) NOT NULL,
    `config` JSON NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `saved_reports_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: alumni
CREATE TABLE `alumni` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `graduation_year` INTEGER NULL,
    `current_organization` VARCHAR(255) NULL,
    `designation` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `linkedin_url` VARCHAR(500) NULL,
    `willing_to_mentor` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `alumni_institution_id_idx`(`institution_id`),
    INDEX `alumni_graduation_year_idx`(`graduation_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: alumni_events
CREATE TABLE `alumni_events` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `event_date` DATE NOT NULL,
    `venue` VARCHAR(255) NULL,
    `rsvp_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `alumni_events_institution_id_idx`(`institution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: placement_drives
CREATE TABLE `placement_drives` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `package_lpa` DECIMAL(8, 2) NULL,
    `drive_date` DATE NULL,
    `eligibility_criteria` TEXT NULL,
    `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_drives_institution_id_idx`(`institution_id`),
    INDEX `placement_drives_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: placement_applications
CREATE TABLE `placement_applications` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `drive_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `status` ENUM('applied', 'shortlisted', 'selected', 'rejected') NOT NULL DEFAULT 'applied',
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_applications_institution_id_idx`(`institution_id`),
    INDEX `placement_applications_student_id_idx`(`student_id`),
    UNIQUE INDEX `placement_applications_drive_id_student_id_key`(`drive_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `saved_reports` ADD CONSTRAINT `saved_reports_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `alumni` ADD CONSTRAINT `alumni_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `alumni_events` ADD CONSTRAINT `alumni_events_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `placement_drives` ADD CONSTRAINT `placement_drives_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `placement_applications` ADD CONSTRAINT `placement_applications_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `placement_applications` ADD CONSTRAINT `placement_applications_drive_id_fkey` FOREIGN KEY (`drive_id`) REFERENCES `placement_drives`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
