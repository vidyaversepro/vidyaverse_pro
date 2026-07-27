-- CreateTable: biometric_devices
CREATE TABLE `biometric_devices` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `device_code` VARCHAR(100) NOT NULL,
    `location` VARCHAR(255) NULL,
    `device_type` ENUM('fingerprint', 'rfid', 'face') NOT NULL DEFAULT 'fingerprint',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `biometric_devices_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `biometric_devices_institution_id_device_code_key`(`institution_id`, `device_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: biometric_punches
CREATE TABLE `biometric_punches` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `device_id` CHAR(36) NOT NULL,
    `person_type` ENUM('student', 'staff') NOT NULL,
    `person_id` CHAR(36) NOT NULL,
    `punch_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `direction` ENUM('in', 'out') NOT NULL DEFAULT 'in',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `biometric_punches_institution_id_idx`(`institution_id`),
    INDEX `biometric_punches_device_id_idx`(`device_id`),
    INDEX `biometric_punches_person_id_idx`(`person_id`),
    INDEX `biometric_punches_punch_time_idx`(`punch_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: staff_attendances
CREATE TABLE `staff_attendances` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `staff_id` CHAR(36) NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('present', 'absent', 'half_day', 'leave') NOT NULL DEFAULT 'present',
    `check_in` DATETIME(3) NULL,
    `check_out` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `staff_attendances_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `staff_attendances_staff_id_attendance_date_key`(`staff_id`, `attendance_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: fee_concessions
CREATE TABLE `fee_concessions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('scholarship', 'sibling', 'staff_ward', 'merit', 'need_based') NOT NULL DEFAULT 'scholarship',
    `amount` DECIMAL(10, 2) NULL,
    `percent` DECIMAL(5, 2) NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `status` ENUM('active', 'expired') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_concessions_institution_id_idx`(`institution_id`),
    INDEX `fee_concessions_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: fee_installment_plans
CREATE TABLE `fee_installment_plans` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `num_installments` INTEGER NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_installment_plans_institution_id_idx`(`institution_id`),
    INDEX `fee_installment_plans_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: fee_installments
CREATE TABLE `fee_installments` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NOT NULL,
    `installment_no` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_installments_institution_id_idx`(`institution_id`),
    INDEX `fee_installments_plan_id_idx`(`plan_id`),
    INDEX `fee_installments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: live_classes
CREATE TABLE `live_classes` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `platform` ENUM('zoom', 'meet', 'jitsi', 'other') NOT NULL DEFAULT 'meet',
    `join_url` VARCHAR(500) NULL,
    `recording_url` VARCHAR(500) NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `duration_mins` INTEGER NOT NULL DEFAULT 45,
    `host_id` CHAR(36) NULL,
    `status` ENUM('scheduled', 'live', 'ended', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `live_classes_institution_id_idx`(`institution_id`),
    INDEX `live_classes_section_id_idx`(`section_id`),
    INDEX `live_classes_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `biometric_devices` ADD CONSTRAINT `biometric_devices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `biometric_punches` ADD CONSTRAINT `biometric_punches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `biometric_punches` ADD CONSTRAINT `biometric_punches_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `biometric_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `staff_attendances` ADD CONSTRAINT `staff_attendances_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_concessions` ADD CONSTRAINT `fee_concessions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_installment_plans` ADD CONSTRAINT `fee_installment_plans_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_installments` ADD CONSTRAINT `fee_installments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_installments` ADD CONSTRAINT `fee_installments_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `fee_installment_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `live_classes` ADD CONSTRAINT `live_classes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
