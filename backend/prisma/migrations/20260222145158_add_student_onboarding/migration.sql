-- CreateTable
CREATE TABLE `student_form_progress` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `tab_academic` BOOLEAN NOT NULL DEFAULT false,
    `tab_personal` BOOLEAN NOT NULL DEFAULT false,
    `tab_family` BOOLEAN NOT NULL DEFAULT false,
    `tab_contact` BOOLEAN NOT NULL DEFAULT false,
    `tab_other` BOOLEAN NOT NULL DEFAULT false,
    `active_tab` ENUM('academic', 'personal', 'family', 'contact', 'other') NOT NULL DEFAULT 'academic',
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_form_progress_student_id_key`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_onboarding_tokens` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `mode` ENUM('volunteer', 'selfservice') NOT NULL DEFAULT 'selfservice',
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `used_by_ip` VARCHAR(50) NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `student_onboarding_tokens_student_id_key`(`student_id`),
    UNIQUE INDEX `student_onboarding_tokens_token_key`(`token`),
    INDEX `student_onboarding_tokens_token_idx`(`token`),
    INDEX `student_onboarding_tokens_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_form_progress` ADD CONSTRAINT `student_form_progress_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_form_progress` ADD CONSTRAINT `student_form_progress_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_onboarding_tokens` ADD CONSTRAINT `student_onboarding_tokens_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_onboarding_tokens` ADD CONSTRAINT `student_onboarding_tokens_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
