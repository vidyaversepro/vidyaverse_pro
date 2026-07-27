-- AlterTable
ALTER TABLE `institutions`
    ADD COLUMN `monthly_whatsapp_sent` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `feature_overrides` JSON NULL,
    ADD COLUMN `module_config` JSON NULL;
