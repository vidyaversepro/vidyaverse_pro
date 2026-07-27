-- CreateTable
CREATE TABLE `inbound_media` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `guardian_id` CHAR(36) NOT NULL,
    `wa_media_id` VARCHAR(255) NOT NULL,
    `object_path` VARCHAR(500) NULL,
    `media_type` ENUM('image', 'audio', 'pdf', 'excel', 'video', 'other') NOT NULL,
    `mime_type` VARCHAR(100) NULL,
    `file_size_bytes` INTEGER NULL,
    `intent_detected` VARCHAR(100) NULL,
    `action_taken` VARCHAR(255) NULL,
    `vision_used` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('received', 'downloading', 'stored', 'processed', 'failed') NOT NULL DEFAULT 'received',
    `transcript` TEXT NULL,
    `extracted_text` TEXT NULL,
    `metadata` JSON NULL,
    `error_message` TEXT NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inbound_media_wa_media_id_key`(`wa_media_id`),
    INDEX `inbound_media_institution_id_idx`(`institution_id`),
    INDEX `inbound_media_guardian_id_idx`(`guardian_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `guardian_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NULL,
    `last_intent` VARCHAR(100) NULL,
    `last_message_at` DATETIME(3) NULL,
    `message_count` INTEGER NOT NULL DEFAULT 0,
    `context` JSON NULL,
    `service_window_expires_at` DATETIME(3) NULL,
    `open` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `conversations_institution_id_idx`(`institution_id`),
    INDEX `conversations_guardian_id_idx`(`guardian_id`),
    UNIQUE INDEX `conversations_institution_id_guardian_id_key`(`institution_id`, `guardian_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_messages` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `direction` ENUM('outbound', 'inbound') NOT NULL,
    `text` VARCHAR(2000) NOT NULL,
    `intent` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `conversation_messages_institution_id_idx`(`institution_id`),
    INDEX `conversation_messages_conversation_id_idx`(`conversation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_payment_claims` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `submitted_by_guardian_id` CHAR(36) NOT NULL,
    `object_path` VARCHAR(500) NOT NULL,
    `media_type` ENUM('image', 'audio', 'pdf', 'excel', 'video', 'other') NOT NULL,
    `claim_amount` DECIMAL(10, 2) NULL,
    `payment_method_claimed` ENUM('upi', 'card', 'netbanking', 'cash', 'cheque', 'bank_transfer') NULL,
    `status` ENUM('pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
    `reviewed_by` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_payment_claims_institution_id_idx`(`institution_id`),
    INDEX `fee_payment_claims_invoice_id_idx`(`invoice_id`),
    INDEX `fee_payment_claims_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inbound_media` ADD CONSTRAINT `inbound_media_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_messages` ADD CONSTRAINT `conversation_messages_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_messages` ADD CONSTRAINT `conversation_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_payment_claims` ADD CONSTRAINT `fee_payment_claims_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_payment_claims` ADD CONSTRAINT `fee_payment_claims_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
