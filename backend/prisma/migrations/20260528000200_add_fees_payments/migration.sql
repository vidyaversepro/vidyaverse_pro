-- AlterTable
ALTER TABLE `institutions` ADD COLUMN `razorpay_account_id` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `fee_structures` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `class_id` CHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('tuition', 'transport', 'exam', 'misc', 'lab', 'library') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `frequency` ENUM('one_time', 'monthly', 'quarterly', 'annual') NOT NULL,
    `due_day_of_month` INTEGER NULL,
    `late_fee_amount` DECIMAL(10, 2) NULL,
    `late_fee_after_days` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_structures_institution_id_idx`(`institution_id`),
    INDEX `fee_structures_class_id_idx`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_invoices` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `fee_structure_id` CHAR(36) NULL,
    `invoice_number` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `late_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `net_amount` DECIMAL(10, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('unpaid', 'partial', 'paid', 'waived', 'cancelled') NOT NULL DEFAULT 'unpaid',
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `paid_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `payment_link_url` VARCHAR(500) NULL,
    `gateway_order_id` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_invoices_institution_id_idx`(`institution_id`),
    INDEX `fee_invoices_student_id_idx`(`student_id`),
    INDEX `fee_invoices_status_idx`(`status`),
    INDEX `fee_invoices_gateway_order_id_idx`(`gateway_order_id`),
    UNIQUE INDEX `fee_invoices_institution_id_invoice_number_key`(`institution_id`, `invoice_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_payments` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paid_by_guardian_id` CHAR(36) NULL,
    `method` ENUM('upi', 'card', 'netbanking', 'cash', 'cheque', 'bank_transfer') NOT NULL,
    `gateway_provider` ENUM('razorpay', 'cashfree') NULL,
    `gateway_payment_id` VARCHAR(255) NULL,
    `gateway_order_id` VARCHAR(255) NULL,
    `status` ENUM('initiated', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'initiated',
    `paid_at` DATETIME(3) NULL,
    `receipt_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_payments_institution_id_idx`(`institution_id`),
    INDEX `fee_payments_invoice_id_idx`(`invoice_id`),
    INDEX `fee_payments_gateway_payment_id_idx`(`gateway_payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fee_structures` ADD CONSTRAINT `fee_structures_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_invoices` ADD CONSTRAINT `fee_invoices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_invoices` ADD CONSTRAINT `fee_invoices_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_invoices` ADD CONSTRAINT `fee_invoices_fee_structure_id_fkey` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_payments` ADD CONSTRAINT `fee_payments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_payments` ADD CONSTRAINT `fee_payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
