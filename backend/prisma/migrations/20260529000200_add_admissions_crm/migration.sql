-- CreateTable
CREATE TABLE `enquiries` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `enquiry_number` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(255) NOT NULL,
    `guardian_name` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `class_interested` VARCHAR(255) NULL,
    `class_id` CHAR(36) NULL,
    `source` ENUM('walk_in', 'website', 'referral', 'whatsapp', 'phone', 'social', 'other') NOT NULL DEFAULT 'other',
    `status` ENUM('new', 'contacted', 'visited', 'application', 'admitted', 'lost') NOT NULL DEFAULT 'new',
    `assigned_to_user_id` CHAR(36) NULL,
    `follow_up_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `converted_student_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `enquiries_institution_id_idx`(`institution_id`),
    INDEX `enquiries_status_idx`(`status`),
    INDEX `enquiries_phone_idx`(`phone`),
    INDEX `enquiries_assigned_to_user_id_idx`(`assigned_to_user_id`),
    UNIQUE INDEX `enquiries_institution_id_enquiry_number_key`(`institution_id`, `enquiry_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enquiry_activities` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `enquiry_id` CHAR(36) NOT NULL,
    `type` ENUM('created', 'note', 'call', 'visit', 'whatsapp', 'status_change', 'converted') NOT NULL DEFAULT 'note',
    `description` TEXT NOT NULL,
    `created_by_user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `enquiry_activities_institution_id_idx`(`institution_id`),
    INDEX `enquiry_activities_enquiry_id_idx`(`enquiry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `enquiries` ADD CONSTRAINT `enquiries_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enquiry_activities` ADD CONSTRAINT `enquiry_activities_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enquiry_activities` ADD CONSTRAINT `enquiry_activities_enquiry_id_fkey` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
