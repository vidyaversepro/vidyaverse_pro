-- Fix: Better Auth stores large payloads in verifications.value (e.g. the OIDC
-- authorization-code state blob). The default VARCHAR(191) overflowed
-- ("value too long"), breaking the OIDC authorize step. Widen to TEXT and drop
-- the unsupported @@unique([identifier, value]) (TEXT can't be in a plain unique
-- index, and Better Auth only queries by identifier).

-- Drop the old composite unique index (name per Prisma convention).
ALTER TABLE `verifications` DROP INDEX `verifications_identifier_value_key`;

-- Widen value to TEXT.
ALTER TABLE `verifications` MODIFY COLUMN `value` TEXT NOT NULL;

-- Plain index on identifier (how Better Auth looks rows up).
ALTER TABLE `verifications` ADD INDEX `verifications_identifier_idx` (`identifier`);
