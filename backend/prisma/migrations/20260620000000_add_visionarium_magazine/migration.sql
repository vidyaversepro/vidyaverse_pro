-- AlterTable
ALTER TABLE `visionarium_articles` ADD COLUMN `article_type` ENUM('article', 'story', 'poem', 'artwork', 'interview') NULL,
    ADD COLUMN `perspective` ENUM('student', 'teacher', 'expert', 'alumni') NULL,
    ADD COLUMN `translation_of_id` CHAR(36) NULL,
    MODIFY `category` ENUM('science', 'mathematics', 'life_sciences', 'history', 'political_science', 'economics', 'information_technology', 'languages') NOT NULL DEFAULT 'science';

-- AlterTable
ALTER TABLE `visionarium_issues` DROP COLUMN `title`,
    ADD COLUMN `number` INTEGER NULL,
    ADD COLUMN `title_english` VARCHAR(255) NOT NULL,
    ADD COLUMN `title_hindi` VARCHAR(255) NULL,
    ADD COLUMN `volume` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `visionarium_articles_translation_of_id_language_key` ON `visionarium_articles`(`translation_of_id`, `language`);

-- AddForeignKey
ALTER TABLE `visionarium_articles` ADD CONSTRAINT `visionarium_articles_translation_of_id_fkey` FOREIGN KEY (`translation_of_id`) REFERENCES `visionarium_articles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

