-- CreateTable: cce_assessments
CREATE TABLE `cce_assessments` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `term_type` ENUM('FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2') NOT NULL,
    `max_marks` DECIMAL(6, 2) NOT NULL DEFAULT 100.00,
    `weightage` INTEGER NOT NULL DEFAULT 100,
    `conducted_on` DATE NULL,
    `status` ENUM('open', 'locked') NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cce_assessments_institution_id_idx`(`institution_id`),
    INDEX `cce_assessments_section_id_idx`(`section_id`),
    INDEX `cce_assessments_term_type_idx`(`term_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: cce_marks
CREATE TABLE `cce_marks` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `assessment_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `marks_obtained` DECIMAL(6, 2) NOT NULL,
    `grade` VARCHAR(4) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cce_marks_institution_id_idx`(`institution_id`),
    INDEX `cce_marks_student_id_idx`(`student_id`),
    UNIQUE INDEX `cce_marks_assessment_id_student_id_key`(`assessment_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: assignments
CREATE TABLE `assignments` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `assigned_by` CHAR(36) NULL,
    `due_date` DATETIME(3) NULL,
    `max_marks` DECIMAL(6, 2) NULL,
    `attachment_url` VARCHAR(500) NULL,
    `status` ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `assignments_institution_id_idx`(`institution_id`),
    INDEX `assignments_section_id_idx`(`section_id`),
    INDEX `assignments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: assignment_submissions
CREATE TABLE `assignment_submissions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `assignment_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `content` TEXT NULL,
    `attachment_url` VARCHAR(500) NULL,
    `marks_obtained` DECIMAL(6, 2) NULL,
    `feedback` TEXT NULL,
    `status` ENUM('submitted', 'graded', 'late') NOT NULL DEFAULT 'submitted',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `graded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `assignment_submissions_institution_id_idx`(`institution_id`),
    INDEX `assignment_submissions_student_id_idx`(`student_id`),
    UNIQUE INDEX `assignment_submissions_assignment_id_student_id_key`(`assignment_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cce_assessments` ADD CONSTRAINT `cce_assessments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `cce_marks` ADD CONSTRAINT `cce_marks_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `cce_marks` ADD CONSTRAINT `cce_marks_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `cce_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
