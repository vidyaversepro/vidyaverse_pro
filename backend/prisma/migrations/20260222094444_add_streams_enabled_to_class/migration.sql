-- AlterTable
ALTER TABLE `classes` ADD COLUMN `streams_enabled` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `institutions` ADD COLUMN `dark_logo_url` VARCHAR(500) NULL,
    ADD COLUMN `institution_type` ENUM('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'COACHING_INSTITUTE', 'TRAINING_CENTER') NOT NULL DEFAULT 'SCHOOL',
    ADD COLUMN `onboarding_completed` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `institution_authorities` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `designation` VARCHAR(255) NOT NULL,
    `role_type` ENUM('PRINCIPAL', 'VICE_CHANCELLOR', 'HOD', 'REGISTRAR', 'DEAN', 'DIRECTOR', 'COORDINATOR', 'TEACHER', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `signature_url` VARCHAR(500) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `institution_authorities_institution_id_idx`(`institution_id`),
    INDEX `institution_authorities_role_type_idx`(`role_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `institution_authorities` ADD CONSTRAINT `institution_authorities_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
