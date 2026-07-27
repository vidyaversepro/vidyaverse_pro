-- CreateTable
CREATE TABLE `staff_members` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `employee_code` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NULL,
    `designation` VARCHAR(255) NULL,
    `department` VARCHAR(255) NULL,
    `employment_type` ENUM('full_time', 'part_time', 'contract', 'visiting') NOT NULL DEFAULT 'full_time',
    `date_of_joining` DATE NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('active', 'on_leave', 'resigned', 'terminated') NOT NULL DEFAULT 'active',
    `user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `staff_members_institution_id_idx`(`institution_id`),
    INDEX `staff_members_status_idx`(`status`),
    UNIQUE INDEX `staff_members_institution_id_employee_code_key`(`institution_id`, `employee_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salary_structures` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `staff_id` CHAR(36) NOT NULL,
    `effective_from` DATE NOT NULL,
    `basic` DECIMAL(12, 2) NOT NULL,
    `hra` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `conveyance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `special` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_allowances` JSON NULL,
    `pf_enabled` BOOLEAN NOT NULL DEFAULT true,
    `esi_enabled` BOOLEAN NOT NULL DEFAULT false,
    `professional_tax` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `tds` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_deductions` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `salary_structures_institution_id_idx`(`institution_id`),
    INDEX `salary_structures_staff_id_idx`(`staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payslips` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `staff_id` CHAR(36) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `gross_earnings` DECIMAL(12, 2) NOT NULL,
    `total_deductions` DECIMAL(12, 2) NOT NULL,
    `net_pay` DECIMAL(12, 2) NOT NULL,
    `breakdown` JSON NOT NULL,
    `status` ENUM('draft', 'finalized', 'paid') NOT NULL DEFAULT 'draft',
    `pdf_url` VARCHAR(500) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payslips_institution_id_idx`(`institution_id`),
    INDEX `payslips_staff_id_idx`(`staff_id`),
    UNIQUE INDEX `payslips_staff_id_month_year_key`(`staff_id`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_requests` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `staff_id` CHAR(36) NOT NULL,
    `type` ENUM('casual', 'sick', 'earned', 'unpaid', 'maternity', 'other') NOT NULL DEFAULT 'casual',
    `from_date` DATE NOT NULL,
    `to_date` DATE NOT NULL,
    `days` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reviewed_by_user_id` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leave_requests_institution_id_idx`(`institution_id`),
    INDEX `leave_requests_staff_id_idx`(`staff_id`),
    INDEX `leave_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff_members` ADD CONSTRAINT `staff_members_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salary_structures` ADD CONSTRAINT `salary_structures_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payslips` ADD CONSTRAINT `payslips_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
