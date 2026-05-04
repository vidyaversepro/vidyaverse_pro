/*
  Warnings:

  - You are about to drop the column `roll_no` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slot_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `students_section_id_roll_no_key` ON `students`;

-- AlterTable
ALTER TABLE `student_form_progress` ADD COLUMN `tab_photo` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `active_tab` ENUM('academic', 'personal', 'photo', 'family', 'contact', 'other') NOT NULL DEFAULT 'academic';

-- AlterTable
ALTER TABLE `students` DROP COLUMN `roll_no`,
    ADD COLUMN `slot_id` CHAR(30) NULL,
    MODIFY `data_status` ENUM('pending', 'filled', 'enhanced', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'filled';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `image` TEXT NULL,
    MODIFY `password_hash` VARCHAR(255) NULL,
    MODIFY `global_role` ENUM('super_admin', 'admin', 'support', 'student', 'user') NULL DEFAULT 'student';

-- CreateTable
CREATE TABLE `admission_slots` (
    `id` CHAR(30) NOT NULL,
    `section_id` CHAR(36) NOT NULL,
    `roll_no` INTEGER NOT NULL,
    `status` ENUM('EMPTY', 'INVITED', 'FILLED') NOT NULL DEFAULT 'EMPTY',
    `token` VARCHAR(50) NOT NULL,
    `token_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admission_slots_token_key`(`token`),
    INDEX `admission_slots_section_id_idx`(`section_id`),
    INDEX `admission_slots_status_idx`(`status`),
    INDEX `admission_slots_token_idx`(`token`),
    UNIQUE INDEX `admission_slots_section_id_roll_no_key`(`section_id`, `roll_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_issues` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `issue_code` VARCHAR(50) NOT NULL,
    `cover_image_url` VARCHAR(500) NULL,
    `publish_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visionarium_issues_issue_code_key`(`issue_code`),
    INDEX `visionarium_issues_issue_code_idx`(`issue_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_articles` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NULL,
    `author_user_id` CHAR(36) NULL,
    `author_student_id` CHAR(36) NULL,
    `issue_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `summary` TEXT NULL,
    `language` ENUM('hi', 'en', 'hi_en') NOT NULL DEFAULT 'en',
    `category` ENUM('SCIENCE', 'MATHS', 'HISTORY', 'IT', 'ESSAY', 'POEM', 'ITIHASA', 'DARSHANA', 'BHARATIYA_VIGYAN', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('draft', 'review', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visionarium_articles_slug_key`(`slug`),
    INDEX `visionarium_articles_institution_id_idx`(`institution_id`),
    INDEX `visionarium_articles_author_user_id_idx`(`author_user_id`),
    INDEX `visionarium_articles_category_idx`(`category`),
    INDEX `visionarium_articles_status_idx`(`status`),
    INDEX `visionarium_articles_language_idx`(`language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_school_subscriptions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `plan` ENUM('basic', 'premium') NOT NULL DEFAULT 'basic',
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `visionarium_school_subscriptions_institution_id_idx`(`institution_id`),
    INDEX `visionarium_school_subscriptions_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_test_series` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `class_id` CHAR(36) NULL,
    `subject_id` CHAR(36) NULL,
    `language` ENUM('hi', 'en', 'hi_en') NOT NULL DEFAULT 'en',
    `total_marks` INTEGER NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `visionarium_test_series_institution_id_idx`(`institution_id`),
    INDEX `visionarium_test_series_class_id_idx`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_test_attempts` (
    `id` CHAR(36) NOT NULL,
    `test_series_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `score_obtained` DECIMAL(5, 2) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `response_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `visionarium_test_attempts_test_series_id_idx`(`test_series_id`),
    INDEX `visionarium_test_attempts_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visionarium_submissions` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NOT NULL,
    `submitted_by_user_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `submission_type` ENUM('article', 'poem', 'story', 'artwork', 'other') NOT NULL DEFAULT 'article',
    `body` LONGTEXT NULL,
    `content_url` VARCHAR(500) NULL,
    `status` ENUM('submitted', 'accepted', 'rejected', 'published') NOT NULL DEFAULT 'submitted',
    `linked_article_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `visionarium_submissions_institution_id_idx`(`institution_id`),
    INDEX `visionarium_submissions_submitted_by_user_id_idx`(`submitted_by_user_id`),
    INDEX `visionarium_submissions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_relationships` (
    `id` CHAR(36) NOT NULL,
    `from_user_id` CHAR(36) NOT NULL,
    `to_user_id` CHAR(36) NOT NULL,
    `relationship_type` ENUM('guardian_of', 'ward_of', 'sibling', 'teacher_of', 'student_of', 'batchmate', 'schoolmate') NOT NULL,
    `institution_id` CHAR(36) NULL,
    `since_academic_year` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `social_relationships_from_user_id_idx`(`from_user_id`),
    INDEX `social_relationships_to_user_id_idx`(`to_user_id`),
    INDEX `social_relationships_institution_id_idx`(`institution_id`),
    UNIQUE INDEX `social_relationships_from_user_id_to_user_id_relationship_ty_key`(`from_user_id`, `to_user_id`, `relationship_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_saathi_links` (
    `id` CHAR(36) NOT NULL,
    `requester_user_id` CHAR(36) NOT NULL,
    `target_user_id` CHAR(36) NOT NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'blocked', 'cancelled') NOT NULL DEFAULT 'pending',
    `context` ENUM('student', 'teacher', 'parent', 'alumni', 'other') NOT NULL DEFAULT 'other',
    `message` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `social_saathi_links_requester_user_id_idx`(`requester_user_id`),
    INDEX `social_saathi_links_target_user_id_idx`(`target_user_id`),
    INDEX `social_saathi_links_status_idx`(`status`),
    UNIQUE INDEX `social_saathi_links_requester_user_id_target_user_id_key`(`requester_user_id`, `target_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_posts` (
    `id` CHAR(36) NOT NULL,
    `institution_id` CHAR(36) NULL,
    `author_user_id` CHAR(36) NOT NULL,
    `author_student_id` CHAR(36) NULL,
    `scope` ENUM('class_only', 'institution_only', 'my_saathi', 'public_vidyaverse') NOT NULL DEFAULT 'institution_only',
    `class_id` CHAR(36) NULL,
    `section_id` CHAR(36) NULL,
    `title` VARCHAR(255) NULL,
    `body` TEXT NOT NULL,
    `media_url` VARCHAR(500) NULL,
    `linked_article_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `social_posts_institution_id_idx`(`institution_id`),
    INDEX `social_posts_author_user_id_idx`(`author_user_id`),
    INDEX `social_posts_scope_idx`(`scope`),
    INDEX `social_posts_class_id_idx`(`class_id`),
    INDEX `social_posts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_comments` (
    `id` CHAR(36) NOT NULL,
    `post_id` CHAR(36) NOT NULL,
    `author_user_id` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `social_comments_post_id_idx`(`post_id`),
    INDEX `social_comments_author_user_id_idx`(`author_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_reactions` (
    `id` CHAR(36) NOT NULL,
    `post_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `reaction_type` ENUM('prerna') NOT NULL DEFAULT 'prerna',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `social_reactions_post_id_idx`(`post_id`),
    INDEX `social_reactions_user_id_idx`(`user_id`),
    UNIQUE INDEX `social_reactions_post_id_user_id_key`(`post_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sessions_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `idToken` VARCHAR(191) NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accounts_accountId_providerId_key`(`accountId`, `providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verifications` (
    `id` CHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `verifications_identifier_value_key`(`identifier`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `students_slot_id_key` ON `students`(`slot_id`);

-- CreateIndex
CREATE INDEX `students_slot_id_idx` ON `students`(`slot_id`);

-- AddForeignKey
ALTER TABLE `admission_slots` ADD CONSTRAINT `admission_slots_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `admission_slots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_articles` ADD CONSTRAINT `visionarium_articles_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_articles` ADD CONSTRAINT `visionarium_articles_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_articles` ADD CONSTRAINT `visionarium_articles_author_student_id_fkey` FOREIGN KEY (`author_student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_articles` ADD CONSTRAINT `visionarium_articles_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `visionarium_issues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_school_subscriptions` ADD CONSTRAINT `visionarium_school_subscriptions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_test_series` ADD CONSTRAINT `visionarium_test_series_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_test_series` ADD CONSTRAINT `visionarium_test_series_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_test_series` ADD CONSTRAINT `visionarium_test_series_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_test_attempts` ADD CONSTRAINT `visionarium_test_attempts_test_series_id_fkey` FOREIGN KEY (`test_series_id`) REFERENCES `visionarium_test_series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_test_attempts` ADD CONSTRAINT `visionarium_test_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_submissions` ADD CONSTRAINT `visionarium_submissions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_submissions` ADD CONSTRAINT `visionarium_submissions_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_submissions` ADD CONSTRAINT `visionarium_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visionarium_submissions` ADD CONSTRAINT `visionarium_submissions_linked_article_id_fkey` FOREIGN KEY (`linked_article_id`) REFERENCES `visionarium_articles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_relationships` ADD CONSTRAINT `social_relationships_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_relationships` ADD CONSTRAINT `social_relationships_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_relationships` ADD CONSTRAINT `social_relationships_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_saathi_links` ADD CONSTRAINT `social_saathi_links_requester_user_id_fkey` FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_saathi_links` ADD CONSTRAINT `social_saathi_links_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_author_student_id_fkey` FOREIGN KEY (`author_student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_linked_article_id_fkey` FOREIGN KEY (`linked_article_id`) REFERENCES `visionarium_articles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_comments` ADD CONSTRAINT `social_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `social_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_comments` ADD CONSTRAINT `social_comments_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_reactions` ADD CONSTRAINT `social_reactions_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `social_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_reactions` ADD CONSTRAINT `social_reactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
