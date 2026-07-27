-- CreateTable
CREATE TABLE `guardians` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `whatsapp_number` VARCHAR(20) NOT NULL,
    `role` ENUM('mother', 'father', 'grandparent_paternal', 'grandparent_maternal', 'uncle', 'aunt', 'legal_guardian', 'hostel_warden', 'step_parent', 'sibling_adult', 'other') NOT NULL DEFAULT 'other',
    `preferred_language` VARCHAR(10) NULL,
    `preferred_dialect` VARCHAR(50) NULL,
    `preferred_medium` ENUM('text', 'voice') NULL,
    `marketing_consent` BOOLEAN NOT NULL DEFAULT false,
    `whatsapp_verified` BOOLEAN NOT NULL DEFAULT false,
    `source` ENUM('backfill', 'manual', 'import', 'inbound') NOT NULL DEFAULT 'backfill',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `guardians_institution_id_idx`(`institution_id`),
    INDEX `guardians_whatsapp_number_idx`(`whatsapp_number`),
    UNIQUE INDEX `guardians_institution_id_whatsapp_number_key`(`institution_id`, `whatsapp_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guardian_student_links` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `guardian_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `notify_attendance` BOOLEAN NOT NULL DEFAULT true,
    `notify_fees` BOOLEAN NOT NULL DEFAULT true,
    `notify_homework` BOOLEAN NOT NULL DEFAULT true,
    `notify_exams` BOOLEAN NOT NULL DEFAULT true,
    `notify_transport` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `guardian_student_links_institution_id_idx`(`institution_id`),
    INDEX `guardian_student_links_guardian_id_idx`(`guardian_id`),
    INDEX `guardian_student_links_student_id_idx`(`student_id`),
    UNIQUE INDEX `guardian_student_links_guardian_id_student_id_key`(`guardian_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guardians` ADD CONSTRAINT `guardians_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guardian_student_links` ADD CONSTRAINT `guardian_student_links_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guardian_student_links` ADD CONSTRAINT `guardian_student_links_guardian_id_fkey` FOREIGN KEY (`guardian_id`) REFERENCES `guardians`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guardian_student_links` ADD CONSTRAINT `guardian_student_links_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
