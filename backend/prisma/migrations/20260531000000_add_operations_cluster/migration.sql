-- CreateTable: hostel_blocks
CREATE TABLE `hostel_blocks` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` ENUM('boys', 'girls', 'mixed') NOT NULL DEFAULT 'boys',
    `warden_name` VARCHAR(255) NULL,
    `warden_phone` VARCHAR(20) NULL,
    `total_rooms` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hostel_blocks_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `hostel_blocks_institution_id_code_key`(`institution_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: hostel_rooms
CREATE TABLE `hostel_rooms` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `block_id` CHAR(36) NOT NULL,
    `room_number` VARCHAR(50) NOT NULL,
    `floor` INTEGER NOT NULL DEFAULT 0,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `occupied` INTEGER NOT NULL DEFAULT 0,
    `room_type` VARCHAR(50) NULL,
    `monthly_rent` DECIMAL(10, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hostel_rooms_institution_id_idx`(`institution_id`),
    INDEX `hostel_rooms_block_id_idx`(`block_id`),
    UNIQUE INDEX `hostel_rooms_block_id_room_number_key`(`block_id`, `room_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: hostel_allotments
CREATE TABLE `hostel_allotments` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `room_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `bed_number` VARCHAR(20) NULL,
    `status` ENUM('active', 'vacated') NOT NULL DEFAULT 'active',
    `allotted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vacated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hostel_allotments_institution_id_idx`(`institution_id`),
    INDEX `hostel_allotments_room_id_idx`(`room_id`),
    INDEX `hostel_allotments_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: mess_bills
CREATE TABLE `mess_bills` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `bill_month` VARCHAR(7) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    `due_date` DATE NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mess_bills_institution_id_idx`(`institution_id`),
    INDEX `mess_bills_status_idx`(`status`),
    UNIQUE INDEX `mess_bills_student_id_bill_month_key`(`student_id`, `bill_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: inventory_categories
CREATE TABLE `inventory_categories` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('consumable', 'asset') NOT NULL DEFAULT 'consumable',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `inventory_categories_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `inventory_categories_institution_id_name_key`(`institution_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: inventory_items
CREATE TABLE `inventory_items` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) NULL,
    `unit` VARCHAR(50) NOT NULL DEFAULT 'pcs',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `reorder_level` INTEGER NOT NULL DEFAULT 0,
    `unit_cost` DECIMAL(10, 2) NULL,
    `location` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `inventory_items_institution_id_idx`(`institution_id`),
    INDEX `inventory_items_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: stock_transactions
CREATE TABLE `stock_transactions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `type` ENUM('stock_in', 'stock_out', 'adjustment') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `balance_after` INTEGER NOT NULL,
    `reason` VARCHAR(500) NULL,
    `performed_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_transactions_institution_id_idx`(`institution_id`),
    INDEX `stock_transactions_item_id_idx`(`item_id`),
    INDEX `stock_transactions_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: health_records
CREATE TABLE `health_records` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `blood_group` VARCHAR(10) NULL,
    `allergies` TEXT NULL,
    `conditions` TEXT NULL,
    `height_cm` DECIMAL(5, 2) NULL,
    `weight_kg` DECIMAL(5, 2) NULL,
    `last_checkup` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `health_records_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `health_records_institution_id_student_id_key`(`institution_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: clinic_visits
CREATE TABLE `clinic_visits` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `visit_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `symptoms` TEXT NULL,
    `diagnosis` TEXT NULL,
    `treatment` TEXT NULL,
    `attended_by` VARCHAR(255) NULL,
    `guardian_notified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `clinic_visits_institution_id_idx`(`institution_id`),
    INDEX `clinic_visits_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: vaccination_records
CREATE TABLE `vaccination_records` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `vaccine_name` VARCHAR(255) NOT NULL,
    `date_administered` DATE NULL,
    `next_due` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vaccination_records_institution_id_idx`(`institution_id`),
    INDEX `vaccination_records_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: visitor_logs
CREATE TABLE `visitor_logs` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `visitor_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `purpose` VARCHAR(500) NULL,
    `whom_to_meet` VARCHAR(255) NULL,
    `badge_number` VARCHAR(50) NULL,
    `status` ENUM('checked_in', 'checked_out') NOT NULL DEFAULT 'checked_in',
    `check_in_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `check_out_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `visitor_logs_institution_id_idx`(`institution_id`),
    INDEX `visitor_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: gate_passes
CREATE TABLE `gate_passes` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `type` ENUM('early_leave', 'late_entry', 'day_out') NOT NULL DEFAULT 'early_leave',
    `reason` TEXT NULL,
    `approved_by` VARCHAR(255) NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valid_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `gate_passes_institution_id_idx`(`institution_id`),
    INDEX `gate_passes_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hostel_blocks` ADD CONSTRAINT `hostel_blocks_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hostel_rooms` ADD CONSTRAINT `hostel_rooms_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hostel_rooms` ADD CONSTRAINT `hostel_rooms_block_id_fkey` FOREIGN KEY (`block_id`) REFERENCES `hostel_blocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hostel_allotments` ADD CONSTRAINT `hostel_allotments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hostel_allotments` ADD CONSTRAINT `hostel_allotments_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mess_bills` ADD CONSTRAINT `mess_bills_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `inventory_categories` ADD CONSTRAINT `inventory_categories_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `health_records` ADD CONSTRAINT `health_records_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `clinic_visits` ADD CONSTRAINT `clinic_visits_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `vaccination_records` ADD CONSTRAINT `vaccination_records_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `visitor_logs` ADD CONSTRAINT `visitor_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `gate_passes` ADD CONSTRAINT `gate_passes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
