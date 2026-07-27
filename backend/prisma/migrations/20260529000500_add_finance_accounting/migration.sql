-- CreateTable
CREATE TABLE `ledger_accounts` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('asset', 'liability', 'income', 'expense', 'equity') NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ledger_accounts_institution_id_idx`(`institution_id`),
    INDEX `ledger_accounts_type_idx`(`type`),
    UNIQUE INDEX `ledger_accounts_institution_id_code_key`(`institution_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entries` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `voucher_number` VARCHAR(50) NOT NULL,
    `entry_date` DATE NOT NULL,
    `type` ENUM('receipt', 'payment', 'journal', 'contra') NOT NULL DEFAULT 'journal',
    `narration` TEXT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` CHAR(36) NULL,
    `status` ENUM('posted', 'void') NOT NULL DEFAULT 'posted',
    `created_by_user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `journal_entries_institution_id_idx`(`institution_id`),
    INDEX `journal_entries_entry_date_idx`(`entry_date`),
    UNIQUE INDEX `journal_entries_institution_id_voucher_number_key`(`institution_id`, `voucher_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_lines` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `entry_id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `debit` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `credit` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `journal_lines_institution_id_idx`(`institution_id`),
    INDEX `journal_lines_entry_id_idx`(`entry_id`),
    INDEX `journal_lines_account_id_idx`(`account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ledger_accounts` ADD CONSTRAINT `ledger_accounts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `journal_entries_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_lines` ADD CONSTRAINT `journal_lines_entry_id_fkey` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
