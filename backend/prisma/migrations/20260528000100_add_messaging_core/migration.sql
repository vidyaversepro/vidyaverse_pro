-- AlterTable
ALTER TABLE `institutions`
    ADD COLUMN `whatsapp_phone_number_id` VARCHAR(50) NULL,
    ADD COLUMN `whatsapp_waba_id` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `message_templates` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `meta_template_name` VARCHAR(255) NULL,
    `category` ENUM('utility', 'authentication', 'marketing', 'service') NOT NULL,
    `channel` ENUM('whatsapp', 'sms') NOT NULL DEFAULT 'whatsapp',
    `language` VARCHAR(10) NOT NULL,
    `dialect` VARCHAR(50) NULL,
    `body_text` TEXT NOT NULL,
    `placeholders` JSON NULL,
    `button_config` JSON NULL,
    `status` ENUM('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    `meta_template_id` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `message_templates_institution_id_idx`(`institution_id`),
    INDEX `message_templates_code_idx`(`code`),
    UNIQUE INDEX `message_templates_institution_id_code_language_key`(`institution_id`, `code`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outbox` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `recipient_type` ENUM('guardian', 'staff') NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `channel` ENUM('whatsapp', 'sms', 'ivr') NOT NULL DEFAULT 'whatsapp',
    `template_code` VARCHAR(100) NOT NULL,
    `variables` JSON NULL,
    `category` ENUM('utility', 'authentication', 'marketing', 'service') NULL,
    `priority` ENUM('critical', 'high', 'normal', 'low') NOT NULL DEFAULT 'normal',
    `idempotency_key` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    `window_used` BOOLEAN NOT NULL DEFAULT false,
    `sent_at` DATETIME(3) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `last_error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `outbox_idempotency_key_key`(`idempotency_key`),
    INDEX `outbox_institution_id_idx`(`institution_id`),
    INDEX `outbox_status_idx`(`status`),
    INDEX `outbox_recipient_type_recipient_id_idx`(`recipient_type`, `recipient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `outbox_id` CHAR(36) NULL,
    `guardian_id` CHAR(36) NULL,
    `staff_id` CHAR(36) NULL,
    `channel` ENUM('whatsapp', 'sms', 'ivr') NOT NULL,
    `template_code` VARCHAR(100) NULL,
    `wa_message_id` VARCHAR(255) NULL,
    `direction` ENUM('outbound', 'inbound') NOT NULL,
    `category` ENUM('utility', 'authentication', 'marketing', 'service') NULL,
    `status` VARCHAR(50) NOT NULL,
    `delivered_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `messages_institution_id_idx`(`institution_id`),
    INDEX `messages_guardian_id_idx`(`guardian_id`),
    INDEX `messages_wa_message_id_idx`(`wa_message_id`),
    INDEX `messages_outbox_id_idx`(`outbox_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digest_queue` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `guardian_id` CHAR(36) NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `event_payload` JSON NOT NULL,
    `scheduled_for` DATETIME(3) NOT NULL,
    `sent_at` DATETIME(3) NULL,
    `outbox_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `digest_queue_institution_id_idx`(`institution_id`),
    INDEX `digest_queue_guardian_id_idx`(`guardian_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `message_templates` ADD CONSTRAINT `message_templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outbox` ADD CONSTRAINT `outbox_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_outbox_id_fkey` FOREIGN KEY (`outbox_id`) REFERENCES `outbox`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digest_queue` ADD CONSTRAINT `digest_queue_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digest_queue` ADD CONSTRAINT `digest_queue_outbox_id_fkey` FOREIGN KEY (`outbox_id`) REFERENCES `outbox`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
