-- AlterTable: User — reconciliation columns
ALTER TABLE `users`
    ADD COLUMN `alternate_emails` JSON NULL,
    ADD COLUMN `external_subjects` JSON NULL;

-- CreateTable: oauth_applications (Better Auth oidc-provider plugin — RP registry)
CREATE TABLE `oauth_applications` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(500) NULL,
    `metadata` TEXT NULL,
    `client_id` VARCHAR(255) NOT NULL,
    `client_secret` VARCHAR(512) NULL,
    `redirect_urls` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'web',
    `disabled` BOOLEAN NOT NULL DEFAULT false,
    `user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `oauth_applications_client_id_key`(`client_id`),
    INDEX `oauth_applications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: oauth_access_tokens
CREATE TABLE `oauth_access_tokens` (
    `id` CHAR(36) NOT NULL,
    `access_token` VARCHAR(512) NOT NULL,
    `refresh_token` VARCHAR(512) NOT NULL,
    `access_token_expires_at` DATETIME(3) NOT NULL,
    `refresh_token_expires_at` DATETIME(3) NOT NULL,
    `client_id` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NULL,
    `scopes` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `oauth_access_tokens_access_token_key`(`access_token`),
    UNIQUE INDEX `oauth_access_tokens_refresh_token_key`(`refresh_token`),
    INDEX `oauth_access_tokens_client_id_idx`(`client_id`),
    INDEX `oauth_access_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: oauth_consents
CREATE TABLE `oauth_consents` (
    `id` CHAR(36) NOT NULL,
    `client_id` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `scopes` TEXT NOT NULL,
    `consent_given` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `oauth_consents_client_id_user_id_key`(`client_id`, `user_id`),
    INDEX `oauth_consents_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: jwks (Better Auth jwt plugin — rotating signing keys for JWKS endpoint)
CREATE TABLE `jwks` (
    `id` CHAR(36) NOT NULL,
    `public_key` TEXT NOT NULL,
    `private_key` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: oauth_applications → users
ALTER TABLE `oauth_applications` ADD CONSTRAINT `oauth_applications_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: oauth_access_tokens → oauth_applications, users
ALTER TABLE `oauth_access_tokens` ADD CONSTRAINT `oauth_access_tokens_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `oauth_applications`(`client_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `oauth_access_tokens` ADD CONSTRAINT `oauth_access_tokens_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: oauth_consents → oauth_applications, users
ALTER TABLE `oauth_consents` ADD CONSTRAINT `oauth_consents_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `oauth_applications`(`client_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `oauth_consents` ADD CONSTRAINT `oauth_consents_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
