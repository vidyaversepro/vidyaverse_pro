-- AlterTable
ALTER TABLE `id_cards` ADD COLUMN `pdf_object_path` VARCHAR(500) NULL,
ADD COLUMN `card_front_object_path` VARCHAR(500) NULL,
ADD COLUMN `card_back_object_path` VARCHAR(500) NULL;
