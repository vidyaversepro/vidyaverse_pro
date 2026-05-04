-- AlterTable
ALTER TABLE `templates` ADD COLUMN `target_audience` ENUM('ALL', 'STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'ALL',
    MODIFY `service_type` ENUM('visiting_card', 'id_card', 'certificate', 'group_photo', 'portfolio', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate') NOT NULL;

-- CreateTable
CREATE TABLE `visiting_cards` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `card_number` VARCHAR(50) NOT NULL,
    `designation` VARCHAR(255) NULL,
    `department` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `website` VARCHAR(255) NULL,
    `linkedin_url` VARCHAR(500) NULL,
    `front_pdf_url` VARCHAR(500) NULL,
    `back_pdf_url` VARCHAR(500) NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `qr_code_data` TEXT NULL,
    `status` ENUM('draft', 'generated', 'approved', 'printed', 'issued', 'cancelled') NOT NULL DEFAULT 'draft',
    `issued_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visiting_cards_card_number_key`(`card_number`),
    INDEX `visiting_cards_institution_id_idx`(`institution_id`),
    INDEX `visiting_cards_status_idx`(`status`),
    INDEX `visiting_cards_user_id_idx`(`user_id`),
    INDEX `visiting_cards_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `templates_target_audience_idx` ON `templates`(`target_audience`);

-- AddForeignKey
ALTER TABLE `visiting_cards` ADD CONSTRAINT `visiting_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visiting_cards` ADD CONSTRAINT `visiting_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visiting_cards` ADD CONSTRAINT `visiting_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visiting_cards` ADD CONSTRAINT `visiting_cards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
