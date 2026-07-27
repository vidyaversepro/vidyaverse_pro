-- CreateTable
CREATE TABLE `timetable_periods` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `start_time` VARCHAR(5) NOT NULL,
    `end_time` VARCHAR(5) NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 0,
    `is_break` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `timetable_periods_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `timetable_periods_institution_id_name_key`(`institution_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_slots` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    `period_id` CHAR(36) NOT NULL,
    `subject_name` VARCHAR(255) NOT NULL,
    `subject_id` CHAR(36) NULL,
    `teacher_id` CHAR(36) NULL,
    `room` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `timetable_slots_institution_id_idx`(`institution_id`),
    INDEX `timetable_slots_section_id_idx`(`section_id`),
    INDEX `timetable_slots_teacher_id_idx`(`teacher_id`),
    UNIQUE INDEX `timetable_slots_section_id_day_of_week_period_id_key`(`section_id`, `day_of_week`, `period_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `substitutions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `slot_id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `original_teacher_id` CHAR(36) NULL,
    `substitute_teacher_id` CHAR(36) NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('planned', 'completed', 'cancelled') NOT NULL DEFAULT 'planned',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `substitutions_institution_id_idx`(`institution_id`),
    INDEX `substitutions_date_idx`(`date`),
    INDEX `substitutions_substitute_teacher_id_idx`(`substitute_teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `timetable_periods` ADD CONSTRAINT `timetable_periods_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_slots` ADD CONSTRAINT `timetable_slots_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `timetable_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substitutions` ADD CONSTRAINT `substitutions_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `timetable_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
