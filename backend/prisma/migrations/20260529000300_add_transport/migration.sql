-- CreateTable
CREATE TABLE `transport_routes` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `vehicle_number` VARCHAR(50) NULL,
    `driver_name` VARCHAR(255) NULL,
    `driver_phone` VARCHAR(20) NULL,
    `capacity` INTEGER NULL,
    `fee_amount` DECIMAL(10, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transport_routes_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `transport_routes_institution_id_code_key`(`institution_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_stops` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `route_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 0,
    `pickup_time` VARCHAR(5) NULL,
    `drop_time` VARCHAR(5) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transport_stops_institution_id_idx`(`institution_id`),
    INDEX `transport_stops_route_id_idx`(`route_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_transport` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `route_id` CHAR(36) NOT NULL,
    `stop_id` CHAR(36) NULL,
    `type` ENUM('pickup', 'drop', 'both') NOT NULL DEFAULT 'both',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_transport_institution_id_idx`(`institution_id`),
    INDEX `student_transport_student_id_idx`(`student_id`),
    INDEX `student_transport_route_id_idx`(`route_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_trips` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `route_id` CHAR(36) NOT NULL,
    `trip_date` DATE NOT NULL,
    `direction` ENUM('pickup', 'drop', 'both') NOT NULL DEFAULT 'pickup',
    `status` ENUM('scheduled', 'started', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `last_latitude` DOUBLE NULL,
    `last_longitude` DOUBLE NULL,
    `last_ping_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transport_trips_institution_id_idx`(`institution_id`),
    INDEX `transport_trips_route_id_idx`(`route_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transport_routes` ADD CONSTRAINT `transport_routes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_stops` ADD CONSTRAINT `transport_stops_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_transport` ADD CONSTRAINT `student_transport_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_trips` ADD CONSTRAINT `transport_trips_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
