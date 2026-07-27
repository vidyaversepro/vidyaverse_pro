-- AlterTable
ALTER TABLE `students` ADD COLUMN `user_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `certificates_institution_id_fkey` ON `certificates`(`institution_id`);

-- CreateIndex
CREATE INDEX `hall_tickets_institution_id_fkey` ON `hall_tickets`(`institution_id`);

-- CreateIndex
CREATE INDEX `library_cards_institution_id_fkey` ON `library_cards`(`institution_id`);

-- CreateIndex
CREATE UNIQUE INDEX `students_user_id_key` ON `students`(`user_id`);

-- CreateIndex
CREATE INDEX `transfer_certificates_institution_id_fkey` ON `transfer_certificates`(`institution_id`);

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

