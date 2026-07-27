-- CreateTable: question_bank_items
CREATE TABLE `question_bank_items` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `subject` VARCHAR(100) NOT NULL,
    `topic` VARCHAR(150) NULL,
    `class_level` VARCHAR(20) NULL,
    `question_text` TEXT NOT NULL,
    `type` ENUM('mcq', 'true_false', 'short_answer') NOT NULL DEFAULT 'mcq',
    `options` JSON NULL,
    `correct_option` VARCHAR(255) NULL,
    `marks` INTEGER NOT NULL DEFAULT 1,
    `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
    `explanation` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `question_bank_items_institution_id_idx`(`institution_id`),
    INDEX `question_bank_items_subject_idx`(`subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: online_tests
CREATE TABLE `online_tests` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(100) NULL,
    `question_ids` JSON NOT NULL,
    `total_marks` INTEGER NOT NULL DEFAULT 0,
    `duration_mins` INTEGER NOT NULL DEFAULT 30,
    `status` ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
    `scheduled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `online_tests_institution_id_idx`(`institution_id`),
    INDEX `online_tests_section_id_idx`(`section_id`),
    INDEX `online_tests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: online_test_attempts
CREATE TABLE `online_test_attempts` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `test_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `answers` JSON NULL,
    `score` INTEGER NULL,
    `max_score` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submitted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `online_test_attempts_institution_id_idx`(`institution_id`),
    INDEX `online_test_attempts_test_id_idx`(`test_id`),
    UNIQUE INDEX `online_test_attempts_test_id_student_id_key`(`test_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question_bank_items` ADD CONSTRAINT `question_bank_items_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `online_tests` ADD CONSTRAINT `online_tests_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `online_test_attempts` ADD CONSTRAINT `online_test_attempts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `online_test_attempts` ADD CONSTRAINT `online_test_attempts_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `online_tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
