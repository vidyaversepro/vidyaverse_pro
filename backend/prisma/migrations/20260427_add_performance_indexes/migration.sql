-- CreateTable
CREATE TABLE `id_card_batches` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `total_requested` INTEGER NOT NULL,
    `total_succeeded` INTEGER NOT NULL DEFAULT 0,
    `total_failed` INTEGER NOT NULL DEFAULT 0,
    `failed_student_ids` VARCHAR(10000) NOT NULL DEFAULT '[]',
    `pdf_url` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `processing_time_ms` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `id_card_batches_template_id_idx`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `id_card_batches` ADD CONSTRAINT `id_card_batches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `id_card_batches` ADD CONSTRAINT `id_card_batches_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `id_card_batches_institution_id_idx` ON `id_card_batches`(`institution_id`);

-- CreateIndex
CREATE INDEX `id_cards_institution_id_status_idx` ON `id_cards`(`institution_id`, `status`);

-- CreateIndex
CREATE INDEX `students_institution_id_status_idx` ON `students`(`institution_id`, `status`);

-- CreateIndex
CREATE INDEX `students_institution_id_data_status_idx` ON `students`(`institution_id`, `data_status`);

-- CreateIndex
CREATE INDEX `templates_institution_id_service_type_idx` ON `templates`(`institution_id`, `service_type`);


