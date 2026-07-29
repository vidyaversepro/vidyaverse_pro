-- Suppression list for addresses that permanently failed delivery, fed by the
-- Resend bounce/complaint webhook.
--
-- Hand-written rather than generated. `prisma migrate diff --from-migrations`
-- produces far more than this table: schema.prisma has drifted from the recorded
-- migration history, so a generated migration would also drop foreign keys and
-- indexes that production is relying on. That drift is a separate problem and is
-- deliberately NOT addressed here.
--
-- IF NOT EXISTS so this is safe on a database where the table was created by an
-- earlier `db push`.

CREATE TABLE IF NOT EXISTS `email_suppressions` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `reason` VARCHAR(50) NOT NULL,
    `detail` TEXT NULL,
    `source` VARCHAR(50) NOT NULL DEFAULT 'resend',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_suppressions_email_key`(`email`),
    INDEX `email_suppressions_reason_idx`(`reason`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
