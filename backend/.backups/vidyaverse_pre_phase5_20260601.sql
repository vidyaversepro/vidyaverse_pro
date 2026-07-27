mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: vidyaverse
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `vidyaverse`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `vidyaverse` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `vidyaverse`;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0031a3ed-d608-4ead-8286-f279e2587ad5','331f3d815f159b00a8f3987ecce28c1b3a8a43029ec42420a4826246c5184d48','2026-05-29 14:20:56.398','20260529000500_add_finance_accounting',NULL,NULL,'2026-05-29 14:20:55.810',1),('300e5f69-afc5-4146-8183-cad67cff08e8','a96d67e5ba08283fe341577d48e94c3ea10d8a6d0ca4178acf2d97d784257265','2026-04-27 02:25:44.029','20260427_add_performance_indexes','',NULL,'2026-04-27 02:25:44.029',0),('32640041-c074-48fc-8e57-300a1aa68d98','5c9c6cb67033a50d1bc06504381128a7f47e2ed7edd8fc956b2d4ad84d1de462','2026-05-30 16:51:43.959','20260531000100_add_academics_cluster',NULL,NULL,'2026-05-30 16:51:43.115',1),('3ce755b0-e836-4726-b847-405989cf6363','3f3a0d748f0d2bd7cdcc6e429adbebc818247da70ba7267cbd1218d2be6c1695','2026-04-27 02:12:44.379','20260219234920_add_admin_invitation','',NULL,'2026-04-27 02:12:44.379',0),('3f4939eb-8735-4da9-8dbb-a1ffa7db2bf8','553c60edf5e039f687a48377394815eadd772340223657c385a6eab109cd2692','2026-04-27 02:12:48.508','20260222145158_add_student_onboarding','',NULL,'2026-04-27 02:12:48.508',0),('415397d6-3087-4615-8205-673495b53055','db150a87748b441e861cd9e3e26be86167de22ced63d6d9920adcd29025c232c','2026-05-29 20:21:35.814','20260530000000_add_oidc_provider',NULL,NULL,'2026-05-29 20:21:34.874',1),('4ba68f4a-124a-42a9-90b3-39d84d4da175','bf51a557dd76444ffe948bce07d869bc5a6743944f3ea9442dda943bac8f0396','2026-05-28 07:03:53.450','20260528000100_add_messaging_core',NULL,NULL,'2026-05-28 07:03:51.723',1),('4e51d84e-6fa3-40a9-89d5-f2830d13437d','a96d67e5ba08283fe341577d48e94c3ea10d8a6d0ca4178acf2d97d784257265',NULL,'20260427_add_performance_indexes','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260427_add_performance_indexes\n\nDatabase error code: 1061\n\nDatabase error:\nDuplicate key name \'id_card_batches_institution_id_idx\'\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226','2026-04-27 02:25:44.011','2026-04-27 02:24:51.158',0),('5e99a59c-0597-4eca-9628-c7e38a89a710','034b732bae787f9143e1b3c6283496e2d8d04edeaa681dda187183c389acc222',NULL,'20260427_add_performance_indexes','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260427_add_performance_indexes\n\nDatabase error code: 1176\n\nDatabase error:\nKey \'id_cards_institution_id_fkey\' doesn\'t exist in table \'id_cards\'\n\nPlease check the query number 6 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226','2026-04-27 02:24:48.354','2026-04-27 02:23:41.953',0),('60a90e1d-3cc0-4568-9250-1a8357533ebf','869239929b469a887311f361596b42d60b1e522ee4481e0f7eb43e1aa75c03f9','2026-05-28 22:57:03.570','20260529000000_add_inbound_pipeline',NULL,NULL,'2026-05-28 22:57:02.617',1),('69e5ce22-13da-41b0-886e-92bd610b2ddc','93594d0765aadfc3210e710f9f17d2c0d40a4f3e6d54f41c079114847e0d30ca','2026-04-27 02:12:50.613','20260222225555_add_class_teacher','',NULL,'2026-04-27 02:12:50.613',0),('6fe4eb10-0890-4cab-b89f-118c70d52a78','4994ac438fb67eb6d2d8a2f8ccaefc1efd0bcf2214f32e7dfb32d10e63f30213','2026-05-29 00:54:15.801','20260529000200_add_admissions_crm',NULL,NULL,'2026-05-29 00:54:15.277',1),('8451dee5-cfdd-4174-9ea0-729d6c864eab','84268563029924d165976fc09d61ea2036e96d4f69042d92735b8a19e29ab5e4','2026-05-31 05:05:36.207','20260531000400_fix_verification_value_text',NULL,NULL,'2026-05-31 05:05:35.907',1),('854fed0c-35f2-45c7-a6ac-fccfeb673b8b','4a6c71323913d6d523156c4d0ff4cfb3523dd122305ffa09c9ba4c0838632f00','2026-04-27 02:12:54.792','20260321045326_add_visiting_card_and_template_audience','',NULL,'2026-04-27 02:12:54.792',0),('91e1288f-6916-41c6-8f5b-d0367a30de6f','97800b7f60140322889363965bbaf88909b9d8ce7c27dabb292afd22e85a40ec','2026-04-27 02:12:46.471','20260222094444_add_streams_enabled_to_class','',NULL,'2026-04-27 02:12:46.471',0),('9bcbad4e-5c70-4c3f-9533-5047dd0f0ba2','2049067da36206587117a6e38dc61768c2a9a166132d09002e5d1b65e9df236c','2026-04-27 02:12:52.676','20260313125441_fix_admin_invitation','',NULL,'2026-04-27 02:12:52.676',0),('accf7697-1ed2-4a03-84e9-cbbdad632399','32306fa92cb88a0ff874080430abf1435020227e6913ae39ec9e5a1b52d99d1e','2026-05-28 18:27:05.468','20260528000200_add_fees_payments',NULL,NULL,'2026-05-28 18:27:04.220',1),('b2f82c46-dbc4-4f0c-a7dc-f55d62c51106','7be49ff3623d1695ae0be1b46d8cdf525f89a2016121d3a10256330c5ddf09f0','2026-05-30 17:24:06.174','20260531000300_add_extensions_cluster',NULL,NULL,'2026-05-30 17:24:04.709',1),('b55ede66-2e03-4cd5-86e2-00c66f0faf53','e7d742b46edf96fb81b65f218d6ebb37a8fe43baf9b5e19bfe8680ba8a7dc1b3','2026-05-29 00:31:49.136','20260529000100_add_entitlement_fields',NULL,NULL,'2026-05-29 00:31:48.739',1),('c42e8f16-96be-4ebb-8241-09f7e95c0e94','02743f03c3e0444b31af306ec468cdc64003296d7b0b384bc38d37b107253812','2026-05-28 07:03:51.684','20260528000000_add_guardian_model',NULL,NULL,'2026-05-28 07:03:50.616',1),('c54afb2b-0832-4213-8f2e-1dc47a20a795','915b435a0f8b520b95cd78c6f0edd009572b6ab323288941ec6860b4a90ae0c2','2026-05-29 14:31:32.099','20260529000600_add_timetable',NULL,NULL,'2026-05-29 14:31:31.540',1),('c75562a7-12d5-42ed-8523-e928257367c7','815b3124b59a9a0830f55a0144d2ef110bad21ba3aaf2ccc481100b2799108f0','2026-05-31 17:25:18.960','20260531000500_add_assessments_online',NULL,NULL,'2026-05-31 17:25:16.970',1),('c8304ee1-0202-4600-b288-da832717e73f','c12994065e1e3145b5a05183d9188c5e9ed31c984c7b049e03b73918761870b6','2026-05-29 13:55:58.186','20260529000300_add_transport',NULL,NULL,'2026-05-29 13:55:57.576',1),('d53ba645-a0f1-4270-a55d-28b7e33e622d','29877c3e5acbca3c63cf6dc1953e115ce5ac6ffccc259a3273752bcf3ee5a890','2026-04-27 03:21:55.214','20260427100000_add_pdf_object_path','',NULL,'2026-04-27 03:21:55.214',0),('db144c83-0bde-4f3f-8a76-2ae538abe794','cbb1ae23e53ad7c53fc2ce7a783ee6f0cfc4167ca87e08f74af9520f5e18af4e',NULL,'20260427_add_performance_indexes','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260427_add_performance_indexes\n\nDatabase error code: 1064\n\nDatabase error:\nYou have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near \'﻿-- CreateIndex\r\nCREATE INDEX `id_card_batches_institution_id_idx` ON `id_card\' at line 1\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260427_add_performance_indexes\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226','2026-04-27 02:22:57.555','2026-04-27 02:22:18.307',0),('e11e8bc8-a57f-460c-9f0b-9d6ad3e5dbf6','f05a7a1181a044e05b27ff3229700543256c7deec0d17afcb27eddd48c7c0008','2026-05-30 16:41:33.422','20260531000000_add_operations_cluster',NULL,NULL,'2026-05-30 16:41:31.194',1),('f94a62cc-d3a6-4f57-90e6-d1a1604336b1','e7cef107fa0fcbc317578821606f5dee9e845e5af8b74b54621a2f9868712ac5','2026-05-29 14:11:55.929','20260529000400_add_hr_payroll',NULL,NULL,'2026-05-29 14:11:55.236',1),('fb3528a3-2ccb-4684-b90b-dc52b4c7f23a','4642f0c0689bc7d97ec6ab4366854b259d0b74ce79888b126293f661889f21e7','2026-05-30 17:02:49.749','20260531000200_add_insights_cluster',NULL,NULL,'2026-05-30 17:02:48.655',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refreshToken` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idToken` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accessTokenExpiresAt` datetime(3) DEFAULT NULL,
  `refreshTokenExpiresAt` datetime(3) DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_accountId_providerId_key` (`accountId`,`providerId`),
  KEY `accounts_userId_fkey` (`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('aa4b7bfa-97c9-4e00-8c61-2efd7d6d1f2f','thevinstitution@gmail.com','credential','1d5d687b-8d05-4af5-b92d-347f85c46bcf',NULL,NULL,NULL,NULL,NULL,NULL,'7684a24b8a32f7a3f1cc595837a73e61:2a60083f96e263dfb9e95f3faf917da54786382fa6e59e6581baab856b79139dadf1cd6f78bb32c320e3bbf5f610a8eee771d72f49c7944b34d95b1ac95284cc','2026-04-25 03:38:11.883','2026-04-25 20:34:18.469');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_invitations`
--

DROP TABLE IF EXISTS `admin_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_invitations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `status` enum('pending','accepted','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_invitations_token_key` (`token`),
  KEY `admin_invitations_email_idx` (`email`),
  KEY `admin_invitations_token_idx` (`token`),
  KEY `admin_invitations_institution_id_idx` (`institution_id`),
  CONSTRAINT `admin_invitations_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_invitations`
--

LOCK TABLES `admin_invitations` WRITE;
/*!40000 ALTER TABLE `admin_invitations` DISABLE KEYS */;
INSERT INTO `admin_invitations` VALUES ('f3f2c4c7-c18e-4c1d-84f4-82a18ba22454','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','study0644@gmail.com','c2adf5496f1ff1cf8c1aa53f49bfb12ee42cac2c1e41a1b90120eaaaa6893e75','2026-04-29 03:50:53.089','pending','2026-04-28 03:50:53.204','2026-04-28 03:50:53.204');
/*!40000 ALTER TABLE `admin_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_slots`
--

DROP TABLE IF EXISTS `admission_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_slots` (
  `id` char(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roll_no` int NOT NULL,
  `status` enum('EMPTY','INVITED','FILLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMPTY',
  `token` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_slots_token_key` (`token`),
  UNIQUE KEY `admission_slots_section_id_roll_no_key` (`section_id`,`roll_no`),
  KEY `admission_slots_section_id_idx` (`section_id`),
  KEY `admission_slots_status_idx` (`status`),
  KEY `admission_slots_token_idx` (`token`),
  CONSTRAINT `admission_slots_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_slots`
--

LOCK TABLES `admission_slots` WRITE;
/*!40000 ALTER TABLE `admission_slots` DISABLE KEYS */;
INSERT INTO `admission_slots` VALUES ('cmoi3abqo0002hlfcb23zxq44','da3b6006-d1c3-4c7a-8ad9-e1939d110875',1,'EMPTY','5Hdcyx7u7a','2026-05-28 03:51:37.964','2026-04-28 03:51:37.968'),('cmoi3abqo0003hlfcjyf2d1bd','da3b6006-d1c3-4c7a-8ad9-e1939d110875',2,'EMPTY','-pQBfOFXxj','2026-05-28 03:51:37.964','2026-04-28 03:51:37.968'),('cmoi3abqo0004hlfcy3zqozih','da3b6006-d1c3-4c7a-8ad9-e1939d110875',3,'EMPTY','DGS1_pNb7a','2026-05-28 03:51:37.964','2026-04-28 03:51:37.968'),('cmoi3abqo0005hlfcq28isae7','da3b6006-d1c3-4c7a-8ad9-e1939d110875',4,'EMPTY','8kH5ZJmDFU','2026-05-28 03:51:37.964','2026-04-28 03:51:37.968'),('cmoi3abqo0006hlfch6ff6sz6','da3b6006-d1c3-4c7a-8ad9-e1939d110875',5,'EMPTY','PwapuKseV9','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0007hlfcr300i88r','da3b6006-d1c3-4c7a-8ad9-e1939d110875',6,'EMPTY','orpcAYHo7n','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0008hlfcwqmywhu3','da3b6006-d1c3-4c7a-8ad9-e1939d110875',7,'EMPTY','rLj_ERYHSk','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0009hlfcy9ok2jbt','da3b6006-d1c3-4c7a-8ad9-e1939d110875',8,'EMPTY','jsjS6762xM','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000ahlfcz744x8db','da3b6006-d1c3-4c7a-8ad9-e1939d110875',9,'EMPTY','2RKJR9DirO','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000bhlfcndbc2pg5','da3b6006-d1c3-4c7a-8ad9-e1939d110875',10,'EMPTY','USxX7b4ZT7','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000chlfctwz3nm6s','da3b6006-d1c3-4c7a-8ad9-e1939d110875',11,'EMPTY','BpWEZkECO7','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000dhlfcyjs3co7r','da3b6006-d1c3-4c7a-8ad9-e1939d110875',12,'EMPTY','W_6T8BzR2X','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000ehlfcafe1dfug','da3b6006-d1c3-4c7a-8ad9-e1939d110875',13,'EMPTY','3iznWhXGIc','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000fhlfcxn3j4ha7','da3b6006-d1c3-4c7a-8ad9-e1939d110875',14,'EMPTY','SoCo7d7BGC','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000ghlfchlsn3mvd','da3b6006-d1c3-4c7a-8ad9-e1939d110875',15,'EMPTY','WH2mtISHrR','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000hhlfcjlwxkvga','da3b6006-d1c3-4c7a-8ad9-e1939d110875',16,'EMPTY','94aRKpNusW','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000ihlfcge2slyz9','da3b6006-d1c3-4c7a-8ad9-e1939d110875',17,'EMPTY','A9S49MpH6N','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000jhlfc2p86y4mf','da3b6006-d1c3-4c7a-8ad9-e1939d110875',18,'EMPTY','t-6REeJwsk','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000khlfc9zad2dg3','da3b6006-d1c3-4c7a-8ad9-e1939d110875',19,'EMPTY','OlmAsdp_zA','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000lhlfcikjdbmr9','da3b6006-d1c3-4c7a-8ad9-e1939d110875',20,'EMPTY','Rc2ObWLZYm','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000mhlfc4cw4f6no','da3b6006-d1c3-4c7a-8ad9-e1939d110875',21,'EMPTY','_mJpe93Wvd','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000nhlfc7pm1mmrw','da3b6006-d1c3-4c7a-8ad9-e1939d110875',22,'EMPTY','BUg5mqYo0Y','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000ohlfcc61jebuy','da3b6006-d1c3-4c7a-8ad9-e1939d110875',23,'EMPTY','wunBT26JFj','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000phlfcpcs631na','da3b6006-d1c3-4c7a-8ad9-e1939d110875',24,'EMPTY','RaXGe4HWMn','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000qhlfcmu3nbhvd','da3b6006-d1c3-4c7a-8ad9-e1939d110875',25,'EMPTY','hfw9_ZR3QK','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000rhlfccmgekwsu','da3b6006-d1c3-4c7a-8ad9-e1939d110875',26,'EMPTY','65nzJtcCOA','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000shlfce2nkc8ll','da3b6006-d1c3-4c7a-8ad9-e1939d110875',27,'EMPTY','QAZnuFXlMA','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000thlfcmxb144tm','da3b6006-d1c3-4c7a-8ad9-e1939d110875',28,'EMPTY','nCs_l-X0HQ','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000uhlfc99dyqrze','da3b6006-d1c3-4c7a-8ad9-e1939d110875',29,'EMPTY','Y0lqK6mpys','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000vhlfckfqnowt0','da3b6006-d1c3-4c7a-8ad9-e1939d110875',30,'EMPTY','qbH3jRY_Kx','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000whlfc7o0nd8qd','da3b6006-d1c3-4c7a-8ad9-e1939d110875',31,'EMPTY','BVbMsa_HPl','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000xhlfcjyi36ds3','da3b6006-d1c3-4c7a-8ad9-e1939d110875',32,'EMPTY','4nAZvsG1Tr','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000yhlfck9f9pc1u','da3b6006-d1c3-4c7a-8ad9-e1939d110875',33,'EMPTY','LnBAkIZzEN','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo000zhlfc0gwl554z','da3b6006-d1c3-4c7a-8ad9-e1939d110875',34,'EMPTY','wK-7gx7Kn5','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0010hlfcb4aq8fpv','da3b6006-d1c3-4c7a-8ad9-e1939d110875',35,'EMPTY','hwCmuSSrCd','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0011hlfca4vkw878','da3b6006-d1c3-4c7a-8ad9-e1939d110875',36,'EMPTY','A4oV_IBb2X','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0012hlfcf3fkuhr9','da3b6006-d1c3-4c7a-8ad9-e1939d110875',37,'EMPTY','m5cOtM_Zm-','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0013hlfcqe1juvtl','da3b6006-d1c3-4c7a-8ad9-e1939d110875',38,'EMPTY','X9qN2O8PWG','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0014hlfc7n0z5zbx','da3b6006-d1c3-4c7a-8ad9-e1939d110875',39,'EMPTY','NvWeYec0V0','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abqo0015hlfcx0d3b0og','da3b6006-d1c3-4c7a-8ad9-e1939d110875',40,'EMPTY','allTEix_QQ','2026-05-28 03:51:37.965','2026-04-28 03:51:37.968'),('cmoi3abtk0017hlfcsska4ert','3390bf16-3beb-40d8-803d-be2001148d93',1,'EMPTY','PfvaoVVIFe','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk0018hlfcb4xlg9cu','3390bf16-3beb-40d8-803d-be2001148d93',2,'EMPTY','BgDpZa5FzK','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk0019hlfcrier7omf','3390bf16-3beb-40d8-803d-be2001148d93',3,'EMPTY','e0jQeU0cDg','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001ahlfcphdnfc22','3390bf16-3beb-40d8-803d-be2001148d93',4,'EMPTY','UxrotwkYur','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001bhlfcm9arr4qi','3390bf16-3beb-40d8-803d-be2001148d93',5,'EMPTY','7c8ndc0RvZ','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001chlfcbqhwut8e','3390bf16-3beb-40d8-803d-be2001148d93',6,'EMPTY','k5gTD_VwYK','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001dhlfcsqpepvo8','3390bf16-3beb-40d8-803d-be2001148d93',7,'EMPTY','YHUQpkXiGQ','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001ehlfcoz3rynxq','3390bf16-3beb-40d8-803d-be2001148d93',8,'EMPTY','GISz3wziSS','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001fhlfc8hq5xqy7','3390bf16-3beb-40d8-803d-be2001148d93',9,'EMPTY','wLxRxZTuP7','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001ghlfclrvllggw','3390bf16-3beb-40d8-803d-be2001148d93',10,'EMPTY','c0Tp3ustcq','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001hhlfc0kjq1f27','3390bf16-3beb-40d8-803d-be2001148d93',11,'EMPTY','cnM2nz9yMq','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001ihlfco4wmt0rk','3390bf16-3beb-40d8-803d-be2001148d93',12,'EMPTY','K_ER6VGtja','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001jhlfcxq2xpp4n','3390bf16-3beb-40d8-803d-be2001148d93',13,'EMPTY','NMTF2ARvy2','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001khlfcptibt01v','3390bf16-3beb-40d8-803d-be2001148d93',14,'EMPTY','XzCccqYLQd','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001lhlfcu5azirgy','3390bf16-3beb-40d8-803d-be2001148d93',15,'EMPTY','NnTruw2r_D','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001mhlfclp9i075r','3390bf16-3beb-40d8-803d-be2001148d93',16,'EMPTY','zngdC6FUP7','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001nhlfcppy3zqkk','3390bf16-3beb-40d8-803d-be2001148d93',17,'EMPTY','Kk6aQrep9Z','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001ohlfcq27h8b44','3390bf16-3beb-40d8-803d-be2001148d93',18,'EMPTY','QtLUZTTBO0','2026-05-28 03:51:38.070','2026-04-28 03:51:38.073'),('cmoi3abtk001phlfcn7n2thc9','3390bf16-3beb-40d8-803d-be2001148d93',19,'EMPTY','k1KbGjD8at','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtk001qhlfc3nu322rc','3390bf16-3beb-40d8-803d-be2001148d93',20,'EMPTY','Tp71f3fnIC','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtk001rhlfctkszl0fi','3390bf16-3beb-40d8-803d-be2001148d93',21,'EMPTY','tRW2p1tlZ8','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtk001shlfcbq4v8al6','3390bf16-3beb-40d8-803d-be2001148d93',22,'EMPTY','JnC2YbjrQI','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtk001thlfcxsm2phzp','3390bf16-3beb-40d8-803d-be2001148d93',23,'EMPTY','1CzDckEOD5','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtk001uhlfcbzdwo650','3390bf16-3beb-40d8-803d-be2001148d93',24,'EMPTY','hyz05lzj_u','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl001vhlfc70pytw6g','3390bf16-3beb-40d8-803d-be2001148d93',25,'EMPTY','wr4H55VlJD','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl001whlfcqla5zo11','3390bf16-3beb-40d8-803d-be2001148d93',26,'EMPTY','MlhrdmTR3H','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl001xhlfcy9msqecc','3390bf16-3beb-40d8-803d-be2001148d93',27,'EMPTY','lc_hLZ9LrE','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl001yhlfc6a3wjdwt','3390bf16-3beb-40d8-803d-be2001148d93',28,'EMPTY','-ysg6cJwbL','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl001zhlfcgd1tv9u1','3390bf16-3beb-40d8-803d-be2001148d93',29,'EMPTY','Y95todkUVM','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0020hlfc2i1zp751','3390bf16-3beb-40d8-803d-be2001148d93',30,'EMPTY','20jc5Kk0aV','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0021hlfcbo9naey4','3390bf16-3beb-40d8-803d-be2001148d93',31,'EMPTY','9k-_Ret0j_','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0022hlfce6q1z0dg','3390bf16-3beb-40d8-803d-be2001148d93',32,'EMPTY','LPCskyS3qX','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0023hlfccpcksgo8','3390bf16-3beb-40d8-803d-be2001148d93',33,'EMPTY','tF4d1y6LVF','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0024hlfch1lqzikv','3390bf16-3beb-40d8-803d-be2001148d93',34,'EMPTY','cz2y5drvIT','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0025hlfc58cfucxw','3390bf16-3beb-40d8-803d-be2001148d93',35,'EMPTY','DVKDa-RQdC','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0026hlfc0os959st','3390bf16-3beb-40d8-803d-be2001148d93',36,'EMPTY','4ThdiKTPZO','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0027hlfch38s610q','3390bf16-3beb-40d8-803d-be2001148d93',37,'EMPTY','5-xmqhrt56','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0028hlfczsoj9r69','3390bf16-3beb-40d8-803d-be2001148d93',38,'EMPTY','9RtszkxraC','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl0029hlfc5s9z85eo','3390bf16-3beb-40d8-803d-be2001148d93',39,'EMPTY','lCDB1CB0-Q','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3abtl002ahlfcgrqo07ub','3390bf16-3beb-40d8-803d-be2001148d93',40,'EMPTY','5D7H897GZ7','2026-05-28 03:51:38.071','2026-04-28 03:51:38.073'),('cmoi3ac1h002chlfc2ypkzuvb','d657c104-6733-43b8-a56a-d04b290ddb15',1,'EMPTY','nWdO_myPcj','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002dhlfc367fj5hp','d657c104-6733-43b8-a56a-d04b290ddb15',2,'EMPTY','PRILlhZwgm','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002ehlfcdbxrxts0','d657c104-6733-43b8-a56a-d04b290ddb15',3,'EMPTY','Q3h2pxbvEI','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002fhlfckizxitm1','d657c104-6733-43b8-a56a-d04b290ddb15',4,'EMPTY','18cx15T_WR','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002ghlfcfq7io0jb','d657c104-6733-43b8-a56a-d04b290ddb15',5,'EMPTY','4Oa_xt3ZMh','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002hhlfcp44mi1ld','d657c104-6733-43b8-a56a-d04b290ddb15',6,'EMPTY','7-LfD4GmLM','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002ihlfcugb5sser','d657c104-6733-43b8-a56a-d04b290ddb15',7,'EMPTY','gVvFW2Bzws','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002jhlfcoxynrq86','d657c104-6733-43b8-a56a-d04b290ddb15',8,'EMPTY','PMDLqLmN1X','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002khlfccw3as473','d657c104-6733-43b8-a56a-d04b290ddb15',9,'EMPTY','eFDM3O2Mex','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002lhlfcpxm44h9a','d657c104-6733-43b8-a56a-d04b290ddb15',10,'EMPTY','dNgxXHoe11','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002mhlfcpa2e8vi9','d657c104-6733-43b8-a56a-d04b290ddb15',11,'EMPTY','wfd4kS2cLl','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002nhlfco8cr72cg','d657c104-6733-43b8-a56a-d04b290ddb15',12,'EMPTY','Q3tQ9xrxm3','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002ohlfcagx3n913','d657c104-6733-43b8-a56a-d04b290ddb15',13,'EMPTY','Hi310MJuH5','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002phlfcw0rs86o2','d657c104-6733-43b8-a56a-d04b290ddb15',14,'EMPTY','nbjiYRSfry','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002qhlfc08sauyg6','d657c104-6733-43b8-a56a-d04b290ddb15',15,'EMPTY','LrjOvVKtlO','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002rhlfcttef7ag1','d657c104-6733-43b8-a56a-d04b290ddb15',16,'EMPTY','25y5d4u5OH','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002shlfcy42lsj76','d657c104-6733-43b8-a56a-d04b290ddb15',17,'EMPTY','Z-Aq1BgFCP','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002thlfcvymwpo0p','d657c104-6733-43b8-a56a-d04b290ddb15',18,'EMPTY','L1lBv9ljQN','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002uhlfc7xli8lmr','d657c104-6733-43b8-a56a-d04b290ddb15',19,'EMPTY','RazJsBx7fV','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002vhlfcntkluubk','d657c104-6733-43b8-a56a-d04b290ddb15',20,'EMPTY','Zt2osi3l9E','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002whlfce8b1gzgu','d657c104-6733-43b8-a56a-d04b290ddb15',21,'EMPTY','oeanykuT7T','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002xhlfco690htv1','d657c104-6733-43b8-a56a-d04b290ddb15',22,'EMPTY','dDi4zbGF0k','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002yhlfcvlnqa7er','d657c104-6733-43b8-a56a-d04b290ddb15',23,'EMPTY','f69cYZ2Bmo','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h002zhlfcpypxc4cj','d657c104-6733-43b8-a56a-d04b290ddb15',24,'EMPTY','uBgU1W9rNE','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0030hlfc3473jj2c','d657c104-6733-43b8-a56a-d04b290ddb15',25,'EMPTY','6FqT06Qq8-','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0031hlfc9cce0q3s','d657c104-6733-43b8-a56a-d04b290ddb15',26,'EMPTY','yVWUlD4AuK','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0032hlfczfwwb6z3','d657c104-6733-43b8-a56a-d04b290ddb15',27,'EMPTY','RIBI-lKBIK','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0033hlfchcxevuon','d657c104-6733-43b8-a56a-d04b290ddb15',28,'EMPTY','UF7YMrKQAM','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0034hlfc7862lqla','d657c104-6733-43b8-a56a-d04b290ddb15',29,'EMPTY','IIP8_KbdkM','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0035hlfcaie9xmku','d657c104-6733-43b8-a56a-d04b290ddb15',30,'EMPTY','UQeLmy1Ybc','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0036hlfctn1gg1ug','d657c104-6733-43b8-a56a-d04b290ddb15',31,'EMPTY','68h9LPyOEP','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0037hlfcoi43krja','d657c104-6733-43b8-a56a-d04b290ddb15',32,'EMPTY','FhiBD5Ic0Q','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0038hlfcdv6apaq8','d657c104-6733-43b8-a56a-d04b290ddb15',33,'EMPTY','D7_PezSc6d','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h0039hlfcwe6f4qun','d657c104-6733-43b8-a56a-d04b290ddb15',34,'EMPTY','CeLdHu1VqH','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003ahlfcqdii8wgn','d657c104-6733-43b8-a56a-d04b290ddb15',35,'EMPTY','_IzdUgc9KE','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003bhlfcfzry7ozq','d657c104-6733-43b8-a56a-d04b290ddb15',36,'EMPTY','pHKsYJZAHv','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003chlfckujsy5px','d657c104-6733-43b8-a56a-d04b290ddb15',37,'EMPTY','TDivt0EiGV','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003dhlfc6dmbfd25','d657c104-6733-43b8-a56a-d04b290ddb15',38,'EMPTY','is3Ioq3Ckq','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003ehlfcv61i9xlz','d657c104-6733-43b8-a56a-d04b290ddb15',39,'EMPTY','RP9dkwYQZk','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac1h003fhlfcomxxx14q','d657c104-6733-43b8-a56a-d04b290ddb15',40,'EMPTY','SSqtOsvIay','2026-05-28 03:51:38.337','2026-04-28 03:51:38.339'),('cmoi3ac64003hhlfcvrhu1bu7','8359dfb1-d272-4324-9264-dd2768a50f57',1,'EMPTY','4lblQItf1r','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003ihlfcxlwq5kws','8359dfb1-d272-4324-9264-dd2768a50f57',2,'EMPTY','SNGK5sxXgs','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003jhlfcajuaui31','8359dfb1-d272-4324-9264-dd2768a50f57',3,'EMPTY','ImGRT-9H4K','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003khlfch1f66l3y','8359dfb1-d272-4324-9264-dd2768a50f57',4,'EMPTY','bFKToGemGx','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003lhlfcwk45hm3n','8359dfb1-d272-4324-9264-dd2768a50f57',5,'EMPTY','g-PmHN6jSL','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003mhlfckvud5j03','8359dfb1-d272-4324-9264-dd2768a50f57',6,'EMPTY','fX4vmj9vjH','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003nhlfcxb4zj3b6','8359dfb1-d272-4324-9264-dd2768a50f57',7,'EMPTY','YYwDX_A_AC','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003ohlfcgxa4fx4g','8359dfb1-d272-4324-9264-dd2768a50f57',8,'EMPTY','eUB3HQy5KG','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003phlfcpqrfuyhd','8359dfb1-d272-4324-9264-dd2768a50f57',9,'EMPTY','AMjoTyG1AZ','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003qhlfcmtvpuz6b','8359dfb1-d272-4324-9264-dd2768a50f57',10,'EMPTY','_HlPGFVYUd','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003rhlfcvzrgour3','8359dfb1-d272-4324-9264-dd2768a50f57',11,'EMPTY','uFCQEukDF4','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003shlfc7uzn21m7','8359dfb1-d272-4324-9264-dd2768a50f57',12,'EMPTY','VG-YK6rH4h','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003thlfc08osg5nb','8359dfb1-d272-4324-9264-dd2768a50f57',13,'EMPTY','X3Z1UHKIC2','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003uhlfctgwlkoi7','8359dfb1-d272-4324-9264-dd2768a50f57',14,'EMPTY','mCi5-9MLH9','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003vhlfcl8gth1h9','8359dfb1-d272-4324-9264-dd2768a50f57',15,'EMPTY','dsa7tR7HxZ','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003whlfcepx09l5t','8359dfb1-d272-4324-9264-dd2768a50f57',16,'EMPTY','izFG0W1faX','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003xhlfcn6ih8x2u','8359dfb1-d272-4324-9264-dd2768a50f57',17,'EMPTY','JEx1ZCAlqn','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003yhlfct0xgcot6','8359dfb1-d272-4324-9264-dd2768a50f57',18,'EMPTY','3Pnpr_9bAo','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64003zhlfcpuqfc65x','8359dfb1-d272-4324-9264-dd2768a50f57',19,'EMPTY','bIMdqu8oMM','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640040hlfc3bp9ykr2','8359dfb1-d272-4324-9264-dd2768a50f57',20,'EMPTY','efAqDlHCep','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640041hlfclbfn0wz7','8359dfb1-d272-4324-9264-dd2768a50f57',21,'EMPTY','1sS5wOyddM','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640042hlfcyihyk5a3','8359dfb1-d272-4324-9264-dd2768a50f57',22,'EMPTY','V2aejrIj73','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640043hlfcxtrkrhts','8359dfb1-d272-4324-9264-dd2768a50f57',23,'EMPTY','5EacXkfqqd','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640044hlfcfq38j72k','8359dfb1-d272-4324-9264-dd2768a50f57',24,'EMPTY','nc7hgPItnX','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640045hlfcyn0mx2b6','8359dfb1-d272-4324-9264-dd2768a50f57',25,'EMPTY','MgEFS5yu8k','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640046hlfcsxga8oan','8359dfb1-d272-4324-9264-dd2768a50f57',26,'EMPTY','LAAXuX2vNO','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640047hlfcq75k2kz0','8359dfb1-d272-4324-9264-dd2768a50f57',27,'EMPTY','Z4P6R0NDfm','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640048hlfcj4d52t29','8359dfb1-d272-4324-9264-dd2768a50f57',28,'EMPTY','2UxOiaMLqb','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac640049hlfczbustikf','8359dfb1-d272-4324-9264-dd2768a50f57',29,'EMPTY','cz_RhHyT7E','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004ahlfc3b10y9si','8359dfb1-d272-4324-9264-dd2768a50f57',30,'EMPTY','8tL6wiDGRc','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004bhlfcv4uy4uiw','8359dfb1-d272-4324-9264-dd2768a50f57',31,'EMPTY','_PwxoCz6M_','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004chlfcxy227vij','8359dfb1-d272-4324-9264-dd2768a50f57',32,'EMPTY','xTLW3LT9Ss','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004dhlfctxpbtzia','8359dfb1-d272-4324-9264-dd2768a50f57',33,'EMPTY','MOhocuASx8','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004ehlfcfb6sqof3','8359dfb1-d272-4324-9264-dd2768a50f57',34,'EMPTY','VTwIp4_fCB','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004fhlfcmq9i881c','8359dfb1-d272-4324-9264-dd2768a50f57',35,'EMPTY','5Sn0GxvX1U','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004ghlfckw8fsu4q','8359dfb1-d272-4324-9264-dd2768a50f57',36,'EMPTY','ZBc0CtDkXN','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004hhlfcy1n7qm5c','8359dfb1-d272-4324-9264-dd2768a50f57',37,'EMPTY','gYtI0D25GC','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004ihlfcms8yz780','8359dfb1-d272-4324-9264-dd2768a50f57',38,'EMPTY','bGcm7iKRbU','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004jhlfcwgwvrnqm','8359dfb1-d272-4324-9264-dd2768a50f57',39,'EMPTY','QqpIYdPKpK','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3ac64004khlfcyjowthau','8359dfb1-d272-4324-9264-dd2768a50f57',40,'EMPTY','_jqKZmtlqK','2026-05-28 03:51:38.522','2026-04-28 03:51:38.524'),('cmoi3acff004mhlfczokbjvyq','f9097bac-2685-4bac-a83f-c4d6537d32f2',1,'EMPTY','_X1GqokglH','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004nhlfcv3b2ekfc','f9097bac-2685-4bac-a83f-c4d6537d32f2',2,'EMPTY','NBvBQl-BVg','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004ohlfcq37s3sqx','f9097bac-2685-4bac-a83f-c4d6537d32f2',3,'EMPTY','st7m6CosA0','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004phlfchxw3h0rf','f9097bac-2685-4bac-a83f-c4d6537d32f2',4,'EMPTY','dxZLMLsENO','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004qhlfc1cofyf5a','f9097bac-2685-4bac-a83f-c4d6537d32f2',5,'EMPTY','yZT_wOaC40','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004rhlfc23oo5tjq','f9097bac-2685-4bac-a83f-c4d6537d32f2',6,'EMPTY','jLAK_KwzHu','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004shlfcss43ayu7','f9097bac-2685-4bac-a83f-c4d6537d32f2',7,'EMPTY','Pkg8JXf6vJ','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004thlfcng99xg6p','f9097bac-2685-4bac-a83f-c4d6537d32f2',8,'EMPTY','9odPOL0Np5','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004uhlfcp5wfdna1','f9097bac-2685-4bac-a83f-c4d6537d32f2',9,'EMPTY','Y86hyK6QKe','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004vhlfca7oi0md5','f9097bac-2685-4bac-a83f-c4d6537d32f2',10,'EMPTY','CLVOKZEGmD','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004whlfcrwdflsyi','f9097bac-2685-4bac-a83f-c4d6537d32f2',11,'EMPTY','RCBaCNxe2q','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004xhlfcrbuc8dpc','f9097bac-2685-4bac-a83f-c4d6537d32f2',12,'EMPTY','snjkCOzT_U','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004yhlfcw0lefi0e','f9097bac-2685-4bac-a83f-c4d6537d32f2',13,'EMPTY','TLSVY5G4an','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff004zhlfc264lszf5','f9097bac-2685-4bac-a83f-c4d6537d32f2',14,'EMPTY','u-uyWZIAqJ','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0050hlfcq7no7jj0','f9097bac-2685-4bac-a83f-c4d6537d32f2',15,'EMPTY','9S2Not2TTE','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0051hlfcfnttqxm1','f9097bac-2685-4bac-a83f-c4d6537d32f2',16,'EMPTY','q-VBqzZO0I','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0052hlfc1efrfq8t','f9097bac-2685-4bac-a83f-c4d6537d32f2',17,'EMPTY','0apqrZAzkv','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0053hlfcbpoph7xp','f9097bac-2685-4bac-a83f-c4d6537d32f2',18,'EMPTY','FDxo6bMw-o','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0054hlfc9t7xxn52','f9097bac-2685-4bac-a83f-c4d6537d32f2',19,'EMPTY','MXYJGKJu9G','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0055hlfcjh7nw0k9','f9097bac-2685-4bac-a83f-c4d6537d32f2',20,'EMPTY','GpSCdgbTUC','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0056hlfc6scjucff','f9097bac-2685-4bac-a83f-c4d6537d32f2',21,'EMPTY','DL1KMjtK8B','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0057hlfch8zc1tzs','f9097bac-2685-4bac-a83f-c4d6537d32f2',22,'EMPTY','4BvJDXPXFf','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0058hlfclxv62dm7','f9097bac-2685-4bac-a83f-c4d6537d32f2',23,'EMPTY','3AEmKt6H61','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff0059hlfcd75opkk6','f9097bac-2685-4bac-a83f-c4d6537d32f2',24,'EMPTY','5S9RIq8olJ','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005ahlfcwnb440pr','f9097bac-2685-4bac-a83f-c4d6537d32f2',25,'EMPTY','3AZeL_43z6','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005bhlfclptfd1x8','f9097bac-2685-4bac-a83f-c4d6537d32f2',26,'EMPTY','0OACmMssrD','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005chlfcd6527ghx','f9097bac-2685-4bac-a83f-c4d6537d32f2',27,'EMPTY','Iv4F9Wmgv_','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005dhlfc27nya9sh','f9097bac-2685-4bac-a83f-c4d6537d32f2',28,'EMPTY','L2jKPdmQP6','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005ehlfcnp3gs9ts','f9097bac-2685-4bac-a83f-c4d6537d32f2',29,'EMPTY','AjNmMfwmea','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005fhlfc8zhogfi7','f9097bac-2685-4bac-a83f-c4d6537d32f2',30,'EMPTY','gDvm092XEh','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005ghlfc1akxsipg','f9097bac-2685-4bac-a83f-c4d6537d32f2',31,'EMPTY','M-ea27M61J','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005hhlfc9jsqgxpk','f9097bac-2685-4bac-a83f-c4d6537d32f2',32,'EMPTY','bDpsilBkb0','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005ihlfc5xomes86','f9097bac-2685-4bac-a83f-c4d6537d32f2',33,'EMPTY','GUEUv4158h','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005jhlfc1tixy148','f9097bac-2685-4bac-a83f-c4d6537d32f2',34,'EMPTY','v2saQRR2F_','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005khlfcw9hwmtv0','f9097bac-2685-4bac-a83f-c4d6537d32f2',35,'EMPTY','_oDvKrH86Y','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005lhlfck520y2o2','f9097bac-2685-4bac-a83f-c4d6537d32f2',36,'EMPTY','paGcXOvERM','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005mhlfc09pldyfj','f9097bac-2685-4bac-a83f-c4d6537d32f2',37,'EMPTY','946h98ewad','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005nhlfcypd6cqpm','f9097bac-2685-4bac-a83f-c4d6537d32f2',38,'EMPTY','qLeSr6nFAo','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005ohlfcfra2ib18','f9097bac-2685-4bac-a83f-c4d6537d32f2',39,'EMPTY','Mas3uenszV','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acff005phlfcsbmu591y','f9097bac-2685-4bac-a83f-c4d6537d32f2',40,'EMPTY','BUUtY4QePN','2026-05-28 03:51:38.849','2026-04-28 03:51:38.859'),('cmoi3acii005rhlfcj5veebp5','4abeb14d-e769-4e41-96f9-836f420af920',1,'EMPTY','vrv0j5Elul','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005shlfc3bs72vi7','4abeb14d-e769-4e41-96f9-836f420af920',2,'EMPTY','n-7vEqg7vT','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005thlfcx0mgmo2p','4abeb14d-e769-4e41-96f9-836f420af920',3,'EMPTY','BcgZGpUpUM','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005uhlfctop07p4s','4abeb14d-e769-4e41-96f9-836f420af920',4,'EMPTY','iIat33vCzC','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005vhlfcetaw4pt5','4abeb14d-e769-4e41-96f9-836f420af920',5,'EMPTY','mvMpthCL-g','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005whlfc8nw1z6me','4abeb14d-e769-4e41-96f9-836f420af920',6,'EMPTY','9CH78goU4r','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005xhlfcuzqoprld','4abeb14d-e769-4e41-96f9-836f420af920',7,'EMPTY','CT3X3osWVB','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005yhlfcva9p3758','4abeb14d-e769-4e41-96f9-836f420af920',8,'EMPTY','d7zkZThgzx','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii005zhlfc5m9epjan','4abeb14d-e769-4e41-96f9-836f420af920',9,'EMPTY','o9a7R8JBgm','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0060hlfcrofma4ou','4abeb14d-e769-4e41-96f9-836f420af920',10,'EMPTY','jErqkmEyXh','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0061hlfczt6e1zvd','4abeb14d-e769-4e41-96f9-836f420af920',11,'EMPTY','D4Vf5sTYCG','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0062hlfci2fu3il3','4abeb14d-e769-4e41-96f9-836f420af920',12,'EMPTY','9czWHCWU_Y','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0063hlfcat1lmjrz','4abeb14d-e769-4e41-96f9-836f420af920',13,'EMPTY','3EGSgdtFCP','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0064hlfcdzuiu2gq','4abeb14d-e769-4e41-96f9-836f420af920',14,'EMPTY','3HykPenwSQ','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0065hlfcjrn9q0a3','4abeb14d-e769-4e41-96f9-836f420af920',15,'EMPTY','IIX6PTf9-L','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0066hlfcghd4b559','4abeb14d-e769-4e41-96f9-836f420af920',16,'EMPTY','2TGWh9Xyqh','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0067hlfck0mdsc17','4abeb14d-e769-4e41-96f9-836f420af920',17,'EMPTY','gtFU2ZtobO','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0068hlfckdfezx2w','4abeb14d-e769-4e41-96f9-836f420af920',18,'EMPTY','b337gW1kgI','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii0069hlfcwwun6gis','4abeb14d-e769-4e41-96f9-836f420af920',19,'EMPTY','3Pu3JdChtQ','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006ahlfcxx4ruo1q','4abeb14d-e769-4e41-96f9-836f420af920',20,'EMPTY','ATzAj_npta','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006bhlfc8pnei9fd','4abeb14d-e769-4e41-96f9-836f420af920',21,'EMPTY','uL19CTJ4Rr','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006chlfcydyxl8l4','4abeb14d-e769-4e41-96f9-836f420af920',22,'EMPTY','ZfwRlJVRiv','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006dhlfcmlpxf5jm','4abeb14d-e769-4e41-96f9-836f420af920',23,'EMPTY','X9GY2V_8aF','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006ehlfc3cx4e2mn','4abeb14d-e769-4e41-96f9-836f420af920',24,'EMPTY','qG6ktPAq0v','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006fhlfcbvdghe6v','4abeb14d-e769-4e41-96f9-836f420af920',25,'EMPTY','6m1e7wUekc','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006ghlfc4jtij5sg','4abeb14d-e769-4e41-96f9-836f420af920',26,'EMPTY','rKj0k0ud1-','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006hhlfcg73nfgv2','4abeb14d-e769-4e41-96f9-836f420af920',27,'EMPTY','HvpphLTHCG','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006ihlfcy6vailla','4abeb14d-e769-4e41-96f9-836f420af920',28,'EMPTY','iOOy9_sENv','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006jhlfc3e8nskbq','4abeb14d-e769-4e41-96f9-836f420af920',29,'EMPTY','LWA4ZhhC7S','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006khlfcqd5omyry','4abeb14d-e769-4e41-96f9-836f420af920',30,'EMPTY','5hssRII8fH','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006lhlfcog5d5iia','4abeb14d-e769-4e41-96f9-836f420af920',31,'EMPTY','z2-ApusB8o','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006mhlfcidyt01zl','4abeb14d-e769-4e41-96f9-836f420af920',32,'EMPTY','DDhiTPzJjA','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006nhlfc0iwpga1a','4abeb14d-e769-4e41-96f9-836f420af920',33,'EMPTY','8QZ3M6W80c','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006ohlfcc0po7i97','4abeb14d-e769-4e41-96f9-836f420af920',34,'EMPTY','aDeZgZLiYO','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006phlfcn2d80dkd','4abeb14d-e769-4e41-96f9-836f420af920',35,'EMPTY','58SEIz-m9p','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006qhlfcpbibqqc5','4abeb14d-e769-4e41-96f9-836f420af920',36,'EMPTY','dsLE0rXieP','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006rhlfcj1yn7lp4','4abeb14d-e769-4e41-96f9-836f420af920',37,'EMPTY','JG9R-uKQmX','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006shlfcueymz94x','4abeb14d-e769-4e41-96f9-836f420af920',38,'EMPTY','k47qmH73KY','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006thlfc7qrqe4pt','4abeb14d-e769-4e41-96f9-836f420af920',39,'EMPTY','Sq2L28KqvX','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3acii006uhlfcgc40hv1r','4abeb14d-e769-4e41-96f9-836f420af920',40,'EMPTY','Ms2Lw0Kd-G','2026-05-28 03:51:38.969','2026-04-28 03:51:38.970'),('cmoi3aco0006whlfc8msnkolk','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',1,'EMPTY','g9wkDRPirP','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0006xhlfc1332ekdc','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',2,'EMPTY','m0_4CukuZH','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0006yhlfcffuh2j9z','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',3,'EMPTY','ixJpUWUKCy','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0006zhlfclgnkwbbw','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',4,'EMPTY','WnoxkYUhN7','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00070hlfc3afo23bg','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',5,'EMPTY','_p0ET8Tdzi','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00071hlfc8buhuhg5','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',6,'EMPTY','v2oTwJKFb9','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00072hlfc92duh22s','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',7,'EMPTY','v4-Xd1d4IC','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00073hlfceunt4eao','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',8,'EMPTY','BfXKEB4PZ-','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00074hlfc4eowdjuz','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',9,'EMPTY','djxvh3F6p_','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00075hlfc6eqvn2f8','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',10,'EMPTY','v1FZvc0zRQ','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00076hlfce2gtwy64','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',11,'EMPTY','NJYgPWxdHE','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00077hlfcm0u0r76q','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',12,'EMPTY','ficMeq4rb1','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00078hlfcoq354p2k','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',13,'EMPTY','ajH04Tq8Hr','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco00079hlfc4bgfcdtj','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',14,'EMPTY','jxqmsKAd7b','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007ahlfcjcthjufb','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',15,'EMPTY','31__xqul5v','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007bhlfc1lw45nc1','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',16,'EMPTY','wGc0SzfV90','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007chlfcdo24g57z','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',17,'EMPTY','AM28hscp9H','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007dhlfc70nwpv9e','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',18,'EMPTY','n4Y8VjHtdQ','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007ehlfc2x9h1bt1','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',19,'EMPTY','MNu7Fz4Kpa','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007fhlfcmgyj125w','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',20,'EMPTY','IM-heWhTrz','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007ghlfcocq1be3e','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',21,'EMPTY','saRUIJg2Sg','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007hhlfcht3tn8mu','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',22,'EMPTY','16rHJIynIK','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007ihlfc9a0jvrow','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',23,'EMPTY','ErEn2QbHo7','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007jhlfc4txrn1nb','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',24,'EMPTY','oHLspXPR-n','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007khlfcxwmmfqik','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',25,'EMPTY','iqfa2u09Yq','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007lhlfca4tmrtr2','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',26,'EMPTY','KrU0lZK3mJ','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007mhlfckhna10w7','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',27,'EMPTY','ipCypVBAn3','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007nhlfc98otlwn9','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',28,'EMPTY','4KFacRsW7T','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007ohlfc2o4yrqm4','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',29,'EMPTY','_aXTENIovT','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007phlfcwvwxjgkh','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',30,'EMPTY','3m9yVNzqVM','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007qhlfcxkcpdaah','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',31,'EMPTY','s1rFIts6yz','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007rhlfcvmsd8fqj','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',32,'EMPTY','Kx3-yQrNSO','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007shlfcob7kkt2x','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',33,'EMPTY','OakU5Clwrf','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007thlfc88bnvj2h','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',34,'EMPTY','_pi1bidEAa','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007uhlfcahl9uaa2','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',35,'EMPTY','qxZbE47aN1','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007vhlfch504312k','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',36,'EMPTY','2s3CfWeciw','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007whlfcyv5gfo49','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',37,'EMPTY','C9cX1RZ2A7','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007xhlfcgstja2xb','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',38,'EMPTY','354MQoDJzM','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007yhlfc1hntlt91','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',39,'EMPTY','hsygwPjMrv','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3aco0007zhlfcvrhknz2e','aeced88d-9dd5-4e81-b4f2-ebdf7b947128',40,'EMPTY','qm5rtIWrsp','2026-05-28 03:51:39.166','2026-04-28 03:51:39.168'),('cmoi3acpp0081hlfc5jpcb8ye','1c123034-31b8-4466-9d89-f6c38b1bdc15',1,'EMPTY','8QPjBzrcjx','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0082hlfc4tbfbwn3','1c123034-31b8-4466-9d89-f6c38b1bdc15',2,'EMPTY','GW7DKKqppJ','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0083hlfcy04jsjil','1c123034-31b8-4466-9d89-f6c38b1bdc15',3,'EMPTY','MYQEXPdiiF','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0084hlfcrlzmjhya','1c123034-31b8-4466-9d89-f6c38b1bdc15',4,'EMPTY','jnFkXSuKhT','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0085hlfc3lhkoni2','1c123034-31b8-4466-9d89-f6c38b1bdc15',5,'EMPTY','_hGIKCXpPM','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0086hlfcnb69el4k','1c123034-31b8-4466-9d89-f6c38b1bdc15',6,'EMPTY','6Z_2q-ovMV','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0087hlfcyt8jl30m','1c123034-31b8-4466-9d89-f6c38b1bdc15',7,'EMPTY','3Q_07qPCA-','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0088hlfcfhqnvixw','1c123034-31b8-4466-9d89-f6c38b1bdc15',8,'EMPTY','xXoZspJ0AQ','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp0089hlfctdhyxffg','1c123034-31b8-4466-9d89-f6c38b1bdc15',9,'EMPTY','MxAtvlxpEI','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008ahlfcw83ao1dy','1c123034-31b8-4466-9d89-f6c38b1bdc15',10,'EMPTY','ExEexnJoi1','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008bhlfcne22m5i1','1c123034-31b8-4466-9d89-f6c38b1bdc15',11,'EMPTY','licYwihUce','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008chlfc6pr8en5t','1c123034-31b8-4466-9d89-f6c38b1bdc15',12,'EMPTY','wHwiyiJLnd','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008dhlfct4au8yzh','1c123034-31b8-4466-9d89-f6c38b1bdc15',13,'EMPTY','QItKyDjVE-','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008ehlfcpk6qc31n','1c123034-31b8-4466-9d89-f6c38b1bdc15',14,'EMPTY','SD43glyWr-','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008fhlfcao2d4jez','1c123034-31b8-4466-9d89-f6c38b1bdc15',15,'EMPTY','vJJU56FGo1','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008ghlfcyrhwzvbz','1c123034-31b8-4466-9d89-f6c38b1bdc15',16,'EMPTY','_8tmLj9JRM','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008hhlfcan49tmwt','1c123034-31b8-4466-9d89-f6c38b1bdc15',17,'EMPTY','yxBKN1sbT4','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008ihlfct8sam6tv','1c123034-31b8-4466-9d89-f6c38b1bdc15',18,'EMPTY','qKLA4v-j_A','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008jhlfcjofc705c','1c123034-31b8-4466-9d89-f6c38b1bdc15',19,'EMPTY','Bass2Zl1jb','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008khlfcac2jzzzj','1c123034-31b8-4466-9d89-f6c38b1bdc15',20,'EMPTY','LXFZBeAqtj','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008lhlfca6qccwux','1c123034-31b8-4466-9d89-f6c38b1bdc15',21,'EMPTY','FDiWL4ckq9','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008mhlfc2b35k3cj','1c123034-31b8-4466-9d89-f6c38b1bdc15',22,'EMPTY','9jhkx07n61','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008nhlfcc51mpi0n','1c123034-31b8-4466-9d89-f6c38b1bdc15',23,'EMPTY','CIZXqXLEoQ','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008ohlfcxg4f6sm3','1c123034-31b8-4466-9d89-f6c38b1bdc15',24,'EMPTY','S-hTdNYjKY','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpp008phlfcapgxckrr','1c123034-31b8-4466-9d89-f6c38b1bdc15',25,'EMPTY','-DO0TmKcfB','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008qhlfcno4d9vi9','1c123034-31b8-4466-9d89-f6c38b1bdc15',26,'EMPTY','AA8eExrfta','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008rhlfcofbjz0yn','1c123034-31b8-4466-9d89-f6c38b1bdc15',27,'EMPTY','5GFENn2Eeb','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008shlfcuflr4fub','1c123034-31b8-4466-9d89-f6c38b1bdc15',28,'EMPTY','yr_fVHpa1A','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008thlfcv086k8dz','1c123034-31b8-4466-9d89-f6c38b1bdc15',29,'EMPTY','w9XoOX5y1V','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008uhlfczy624lmu','1c123034-31b8-4466-9d89-f6c38b1bdc15',30,'EMPTY','EFcYZtR5Ii','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008vhlfcimp4yk04','1c123034-31b8-4466-9d89-f6c38b1bdc15',31,'EMPTY','uFgnhYRFEZ','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008whlfc37vqkile','1c123034-31b8-4466-9d89-f6c38b1bdc15',32,'EMPTY','KpJnYvkQhy','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008xhlfcikvo3wmc','1c123034-31b8-4466-9d89-f6c38b1bdc15',33,'EMPTY','4DDX3287qp','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008yhlfc3o8axbt8','1c123034-31b8-4466-9d89-f6c38b1bdc15',34,'EMPTY','IbcaF4ABu4','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq008zhlfcbupyglfh','1c123034-31b8-4466-9d89-f6c38b1bdc15',35,'EMPTY','mhuT0LDnxb','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq0090hlfcbyt3uk1b','1c123034-31b8-4466-9d89-f6c38b1bdc15',36,'EMPTY','gwXzFNBJBM','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq0091hlfc52p00c5g','1c123034-31b8-4466-9d89-f6c38b1bdc15',37,'EMPTY','n4p0KKc7r4','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq0092hlfcnzenhhn8','1c123034-31b8-4466-9d89-f6c38b1bdc15',38,'EMPTY','s46be1NRxd','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq0093hlfcdo5oc573','1c123034-31b8-4466-9d89-f6c38b1bdc15',39,'EMPTY','iIGqd2PTei','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acpq0094hlfc81zx417o','1c123034-31b8-4466-9d89-f6c38b1bdc15',40,'EMPTY','orVs2L5lsk','2026-05-28 03:51:39.228','2026-04-28 03:51:39.230'),('cmoi3acxz0096hlfc48ookdwt','045a8de1-828a-494e-9d34-539ce0eafe65',1,'EMPTY','GyCT4JqAiY','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz0097hlfcps2fkksl','045a8de1-828a-494e-9d34-539ce0eafe65',2,'EMPTY','FRBuFbVobV','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz0098hlfcbzvdlemp','045a8de1-828a-494e-9d34-539ce0eafe65',3,'EMPTY','z7X_bJXZNp','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz0099hlfc8umd8smh','045a8de1-828a-494e-9d34-539ce0eafe65',4,'EMPTY','oIKVNmDIY-','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009ahlfcv2h6qn8s','045a8de1-828a-494e-9d34-539ce0eafe65',5,'EMPTY','gXJlWJ-gF0','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009bhlfc3jiiu4qa','045a8de1-828a-494e-9d34-539ce0eafe65',6,'EMPTY','6yzKoUxYNi','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009chlfczmbx5bvc','045a8de1-828a-494e-9d34-539ce0eafe65',7,'EMPTY','K9SjPwMFTB','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009dhlfc9telft50','045a8de1-828a-494e-9d34-539ce0eafe65',8,'EMPTY','zmmfU7wZU6','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009ehlfcc7573mso','045a8de1-828a-494e-9d34-539ce0eafe65',9,'EMPTY','0MoGayjxGT','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009fhlfcdjlxrzq4','045a8de1-828a-494e-9d34-539ce0eafe65',10,'EMPTY','vzZSxQ0Z1J','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009ghlfci9crgcvh','045a8de1-828a-494e-9d34-539ce0eafe65',11,'EMPTY','yXhvG5IWSg','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009hhlfchmvhwjy1','045a8de1-828a-494e-9d34-539ce0eafe65',12,'EMPTY','o0UAiQRhPj','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009ihlfc22gyra9m','045a8de1-828a-494e-9d34-539ce0eafe65',13,'EMPTY','eaxxMzR6Wp','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009jhlfc3sqqsd6j','045a8de1-828a-494e-9d34-539ce0eafe65',14,'EMPTY','55vBw-kvRH','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009khlfcibtpaf47','045a8de1-828a-494e-9d34-539ce0eafe65',15,'EMPTY','BFSFVlqGWY','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009lhlfccutc5r2t','045a8de1-828a-494e-9d34-539ce0eafe65',16,'EMPTY','UqiCMnbwS4','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009mhlfc5gmfkwbz','045a8de1-828a-494e-9d34-539ce0eafe65',17,'EMPTY','7-Ns6OCTKO','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009nhlfc98wqtygq','045a8de1-828a-494e-9d34-539ce0eafe65',18,'EMPTY','avO1WqxqR2','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009ohlfc5789blt4','045a8de1-828a-494e-9d34-539ce0eafe65',19,'EMPTY','OoO0swCgA1','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009phlfc7qtdveiu','045a8de1-828a-494e-9d34-539ce0eafe65',20,'EMPTY','As3gnXvLoL','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009qhlfckpqe4359','045a8de1-828a-494e-9d34-539ce0eafe65',21,'EMPTY','p09wTD24AM','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009rhlfc9u3aiqu4','045a8de1-828a-494e-9d34-539ce0eafe65',22,'EMPTY','Q8eTBvs6HI','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009shlfc2mupzmq8','045a8de1-828a-494e-9d34-539ce0eafe65',23,'EMPTY','BitXBkuHu8','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009thlfc18cvuyk1','045a8de1-828a-494e-9d34-539ce0eafe65',24,'EMPTY','35kFnSTJ7p','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009uhlfc924z983h','045a8de1-828a-494e-9d34-539ce0eafe65',25,'EMPTY','9SVYJefJna','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009vhlfcvbnewl1p','045a8de1-828a-494e-9d34-539ce0eafe65',26,'EMPTY','tkE-vKnd8c','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009whlfc8chqgw85','045a8de1-828a-494e-9d34-539ce0eafe65',27,'EMPTY','cph_-4mQt_','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009xhlfc4f8ibzz6','045a8de1-828a-494e-9d34-539ce0eafe65',28,'EMPTY','wzc5OdT330','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009yhlfc5347kr3l','045a8de1-828a-494e-9d34-539ce0eafe65',29,'EMPTY','ZPkuLMTmig','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz009zhlfcx73qodfa','045a8de1-828a-494e-9d34-539ce0eafe65',30,'EMPTY','DkUCTtl8AN','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a0hlfcgv15ajg0','045a8de1-828a-494e-9d34-539ce0eafe65',31,'EMPTY','Pm3MwSgdS2','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a1hlfcwueuowwc','045a8de1-828a-494e-9d34-539ce0eafe65',32,'EMPTY','YZfgXsoqwz','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a2hlfc24vmx6te','045a8de1-828a-494e-9d34-539ce0eafe65',33,'EMPTY','YkHsCBOSb_','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a3hlfc0xb3jm8x','045a8de1-828a-494e-9d34-539ce0eafe65',34,'EMPTY','lIeAVYJV0L','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a4hlfca46v1ml3','045a8de1-828a-494e-9d34-539ce0eafe65',35,'EMPTY','L5DR6-Hocy','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a5hlfc1sv3sy4h','045a8de1-828a-494e-9d34-539ce0eafe65',36,'EMPTY','VyIupoNhVA','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acxz00a6hlfcapnce8q0','045a8de1-828a-494e-9d34-539ce0eafe65',37,'EMPTY','6brov9045k','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acy000a7hlfcg6vqo590','045a8de1-828a-494e-9d34-539ce0eafe65',38,'EMPTY','BkZiWudS0g','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acy000a8hlfcr6isc8qd','045a8de1-828a-494e-9d34-539ce0eafe65',39,'EMPTY','UuhGGK6pUR','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3acy000a9hlfc7kqyzdq5','045a8de1-828a-494e-9d34-539ce0eafe65',40,'EMPTY','XpVhZ4UhDX','2026-05-28 03:51:39.525','2026-04-28 03:51:39.527'),('cmoi3ad3u00abhlfcapvxsbhm','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',1,'EMPTY','sfpwwUAiLf','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00achlfc81ov7scf','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',2,'EMPTY','Bh-oS7FSw-','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00adhlfc5mv38jyh','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',3,'EMPTY','d41euTP5Jb','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aehlfcitxrbzy4','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',4,'EMPTY','7v9D-ZXqen','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00afhlfcwgujkot6','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',5,'EMPTY','qYmiY-1dbf','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aghlfcqomtqtta','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',6,'EMPTY','oqt3HWt8pf','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00ahhlfceqv7i9o8','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',7,'EMPTY','4rYGOejapn','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aihlfc75gjrlf7','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',8,'EMPTY','VIKz6ajzSB','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00ajhlfcx9lbi44q','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',9,'EMPTY','Tzh7RnYDXy','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00akhlfcsyizk8ho','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',10,'EMPTY','wH4nd02nem','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00alhlfcv8mp8jh3','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',11,'EMPTY','VXhwoWNLIy','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00amhlfc6139u7ly','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',12,'EMPTY','YU6rmPK5b-','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00anhlfcwqywxksc','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',13,'EMPTY','2FyUxxIUFM','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aohlfc8xcu5j6c','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',14,'EMPTY','EWGmT7ZrDu','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aphlfcn1m7oo0s','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',15,'EMPTY','WmftXmGJaM','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00aqhlfc6qo45cll','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',16,'EMPTY','fYN7twOfnK','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00arhlfcw9u8s025','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',17,'EMPTY','JipkOcAEns','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00ashlfcxixe5qgy','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',18,'EMPTY','9r4lSz5lJh','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00athlfcjm9vqgoj','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',19,'EMPTY','2XCzGugURT','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00auhlfcobpu4xph','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',20,'EMPTY','eERFoghGVN','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00avhlfckj92dfy0','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',21,'EMPTY','ZnaN7lcLfV','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00awhlfca9ovijy7','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',22,'EMPTY','Kg41UTxsAQ','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00axhlfcmamm38bz','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',23,'EMPTY','a-2E24Q3rz','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00ayhlfcpcu6c4w4','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',24,'EMPTY','1noAjVOea6','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00azhlfcyohee5t2','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',25,'EMPTY','9fNW5LJbWU','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b0hlfczzznikxp','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',26,'EMPTY','V8SpPFWuXv','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b1hlfc6isqhuwj','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',27,'EMPTY','fy1tQeOuk9','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b2hlfc068tclc1','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',28,'EMPTY','jhXZ3_Q868','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b3hlfcmj2keen3','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',29,'EMPTY','He3ivfa7qO','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b4hlfctpqrg2ab','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',30,'EMPTY','juxHMSTdtY','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b5hlfc3mzr3k7c','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',31,'EMPTY','Bxss5jLrgG','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b6hlfc3t9g2fn9','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',32,'EMPTY','HWEUctOkPG','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b7hlfcbj6up8w6','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',33,'EMPTY','9euYh2T2Mr','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b8hlfcxb4lui4y','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',34,'EMPTY','ar0pWkgc8W','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3u00b9hlfc20ne0ddu','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',35,'EMPTY','RHGjbkC2qw','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3v00bahlfcr6egwrl5','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',36,'EMPTY','PcyROazvPR','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3v00bbhlfcmfca0cer','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',37,'EMPTY','RGaLBN2To7','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3v00bchlfc3oxgu3hl','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',38,'EMPTY','-EbnS70p9R','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3v00bdhlfcmwml9u8f','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',39,'EMPTY','iKh_wgsyc2','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3ad3v00behlfcik51337y','68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9',40,'EMPTY','voFYblb8-a','2026-05-28 03:51:39.736','2026-04-28 03:51:39.738'),('cmoi3adbp00bghlfcpivwpqbd','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',1,'EMPTY','OfuSmmvzxP','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bhhlfc81bfd342','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',2,'EMPTY','_lQj7LRWRB','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bihlfct87jwfzh','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',3,'EMPTY','rLoBgrbWC7','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bjhlfc4fbibaux','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',4,'EMPTY','TrdOGb06I9','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bkhlfckn7nfvtb','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',5,'EMPTY','D40dkewkOY','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00blhlfcyxf47dig','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',6,'EMPTY','KlvBvgqZed','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bmhlfcc6lc3668','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',7,'EMPTY','Dm-Jj8SSuV','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bnhlfcnk5jezy2','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',8,'EMPTY','IjtGfBGhtF','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bohlfc4ebai55x','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',9,'EMPTY','cfR_WrClOs','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bphlfc2eicefdn','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',10,'EMPTY','_hPQXJ2JDu','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bqhlfcamo478gb','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',11,'EMPTY','GSDYzfjAq8','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00brhlfc3g98bqz5','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',12,'EMPTY','VogudQGwwg','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bshlfcnhmyqdph','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',13,'EMPTY','ixb6NdLTVa','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bthlfcg77xtbeg','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',14,'EMPTY','ALNfRq6zgo','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00buhlfcag3ot6bo','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',15,'EMPTY','pDZzxSDuLD','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bvhlfcnkww20lh','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',16,'EMPTY','13mDpP653G','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bwhlfco4gu1vn8','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',17,'EMPTY','ExMr2vjgqn','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bxhlfc672i9l6n','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',18,'EMPTY','8Eze2KPKsK','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00byhlfcj5cujxvb','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',19,'EMPTY','vwu2Iks41a','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00bzhlfcj746tcqc','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',20,'EMPTY','Nlcm1GEGrF','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c0hlfcmednzchg','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',21,'EMPTY','cdt0SfK-Yc','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c1hlfcb8qqo7s7','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',22,'EMPTY','4MSxLp6WOM','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c2hlfcycyyzzy0','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',23,'EMPTY','daJNKYMg1l','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c3hlfc1921t84h','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',24,'EMPTY','tbFiD_kXY7','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c4hlfcsmv9q758','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',25,'EMPTY','XFGKNOpW4g','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c5hlfckdwemoom','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',26,'EMPTY','MpMIhC13oa','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c6hlfcfrypwjnf','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',27,'EMPTY','kO8IT8N57L','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c7hlfc9ekmz9h2','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',28,'EMPTY','gOBPu4lTyq','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c8hlfc29y24uro','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',29,'EMPTY','i-JSCobs-C','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00c9hlfc45gsjat8','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',30,'EMPTY','A_B7HsaEkc','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cahlfctle3vozd','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',31,'EMPTY','h_6ZyW6S8o','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cbhlfcjvhnn5k3','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',32,'EMPTY','SbwtjUSJ9e','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cchlfc61pq9wes','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',33,'EMPTY','PysdnCtEw4','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cdhlfcqzjphyav','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',34,'EMPTY','gjOyEVlCRR','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cehlfcm5rlsplk','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',35,'EMPTY','JSSUIr0vnQ','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cfhlfc8vb0vuiy','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',36,'EMPTY','j8FL0FGfwB','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cghlfciaxqngtb','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',37,'EMPTY','FR9QZFLI3l','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00chhlfcsgovuhqr','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',38,'EMPTY','1mkTgDpat8','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cihlfciidr2z2k','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',39,'EMPTY','moYR7TRuXt','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adbp00cjhlfctl2rrevb','99dcfb9e-ea63-4064-abbb-d7f9cb3a1587',40,'EMPTY','dHSq7Ugfbv','2026-05-28 03:51:40.019','2026-04-28 03:51:40.021'),('cmoi3adf000clhlfculdi5r78','e6653768-8204-4e1c-a684-0cabec17223e',1,'EMPTY','Mjtq3PZ2eH','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cmhlfcmwssra36','e6653768-8204-4e1c-a684-0cabec17223e',2,'EMPTY','-84WVybPkA','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cnhlfc9w955nqk','e6653768-8204-4e1c-a684-0cabec17223e',3,'EMPTY','wq56jODU5K','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cohlfcfz1bjrxl','e6653768-8204-4e1c-a684-0cabec17223e',4,'EMPTY','KToCYzG6MB','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cphlfckdbxeyju','e6653768-8204-4e1c-a684-0cabec17223e',5,'EMPTY','TTZCSX0z3i','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cqhlfc4ivo1x9s','e6653768-8204-4e1c-a684-0cabec17223e',6,'EMPTY','z3EclhtBmp','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000crhlfcz4nrm0f6','e6653768-8204-4e1c-a684-0cabec17223e',7,'EMPTY','FYGx5X0c5U','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cshlfc2fh508gy','e6653768-8204-4e1c-a684-0cabec17223e',8,'EMPTY','XZYayxVvXv','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cthlfchnoisd0a','e6653768-8204-4e1c-a684-0cabec17223e',9,'EMPTY','LDLUwjeudh','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cuhlfcmw0hkj3c','e6653768-8204-4e1c-a684-0cabec17223e',10,'EMPTY','dedQxji8Ea','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cvhlfccfewnpz1','e6653768-8204-4e1c-a684-0cabec17223e',11,'EMPTY','IrVl6brlkU','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cwhlfciap1s367','e6653768-8204-4e1c-a684-0cabec17223e',12,'EMPTY','Mnc-BNXwpQ','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cxhlfczuhp3kfj','e6653768-8204-4e1c-a684-0cabec17223e',13,'EMPTY','h-SOFlFu3m','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000cyhlfcrewotcql','e6653768-8204-4e1c-a684-0cabec17223e',14,'EMPTY','vKeTkIl3Aq','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000czhlfcmxyfvilf','e6653768-8204-4e1c-a684-0cabec17223e',15,'EMPTY','QRfdfveC9B','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d0hlfc1w37yshu','e6653768-8204-4e1c-a684-0cabec17223e',16,'EMPTY','izgth3LrLy','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d1hlfcbs2871qv','e6653768-8204-4e1c-a684-0cabec17223e',17,'EMPTY','hSlu6LV4hd','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d2hlfcpwc4ak6t','e6653768-8204-4e1c-a684-0cabec17223e',18,'EMPTY','LuE35qPjT7','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d3hlfcbvluwii9','e6653768-8204-4e1c-a684-0cabec17223e',19,'EMPTY','OTGkVOXceu','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d4hlfcy5tq1e9y','e6653768-8204-4e1c-a684-0cabec17223e',20,'EMPTY','JTPgeE84eK','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d5hlfcfkruvrw6','e6653768-8204-4e1c-a684-0cabec17223e',21,'EMPTY','qyArB-YHkf','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d6hlfcn23qqyk2','e6653768-8204-4e1c-a684-0cabec17223e',22,'EMPTY','5QaY0VRn23','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d7hlfc6duyxm4x','e6653768-8204-4e1c-a684-0cabec17223e',23,'EMPTY','59Tlzi6E0m','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d8hlfcjrcy39r1','e6653768-8204-4e1c-a684-0cabec17223e',24,'EMPTY','jjCG3idKhj','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000d9hlfchvrcodgb','e6653768-8204-4e1c-a684-0cabec17223e',25,'EMPTY','dT7dWdJ6ja','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dahlfcdyp4rsu9','e6653768-8204-4e1c-a684-0cabec17223e',26,'EMPTY','ZjzvpfuDy4','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dbhlfcsp6qsjxi','e6653768-8204-4e1c-a684-0cabec17223e',27,'EMPTY','2FYW6wt9wc','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dchlfc6b1h421r','e6653768-8204-4e1c-a684-0cabec17223e',28,'EMPTY','QFIR4SicMI','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000ddhlfcmm572pka','e6653768-8204-4e1c-a684-0cabec17223e',29,'EMPTY','aPUck2qBYE','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dehlfc03f0mp8w','e6653768-8204-4e1c-a684-0cabec17223e',30,'EMPTY','GCUjNtFSko','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dfhlfcolc4n8fn','e6653768-8204-4e1c-a684-0cabec17223e',31,'EMPTY','x6cPeZrvlt','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dghlfc9o8zsam5','e6653768-8204-4e1c-a684-0cabec17223e',32,'EMPTY','gpXUiyziJt','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dhhlfcywodz4zn','e6653768-8204-4e1c-a684-0cabec17223e',33,'EMPTY','VxNsrshCWa','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dihlfc1wvdsuxl','e6653768-8204-4e1c-a684-0cabec17223e',34,'EMPTY','D0lHVJCPFR','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000djhlfcuvljj80b','e6653768-8204-4e1c-a684-0cabec17223e',35,'EMPTY','skA4cuA1pK','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dkhlfc7gcbvurn','e6653768-8204-4e1c-a684-0cabec17223e',36,'EMPTY','djD-IYiwWs','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dlhlfcwfe7202j','e6653768-8204-4e1c-a684-0cabec17223e',37,'EMPTY','7wNboqPN9q','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dmhlfc7f2uzzo1','e6653768-8204-4e1c-a684-0cabec17223e',38,'EMPTY','oZYV2p5QdT','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dnhlfcc4sw7re5','e6653768-8204-4e1c-a684-0cabec17223e',39,'EMPTY','lyoDCEEcA2','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3adf000dohlfcclgr3xxd','e6653768-8204-4e1c-a684-0cabec17223e',40,'EMPTY','-JUhYShj55','2026-05-28 03:51:40.138','2026-04-28 03:51:40.140'),('cmoi3ado400dqhlfccovbzp0u','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',1,'EMPTY','Wz8W2GiGSw','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400drhlfclu284kgw','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',2,'EMPTY','BZ9Y0WvsMo','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dshlfcq45jdzpd','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',3,'EMPTY','Q-5Hgg59sV','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dthlfcq4vyxtxj','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',4,'EMPTY','WIKz1TWnq5','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400duhlfcn5dbu3my','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',5,'EMPTY','a6VrADkh77','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dvhlfckstpsiya','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',6,'EMPTY','hDx1OLe2bv','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dwhlfc4umluo5m','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',7,'EMPTY','gzKkbHJ0ty','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dxhlfche092l55','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',8,'EMPTY','UuPkj3eDkT','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dyhlfcu946ryle','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',9,'EMPTY','6o1xBqBREK','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400dzhlfcfb1g0nmh','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',10,'EMPTY','z31T1d2LbQ','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e0hlfctvapwslm','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',11,'EMPTY','0NbPnWIKOv','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e1hlfcfa6wjgx5','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',12,'EMPTY','ecCpdtO_UN','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e2hlfc438c4j9t','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',13,'EMPTY','nzxlzn6EOn','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e3hlfcqe2bbmh3','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',14,'EMPTY','ojX-59iHb9','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e4hlfclkcdx71u','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',15,'EMPTY','iWWhg0sVK4','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e5hlfcf8yvmw53','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',16,'EMPTY','GXfb4rLZs2','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e6hlfcbsd8qrvr','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',17,'EMPTY','UNxx0bHykm','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e7hlfc1kno2rsm','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',18,'EMPTY','BuBH5nizZd','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e8hlfct55wjtqu','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',19,'EMPTY','KemkYEhZa1','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400e9hlfcdkj3deih','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',20,'EMPTY','mw-D-_EwoK','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400eahlfc7nmjayg5','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',21,'EMPTY','JesjRLSe3O','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado400ebhlfcv6n8e26d','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',22,'EMPTY','amUxDaZAor','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500echlfcvjo1dj6k','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',23,'EMPTY','WoX_vvwm0w','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500edhlfckqbigw3t','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',24,'EMPTY','7kCsOPYU0D','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eehlfcl7eqcf5j','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',25,'EMPTY','EW7UykszIS','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500efhlfcfc1f07gq','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',26,'EMPTY','sWaHVUv1eP','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eghlfcplrzp7tw','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',27,'EMPTY','A_h3gR1_7J','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500ehhlfc0bvjod6m','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',28,'EMPTY','SUFfjtBy84','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eihlfc7cf37qja','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',29,'EMPTY','kemsbZhSsu','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500ejhlfccbs7smtc','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',30,'EMPTY','596ulyKQDz','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500ekhlfcflcc3d36','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',31,'EMPTY','PW76bx2_8Y','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500elhlfcfghoml41','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',32,'EMPTY','RG_lMtx2ui','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500emhlfc6hgegdba','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',33,'EMPTY','SbQfZesoPG','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500enhlfcp6np0efb','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',34,'EMPTY','qAYB0IXTkL','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eohlfcsff4gei5','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',35,'EMPTY','j-y2fD3ArZ','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500ephlfcvk50s6nl','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',36,'EMPTY','HpYxr_oGeT','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eqhlfcwm9qwwge','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',37,'EMPTY','YYuFTun6n2','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500erhlfc2kddsmg1','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',38,'EMPTY','95-w4Yd84j','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500eshlfc7haspweq','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',39,'EMPTY','jkpQNmebFI','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3ado500ethlfcw08n9r8e','c35aa8d0-cacd-4e01-b67a-1048f3a03f8e',40,'EMPTY','Y5si7AFBdN','2026-05-28 03:51:40.466','2026-04-28 03:51:40.468'),('cmoi3adr700evhlfcqjr3rkxe','a237c28c-c77b-4804-9cdd-fcfcef93babc',1,'EMPTY','dTavn-LN4W','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700ewhlfcoatimknd','a237c28c-c77b-4804-9cdd-fcfcef93babc',2,'EMPTY','TaiTtS6T15','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700exhlfce5c975m4','a237c28c-c77b-4804-9cdd-fcfcef93babc',3,'EMPTY','gpEzMut0lp','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700eyhlfct07ddllc','a237c28c-c77b-4804-9cdd-fcfcef93babc',4,'EMPTY','3SaAnZ0IbH','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700ezhlfc3dv4gvcm','a237c28c-c77b-4804-9cdd-fcfcef93babc',5,'EMPTY','TuyN_Dzt6J','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f0hlfcwj3d0vhb','a237c28c-c77b-4804-9cdd-fcfcef93babc',6,'EMPTY','KaJnAdV0gn','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f1hlfckzqk57f1','a237c28c-c77b-4804-9cdd-fcfcef93babc',7,'EMPTY','UDVdg0cBao','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f2hlfcrwpiggj1','a237c28c-c77b-4804-9cdd-fcfcef93babc',8,'EMPTY','NHblGRi6PG','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f3hlfcbkz0llyy','a237c28c-c77b-4804-9cdd-fcfcef93babc',9,'EMPTY','wizOCkMZlR','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f4hlfc8th9sf9l','a237c28c-c77b-4804-9cdd-fcfcef93babc',10,'EMPTY','VYNdWQfbxi','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f5hlfc15ki5sep','a237c28c-c77b-4804-9cdd-fcfcef93babc',11,'EMPTY','EofRFW1BAc','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f6hlfciv0hy334','a237c28c-c77b-4804-9cdd-fcfcef93babc',12,'EMPTY','ucZe7NsgKK','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f7hlfc8f74nb0f','a237c28c-c77b-4804-9cdd-fcfcef93babc',13,'EMPTY','QnoKu2fiwS','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f8hlfc6hm127a1','a237c28c-c77b-4804-9cdd-fcfcef93babc',14,'EMPTY','n6jnQ_I9E2','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700f9hlfckbb77mhj','a237c28c-c77b-4804-9cdd-fcfcef93babc',15,'EMPTY','PsPuaZWWzm','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fahlfc5zmu91fe','a237c28c-c77b-4804-9cdd-fcfcef93babc',16,'EMPTY','toLbsJ6ieB','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fbhlfcar72q7cm','a237c28c-c77b-4804-9cdd-fcfcef93babc',17,'EMPTY','38fUlfgwk9','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fchlfcv74l6xa2','a237c28c-c77b-4804-9cdd-fcfcef93babc',18,'EMPTY','MQ-WryEIr_','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fdhlfc40i7saqt','a237c28c-c77b-4804-9cdd-fcfcef93babc',19,'EMPTY','8XmBaC3e-b','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fehlfctdj5gd4s','a237c28c-c77b-4804-9cdd-fcfcef93babc',20,'EMPTY','Iv94ZtflQD','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700ffhlfcj2mleqlo','a237c28c-c77b-4804-9cdd-fcfcef93babc',21,'EMPTY','A32HHwLapF','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fghlfc1q0w7wil','a237c28c-c77b-4804-9cdd-fcfcef93babc',22,'EMPTY','Q8iIHKxbs-','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fhhlfc34cytszk','a237c28c-c77b-4804-9cdd-fcfcef93babc',23,'EMPTY','ck7bZn4Z_j','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fihlfcx9iows26','a237c28c-c77b-4804-9cdd-fcfcef93babc',24,'EMPTY','dAcGWNxiLn','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fjhlfcgl09b89x','a237c28c-c77b-4804-9cdd-fcfcef93babc',25,'EMPTY','NWmwfKOM6N','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fkhlfc5pdr9py7','a237c28c-c77b-4804-9cdd-fcfcef93babc',26,'EMPTY','kLctNO-Exs','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700flhlfc5yhbszpx','a237c28c-c77b-4804-9cdd-fcfcef93babc',27,'EMPTY','VMg6n81Tc7','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fmhlfcovmcltvj','a237c28c-c77b-4804-9cdd-fcfcef93babc',28,'EMPTY','TDxrMbCp58','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fnhlfc71f3x4q6','a237c28c-c77b-4804-9cdd-fcfcef93babc',29,'EMPTY','92pOsTxZPF','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fohlfctf0zby3r','a237c28c-c77b-4804-9cdd-fcfcef93babc',30,'EMPTY','Zl690eCpWV','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr700fphlfc95lyzerm','a237c28c-c77b-4804-9cdd-fcfcef93babc',31,'EMPTY','8Ob-pGSI3-','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fqhlfcz5f6fke8','a237c28c-c77b-4804-9cdd-fcfcef93babc',32,'EMPTY','jNbTxao4fg','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800frhlfcs9z2tebo','a237c28c-c77b-4804-9cdd-fcfcef93babc',33,'EMPTY','2s9P3MO13N','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fshlfcnn0b64pr','a237c28c-c77b-4804-9cdd-fcfcef93babc',34,'EMPTY','XT1wA-4K5a','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fthlfcoej8ezep','a237c28c-c77b-4804-9cdd-fcfcef93babc',35,'EMPTY','oLtRVBtoqU','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fuhlfc8lgul34u','a237c28c-c77b-4804-9cdd-fcfcef93babc',36,'EMPTY','DFnXE97OUF','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fvhlfclkp0fo8m','a237c28c-c77b-4804-9cdd-fcfcef93babc',37,'EMPTY','_M-uRMDUPT','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fwhlfc2p0fg9kv','a237c28c-c77b-4804-9cdd-fcfcef93babc',38,'EMPTY','2bemJgRJl2','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fxhlfc7dkq49yn','a237c28c-c77b-4804-9cdd-fcfcef93babc',39,'EMPTY','Qri6l6enbT','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3adr800fyhlfc30rb8w4w','a237c28c-c77b-4804-9cdd-fcfcef93babc',40,'EMPTY','gOV5udHQA5','2026-05-28 03:51:40.578','2026-04-28 03:51:40.579'),('cmoi3ae0100g0hlfc38kwbc0o','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',1,'EMPTY','iI-U1R_b1M','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g1hlfc8rt4doza','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',2,'EMPTY','xg18FZpIjt','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g2hlfctnc73yt2','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',3,'EMPTY','44ro6IiQn3','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g3hlfc73nb27ih','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',4,'EMPTY','Kuuwty_uge','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g4hlfcmdjpd56p','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',5,'EMPTY','vLWaoHfZIT','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g5hlfc9rb9n0dm','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',6,'EMPTY','nrWY9o7OO2','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g6hlfcwld636ib','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',7,'EMPTY','4OGqEHcFRh','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g7hlfcaobimwex','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',8,'EMPTY','7Fx0Hvi4Gp','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g8hlfc7h6tmeug','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',9,'EMPTY','i_YhDhxIJk','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100g9hlfczdyu11h0','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',10,'EMPTY','eGsZow_oPz','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gahlfczwmi22mr','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',11,'EMPTY','vrVH0y9MQy','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gbhlfcevhd3bz6','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',12,'EMPTY','BmlHOc59M-','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gchlfc26ugvpgd','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',13,'EMPTY','ONSlxWwdCh','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gdhlfc39uen2ip','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',14,'EMPTY','CtyLuD-j53','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gehlfc4rd8lhc6','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',15,'EMPTY','zXBrRcJFVC','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gfhlfcjknoheeu','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',16,'EMPTY','SGg0FDde9e','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gghlfchmx4hjye','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',17,'EMPTY','Fuxse4Jj3o','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100ghhlfc8idwp25c','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',18,'EMPTY','rbXaUO7jMK','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0100gihlfchzdxqq6y','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',19,'EMPTY','I4qRbdm2eh','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gjhlfcio8xa71h','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',20,'EMPTY','aCnXlpkNE5','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gkhlfcnluytu73','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',21,'EMPTY','8Vwyo23Drc','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200glhlfcvz01befx','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',22,'EMPTY','zAtjPa0gmX','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gmhlfcsey1cosa','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',23,'EMPTY','dmNT06Ma79','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gnhlfc3fpov1r2','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',24,'EMPTY','9XEHgeoRbU','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gohlfcca7uxc1m','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',25,'EMPTY','-xzmn9ClEp','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gphlfc2tf8afle','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',26,'EMPTY','7aIfvxY77v','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gqhlfcgi24cyrb','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',27,'EMPTY','YDp9JnL5_U','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200grhlfcl673ts8p','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',28,'EMPTY','fMGCzOcY1d','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gshlfcv2xhx8uw','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',29,'EMPTY','nzHw25nOC9','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gthlfcraugalyk','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',30,'EMPTY','o7K313V73x','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200guhlfc7t4ce69g','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',31,'EMPTY','E-x6_mWtSn','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gvhlfcz65glr4c','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',32,'EMPTY','vUhr4pgcpB','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gwhlfcwlu9t4t1','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',33,'EMPTY','bbQ9Fe06w-','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gxhlfc3avw583u','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',34,'EMPTY','2cmlgEt58R','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gyhlfctzlofrvw','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',35,'EMPTY','4K2a6AkJuw','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200gzhlfcl0f4gyw1','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',36,'EMPTY','1il0Zf-dGj','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200h0hlfcni2ah2ei','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',37,'EMPTY','_3yEQEXp1Y','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200h1hlfcad13y7lk','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',38,'EMPTY','OevR8_Qkhx','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200h2hlfcr8hb7jpl','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',39,'EMPTY','6OqI-eTSAS','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae0200h3hlfcgbs8ou0a','46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6',40,'EMPTY','hisRZ0PfHU','2026-05-28 03:51:40.896','2026-04-28 03:51:40.898'),('cmoi3ae3800h5hlfctj9vrzvu','485b4c5c-4aa4-4568-9cdf-573d925c8bff',1,'EMPTY','X_es5hC3vv','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800h6hlfcdvyw0w3r','485b4c5c-4aa4-4568-9cdf-573d925c8bff',2,'EMPTY','un4PuIXVkP','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800h7hlfcrt3bbtba','485b4c5c-4aa4-4568-9cdf-573d925c8bff',3,'EMPTY','dFxfFCXAr5','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800h8hlfc5dibvcla','485b4c5c-4aa4-4568-9cdf-573d925c8bff',4,'EMPTY','8iLJaZXduK','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800h9hlfcj7wwgk57','485b4c5c-4aa4-4568-9cdf-573d925c8bff',5,'EMPTY','a-TuIYlUYD','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hahlfcgj4x25ul','485b4c5c-4aa4-4568-9cdf-573d925c8bff',6,'EMPTY','jjcKp-2STF','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hbhlfccrnp2u7z','485b4c5c-4aa4-4568-9cdf-573d925c8bff',7,'EMPTY','6Re2GjUlE6','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hchlfcmunb41g7','485b4c5c-4aa4-4568-9cdf-573d925c8bff',8,'EMPTY','kxf8FMXXlg','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hdhlfcqmcqha8v','485b4c5c-4aa4-4568-9cdf-573d925c8bff',9,'EMPTY','v7BvmCm4D3','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hehlfcqfo9yyxy','485b4c5c-4aa4-4568-9cdf-573d925c8bff',10,'EMPTY','BLAI3FmC7y','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hfhlfcp8jnm7q6','485b4c5c-4aa4-4568-9cdf-573d925c8bff',11,'EMPTY','APGuiObNL9','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hghlfc52c20sqy','485b4c5c-4aa4-4568-9cdf-573d925c8bff',12,'EMPTY','hhfMpi8XRE','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hhhlfc0t4m2tc5','485b4c5c-4aa4-4568-9cdf-573d925c8bff',13,'EMPTY','nW0CL4jBsZ','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hihlfc48h2vyfc','485b4c5c-4aa4-4568-9cdf-573d925c8bff',14,'EMPTY','QAkQUZjiiW','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hjhlfc5znkblao','485b4c5c-4aa4-4568-9cdf-573d925c8bff',15,'EMPTY','n6AJ_s9ws8','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hkhlfcbr6vxvo1','485b4c5c-4aa4-4568-9cdf-573d925c8bff',16,'EMPTY','D1-lsljZkr','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hlhlfccbhih238','485b4c5c-4aa4-4568-9cdf-573d925c8bff',17,'EMPTY','JgrZPGBRrY','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hmhlfcnvq1ez9k','485b4c5c-4aa4-4568-9cdf-573d925c8bff',18,'EMPTY','HpqkeMGOTP','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hnhlfcmo7wqg43','485b4c5c-4aa4-4568-9cdf-573d925c8bff',19,'EMPTY','twqXWMw3mV','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hohlfc2xbbl09w','485b4c5c-4aa4-4568-9cdf-573d925c8bff',20,'EMPTY','fft0whrsdi','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hphlfcx5kl4eae','485b4c5c-4aa4-4568-9cdf-573d925c8bff',21,'EMPTY','8oh8eWcZiD','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hqhlfcgn3koxcy','485b4c5c-4aa4-4568-9cdf-573d925c8bff',22,'EMPTY','vRly_1yPKe','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hrhlfc2b5ju6iz','485b4c5c-4aa4-4568-9cdf-573d925c8bff',23,'EMPTY','Bbg6XmsuZH','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hshlfcyjmz249t','485b4c5c-4aa4-4568-9cdf-573d925c8bff',24,'EMPTY','hQKTdGKKLl','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hthlfcz0jpemrd','485b4c5c-4aa4-4568-9cdf-573d925c8bff',25,'EMPTY','ktTzPLyqXJ','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800huhlfcsh4nhdkm','485b4c5c-4aa4-4568-9cdf-573d925c8bff',26,'EMPTY','UsrVRrwQT5','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hvhlfccj7tjlpl','485b4c5c-4aa4-4568-9cdf-573d925c8bff',27,'EMPTY','CSGnhmaiJH','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hwhlfcaysns9sc','485b4c5c-4aa4-4568-9cdf-573d925c8bff',28,'EMPTY','zeGNuktZj6','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hxhlfc4gnvecsc','485b4c5c-4aa4-4568-9cdf-573d925c8bff',29,'EMPTY','1vrZgFpqbx','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hyhlfczj3rsx9s','485b4c5c-4aa4-4568-9cdf-573d925c8bff',30,'EMPTY','X42ciYBnmK','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800hzhlfcxcsaeiyk','485b4c5c-4aa4-4568-9cdf-573d925c8bff',31,'EMPTY','xbiT7OpEnw','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i0hlfcwinixbpt','485b4c5c-4aa4-4568-9cdf-573d925c8bff',32,'EMPTY','JoeCrSSK0j','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i1hlfc1o7mqfmb','485b4c5c-4aa4-4568-9cdf-573d925c8bff',33,'EMPTY','ZEMinzxVQs','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i2hlfcxsyo1wes','485b4c5c-4aa4-4568-9cdf-573d925c8bff',34,'EMPTY','wmymSHcie6','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i3hlfcchtnds4i','485b4c5c-4aa4-4568-9cdf-573d925c8bff',35,'EMPTY','Wp3r9N7MTS','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i4hlfc5dox54ov','485b4c5c-4aa4-4568-9cdf-573d925c8bff',36,'EMPTY','mpV5OQcEcR','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i5hlfcx0xbpxce','485b4c5c-4aa4-4568-9cdf-573d925c8bff',37,'EMPTY','eVey0hpWlm','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i6hlfc71di3ehb','485b4c5c-4aa4-4568-9cdf-573d925c8bff',38,'EMPTY','_VoCCHiq2N','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i7hlfck1a08ylh','485b4c5c-4aa4-4568-9cdf-573d925c8bff',39,'EMPTY','fjy_P243xo','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3ae3800i8hlfcqb8hct4p','485b4c5c-4aa4-4568-9cdf-573d925c8bff',40,'EMPTY','-cNdq3NyGZ','2026-05-28 03:51:41.010','2026-04-28 03:51:41.012'),('cmoi3aeaj00iahlfcgus27j1a','3c185166-f88c-42d7-8e36-b25fa7d782a8',1,'EMPTY','DGBxR8X_6w','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00ibhlfciz5wmfg3','3c185166-f88c-42d7-8e36-b25fa7d782a8',2,'EMPTY','TqBYQPsJnN','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00ichlfcvuxwt5l9','3c185166-f88c-42d7-8e36-b25fa7d782a8',3,'EMPTY','5iKuSwzYrc','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00idhlfc14ywhf67','3c185166-f88c-42d7-8e36-b25fa7d782a8',4,'EMPTY','kvn1KVGAIl','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00iehlfc21c5t3my','3c185166-f88c-42d7-8e36-b25fa7d782a8',5,'EMPTY','OqGOoRvhIE','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00ifhlfc97hsfvj0','3c185166-f88c-42d7-8e36-b25fa7d782a8',6,'EMPTY','XuwP7cr8qm','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeaj00ighlfck3blyczs','3c185166-f88c-42d7-8e36-b25fa7d782a8',7,'EMPTY','Y6Ek6itJIP','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ihhlfcptfv70kn','3c185166-f88c-42d7-8e36-b25fa7d782a8',8,'EMPTY','9rdUVP9EES','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iihlfcdrxjavlm','3c185166-f88c-42d7-8e36-b25fa7d782a8',9,'EMPTY','E0dW1zuUi7','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ijhlfc484emzhw','3c185166-f88c-42d7-8e36-b25fa7d782a8',10,'EMPTY','ikyo4j9HRB','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ikhlfc0ud36pa9','3c185166-f88c-42d7-8e36-b25fa7d782a8',11,'EMPTY','YtdXj19fVv','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ilhlfco3f3yr5c','3c185166-f88c-42d7-8e36-b25fa7d782a8',12,'EMPTY','MLbY7WQymX','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00imhlfckp50xh3p','3c185166-f88c-42d7-8e36-b25fa7d782a8',13,'EMPTY','FkIqVsMeJz','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00inhlfcozec37yq','3c185166-f88c-42d7-8e36-b25fa7d782a8',14,'EMPTY','wVsXtl5ltu','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iohlfc29t6khay','3c185166-f88c-42d7-8e36-b25fa7d782a8',15,'EMPTY','lBpq2lrETN','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iphlfcey0karkn','3c185166-f88c-42d7-8e36-b25fa7d782a8',16,'EMPTY','JG5pLFpPPI','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iqhlfcs3tbukmc','3c185166-f88c-42d7-8e36-b25fa7d782a8',17,'EMPTY','b_oExWD84-','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00irhlfcud0rpbs9','3c185166-f88c-42d7-8e36-b25fa7d782a8',18,'EMPTY','qMfHXQCTNt','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ishlfcttgkq9nk','3c185166-f88c-42d7-8e36-b25fa7d782a8',19,'EMPTY','D4aBAQDPrS','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ithlfcq1grhc2c','3c185166-f88c-42d7-8e36-b25fa7d782a8',20,'EMPTY','HWAy7Yr1mf','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iuhlfcye7oo7xg','3c185166-f88c-42d7-8e36-b25fa7d782a8',21,'EMPTY','kfGsoujgiI','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ivhlfcmr93ln8e','3c185166-f88c-42d7-8e36-b25fa7d782a8',22,'EMPTY','QmDNstIXwl','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iwhlfcdf2t6pqh','3c185166-f88c-42d7-8e36-b25fa7d782a8',23,'EMPTY','9Vd6-6IY_c','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00ixhlfcal0e1hng','3c185166-f88c-42d7-8e36-b25fa7d782a8',24,'EMPTY','yfO0M5qSsE','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00iyhlfcypmok523','3c185166-f88c-42d7-8e36-b25fa7d782a8',25,'EMPTY','TwPnFUToWs','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00izhlfcs8gcr01w','3c185166-f88c-42d7-8e36-b25fa7d782a8',26,'EMPTY','8ILLw8ZB52','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j0hlfcffwokomn','3c185166-f88c-42d7-8e36-b25fa7d782a8',27,'EMPTY','f3cXQF59Mi','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j1hlfc0fvz8m6o','3c185166-f88c-42d7-8e36-b25fa7d782a8',28,'EMPTY','o5gY9aVevP','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j2hlfcnlp2fhgc','3c185166-f88c-42d7-8e36-b25fa7d782a8',29,'EMPTY','9uqenObTDi','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j3hlfcuvmjh805','3c185166-f88c-42d7-8e36-b25fa7d782a8',30,'EMPTY','SUgTHA0HpN','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j4hlfcht34nbwu','3c185166-f88c-42d7-8e36-b25fa7d782a8',31,'EMPTY','kX0EEDV_65','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j5hlfcsbbws2k2','3c185166-f88c-42d7-8e36-b25fa7d782a8',32,'EMPTY','OoGrvpq1K6','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j6hlfc3lhl1qds','3c185166-f88c-42d7-8e36-b25fa7d782a8',33,'EMPTY','Q1Zwdea_4N','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j7hlfcfplxp83h','3c185166-f88c-42d7-8e36-b25fa7d782a8',34,'EMPTY','oiiV0QsGr8','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j8hlfc3p061x03','3c185166-f88c-42d7-8e36-b25fa7d782a8',35,'EMPTY','JSuHzHH92M','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00j9hlfc342dn0vi','3c185166-f88c-42d7-8e36-b25fa7d782a8',36,'EMPTY','y0uQr7WfPh','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00jahlfclhuzramn','3c185166-f88c-42d7-8e36-b25fa7d782a8',37,'EMPTY','eAMb4hX5oi','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00jbhlfcpvc706oa','3c185166-f88c-42d7-8e36-b25fa7d782a8',38,'EMPTY','RhHxoyKhm-','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00jchlfc1hfp4g8t','3c185166-f88c-42d7-8e36-b25fa7d782a8',39,'EMPTY','Wcu3GWK2FP','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aeak00jdhlfcioz7b7be','3c185166-f88c-42d7-8e36-b25fa7d782a8',40,'EMPTY','QuEn7m0YCY','2026-05-28 03:51:41.274','2026-04-28 03:51:41.276'),('cmoi3aedw00jfhlfci7s6gur4','532f58b1-4cdc-4383-a315-7b2387b5be20',1,'EMPTY','3gx0o9G36t','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jghlfcrkoty19z','532f58b1-4cdc-4383-a315-7b2387b5be20',2,'EMPTY','dP7qa0qwJc','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jhhlfc86rhkkdj','532f58b1-4cdc-4383-a315-7b2387b5be20',3,'EMPTY','TuEtxmKEiJ','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jihlfc6o2v06nl','532f58b1-4cdc-4383-a315-7b2387b5be20',4,'EMPTY','pFTdG03eLX','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jjhlfccxrw0301','532f58b1-4cdc-4383-a315-7b2387b5be20',5,'EMPTY','TrYkISnsdv','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jkhlfc3hjj2dhq','532f58b1-4cdc-4383-a315-7b2387b5be20',6,'EMPTY','zmsVR_owWf','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jlhlfcqcbl7njy','532f58b1-4cdc-4383-a315-7b2387b5be20',7,'EMPTY','mj77cd3ZM9','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jmhlfc5z3yxl0d','532f58b1-4cdc-4383-a315-7b2387b5be20',8,'EMPTY','tW0O1kPRwk','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jnhlfcujzft6yt','532f58b1-4cdc-4383-a315-7b2387b5be20',9,'EMPTY','_f0Xia9y9a','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00johlfc2k52igce','532f58b1-4cdc-4383-a315-7b2387b5be20',10,'EMPTY','LbFihmXnfx','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jphlfchtcwhyac','532f58b1-4cdc-4383-a315-7b2387b5be20',11,'EMPTY','dK6Z4BuyfB','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jqhlfcuqcjonjt','532f58b1-4cdc-4383-a315-7b2387b5be20',12,'EMPTY','A6ZAok3Bzl','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jrhlfcj2iuz53z','532f58b1-4cdc-4383-a315-7b2387b5be20',13,'EMPTY','GbTtLjY4Ey','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jshlfciv93w8k6','532f58b1-4cdc-4383-a315-7b2387b5be20',14,'EMPTY','5_Lb52Pjpm','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jthlfc8oc9ai8k','532f58b1-4cdc-4383-a315-7b2387b5be20',15,'EMPTY','FO_LJrW69Q','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00juhlfcfjt1lovg','532f58b1-4cdc-4383-a315-7b2387b5be20',16,'EMPTY','ohrIwtc6lO','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jvhlfc58697o2u','532f58b1-4cdc-4383-a315-7b2387b5be20',17,'EMPTY','OW3tSOuvKF','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jwhlfcvxdzro4m','532f58b1-4cdc-4383-a315-7b2387b5be20',18,'EMPTY','Dvg90OWKkL','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jxhlfcno4nnumb','532f58b1-4cdc-4383-a315-7b2387b5be20',19,'EMPTY','Hhv-bvsOn_','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jyhlfc8t71qxvi','532f58b1-4cdc-4383-a315-7b2387b5be20',20,'EMPTY','GIkssOENdV','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00jzhlfcc0t08bqj','532f58b1-4cdc-4383-a315-7b2387b5be20',21,'EMPTY','uW4_1VVkZ6','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k0hlfcmef1bs99','532f58b1-4cdc-4383-a315-7b2387b5be20',22,'EMPTY','Kv3GuPs6RH','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k1hlfc1sjm3w84','532f58b1-4cdc-4383-a315-7b2387b5be20',23,'EMPTY','Su-FHQHoX9','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k2hlfcyux7kbkt','532f58b1-4cdc-4383-a315-7b2387b5be20',24,'EMPTY','D9cxD7cIZo','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k3hlfcoagiig9b','532f58b1-4cdc-4383-a315-7b2387b5be20',25,'EMPTY','Mb922tqre_','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k4hlfct4cjyry4','532f58b1-4cdc-4383-a315-7b2387b5be20',26,'EMPTY','GTwfRtscuO','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k5hlfcu668xeol','532f58b1-4cdc-4383-a315-7b2387b5be20',27,'EMPTY','gzBJ40TQM9','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k6hlfcgqxm5jiu','532f58b1-4cdc-4383-a315-7b2387b5be20',28,'EMPTY','e3dcGZQOo7','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k7hlfcipcw4wkp','532f58b1-4cdc-4383-a315-7b2387b5be20',29,'EMPTY','Uen8OX99iO','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k8hlfco1b5vi8o','532f58b1-4cdc-4383-a315-7b2387b5be20',30,'EMPTY','opwUkfg9mw','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00k9hlfcwh9n0mg0','532f58b1-4cdc-4383-a315-7b2387b5be20',31,'EMPTY','USSKTInqqg','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00kahlfc8lfb04y6','532f58b1-4cdc-4383-a315-7b2387b5be20',32,'EMPTY','_cS0jVjcnF','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedw00kbhlfc6z0y0r9t','532f58b1-4cdc-4383-a315-7b2387b5be20',33,'EMPTY','NicWxEJP8g','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kchlfc17iajq0o','532f58b1-4cdc-4383-a315-7b2387b5be20',34,'EMPTY','cehbYoU5v8','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kdhlfcgdkoz9od','532f58b1-4cdc-4383-a315-7b2387b5be20',35,'EMPTY','v7PRWSytxO','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kehlfc0yqualoq','532f58b1-4cdc-4383-a315-7b2387b5be20',36,'EMPTY','hRY4ink1s4','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kfhlfcwu35qlxa','532f58b1-4cdc-4383-a315-7b2387b5be20',37,'EMPTY','lw_vi7C6dp','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kghlfcepf7xco7','532f58b1-4cdc-4383-a315-7b2387b5be20',38,'EMPTY','YtJSu-AlMT','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00khhlfcm397vrs1','532f58b1-4cdc-4383-a315-7b2387b5be20',39,'EMPTY','Sp1GdEqxXY','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aedx00kihlfcq4o492cz','532f58b1-4cdc-4383-a315-7b2387b5be20',40,'EMPTY','Teo_LhPpT4','2026-05-28 03:51:41.395','2026-04-28 03:51:41.396'),('cmoi3aelz00kkhlfccup7mord','8ab2ba88-1641-4e09-beab-f886d82e7806',1,'EMPTY','ldy2CN9M0A','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00klhlfc5re4dpee','8ab2ba88-1641-4e09-beab-f886d82e7806',2,'EMPTY','59yFpQ6pB9','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kmhlfcib1uv8mt','8ab2ba88-1641-4e09-beab-f886d82e7806',3,'EMPTY','g0H-uCf5I4','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00knhlfcg2smtfxs','8ab2ba88-1641-4e09-beab-f886d82e7806',4,'EMPTY','kUYN6BZokF','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kohlfc9hpaedaz','8ab2ba88-1641-4e09-beab-f886d82e7806',5,'EMPTY','36gJczYKNH','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kphlfc34e5viwe','8ab2ba88-1641-4e09-beab-f886d82e7806',6,'EMPTY','nHThMbTds_','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kqhlfckptsejfr','8ab2ba88-1641-4e09-beab-f886d82e7806',7,'EMPTY','S8ILzRi5jV','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00krhlfclkass2cj','8ab2ba88-1641-4e09-beab-f886d82e7806',8,'EMPTY','SoPStxEjTF','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kshlfcaw33cz41','8ab2ba88-1641-4e09-beab-f886d82e7806',9,'EMPTY','fOWtTysWXL','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kthlfcpx9uiqly','8ab2ba88-1641-4e09-beab-f886d82e7806',10,'EMPTY','Fhc9_W3F22','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kuhlfcq8jdwj23','8ab2ba88-1641-4e09-beab-f886d82e7806',11,'EMPTY','Zzx3sUIank','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kvhlfctiyz285y','8ab2ba88-1641-4e09-beab-f886d82e7806',12,'EMPTY','hAUJ3KOQ2m','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kwhlfcncb97jur','8ab2ba88-1641-4e09-beab-f886d82e7806',13,'EMPTY','4EwGNyEDyT','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kxhlfcb1wnttds','8ab2ba88-1641-4e09-beab-f886d82e7806',14,'EMPTY','eEJ4l7ooMx','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kyhlfcgu6rw11f','8ab2ba88-1641-4e09-beab-f886d82e7806',15,'EMPTY','I-XrJLpfu8','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00kzhlfc6wxrztm5','8ab2ba88-1641-4e09-beab-f886d82e7806',16,'EMPTY','bp1z_NKnTK','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l0hlfc8dl64scu','8ab2ba88-1641-4e09-beab-f886d82e7806',17,'EMPTY','Oi0Mm8lkeo','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l1hlfc58cufuz7','8ab2ba88-1641-4e09-beab-f886d82e7806',18,'EMPTY','7AdDEIbddU','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l2hlfc2j7047nc','8ab2ba88-1641-4e09-beab-f886d82e7806',19,'EMPTY','5tk_iW90Yk','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l3hlfc161p9bkg','8ab2ba88-1641-4e09-beab-f886d82e7806',20,'EMPTY','3Rk9WBvNeL','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l4hlfcr9xwj1vj','8ab2ba88-1641-4e09-beab-f886d82e7806',21,'EMPTY','1PbXlSO1Q1','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l5hlfcl0r3etx9','8ab2ba88-1641-4e09-beab-f886d82e7806',22,'EMPTY','zLYxeSrTrj','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l6hlfcalcitg0h','8ab2ba88-1641-4e09-beab-f886d82e7806',23,'EMPTY','d6fy_lGcnU','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l7hlfc2jqj1lue','8ab2ba88-1641-4e09-beab-f886d82e7806',24,'EMPTY','H0hpV4kOxE','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l8hlfcir1pb9sl','8ab2ba88-1641-4e09-beab-f886d82e7806',25,'EMPTY','YwgSDIzKG8','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00l9hlfc4k0pw7eq','8ab2ba88-1641-4e09-beab-f886d82e7806',26,'EMPTY','NziQmYF_w9','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lahlfcxbuz7be5','8ab2ba88-1641-4e09-beab-f886d82e7806',27,'EMPTY','LeoOqDNUqk','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lbhlfceyw5bi8b','8ab2ba88-1641-4e09-beab-f886d82e7806',28,'EMPTY','7NGZTrxsH5','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lchlfcn1ue98du','8ab2ba88-1641-4e09-beab-f886d82e7806',29,'EMPTY','dGHl6Zo0t6','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00ldhlfcjuftw661','8ab2ba88-1641-4e09-beab-f886d82e7806',30,'EMPTY','hdzZySVKpR','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lehlfcz26qv0q2','8ab2ba88-1641-4e09-beab-f886d82e7806',31,'EMPTY','CotHA3cH4W','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lfhlfcnd27jy92','8ab2ba88-1641-4e09-beab-f886d82e7806',32,'EMPTY','i1gXkou0jq','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lghlfcwjdpc760','8ab2ba88-1641-4e09-beab-f886d82e7806',33,'EMPTY','NCS4DtLvfL','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lhhlfcpbo36poe','8ab2ba88-1641-4e09-beab-f886d82e7806',34,'EMPTY','QMVulBBY9z','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lihlfcrwbvhc9p','8ab2ba88-1641-4e09-beab-f886d82e7806',35,'EMPTY','exrJ_YCmvo','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00ljhlfcvbydvqyb','8ab2ba88-1641-4e09-beab-f886d82e7806',36,'EMPTY','Jbab3VeURW','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lkhlfcyxkwmarv','8ab2ba88-1641-4e09-beab-f886d82e7806',37,'EMPTY','Ekq5TA83Oi','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00llhlfcp4c92pgd','8ab2ba88-1641-4e09-beab-f886d82e7806',38,'EMPTY','pxlvjbEH10','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lmhlfcirceia9t','8ab2ba88-1641-4e09-beab-f886d82e7806',39,'EMPTY','br7nsuSn50','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aelz00lnhlfcvp4brt8h','8ab2ba88-1641-4e09-beab-f886d82e7806',40,'EMPTY','GmDDTWKFyE','2026-05-28 03:51:41.686','2026-04-28 03:51:41.687'),('cmoi3aeqp00lphlfci2bw9gai','b929b5c5-44e1-437f-ada9-736e105bf647',1,'EMPTY','CMlQZ5rdbK','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lqhlfcgkckr6xn','b929b5c5-44e1-437f-ada9-736e105bf647',2,'EMPTY','8mxEa6P-iW','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lrhlfch7krtk8e','b929b5c5-44e1-437f-ada9-736e105bf647',3,'EMPTY','EZIcgPefwB','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lshlfc83cuo1pz','b929b5c5-44e1-437f-ada9-736e105bf647',4,'EMPTY','F4_esmG37c','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lthlfchrkfak7h','b929b5c5-44e1-437f-ada9-736e105bf647',5,'EMPTY','iBbFyYnm0G','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00luhlfcbzrl1ru5','b929b5c5-44e1-437f-ada9-736e105bf647',6,'EMPTY','UorEk9vmlO','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lvhlfcnncszq8t','b929b5c5-44e1-437f-ada9-736e105bf647',7,'EMPTY','Nfl7ZghEn9','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lwhlfct2agdmz0','b929b5c5-44e1-437f-ada9-736e105bf647',8,'EMPTY','7F2B9qGKfq','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lxhlfcb2ph3i1i','b929b5c5-44e1-437f-ada9-736e105bf647',9,'EMPTY','pedo3F-Q1d','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqp00lyhlfc0wvtknt9','b929b5c5-44e1-437f-ada9-736e105bf647',10,'EMPTY','iELpwDiiqn','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00lzhlfcn1d5lx93','b929b5c5-44e1-437f-ada9-736e105bf647',11,'EMPTY','9_yiXIK4IP','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m0hlfczn2sa9cc','b929b5c5-44e1-437f-ada9-736e105bf647',12,'EMPTY','zRj_eTiqGk','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m1hlfco0a3ohn9','b929b5c5-44e1-437f-ada9-736e105bf647',13,'EMPTY','FP2mbLriSX','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m2hlfcv0y0pqm2','b929b5c5-44e1-437f-ada9-736e105bf647',14,'EMPTY','PrtakAYOq6','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m3hlfcbekvthvx','b929b5c5-44e1-437f-ada9-736e105bf647',15,'EMPTY','RAwgdynKhA','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m4hlfcv0x649hm','b929b5c5-44e1-437f-ada9-736e105bf647',16,'EMPTY','19RlPT-tXh','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m5hlfcxr8gen9d','b929b5c5-44e1-437f-ada9-736e105bf647',17,'EMPTY','LwQ8QtG4Mo','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m6hlfcysf4kx38','b929b5c5-44e1-437f-ada9-736e105bf647',18,'EMPTY','c7J_ER6SMj','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m7hlfcnrzif3tc','b929b5c5-44e1-437f-ada9-736e105bf647',19,'EMPTY','sdhXnHIyfx','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m8hlfcq79prkhw','b929b5c5-44e1-437f-ada9-736e105bf647',20,'EMPTY','Je8J8k8Ygi','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00m9hlfct15ydzx6','b929b5c5-44e1-437f-ada9-736e105bf647',21,'EMPTY','_TSXIyyXFF','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mahlfcfpdaimll','b929b5c5-44e1-437f-ada9-736e105bf647',22,'EMPTY','_UCpwsHRAc','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mbhlfct7zj1kve','b929b5c5-44e1-437f-ada9-736e105bf647',23,'EMPTY','xqJMMz3Md8','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mchlfca0ob6mjv','b929b5c5-44e1-437f-ada9-736e105bf647',24,'EMPTY','wZyKmq37YQ','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mdhlfc6qgiiria','b929b5c5-44e1-437f-ada9-736e105bf647',25,'EMPTY','Pr_vo68u7x','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mehlfchwmgjqmw','b929b5c5-44e1-437f-ada9-736e105bf647',26,'EMPTY','Z34HzbuX1t','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mfhlfc8rnqvw7q','b929b5c5-44e1-437f-ada9-736e105bf647',27,'EMPTY','PKfHIlIIAC','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mghlfc4p75rkgm','b929b5c5-44e1-437f-ada9-736e105bf647',28,'EMPTY','3vTd_R2JS8','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mhhlfcdequoks2','b929b5c5-44e1-437f-ada9-736e105bf647',29,'EMPTY','qJl431rzZQ','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mihlfcw1jmjlsd','b929b5c5-44e1-437f-ada9-736e105bf647',30,'EMPTY','5MpvvMVa4U','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mjhlfckfjlhgu1','b929b5c5-44e1-437f-ada9-736e105bf647',31,'EMPTY','tm8vc2sNfy','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mkhlfctb07423p','b929b5c5-44e1-437f-ada9-736e105bf647',32,'EMPTY','FxnPrN4dCp','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mlhlfcall0zkvc','b929b5c5-44e1-437f-ada9-736e105bf647',33,'EMPTY','M3ZD5dT2OF','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mmhlfc2grgrv37','b929b5c5-44e1-437f-ada9-736e105bf647',34,'EMPTY','hwDTlJKqnV','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mnhlfc7xac5bvx','b929b5c5-44e1-437f-ada9-736e105bf647',35,'EMPTY','qlySeJ7_V8','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mohlfc8wd1gsfm','b929b5c5-44e1-437f-ada9-736e105bf647',36,'EMPTY','It0xhJsCBT','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mphlfc67kvt8x8','b929b5c5-44e1-437f-ada9-736e105bf647',37,'EMPTY','HqIqNhdwbY','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mqhlfcq3u8ciko','b929b5c5-44e1-437f-ada9-736e105bf647',38,'EMPTY','u51YYD8KSo','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mrhlfcdl38gjjf','b929b5c5-44e1-437f-ada9-736e105bf647',39,'EMPTY','x7y65ulL3G','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aeqq00mshlfc27zkxphi','b929b5c5-44e1-437f-ada9-736e105bf647',40,'EMPTY','rYYrap8rjR','2026-05-28 03:51:41.855','2026-04-28 03:51:41.858'),('cmoi3aez800muhlfcoj9d22tw','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',1,'EMPTY','CA8Aysc8jJ','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800mvhlfc3nyvxizn','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',2,'EMPTY','JXDX_gXCx6','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800mwhlfct4xi4z8t','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',3,'EMPTY','EawJIjUDIR','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800mxhlfce9n4wsj2','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',4,'EMPTY','KkJyfgOkFT','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800myhlfcxmnv63l0','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',5,'EMPTY','o-AOGUIdUq','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800mzhlfcdrowq7sj','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',6,'EMPTY','3qxSqqZFRF','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800n0hlfcs7enpvzm','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',7,'EMPTY','GZTR_9EHd8','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800n1hlfc1pyuqhrr','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',8,'EMPTY','BSAMTiZoFo','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez800n2hlfcpvaibtop','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',9,'EMPTY','yFmxGBOC3P','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n3hlfc074l09ua','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',10,'EMPTY','bojHp2_jyv','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n4hlfcq9bfd1l5','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',11,'EMPTY','3c8Ibg5JMI','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n5hlfc9djdzeoz','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',12,'EMPTY','cJo5LCDiUp','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n6hlfc0fuox95z','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',13,'EMPTY','oAZT_IS9Np','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n7hlfcly83gugm','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',14,'EMPTY','MQ8fWCLSdK','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n8hlfc59pjz18r','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',15,'EMPTY','4UEMzcdei-','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900n9hlfccq9lymu1','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',16,'EMPTY','WBFSIR6LpI','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nahlfcqnlo7wqp','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',17,'EMPTY','5FF-WRpe8z','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nbhlfc8fr67y1s','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',18,'EMPTY','vNqPM0SEfX','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nchlfcdsgree69','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',19,'EMPTY','WfU9x3Dsgy','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900ndhlfccr0kam8x','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',20,'EMPTY','8_E_bHDCw1','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nehlfcqmhssuac','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',21,'EMPTY','NgBWVuLsw9','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nfhlfc21rk6n9w','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',22,'EMPTY','mkfP69eAZ0','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nghlfc86hqyafg','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',23,'EMPTY','5KzOGt2S5r','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nhhlfcrsitns36','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',24,'EMPTY','dfle9KIsC8','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nihlfc0ljygm5w','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',25,'EMPTY','iem0Kpmca3','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900njhlfckconlqln','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',26,'EMPTY','tCMZ8FtzDZ','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nkhlfcd24jfpvi','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',27,'EMPTY','rVkd1MkTD5','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nlhlfchvj98xvy','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',28,'EMPTY','CyLZqz8RIv','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nmhlfcvg3bhoeu','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',29,'EMPTY','_fFc3IVe5d','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nnhlfc0z34k9mg','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',30,'EMPTY','wj0-OeJQtJ','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nohlfca1j74vco','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',31,'EMPTY','-pKs1ofvM5','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nphlfc4e96hqhq','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',32,'EMPTY','Qs_1WUTcVz','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nqhlfcyzu7u35o','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',33,'EMPTY','a0Ol5ntO8A','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nrhlfc737zt68d','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',34,'EMPTY','Ud8sbtJSgA','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nshlfcufp7n70g','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',35,'EMPTY','QRp7EyHOIb','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nthlfcx21h0run','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',36,'EMPTY','FmKSJ1xYj1','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nuhlfcif74mxcm','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',37,'EMPTY','s9fnUSpxiN','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nvhlfc20kpv1ao','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',38,'EMPTY','BNakaZAVB2','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nwhlfciji25hp5','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',39,'EMPTY','7MkC5Eo8Jm','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3aez900nxhlfc4n3gqvfu','a3263e33-9f4a-473a-b6bf-00f6abb8daa4',40,'EMPTY','DtJzGA1mDc','2026-05-28 03:51:42.162','2026-04-28 03:51:42.165'),('cmoi3af4e00nzhlfcb528lwn3','2583c18a-3c56-4127-a085-23ba16b5ee86',1,'EMPTY','EkCl48rCBt','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o0hlfclm0d1mim','2583c18a-3c56-4127-a085-23ba16b5ee86',2,'EMPTY','W7y-pcXpQ6','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o1hlfcqz5cavvh','2583c18a-3c56-4127-a085-23ba16b5ee86',3,'EMPTY','d7XHFjMzNL','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o2hlfce6wvckw8','2583c18a-3c56-4127-a085-23ba16b5ee86',4,'EMPTY','1jA1y5-QnZ','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o3hlfc4a264z2w','2583c18a-3c56-4127-a085-23ba16b5ee86',5,'EMPTY','lzpK5JoDbT','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o4hlfc8l3a3xz2','2583c18a-3c56-4127-a085-23ba16b5ee86',6,'EMPTY','iocxx-pwY0','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o5hlfcm1w7g0nq','2583c18a-3c56-4127-a085-23ba16b5ee86',7,'EMPTY','ktxLyaH7Hr','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o6hlfcg4f4boat','2583c18a-3c56-4127-a085-23ba16b5ee86',8,'EMPTY','YjY2qn7VUC','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o7hlfco3q9lfx2','2583c18a-3c56-4127-a085-23ba16b5ee86',9,'EMPTY','sshifx8DG_','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o8hlfck0el38e7','2583c18a-3c56-4127-a085-23ba16b5ee86',10,'EMPTY','hrXQwykCyG','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00o9hlfchnhch56o','2583c18a-3c56-4127-a085-23ba16b5ee86',11,'EMPTY','ZQytCfoYhk','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00oahlfc879jf6qr','2583c18a-3c56-4127-a085-23ba16b5ee86',12,'EMPTY','6Gy8EBvzx9','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00obhlfcnoi4kgjg','2583c18a-3c56-4127-a085-23ba16b5ee86',13,'EMPTY','Mp6J94LUoX','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00ochlfcw0sig881','2583c18a-3c56-4127-a085-23ba16b5ee86',14,'EMPTY','cTGFmfUgSx','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00odhlfcs4rsrkv7','2583c18a-3c56-4127-a085-23ba16b5ee86',15,'EMPTY','1Nd96Vf9og','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00oehlfcj83ft3yy','2583c18a-3c56-4127-a085-23ba16b5ee86',16,'EMPTY','sLQK4oEGrW','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00ofhlfcdkdyd5d8','2583c18a-3c56-4127-a085-23ba16b5ee86',17,'EMPTY','-O1Nv8vxzF','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00oghlfc6oii8aou','2583c18a-3c56-4127-a085-23ba16b5ee86',18,'EMPTY','25WM-A3z1M','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00ohhlfc54qe2nc3','2583c18a-3c56-4127-a085-23ba16b5ee86',19,'EMPTY','CwUAvo9c60','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00oihlfc481vsoaq','2583c18a-3c56-4127-a085-23ba16b5ee86',20,'EMPTY','S_WSmuWeXh','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00ojhlfciten63o7','2583c18a-3c56-4127-a085-23ba16b5ee86',21,'EMPTY','NR64xuFzm7','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00okhlfckaw8tilr','2583c18a-3c56-4127-a085-23ba16b5ee86',22,'EMPTY','VwgkiPZb5l','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00olhlfcjkwajxkj','2583c18a-3c56-4127-a085-23ba16b5ee86',23,'EMPTY','nL5GyBo0nX','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4e00omhlfcd45u4d3j','2583c18a-3c56-4127-a085-23ba16b5ee86',24,'EMPTY','eSZKTGAHbm','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00onhlfcs8x7gzln','2583c18a-3c56-4127-a085-23ba16b5ee86',25,'EMPTY','fF_Fn3reIf','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00oohlfcbcsxa60x','2583c18a-3c56-4127-a085-23ba16b5ee86',26,'EMPTY','W6rOu8_Kq3','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00ophlfc0ablv9ls','2583c18a-3c56-4127-a085-23ba16b5ee86',27,'EMPTY','rb_t1FHj51','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00oqhlfciyma2aoj','2583c18a-3c56-4127-a085-23ba16b5ee86',28,'EMPTY','ILpPNFf9yt','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00orhlfcqq4xvybm','2583c18a-3c56-4127-a085-23ba16b5ee86',29,'EMPTY','U92y3rtgnV','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00oshlfcc5qvjq70','2583c18a-3c56-4127-a085-23ba16b5ee86',30,'EMPTY','JMP1vJzDu4','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00othlfcn6wfi7zi','2583c18a-3c56-4127-a085-23ba16b5ee86',31,'EMPTY','1PPkZyWRfJ','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00ouhlfcspshid4o','2583c18a-3c56-4127-a085-23ba16b5ee86',32,'EMPTY','0i48Xzk-P9','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00ovhlfc95cwnnkd','2583c18a-3c56-4127-a085-23ba16b5ee86',33,'EMPTY','7PkJHaHrBJ','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00owhlfcklzlz523','2583c18a-3c56-4127-a085-23ba16b5ee86',34,'EMPTY','zGqfP-VkW0','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00oxhlfc88veq6yi','2583c18a-3c56-4127-a085-23ba16b5ee86',35,'EMPTY','qn4cFpZ16I','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00oyhlfc3v0qi81m','2583c18a-3c56-4127-a085-23ba16b5ee86',36,'EMPTY','hAO6NNE5Q2','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00ozhlfcm08zxv4n','2583c18a-3c56-4127-a085-23ba16b5ee86',37,'EMPTY','2C99qkoFji','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00p0hlfcr5v9ghuh','2583c18a-3c56-4127-a085-23ba16b5ee86',38,'EMPTY','xiPDc5miA5','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00p1hlfc7pmg3f9g','2583c18a-3c56-4127-a085-23ba16b5ee86',39,'EMPTY','mH-RnBr2Ne','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3af4f00p2hlfctqj87nqi','2583c18a-3c56-4127-a085-23ba16b5ee86',40,'EMPTY','fVVC4Kv0ty','2026-05-28 03:51:42.349','2026-04-28 03:51:42.351'),('cmoi3afbf00p4hlfcct1d01gw','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',1,'EMPTY','oy8mxCphTc','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00p5hlfc6vv1jrtn','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',2,'EMPTY','-aoZz29s3A','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00p6hlfcf4ry9eqt','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',3,'EMPTY','P5Jo8L24G8','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00p7hlfcvc1dczub','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',4,'EMPTY','LTGPCdAFwc','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00p8hlfco1wzswxm','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',5,'EMPTY','lAJ-uRiT-D','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00p9hlfcrg60dclp','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',6,'EMPTY','5xCtPLKUDh','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pahlfc0et07s0a','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',7,'EMPTY','jafMhY-qX8','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pbhlfcz7rbgptt','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',8,'EMPTY','oUlsxFli-l','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pchlfcxrvek4os','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',9,'EMPTY','YhrxBxZNNn','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pdhlfcahdpuhrr','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',10,'EMPTY','H0V0CO3bi4','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pehlfc7bsqtqqw','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',11,'EMPTY','N7_1729WfB','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pfhlfcmivv587c','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',12,'EMPTY','i8Eo7VMKqc','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pghlfcb7mam2i9','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',13,'EMPTY','zQgnnqy1X5','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00phhlfcnfmyvvlh','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',14,'EMPTY','lYGRLildv6','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pihlfcc26st67b','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',15,'EMPTY','eKSvTPDjjE','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pjhlfc2c4wemcv','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',16,'EMPTY','hHCrhAbWDS','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pkhlfck4zpracb','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',17,'EMPTY','b4MWwxdD_g','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00plhlfcdtr7egas','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',18,'EMPTY','7ZgOjY0uJ1','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pmhlfc5l19ba9i','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',19,'EMPTY','KqhcfoHNHA','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pnhlfcm8j8vjma','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',20,'EMPTY','bcZwYvZ6EF','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pohlfcsd9jzhja','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',21,'EMPTY','1QMRrhbQAf','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pphlfc8qkcp7pm','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',22,'EMPTY','1d2IQzZLuK','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pqhlfck0tsnkza','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',23,'EMPTY','DilmvM-j7q','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00prhlfc312dqtd8','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',24,'EMPTY','6M0q34iC7A','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pshlfcoey7pwr8','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',25,'EMPTY','5soBMKaAHo','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pthlfcy0dxvmve','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',26,'EMPTY','Slr2DNs4EB','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00puhlfclyn9vipc','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',27,'EMPTY','4jRzcUMxkd','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pvhlfcmh1pmtu8','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',28,'EMPTY','VDhH4jmM7p','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pwhlfctr0oh8nn','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',29,'EMPTY','66K-SvaB8X','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pxhlfcc84yv62s','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',30,'EMPTY','HJrNZKtj98','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbf00pyhlfc2mshfkhd','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',31,'EMPTY','nH2GXWy6a3','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00pzhlfcvlti6qqg','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',32,'EMPTY','wQo3-tYYdR','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q0hlfcs2ps0mzy','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',33,'EMPTY','oN-eT8URc5','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q1hlfc9izxsbwo','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',34,'EMPTY','3g4NtjVqPR','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q2hlfcewfnxeyh','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',35,'EMPTY','HakHPL6Lfx','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q3hlfc30b8b1d6','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',36,'EMPTY','jknhuXV2is','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q4hlfc8hlb4yfi','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',37,'EMPTY','ldyUMi0b9m','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q5hlfccwykojsk','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',38,'EMPTY','wILk37TzP6','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q6hlfcj48getf9','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',39,'EMPTY','C7cwOyaFPA','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afbg00q7hlfco8w67obe','ae3b9974-5251-42ff-bb4b-cc5b0e079ede',40,'EMPTY','FaMRagtbXC','2026-05-28 03:51:42.602','2026-04-28 03:51:42.603'),('cmoi3afga00q9hlfcfyxqjma3','376f1331-4c85-4b52-be25-00b8a8634c6f',1,'EMPTY','GGvFTUsqN_','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qahlfc9kohy8fs','376f1331-4c85-4b52-be25-00b8a8634c6f',2,'EMPTY','XMKvTBFNR7','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qbhlfcr2l832a4','376f1331-4c85-4b52-be25-00b8a8634c6f',3,'EMPTY','PhdbxT3SnQ','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qchlfcf3n6pbyp','376f1331-4c85-4b52-be25-00b8a8634c6f',4,'EMPTY','JLb1fO6Hbg','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qdhlfcnriud7k8','376f1331-4c85-4b52-be25-00b8a8634c6f',5,'EMPTY','zOTwNWVB3k','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qehlfcjgfhuom2','376f1331-4c85-4b52-be25-00b8a8634c6f',6,'EMPTY','BpU511_dQ6','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qfhlfc7oykfddb','376f1331-4c85-4b52-be25-00b8a8634c6f',7,'EMPTY','nH_sj08zeP','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qghlfcmgt82l3v','376f1331-4c85-4b52-be25-00b8a8634c6f',8,'EMPTY','Ds_LUC69J0','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qhhlfccc9j0jqy','376f1331-4c85-4b52-be25-00b8a8634c6f',9,'EMPTY','fRWtjNjvAZ','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qihlfc5iwpkqxs','376f1331-4c85-4b52-be25-00b8a8634c6f',10,'EMPTY','wakbF5yHV-','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qjhlfc2lelj2ks','376f1331-4c85-4b52-be25-00b8a8634c6f',11,'EMPTY','KGTP8xeAnc','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qkhlfc7wllskqd','376f1331-4c85-4b52-be25-00b8a8634c6f',12,'EMPTY','yZMK-9OAdA','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qlhlfc8o6ym2ux','376f1331-4c85-4b52-be25-00b8a8634c6f',13,'EMPTY','sKBtXbvep3','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qmhlfctnaafceb','376f1331-4c85-4b52-be25-00b8a8634c6f',14,'EMPTY','WcjhEeiyB1','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qnhlfc676nbc6i','376f1331-4c85-4b52-be25-00b8a8634c6f',15,'EMPTY','EyWyHz7URb','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qohlfcahb83n4p','376f1331-4c85-4b52-be25-00b8a8634c6f',16,'EMPTY','s8lzieDx_e','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qphlfc88hwkw01','376f1331-4c85-4b52-be25-00b8a8634c6f',17,'EMPTY','d85GAgGs38','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qqhlfcb81nnszv','376f1331-4c85-4b52-be25-00b8a8634c6f',18,'EMPTY','W6QQ-S49Ac','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qrhlfclguubuf7','376f1331-4c85-4b52-be25-00b8a8634c6f',19,'EMPTY','kwXzbcAZUx','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qshlfcr4cgf53l','376f1331-4c85-4b52-be25-00b8a8634c6f',20,'EMPTY','ZDvrjiNDGb','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qthlfcpl39sm2k','376f1331-4c85-4b52-be25-00b8a8634c6f',21,'EMPTY','xcM372YycE','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00quhlfcwxzpy0gi','376f1331-4c85-4b52-be25-00b8a8634c6f',22,'EMPTY','VkF7ngEmvR','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qvhlfcnlpeme35','376f1331-4c85-4b52-be25-00b8a8634c6f',23,'EMPTY','tg8wmBZXxo','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qwhlfcsegyiv31','376f1331-4c85-4b52-be25-00b8a8634c6f',24,'EMPTY','5PK6kKfxQB','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qxhlfcn5yul7i0','376f1331-4c85-4b52-be25-00b8a8634c6f',25,'EMPTY','wxCIthG-iW','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qyhlfcvnf0imkq','376f1331-4c85-4b52-be25-00b8a8634c6f',26,'EMPTY','B2NoG_tiAT','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00qzhlfch5gqr6yn','376f1331-4c85-4b52-be25-00b8a8634c6f',27,'EMPTY','o6GfJwI8ll','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r0hlfcye2lum2u','376f1331-4c85-4b52-be25-00b8a8634c6f',28,'EMPTY','p9Vm1CizMr','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r1hlfctqg2u8mq','376f1331-4c85-4b52-be25-00b8a8634c6f',29,'EMPTY','vhqWDzQp-4','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r2hlfck2pgskz3','376f1331-4c85-4b52-be25-00b8a8634c6f',30,'EMPTY','c3fD10a8VH','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r3hlfcnp0fqgz3','376f1331-4c85-4b52-be25-00b8a8634c6f',31,'EMPTY','DjaLufITE6','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r4hlfctl1cz3c6','376f1331-4c85-4b52-be25-00b8a8634c6f',32,'EMPTY','UwWcbEfOVd','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r5hlfc5s1airel','376f1331-4c85-4b52-be25-00b8a8634c6f',33,'EMPTY','YCU-UMuvWv','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r6hlfcbx0yh6to','376f1331-4c85-4b52-be25-00b8a8634c6f',34,'EMPTY','8u-CU7BwVu','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r7hlfcnx76n4l2','376f1331-4c85-4b52-be25-00b8a8634c6f',35,'EMPTY','368WbvUB-C','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r8hlfchg2wzfp2','376f1331-4c85-4b52-be25-00b8a8634c6f',36,'EMPTY','WG43eV52ZX','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00r9hlfcqxab84jh','376f1331-4c85-4b52-be25-00b8a8634c6f',37,'EMPTY','bXKzjEYeyE','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00rahlfcs0ufrtju','376f1331-4c85-4b52-be25-00b8a8634c6f',38,'EMPTY','K6oZiV8MXW','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00rbhlfcxoxcipav','376f1331-4c85-4b52-be25-00b8a8634c6f',39,'EMPTY','2A2olArH9u','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi3afga00rchlfcd9j7m2oj','376f1331-4c85-4b52-be25-00b8a8634c6f',40,'EMPTY','pWGldpmdQJ','2026-05-28 03:51:42.776','2026-04-28 03:51:42.778'),('cmoi9ere000rehlfc98xl2lak','47744199-e3c1-4d21-9acf-00bed091f05d',1,'EMPTY','X3WYweSIHT','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rfhlfcsguay2i8','47744199-e3c1-4d21-9acf-00bed091f05d',2,'EMPTY','5ACfR3plQA','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rghlfc61rgur9s','47744199-e3c1-4d21-9acf-00bed091f05d',3,'EMPTY','HGCTEBueZG','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rhhlfc2zqvj6ch','47744199-e3c1-4d21-9acf-00bed091f05d',4,'EMPTY','Ls--GnhyG1','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rihlfcjebg9zwx','47744199-e3c1-4d21-9acf-00bed091f05d',5,'EMPTY','BRdDy7g84J','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rjhlfc2s274yml','47744199-e3c1-4d21-9acf-00bed091f05d',6,'EMPTY','4kbx2Ck1bw','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rkhlfcj2vcz35l','47744199-e3c1-4d21-9acf-00bed091f05d',7,'EMPTY','Ixl7HPgPaV','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rlhlfcdz3tfjq8','47744199-e3c1-4d21-9acf-00bed091f05d',8,'EMPTY','zTsl_k6m21','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rmhlfcfmso8za9','47744199-e3c1-4d21-9acf-00bed091f05d',9,'EMPTY','LXTRdNpTRS','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rnhlfckq1r5n75','47744199-e3c1-4d21-9acf-00bed091f05d',10,'EMPTY','jdXtRztq8u','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rohlfcpzvqxwbn','47744199-e3c1-4d21-9acf-00bed091f05d',11,'EMPTY','qorV7Aiy_d','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rphlfcdj82248l','47744199-e3c1-4d21-9acf-00bed091f05d',12,'EMPTY','ft6lPwEnbj','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rqhlfcqxew6d5g','47744199-e3c1-4d21-9acf-00bed091f05d',13,'EMPTY','_I6_DYOUsf','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rrhlfccvaxfi2p','47744199-e3c1-4d21-9acf-00bed091f05d',14,'EMPTY','3eXQtA1XTX','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rshlfctd36rxus','47744199-e3c1-4d21-9acf-00bed091f05d',15,'EMPTY','4T0IgE1z8h','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000rthlfcy9sosotn','47744199-e3c1-4d21-9acf-00bed091f05d',16,'EMPTY','hva-xepbHE','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere000ruhlfchi0qr9wt','47744199-e3c1-4d21-9acf-00bed091f05d',17,'EMPTY','zfntQIJVZl','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100rvhlfc1p450kvc','47744199-e3c1-4d21-9acf-00bed091f05d',18,'EMPTY','syHEehSjat','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100rwhlfc6c0omwnt','47744199-e3c1-4d21-9acf-00bed091f05d',19,'EMPTY','t9Ei4GJLPj','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100rxhlfcwe3fcoya','47744199-e3c1-4d21-9acf-00bed091f05d',20,'EMPTY','xxFoX-WBkE','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100ryhlfcrxlh0554','47744199-e3c1-4d21-9acf-00bed091f05d',21,'EMPTY','xVFC5vDLda','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100rzhlfccnitlksb','47744199-e3c1-4d21-9acf-00bed091f05d',22,'EMPTY','WLLlEMMxmm','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s0hlfcjha7zzww','47744199-e3c1-4d21-9acf-00bed091f05d',23,'EMPTY','3YPR6lKwBY','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s1hlfcaj93hoqf','47744199-e3c1-4d21-9acf-00bed091f05d',24,'EMPTY','Gz3QzBQ4Jq','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s2hlfcecuqwpx9','47744199-e3c1-4d21-9acf-00bed091f05d',25,'EMPTY','BrTf1a8cOK','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s3hlfc0fklmpcw','47744199-e3c1-4d21-9acf-00bed091f05d',26,'EMPTY','Hw-cs-jKfA','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s4hlfc2hkhe3xz','47744199-e3c1-4d21-9acf-00bed091f05d',27,'EMPTY','Dh-rN3xEdo','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s5hlfct63d85l6','47744199-e3c1-4d21-9acf-00bed091f05d',28,'EMPTY','uayk1iIsAv','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s6hlfcto9gvsdc','47744199-e3c1-4d21-9acf-00bed091f05d',29,'EMPTY','D8GtG-i9_A','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s7hlfc232brtvb','47744199-e3c1-4d21-9acf-00bed091f05d',30,'EMPTY','3hNfupwdvD','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s8hlfcyflpqw72','47744199-e3c1-4d21-9acf-00bed091f05d',31,'EMPTY','RWrlY24ogV','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100s9hlfcu7kizd02','47744199-e3c1-4d21-9acf-00bed091f05d',32,'EMPTY','HP_mGCPUnf','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sahlfc3dcv3pml','47744199-e3c1-4d21-9acf-00bed091f05d',33,'EMPTY','sU0L-0_IQ_','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sbhlfcskv970nd','47744199-e3c1-4d21-9acf-00bed091f05d',34,'EMPTY','-pX87JgGKv','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100schlfc6vm7ya7f','47744199-e3c1-4d21-9acf-00bed091f05d',35,'EMPTY','u1HtWrq2M0','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sdhlfcosbtcwzm','47744199-e3c1-4d21-9acf-00bed091f05d',36,'EMPTY','o8VOCS8YSd','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sehlfckjz6qlb5','47744199-e3c1-4d21-9acf-00bed091f05d',37,'EMPTY','ObFU11juR5','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sfhlfckdiant4x','47744199-e3c1-4d21-9acf-00bed091f05d',38,'EMPTY','58gQFUWyj2','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100sghlfcang3k4nz','47744199-e3c1-4d21-9acf-00bed091f05d',39,'EMPTY','nRRzFYudMS','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9ere100shhlfcazcqhy77','47744199-e3c1-4d21-9acf-00bed091f05d',40,'EMPTY','mJTGZgkFGh','2026-05-28 06:43:02.566','2026-04-28 06:43:02.569'),('cmoi9erfv00sjhlfcbye4ejzf','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',1,'EMPTY','af5MnWPfYb','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00skhlfcos2xxkkj','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',2,'EMPTY','IWRNSKzWWQ','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00slhlfcw8c1aiun','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',3,'EMPTY','9kjvcnBDJw','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00smhlfc21rmm4jb','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',4,'EMPTY','zn7lA9xRAr','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00snhlfcovshyu7l','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',5,'EMPTY','-gQ1VEemwF','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sohlfcme4uuk15','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',6,'EMPTY','k1nnV-loA4','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sphlfcgh1tvl20','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',7,'EMPTY','jumL4UwCzt','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sqhlfchd7z0w06','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',8,'EMPTY','QiPK0ZjmU1','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00srhlfcd72q8pam','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',9,'EMPTY','Z3QlJJvf3c','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sshlfcycecqk9w','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',10,'EMPTY','kFRbU0wTJz','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sthlfc9rs48cz1','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',11,'EMPTY','ci0CrVlqum','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00suhlfc8usvc8qo','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',12,'EMPTY','AlsNChKFmG','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00svhlfcb8y8cdlq','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',13,'EMPTY','mDrS9ZXNFV','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00swhlfcgr69iep4','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',14,'EMPTY','kySV6Dt1LW','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00sxhlfcii5wqx54','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',15,'EMPTY','4o_6fwGvFi','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00syhlfcvfvwu7v9','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',16,'EMPTY','v0vlc5zNkX','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00szhlfciunhxgv5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',17,'EMPTY','7UazbPhLZO','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00t0hlfcn6xya8i4','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',18,'EMPTY','8KdFbm34lg','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00t1hlfcjxtt4ju1','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',19,'EMPTY','NQ8X3to2tz','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00t2hlfchrixkwrt','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',20,'EMPTY','BJcMfwsMuB','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00t3hlfcnq5afhxk','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',21,'EMPTY','pojQX3kDAJ','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfv00t4hlfcr00wj97g','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',22,'EMPTY','0JqI8vnx2K','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00t5hlfcj7a973yk','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',23,'EMPTY','v2MCiLOZLO','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00t6hlfc34vxfd8z','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',24,'EMPTY','xmE5Y8iv3J','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00t7hlfcqsujxz71','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',25,'EMPTY','nTvwAka5nQ','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00t8hlfcx10mqeb9','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',26,'EMPTY','xBJdr7YLJd','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00t9hlfcz4k5ga1j','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',27,'EMPTY','w3i7A0oOnx','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tahlfcj4ai5q0x','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',28,'EMPTY','JkSPiIvxda','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tbhlfc5kpxiyre','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',29,'EMPTY','IWBfF6dAOA','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tchlfcfif92ts9','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',30,'EMPTY','7ZEXJ-rnhu','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tdhlfc4b94sqdq','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',31,'EMPTY','kS14QXzRMZ','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tehlfckaj6sdua','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',32,'EMPTY','ZqHWcAIOG9','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tfhlfced8gaizh','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',33,'EMPTY','Qh09KFSlz3','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tghlfc28ilm4yb','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',34,'EMPTY','KNz2y5cPZh','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00thhlfctu60fvnq','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',35,'EMPTY','Ot11a9cPn2','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tihlfceabn4uh8','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',36,'EMPTY','E39z5jctNE','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tjhlfc2a6c82o1','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',37,'EMPTY','Soxjk8ZFX-','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tkhlfcvjp1pfqb','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',38,'EMPTY','2LqUb9NaXF','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tlhlfctgx0gvze','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',39,'EMPTY','9-616cYvzh','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9erfw00tmhlfc7980nyt9','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',40,'EMPTY','6-vmCVTlOb','2026-05-28 06:43:02.633','2026-04-28 06:43:02.635'),('cmoi9g32800tphlfcfejk5nb3','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',101,'FILLED','GOS_hGCD90',NULL,'2026-04-28 06:44:04.353'),('cmoi9g36o00tshlfcezmuoioh','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',102,'FILLED','Y-wab6fetf',NULL,'2026-04-28 06:44:04.513'),('cmoi9g37u00tvhlfcua85gbor','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',103,'FILLED','9krM6tJ-GA',NULL,'2026-04-28 06:44:04.555'),('cmoi9g3a800tyhlfcgjvnzfvs','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',104,'FILLED','xX_LldUHES',NULL,'2026-04-28 06:44:04.640'),('cmoi9g3az00u1hlfc8aogefmd','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',105,'FILLED','GSidIdnPVY',NULL,'2026-04-28 06:44:04.667'),('cmoi9g3bq00u4hlfcm8yy2qax','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',106,'FILLED','BLUf5s21lA',NULL,'2026-04-28 06:44:04.694'),('cmoi9g3d200u7hlfcsqcg5cj7','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',107,'FILLED','mf2ltCtuem',NULL,'2026-04-28 06:44:04.743'),('cmoi9g3ds00uahlfc05l9n6o8','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',108,'FILLED','lSvsYCafth',NULL,'2026-04-28 06:44:04.768'),('cmoi9g3ef00udhlfcr5naq6w1','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',109,'FILLED','1NvXr32kpu',NULL,'2026-04-28 06:44:04.791'),('cmoi9g3f900ughlfcojfraz4y','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',110,'FILLED','q8vUPCoAhh',NULL,'2026-04-28 06:44:04.821'),('cmoi9g3fy00ujhlfcgzxqrh2m','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',111,'FILLED','268AeAsD2V',NULL,'2026-04-28 06:44:04.846'),('cmoi9g3gl00umhlfc8pxh4xbo','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',112,'FILLED','DKKyiX4Tgw',NULL,'2026-04-28 06:44:04.870'),('cmoi9g3hg00uphlfc7msc6wzj','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',113,'FILLED','H8anP_Oytm',NULL,'2026-04-28 06:44:04.900'),('cmoi9g3i500ushlfc8dnoah0z','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',114,'FILLED','0qMWllXHg1',NULL,'2026-04-28 06:44:04.925'),('cmoi9g3iy00uvhlfczl8w5nql','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',115,'FILLED','8X2yEboqjn',NULL,'2026-04-28 06:44:04.955'),('cmoi9g3k700uyhlfcasudzs77','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',116,'FILLED','zXaQsMuZaN',NULL,'2026-04-28 06:44:05.000'),('cmoi9g3ld00v1hlfcasl599ci','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',117,'FILLED','AXnnid4RnK',NULL,'2026-04-28 06:44:05.041'),('cmoi9g3md00v4hlfc1un85jaq','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',118,'FILLED','1lIqSo5VOZ',NULL,'2026-04-28 06:44:05.078'),('cmoi9g3nh00v7hlfc129ew60g','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',119,'FILLED','-FHcFZRIzX',NULL,'2026-04-28 06:44:05.118'),('cmoi9g3o600vahlfcx0xv61i6','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',120,'FILLED','xBgAiJQngg',NULL,'2026-04-28 06:44:05.142'),('cmoi9g3ow00vdhlfcy8ebtb8v','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',121,'FILLED','E_AMhVmt7f',NULL,'2026-04-28 06:44:05.169'),('cmoi9g3po00vghlfcal4y1ka8','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',122,'FILLED','TJCJeXDqX8',NULL,'2026-04-28 06:44:05.196'),('cmoi9g3qh00vjhlfcm7hxr92s','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',123,'FILLED','Uefuarlprp',NULL,'2026-04-28 06:44:05.225'),('cmoi9g3rb00vmhlfcj8lki8jv','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',124,'FILLED','twFKJ8xayD',NULL,'2026-04-28 06:44:05.255'),('cmoi9g3s800vphlfc1j4q4jg5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',125,'FILLED','QXegqW9YsO',NULL,'2026-04-28 06:44:05.289'),('cmoi9g3tc00vshlfcbfzm2l9k','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',126,'FILLED','vgOv7Xq3Hx',NULL,'2026-04-28 06:44:05.328'),('cmoi9g3u100vvhlfcnk06ffaw','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',127,'FILLED','t8B9qqDuKm',NULL,'2026-04-28 06:44:05.353'),('cmoi9g3v400vyhlfc2sqkaxup','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',128,'FILLED','I1wfjeW0M7',NULL,'2026-04-28 06:44:05.392'),('cmoi9g3wm00w1hlfcc4712mbi','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',129,'FILLED','bMhVQ_iBjf',NULL,'2026-04-28 06:44:05.447'),('cmoi9g3xe00w4hlfckoy88s4d','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',130,'FILLED','x7XS8xBBjA',NULL,'2026-04-28 06:44:05.474'),('cmoi9g3y800w7hlfcczx1vzu9','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',131,'FILLED','gnvrMBToHi',NULL,'2026-04-28 06:44:05.504'),('cmoi9g3zb00wahlfcnbpizkxa','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',132,'FILLED','Nb6dQRy1Vl',NULL,'2026-04-28 06:44:05.543'),('cmoi9g41n00wdhlfc01kseie0','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',133,'FILLED','1bn0Jg8mVv',NULL,'2026-04-28 06:44:05.627'),('cmoi9g44d00wghlfcbh2cm0ud','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',134,'FILLED','k011qLTpSF',NULL,'2026-04-28 06:44:05.726'),('cmoi9g45900wjhlfc3cryv7us','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',135,'FILLED','gxMqikzKUa',NULL,'2026-04-28 06:44:05.757'),('cmoi9g46500wmhlfc14pqw85k','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',136,'FILLED','POUaFOrNGL',NULL,'2026-04-28 06:44:05.789'),('cmoi9g47600wphlfc8e2h2ws7','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',137,'FILLED','T4T-ntj6GS',NULL,'2026-04-28 06:44:05.827'),('cmoi9g48c00wshlfco2dj5nvz','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',138,'FILLED','uXdg96bYRQ',NULL,'2026-04-28 06:44:05.868'),('cmoi9g49700wvhlfczr5otlmk','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',139,'FILLED','ShtptbEf4V',NULL,'2026-04-28 06:44:05.899'),('cmoi9g4aj00wyhlfcp8h99tnp','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',140,'FILLED','zv7O-RNivK',NULL,'2026-04-28 06:44:05.947');
/*!40000 ALTER TABLE `admission_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni`
--

DROP TABLE IF EXISTS `alumni`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumni` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `graduation_year` int DEFAULT NULL,
  `current_organization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `willing_to_mentor` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alumni_institution_id_idx` (`institution_id`),
  KEY `alumni_graduation_year_idx` (`graduation_year`),
  CONSTRAINT `alumni_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni`
--

LOCK TABLES `alumni` WRITE;
/*!40000 ALTER TABLE `alumni` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_events`
--

DROP TABLE IF EXISTS `alumni_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumni_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` date NOT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rsvp_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alumni_events_institution_id_idx` (`institution_id`),
  CONSTRAINT `alumni_events_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_events`
--

LOCK TABLES `alumni_events` WRITE;
/*!40000 ALTER TABLE `alumni_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumni_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_requests`
--

DROP TABLE IF EXISTS `approval_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requester_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `status` enum('pending','approved','rejected','changes_requested','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `current_step` int NOT NULL DEFAULT '1',
  `total_steps` int NOT NULL,
  `due_date` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `approval_requests_institution_id_idx` (`institution_id`),
  KEY `approval_requests_requester_id_idx` (`requester_id`),
  KEY `approval_requests_status_idx` (`status`),
  KEY `approval_requests_workflow_id_fkey` (`workflow_id`),
  CONSTRAINT `approval_requests_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `approval_requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `approval_requests_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_requests`
--

LOCK TABLES `approval_requests` WRITE;
/*!40000 ALTER TABLE `approval_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_steps`
--

DROP TABLE IF EXISTS `approval_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_steps` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_number` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('pending','approved','rejected','changes_requested') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approver_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `conditions` json DEFAULT NULL,
  `processed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `approval_steps_request_id_idx` (`request_id`),
  KEY `approval_steps_approver_id_fkey` (`approver_id`),
  CONSTRAINT `approval_steps_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approval_steps_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `approval_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_steps`
--

LOCK TABLES `approval_steps` WRITE;
/*!40000 ALTER TABLE `approval_steps` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_workflows`
--

DROP TABLE IF EXISTS `approval_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_workflows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `steps` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `approval_workflows_institution_id_idx` (`institution_id`),
  KEY `approval_workflows_type_is_active_idx` (`type`,`is_active`),
  CONSTRAINT `approval_workflows_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_workflows`
--

LOCK TABLES `approval_workflows` WRITE;
/*!40000 ALTER TABLE `approval_workflows` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('student','id_card','certificate','hall_ticket','marksheet','library_card','transfer_certificate') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected','changes_requested','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_notes` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewed_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `approvals_institution_id_idx` (`institution_id`),
  KEY `approvals_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  KEY `approvals_status_idx` (`status`),
  KEY `approvals_submitted_by_fkey` (`submitted_by`),
  KEY `approvals_reviewed_by_fkey` (`reviewed_by`),
  CONSTRAINT `approvals_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `approvals_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approvals_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marks_obtained` decimal(6,2) DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `status` enum('submitted','graded','late') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `graded_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assignment_submissions_assignment_id_student_id_key` (`assignment_id`,`student_id`),
  KEY `assignment_submissions_institution_id_idx` (`institution_id`),
  KEY `assignment_submissions_student_id_idx` (`student_id`),
  CONSTRAINT `assignment_submissions_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assignment_submissions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assigned_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` datetime(3) DEFAULT NULL,
  `max_marks` decimal(6,2) DEFAULT NULL,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assignments_institution_id_idx` (`institution_id`),
  KEY `assignments_section_id_idx` (`section_id`),
  KEY `assignments_status_idx` (`status`),
  CONSTRAINT `assignments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_logs`
--

DROP TABLE IF EXISTS `attendance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendance_date` date NOT NULL,
  `attendance_time` time NOT NULL,
  `scan_type` enum('entry','exit','checkpoint') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'entry',
  `scanner_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scanner_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_source` enum('id_card','library_card','hall_ticket','mobile_app') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'id_card',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `attendance_logs_student_id_idx` (`student_id`),
  KEY `attendance_logs_institution_id_attendance_date_idx` (`institution_id`,`attendance_date`),
  KEY `attendance_logs_attendance_date_idx` (`attendance_date`),
  CONSTRAINT `attendance_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_logs_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_logs`
--

LOCK TABLES `attendance_logs` WRITE;
/*!40000 ALTER TABLE `attendance_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('present','absent','late','excused','half_day') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `remarks` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marked_by_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_records_session_id_student_id_key` (`session_id`,`student_id`),
  KEY `attendance_records_student_id_idx` (`student_id`),
  KEY `attendance_records_marked_by_id_fkey` (`marked_by_id`),
  CONSTRAINT `attendance_records_marked_by_id_fkey` FOREIGN KEY (`marked_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `type` enum('class','event','exam','activity') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'class',
  `start_time` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('open','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `closed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `attendance_sessions_institution_id_idx` (`institution_id`),
  KEY `attendance_sessions_section_id_date_idx` (`section_id`,`date`),
  KEY `attendance_sessions_class_id_fkey` (`class_id`),
  KEY `attendance_sessions_subject_id_fkey` (`subject_id`),
  KEY `attendance_sessions_created_by_id_fkey` (`created_by_id`),
  CONSTRAINT `attendance_sessions_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changes` json DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `request_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_idx` (`user_id`),
  KEY `audit_logs_institution_id_idx` (`institution_id`),
  KEY `audit_logs_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  KEY `audit_logs_timestamp_idx` (`timestamp`),
  CONSTRAINT `audit_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('04ad800c-333e-45a0-8bf2-80db7d45d06a','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"professional\", \"overrides\": {\"grants\": [\"transport\", \"voice\", \"alumni\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:49:19.101'),('0b6c7098-6e8d-4e0a-9baa-a3ff8c849d21','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:49:19.026'),('14d1a102-1c69-49cd-95c8-ac6ccd2f9bfd','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:36:37.995'),('30537097-c8b2-4ae5-9f29-5827d4663a73','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"professional\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:49:19.066'),('435a79d0-73d5-4235-a06e-d2686d5808fb','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"professional\", \"overrides\": {\"grants\": [\"transport\", \"voice\", \"alumni\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:36:38.180'),('47f5cf39-84bc-4254-a0e4-bd37cabe1e69','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:49:18.934'),('9255493b-5358-4e2e-b6de-67a044361eb5','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:36:38.066'),('aa470b3a-f51a-4f96-95f2-6e533569a1a3','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:49:19.166'),('ba4c4d54-f7c7-4be5-8cc8-907e4abcb383','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"professional\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:36:38.145'),('d7d74295-4cce-421c-bc9c-f1f64ca53a78','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:49:18.982'),('dfcf8653-e4ac-44c6-abc9-52f397f7a437','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [], \"revokes\": []}}',NULL,NULL,NULL,'2026-05-29 00:36:38.220'),('fe88fe4b-6768-48e4-a3dd-8efa1eaaea31','entitlements.update',NULL,'4a890573-70e1-4d49-b116-d1d17c53ccff','institution','4a890573-70e1-4d49-b116-d1d17c53ccff','{\"tier\": \"starter\", \"overrides\": {\"grants\": [\"transport\", \"voice\"], \"revokes\": [\"certificate\"]}}',NULL,NULL,NULL,'2026-05-29 00:36:38.110');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biometric_devices`
--

DROP TABLE IF EXISTS `biometric_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biometric_devices` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('fingerprint','rfid','face') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fingerprint',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_seen_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `biometric_devices_institution_id_device_code_key` (`institution_id`,`device_code`),
  KEY `biometric_devices_institution_id_idx` (`institution_id`),
  CONSTRAINT `biometric_devices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biometric_devices`
--

LOCK TABLES `biometric_devices` WRITE;
/*!40000 ALTER TABLE `biometric_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `biometric_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biometric_punches`
--

DROP TABLE IF EXISTS `biometric_punches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biometric_punches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_type` enum('student','staff') COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `punch_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `direction` enum('in','out') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `biometric_punches_institution_id_idx` (`institution_id`),
  KEY `biometric_punches_device_id_idx` (`device_id`),
  KEY `biometric_punches_person_id_idx` (`person_id`),
  KEY `biometric_punches_punch_time_idx` (`punch_time`),
  CONSTRAINT `biometric_punches_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `biometric_devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `biometric_punches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biometric_punches`
--

LOCK TABLES `biometric_punches` WRITE;
/*!40000 ALTER TABLE `biometric_punches` DISABLE KEYS */;
/*!40000 ALTER TABLE `biometric_punches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_institution_id_code_key` (`institution_id`,`code`),
  KEY `branches_institution_id_idx` (`institution_id`),
  CONSTRAINT `branches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calculation_engines`
--

DROP TABLE IF EXISTS `calculation_engines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calculation_engines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cgpa_formula` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentage_formula` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentile_formula` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_scale` json NOT NULL,
  `theory_weightage` decimal(5,2) NOT NULL DEFAULT '70.00',
  `practical_weightage` decimal(5,2) NOT NULL DEFAULT '30.00',
  `internal_weightage` decimal(5,2) NOT NULL DEFAULT '20.00',
  `rank_calculation_scope` enum('section','class_all_sections','institution') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'class_all_sections',
  `grace_marks_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `max_grace_marks` int NOT NULL DEFAULT '0',
  `grace_marks_rules` json DEFAULT NULL,
  `decimal_precision` int NOT NULL DEFAULT '2',
  `rounding_method` enum('round','floor','ceil') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'round',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `calculation_engines_institution_id_academic_year_key` (`institution_id`,`academic_year`),
  KEY `calculation_engines_institution_id_idx` (`institution_id`),
  CONSTRAINT `calculation_engines_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calculation_engines`
--

LOCK TABLES `calculation_engines` WRITE;
/*!40000 ALTER TABLE `calculation_engines` DISABLE KEYS */;
/*!40000 ALTER TABLE `calculation_engines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_type` enum('holiday','exam','event','meeting') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'event',
  `event_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `all_day` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_events_institution_id_idx` (`institution_id`),
  KEY `calendar_events_event_date_idx` (`event_date`),
  CONSTRAINT `calendar_events_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cce_assessments`
--

DROP TABLE IF EXISTS `cce_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cce_assessments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `term_type` enum('FA1','FA2','SA1','FA3','FA4','SA2') COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_marks` decimal(6,2) NOT NULL DEFAULT '100.00',
  `weightage` int NOT NULL DEFAULT '100',
  `conducted_on` date DEFAULT NULL,
  `status` enum('open','locked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cce_assessments_institution_id_idx` (`institution_id`),
  KEY `cce_assessments_section_id_idx` (`section_id`),
  KEY `cce_assessments_term_type_idx` (`term_type`),
  CONSTRAINT `cce_assessments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cce_assessments`
--

LOCK TABLES `cce_assessments` WRITE;
/*!40000 ALTER TABLE `cce_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `cce_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cce_marks`
--

DROP TABLE IF EXISTS `cce_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cce_marks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marks_obtained` decimal(6,2) NOT NULL,
  `grade` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cce_marks_assessment_id_student_id_key` (`assessment_id`,`student_id`),
  KEY `cce_marks_institution_id_idx` (`institution_id`),
  KEY `cce_marks_student_id_idx` (`student_id`),
  CONSTRAINT `cce_marks_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `cce_assessments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cce_marks_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cce_marks`
--

LOCK TABLES `cce_marks` WRITE;
/*!40000 ALTER TABLE `cce_marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cce_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_type` enum('academic_excellence','sports','cultural','attendance','character','transfer','scholarship','topper','participation','custom') COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `achievement_details` text COLLATE utf8mb4_unicode_ci,
  `awarded_for_period` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date NOT NULL,
  `verification_qr_code` text COLLATE utf8mb4_unicode_ci,
  `verification_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `digital_signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_tier` enum('standard','premium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'standard',
  `status` enum('draft','generated','sent','downloaded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `email_sent_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificates_certificate_number_key` (`certificate_number`),
  KEY `certificates_student_id_idx` (`student_id`),
  KEY `certificates_certificate_type_idx` (`certificate_type`),
  KEY `certificates_status_idx` (`status`),
  KEY `certificates_institution_id_fkey` (`institution_id`),
  KEY `certificates_template_id_fkey` (`template_id`),
  CONSTRAINT `certificates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificates_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `streams_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `classes_institution_id_name_key` (`institution_id`,`name`),
  KEY `classes_institution_id_idx` (`institution_id`),
  KEY `classes_branch_id_idx` (`branch_id`),
  CONSTRAINT `classes_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `classes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES ('096bc41d-d496-405a-89b3-8a2206b97ae5','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'8th',8,0,'2026-04-28 03:51:40.719','2026-04-28 03:51:40.719'),('0a27e8ea-748b-432f-add5-cf4a143fa561','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'5th',5,0,'2026-04-28 03:51:39.363','2026-04-28 03:51:39.363'),('190e8cc7-0a60-4973-8b4a-98e6fe645cbb','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'7th',7,0,'2026-04-28 03:51:40.289','2026-04-28 03:51:40.289'),('1acf970b-2d49-4586-b848-556e00c761ae','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'12th',12,0,'2026-04-28 03:51:42.440','2026-04-28 03:51:42.440'),('480103b5-08d0-4702-befa-9027c3463688','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'1st',1,0,'2026-04-28 03:51:37.803','2026-04-28 03:51:37.803'),('a8327097-733d-4933-9f1c-49535b4415bd','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'11th',11,1,'2026-04-28 03:51:42.002','2026-04-28 06:42:34.095'),('aa2d67ba-2188-47e9-bc26-36c1c684d9f4','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'10th',10,0,'2026-04-28 03:51:41.512','2026-04-28 03:51:41.512'),('b236ba4c-c0d8-47a7-b17d-ee4172124bc3','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'6th',6,0,'2026-04-28 03:51:39.832','2026-04-28 03:51:39.832'),('c0732854-220f-4a66-9d37-132ba98bb0a4','4a890573-70e1-4d49-b116-d1d17c53ccff',NULL,'Class 5',0,0,'2026-05-28 07:07:26.393','2026-05-28 07:07:26.393'),('cdb83ca7-7863-4401-9a74-b1b14dea270a','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'9th',9,0,'2026-04-28 03:51:41.158','2026-04-28 03:51:41.158'),('da54d939-df4f-4e32-a36b-7d69eb206230','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'4th',4,0,'2026-04-28 03:51:39.049','2026-04-28 03:51:39.049'),('debe358a-8282-4426-8889-d454cfb9acf8','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'2nd',2,0,'2026-04-28 03:51:38.220','2026-04-28 03:51:38.220'),('f0de89be-cf63-4c74-b47d-2dda2bf2b004','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',NULL,'3rd',3,0,'2026-04-28 03:51:38.676','2026-04-28 03:51:38.676'),('f4ea6051-4eae-41df-bb8a-08974262bbdf','4a890573-70e1-4d49-b116-d1d17c53ccff',NULL,'Class 12',0,0,'2026-05-30 17:04:28.832','2026-05-30 17:04:28.832');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinic_visits`
--

DROP TABLE IF EXISTS `clinic_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic_visits` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visit_date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `treatment` text COLLATE utf8mb4_unicode_ci,
  `attended_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_notified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `clinic_visits_institution_id_idx` (`institution_id`),
  KEY `clinic_visits_student_id_idx` (`student_id`),
  CONSTRAINT `clinic_visits_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinic_visits`
--

LOCK TABLES `clinic_visits` WRITE;
/*!40000 ALTER TABLE `clinic_visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `clinic_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_messages`
--

DROP TABLE IF EXISTS `conversation_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('outbound','inbound') COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `intent` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `conversation_messages_institution_id_idx` (`institution_id`),
  KEY `conversation_messages_conversation_id_idx` (`conversation_id`),
  CONSTRAINT `conversation_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversation_messages_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_messages`
--

LOCK TABLES `conversation_messages` WRITE;
/*!40000 ALTER TABLE `conversation_messages` DISABLE KEYS */;
INSERT INTO `conversation_messages` VALUES ('3f7c2013-ab20-4507-ae37-6afc12085ac0','4a890573-70e1-4d49-b116-d1d17c53ccff','9f7d77d7-fef3-41dc-993b-a51c34fbf055','inbound','मेरे बच्चे की उपस्थिति बताइए',NULL,'2026-05-28 23:00:16.069'),('b1285808-a208-4fb6-83e7-5ac966110826','4a890573-70e1-4d49-b116-d1d17c53ccff','9f7d77d7-fef3-41dc-993b-a51c34fbf055','outbound','Aarav Sharma के लिए अभी कोई उपस्थिति रिकॉर्ड नहीं है।','attendance_query','2026-05-28 23:00:16.102'),('e3743e37-91ba-4d5f-ae8f-1f9cbabdcc8d','4a890573-70e1-4d49-b116-d1d17c53ccff','9f7d77d7-fef3-41dc-993b-a51c34fbf055','outbound','आपके बच्चे की बकाया फीस ₹5000.00 है। भुगतान करें: https://rzp.example/dev/4ac70161-ea31-46cd-9277-2af6101c2f7a','fee_query','2026-05-28 23:00:16.015'),('fcd9bc97-059c-4e57-8778-e720a27edcb6','4a890573-70e1-4d49-b116-d1d17c53ccff','9f7d77d7-fef3-41dc-993b-a51c34fbf055','inbound','मेरे बच्चे की फीस कितनी बाकी है?',NULL,'2026-05-28 23:00:15.950');
/*!40000 ALTER TABLE `conversation_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guardian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_intent` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_message_at` datetime(3) DEFAULT NULL,
  `message_count` int NOT NULL DEFAULT '0',
  `context` json DEFAULT NULL,
  `service_window_expires_at` datetime(3) DEFAULT NULL,
  `open` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_institution_id_guardian_id_key` (`institution_id`,`guardian_id`),
  KEY `conversations_institution_id_idx` (`institution_id`),
  KEY `conversations_guardian_id_idx` (`guardian_id`),
  CONSTRAINT `conversations_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('9f7d77d7-fef3-41dc-993b-a51c34fbf055','4a890573-70e1-4d49-b116-d1d17c53ccff','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'attendance_query','2026-05-28 23:00:16.109',4,NULL,NULL,1,'2026-05-28 23:00:15.930','2026-05-28 23:00:16.111');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `digest_queue`
--

DROP TABLE IF EXISTS `digest_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digest_queue` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guardian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_payload` json NOT NULL,
  `scheduled_for` datetime(3) NOT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `outbox_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `digest_queue_institution_id_idx` (`institution_id`),
  KEY `digest_queue_guardian_id_idx` (`guardian_id`),
  KEY `digest_queue_outbox_id_fkey` (`outbox_id`),
  CONSTRAINT `digest_queue_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `digest_queue_outbox_id_fkey` FOREIGN KEY (`outbox_id`) REFERENCES `outbox` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `digest_queue`
--

LOCK TABLES `digest_queue` WRITE;
/*!40000 ALTER TABLE `digest_queue` DISABLE KEYS */;
INSERT INTO `digest_queue` VALUES ('bd02f3c7-6d50-4153-8bc5-d1e649210bd8','4a890573-70e1-4d49-b116-d1d17c53ccff','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','attendance_absent','{\"text\": \"Aarav Sharma आज अनुपस्थित रहा\", \"type\": \"attendance_absent\", \"childName\": \"Aarav Sharma\", \"studentId\": \"feae884d-0c21-4a17-b991-d4a003006e22\", \"guardianId\": \"1cb94c6c-d957-43cb-8113-432ae2d9fe3e\", \"institutionId\": \"4a890573-70e1-4d49-b116-d1d17c53ccff\"}','2026-05-28 07:07:27.182','2026-05-28 07:07:27.182','b2440f70-8db9-4579-97a5-a7acdaa67e4e','2026-05-28 07:07:27.183');
/*!40000 ALTER TABLE `digest_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiries`
--

DROP TABLE IF EXISTS `enquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enquiries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guardian_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_interested` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` enum('walk_in','website','referral','whatsapp','phone','social','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `status` enum('new','contacted','visited','application','admitted','lost') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `assigned_to_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `follow_up_at` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `converted_student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enquiries_institution_id_enquiry_number_key` (`institution_id`,`enquiry_number`),
  KEY `enquiries_institution_id_idx` (`institution_id`),
  KEY `enquiries_status_idx` (`status`),
  KEY `enquiries_phone_idx` (`phone`),
  KEY `enquiries_assigned_to_user_id_idx` (`assigned_to_user_id`),
  CONSTRAINT `enquiries_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiries`
--

LOCK TABLES `enquiries` WRITE;
/*!40000 ALTER TABLE `enquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `enquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiry_activities`
--

DROP TABLE IF EXISTS `enquiry_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enquiry_activities` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('created','note','call','visit','whatsapp','status_change','converted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'note',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `enquiry_activities_institution_id_idx` (`institution_id`),
  KEY `enquiry_activities_enquiry_id_idx` (`enquiry_id`),
  CONSTRAINT `enquiry_activities_enquiry_id_fkey` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `enquiry_activities_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiry_activities`
--

LOCK TABLES `enquiry_activities` WRITE;
/*!40000 ALTER TABLE `enquiry_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `enquiry_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_schedules`
--

DROP TABLE IF EXISTS `exam_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_schedules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_type` enum('internal','board','competitive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `reporting_time` time DEFAULT NULL,
  `status` enum('draft','published','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_schedules_institution_id_idx` (`institution_id`),
  CONSTRAINT `exam_schedules_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_schedules`
--

LOCK TABLES `exam_schedules` WRITE;
/*!40000 ALTER TABLE `exam_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_subjects`
--

DROP TABLE IF EXISTS `exam_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_subjects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_schedule_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `duration_minutes` int NOT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_marks` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `exam_subjects_exam_schedule_id_idx` (`exam_schedule_id`),
  CONSTRAINT `exam_subjects_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_subjects`
--

LOCK TABLES `exam_subjects` WRITE;
/*!40000 ALTER TABLE `exam_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_concessions`
--

DROP TABLE IF EXISTS `fee_concessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_concessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('scholarship','sibling','staff_ward','merit','need_based') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scholarship',
  `amount` decimal(10,2) DEFAULT NULL,
  `percent` decimal(5,2) DEFAULT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_concessions_institution_id_idx` (`institution_id`),
  KEY `fee_concessions_student_id_idx` (`student_id`),
  CONSTRAINT `fee_concessions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_concessions`
--

LOCK TABLES `fee_concessions` WRITE;
/*!40000 ALTER TABLE `fee_concessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_concessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_installment_plans`
--

DROP TABLE IF EXISTS `fee_installment_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_installment_plans` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `num_installments` int NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_installment_plans_institution_id_idx` (`institution_id`),
  KEY `fee_installment_plans_student_id_idx` (`student_id`),
  CONSTRAINT `fee_installment_plans_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_installment_plans`
--

LOCK TABLES `fee_installment_plans` WRITE;
/*!40000 ALTER TABLE `fee_installment_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_installment_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_installments`
--

DROP TABLE IF EXISTS `fee_installments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_installments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installment_no` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_installments_institution_id_idx` (`institution_id`),
  KEY `fee_installments_plan_id_idx` (`plan_id`),
  KEY `fee_installments_status_idx` (`status`),
  CONSTRAINT `fee_installments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fee_installments_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `fee_installment_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_installments`
--

LOCK TABLES `fee_installments` WRITE;
/*!40000 ALTER TABLE `fee_installments` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_installments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_invoices`
--

DROP TABLE IF EXISTS `fee_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_invoices` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fee_structure_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `late_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('unpaid','partial','paid','waived','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paid_at` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `payment_link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fee_invoices_institution_id_invoice_number_key` (`institution_id`,`invoice_number`),
  KEY `fee_invoices_institution_id_idx` (`institution_id`),
  KEY `fee_invoices_student_id_idx` (`student_id`),
  KEY `fee_invoices_status_idx` (`status`),
  KEY `fee_invoices_gateway_order_id_idx` (`gateway_order_id`),
  KEY `fee_invoices_fee_structure_id_fkey` (`fee_structure_id`),
  CONSTRAINT `fee_invoices_fee_structure_id_fkey` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fee_invoices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fee_invoices_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_invoices`
--

LOCK TABLES `fee_invoices` WRITE;
/*!40000 ALTER TABLE `fee_invoices` DISABLE KEYS */;
INSERT INTO `fee_invoices` VALUES ('3afb9d5c-2ab0-4741-ba3f-439f536d63dd','4a890573-70e1-4d49-b116-d1d17c53ccff','feae884d-0c21-4a17-b991-d4a003006e22',NULL,'INV-1780008034702-613',5000.00,200.00,100.00,4900.00,'2026-06-15','paid',4900.00,'2026-05-28 22:40:35.334',NULL,'https://rzp.example/dev/3afb9d5c-2ab0-4741-ba3f-439f536d63dd','dev_3afb9d5c-2ab0-4741-ba3f-439f536d63dd','2026-05-28 22:40:34.705','2026-05-28 22:40:35.336'),('4ac70161-ea31-46cd-9277-2af6101c2f7a','4a890573-70e1-4d49-b116-d1d17c53ccff','feae884d-0c21-4a17-b991-d4a003006e22',NULL,'INV-1780009215909-729',5000.00,0.00,0.00,5000.00,'2026-06-15','paid',5000.00,'2026-05-28 23:00:16.204',NULL,'https://rzp.example/dev/4ac70161-ea31-46cd-9277-2af6101c2f7a','dev_4ac70161-ea31-46cd-9277-2af6101c2f7a','2026-05-28 23:00:15.912','2026-05-28 23:00:16.206');
/*!40000 ALTER TABLE `fee_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_payment_claims`
--

DROP TABLE IF EXISTS `fee_payment_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_payment_claims` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_by_guardian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `object_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_type` enum('image','audio','pdf','excel','video','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `claim_amount` decimal(10,2) DEFAULT NULL,
  `payment_method_claimed` enum('upi','card','netbanking','cash','cheque','bank_transfer') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending_review','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_review',
  `reviewed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_payment_claims_institution_id_idx` (`institution_id`),
  KEY `fee_payment_claims_invoice_id_idx` (`invoice_id`),
  KEY `fee_payment_claims_status_idx` (`status`),
  CONSTRAINT `fee_payment_claims_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fee_payment_claims_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_payment_claims`
--

LOCK TABLES `fee_payment_claims` WRITE;
/*!40000 ALTER TABLE `fee_payment_claims` DISABLE KEYS */;
INSERT INTO `fee_payment_claims` VALUES ('bd916f84-5f28-4c6e-8fd8-002c2a0d6a37','4a890573-70e1-4d49-b116-d1d17c53ccff','4ac70161-ea31-46cd-9277-2af6101c2f7a','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','inbound/4a890573-70e1-4d49-b116-d1d17c53ccff/smoke-proof.jpg','image',NULL,NULL,'approved','e9a35728-b89f-49cb-9621-ffe33a5bd6c9','2026-05-28 23:00:16.168',NULL,'2026-05-28 23:00:16.156','2026-05-28 23:00:16.170');
/*!40000 ALTER TABLE `fee_payment_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_payments`
--

DROP TABLE IF EXISTS `fee_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_by_guardian_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method` enum('upi','card','netbanking','cash','cheque','bank_transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_provider` enum('razorpay','cashfree') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('initiated','success','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'initiated',
  `paid_at` datetime(3) DEFAULT NULL,
  `receipt_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_payments_institution_id_idx` (`institution_id`),
  KEY `fee_payments_invoice_id_idx` (`invoice_id`),
  KEY `fee_payments_gateway_payment_id_idx` (`gateway_payment_id`),
  CONSTRAINT `fee_payments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fee_payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_payments`
--

LOCK TABLES `fee_payments` WRITE;
/*!40000 ALTER TABLE `fee_payments` DISABLE KEYS */;
INSERT INTO `fee_payments` VALUES ('30297a18-435f-48ba-a891-5863f556f980','4a890573-70e1-4d49-b116-d1d17c53ccff','4ac70161-ea31-46cd-9277-2af6101c2f7a',5000.00,'1cb94c6c-d957-43cb-8113-432ae2d9fe3e','bank_transfer',NULL,'claim_bd916f84-5f28-4c6e-8fd8-002c2a0d6a37',NULL,'success','2026-05-28 23:00:16.188',NULL,'2026-05-28 23:00:16.190','2026-05-28 23:00:16.190'),('e118d151-fdb5-4921-9183-1db54ded6d99','4a890573-70e1-4d49-b116-d1d17c53ccff','3afb9d5c-2ab0-4741-ba3f-439f536d63dd',4900.00,'1cb94c6c-d957-43cb-8113-432ae2d9fe3e','upi','razorpay','pay_smoke_1780008035302','dev_3afb9d5c-2ab0-4741-ba3f-439f536d63dd','success','2026-05-28 22:40:35.321',NULL,'2026-05-28 22:40:35.323','2026-05-28 22:40:35.323');
/*!40000 ALTER TABLE `fee_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structures`
--

DROP TABLE IF EXISTS `fee_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_structures` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('tuition','transport','exam','misc','lab','library') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `frequency` enum('one_time','monthly','quarterly','annual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_day_of_month` int DEFAULT NULL,
  `late_fee_amount` decimal(10,2) DEFAULT NULL,
  `late_fee_after_days` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_structures_institution_id_idx` (`institution_id`),
  KEY `fee_structures_class_id_idx` (`class_id`),
  CONSTRAINT `fee_structures_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structures`
--

LOCK TABLES `fee_structures` WRITE;
/*!40000 ALTER TABLE `fee_structures` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gate_passes`
--

DROP TABLE IF EXISTS `gate_passes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gate_passes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('early_leave','late_entry','day_out') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'early_leave',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `valid_until` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `gate_passes_institution_id_idx` (`institution_id`),
  KEY `gate_passes_student_id_idx` (`student_id`),
  CONSTRAINT `gate_passes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gate_passes`
--

LOCK TABLES `gate_passes` WRITE;
/*!40000 ALTER TABLE `gate_passes` DISABLE KEYS */;
/*!40000 ALTER TABLE `gate_passes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_photo_extractions`
--

DROP TABLE IF EXISTS `group_photo_extractions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_photo_extractions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_photo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `row_number` int DEFAULT NULL,
  `position_in_row` int DEFAULT NULL,
  `bounding_box` json DEFAULT NULL,
  `confidence_score` decimal(3,2) DEFAULT NULL,
  `face_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `match_confidence` int DEFAULT NULL,
  `is_auto_matched` tinyint(1) NOT NULL DEFAULT '0',
  `is_rejected` tinyint(1) NOT NULL DEFAULT '0',
  `manual_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `individual_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enhanced_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `framed_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `yearbook_format_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `group_photo_extractions_group_photo_id_idx` (`group_photo_id`),
  KEY `group_photo_extractions_student_id_idx` (`student_id`),
  KEY `group_photo_extractions_face_hash_idx` (`face_hash`),
  CONSTRAINT `group_photo_extractions_group_photo_id_fkey` FOREIGN KEY (`group_photo_id`) REFERENCES `group_photos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_photo_extractions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_photo_extractions`
--

LOCK TABLES `group_photo_extractions` WRITE;
/*!40000 ALTER TABLE `group_photo_extractions` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_photo_extractions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_photos`
--

DROP TABLE IF EXISTS `group_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_photos` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `photo_session_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_date` date DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photographer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_group_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_group_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perceptual_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_tier` enum('basic','standard','premium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'basic',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `processing_status` enum('uploaded','processing','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'uploaded',
  `face_detection_completed` tinyint(1) NOT NULL DEFAULT '0',
  `individual_extraction_completed` tinyint(1) NOT NULL DEFAULT '0',
  `total_students_detected` int NOT NULL DEFAULT '0',
  `row_count` int NOT NULL DEFAULT '0',
  `teacher_detected` tinyint(1) NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `group_photos_institution_id_idx` (`institution_id`),
  KEY `group_photos_section_id_idx` (`section_id`),
  KEY `group_photos_processing_status_idx` (`processing_status`),
  KEY `group_photos_perceptual_hash_idx` (`perceptual_hash`),
  KEY `group_photos_class_id_fkey` (`class_id`),
  CONSTRAINT `group_photos_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `group_photos_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_photos_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_photos`
--

LOCK TABLES `group_photos` WRITE;
/*!40000 ALTER TABLE `group_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardian_student_links`
--

DROP TABLE IF EXISTS `guardian_student_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardian_student_links` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guardian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `notify_attendance` tinyint(1) NOT NULL DEFAULT '1',
  `notify_fees` tinyint(1) NOT NULL DEFAULT '1',
  `notify_homework` tinyint(1) NOT NULL DEFAULT '1',
  `notify_exams` tinyint(1) NOT NULL DEFAULT '1',
  `notify_transport` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardian_student_links_guardian_id_student_id_key` (`guardian_id`,`student_id`),
  KEY `guardian_student_links_institution_id_idx` (`institution_id`),
  KEY `guardian_student_links_guardian_id_idx` (`guardian_id`),
  KEY `guardian_student_links_student_id_idx` (`student_id`),
  CONSTRAINT `guardian_student_links_guardian_id_fkey` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guardian_student_links_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guardian_student_links_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardian_student_links`
--

LOCK TABLES `guardian_student_links` WRITE;
/*!40000 ALTER TABLE `guardian_student_links` DISABLE KEYS */;
INSERT INTO `guardian_student_links` VALUES ('34f70472-4f38-43b3-b718-28c9d8d40611','4a890573-70e1-4d49-b116-d1d17c53ccff','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','feae884d-0c21-4a17-b991-d4a003006e22',1,1,1,1,1,1,'2026-05-28 07:07:26.499','2026-05-29 13:58:55.072');
/*!40000 ALTER TABLE `guardian_student_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardians`
--

DROP TABLE IF EXISTS `guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardians` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('mother','father','grandparent_paternal','grandparent_maternal','uncle','aunt','legal_guardian','hostel_warden','step_parent','sibling_adult','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `preferred_language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_dialect` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_medium` enum('text','voice') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marketing_consent` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_verified` tinyint(1) NOT NULL DEFAULT '0',
  `source` enum('backfill','manual','import','inbound') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'backfill',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardians_institution_id_whatsapp_number_key` (`institution_id`,`whatsapp_number`),
  KEY `guardians_institution_id_idx` (`institution_id`),
  KEY `guardians_whatsapp_number_idx` (`whatsapp_number`),
  CONSTRAINT `guardians_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
INSERT INTO `guardians` VALUES ('1cb94c6c-d957-43cb-8113-432ae2d9fe3e','4a890573-70e1-4d49-b116-d1d17c53ccff','Sunita',NULL,'919999900001','mother','hi',NULL,NULL,0,0,'manual','2026-05-28 07:07:26.483','2026-05-28 07:07:26.483');
/*!40000 ALTER TABLE `guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hall_tickets`
--

DROP TABLE IF EXISTS `hall_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hall_tickets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_schedule_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hall_ticket_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roll_number_for_exam` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exam_center` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_data` text COLLATE utf8mb4_unicode_ci,
  `barcode_data` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('generated','sent','downloaded','verified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generated',
  `sent_via` enum('sms','email','both') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hall_tickets_exam_schedule_id_student_id_key` (`exam_schedule_id`,`student_id`),
  UNIQUE KEY `hall_tickets_hall_ticket_number_key` (`hall_ticket_number`),
  KEY `hall_tickets_student_id_idx` (`student_id`),
  KEY `hall_tickets_status_idx` (`status`),
  KEY `hall_tickets_institution_id_fkey` (`institution_id`),
  KEY `hall_tickets_template_id_fkey` (`template_id`),
  CONSTRAINT `hall_tickets_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hall_tickets_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hall_tickets_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hall_tickets_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hall_tickets`
--

LOCK TABLES `hall_tickets` WRITE;
/*!40000 ALTER TABLE `hall_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `hall_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_records` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `blood_group` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `conditions` text COLLATE utf8mb4_unicode_ci,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `last_checkup` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `health_records_institution_id_student_id_key` (`institution_id`,`student_id`),
  KEY `health_records_institution_id_idx` (`institution_id`),
  CONSTRAINT `health_records_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_allotments`
--

DROP TABLE IF EXISTS `hostel_allotments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostel_allotments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bed_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','vacated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `allotted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `vacated_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hostel_allotments_institution_id_idx` (`institution_id`),
  KEY `hostel_allotments_room_id_idx` (`room_id`),
  KEY `hostel_allotments_student_id_idx` (`student_id`),
  CONSTRAINT `hostel_allotments_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hostel_allotments_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_allotments`
--

LOCK TABLES `hostel_allotments` WRITE;
/*!40000 ALTER TABLE `hostel_allotments` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_allotments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_blocks`
--

DROP TABLE IF EXISTS `hostel_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostel_blocks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('boys','girls','mixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'boys',
  `warden_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warden_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_rooms` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hostel_blocks_institution_id_code_key` (`institution_id`,`code`),
  KEY `hostel_blocks_institution_id_idx` (`institution_id`),
  CONSTRAINT `hostel_blocks_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_blocks`
--

LOCK TABLES `hostel_blocks` WRITE;
/*!40000 ALTER TABLE `hostel_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostel_rooms`
--

DROP TABLE IF EXISTS `hostel_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostel_rooms` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` int NOT NULL DEFAULT '0',
  `capacity` int NOT NULL DEFAULT '1',
  `occupied` int NOT NULL DEFAULT '0',
  `room_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_rent` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hostel_rooms_block_id_room_number_key` (`block_id`,`room_number`),
  KEY `hostel_rooms_institution_id_idx` (`institution_id`),
  KEY `hostel_rooms_block_id_idx` (`block_id`),
  CONSTRAINT `hostel_rooms_block_id_fkey` FOREIGN KEY (`block_id`) REFERENCES `hostel_blocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hostel_rooms_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostel_rooms`
--

LOCK TABLES `hostel_rooms` WRITE;
/*!40000 ALTER TABLE `hostel_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `hostel_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_card_batches`
--

DROP TABLE IF EXISTS `id_card_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_card_batches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_requested` int NOT NULL,
  `total_succeeded` int NOT NULL DEFAULT '0',
  `total_failed` int NOT NULL DEFAULT '0',
  `failed_student_ids` varchar(10000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `pdf_url` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `processing_time_ms` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_card_batches_institution_id_status_idx` (`institution_id`,`status`),
  KEY `id_card_batches_template_id_idx` (`template_id`),
  KEY `id_card_batches_institution_id_idx` (`institution_id`),
  CONSTRAINT `id_card_batches_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_card_batches_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_card_batches`
--

LOCK TABLES `id_card_batches` WRITE;
/*!40000 ALTER TABLE `id_card_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `id_card_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_cards`
--

DROP TABLE IF EXISTS `id_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_cards` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `qr_code_data` text COLLATE utf8mb4_unicode_ci,
  `barcode_data` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_front_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_back_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_approval','approved','printed','issued','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `issued_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `pdf_object_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_back_object_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_front_object_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_cards_card_number_key` (`card_number`),
  KEY `id_cards_student_id_idx` (`student_id`),
  KEY `id_cards_status_idx` (`status`),
  KEY `id_cards_template_id_idx` (`template_id`),
  KEY `id_cards_institution_id_status_idx` (`institution_id`,`status`),
  KEY `id_cards_institution_id_idx` (`institution_id`),
  CONSTRAINT `id_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_cards`
--

LOCK TABLES `id_cards` WRITE;
/*!40000 ALTER TABLE `id_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `id_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_cache`
--

DROP TABLE IF EXISTS `image_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_cache` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `perceptual_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quality_score` decimal(3,2) NOT NULL,
  `is_approved` tinyint(1) NOT NULL,
  `issues` json DEFAULT NULL,
  `analysis_method` enum('opencv','gemini') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hit_count` int NOT NULL DEFAULT '1',
  `last_accessed` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `image_cache_perceptual_hash_key` (`perceptual_hash`),
  KEY `image_cache_perceptual_hash_idx` (`perceptual_hash`),
  KEY `image_cache_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_cache`
--

LOCK TABLES `image_cache` WRITE;
/*!40000 ALTER TABLE `image_cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `image_cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inbound_media`
--

DROP TABLE IF EXISTS `inbound_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inbound_media` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guardian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wa_media_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `object_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_type` enum('image','audio','pdf','excel','video','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` int DEFAULT NULL,
  `intent_detected` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_taken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vision_used` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('received','downloading','stored','processed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'received',
  `transcript` text COLLATE utf8mb4_unicode_ci,
  `extracted_text` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `processed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inbound_media_wa_media_id_key` (`wa_media_id`),
  KEY `inbound_media_institution_id_idx` (`institution_id`),
  KEY `inbound_media_guardian_id_idx` (`guardian_id`),
  CONSTRAINT `inbound_media_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inbound_media`
--

LOCK TABLES `inbound_media` WRITE;
/*!40000 ALTER TABLE `inbound_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `inbound_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institution_authorities`
--

DROP TABLE IF EXISTS `institution_authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institution_authorities` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_type` enum('PRINCIPAL','VICE_CHANCELLOR','HOD','REGISTRAR','DEAN','DIRECTOR','COORDINATOR','TEACHER','CUSTOM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOM',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `institution_authorities_institution_id_idx` (`institution_id`),
  KEY `institution_authorities_role_type_idx` (`role_type`),
  CONSTRAINT `institution_authorities_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institution_authorities`
--

LOCK TABLES `institution_authorities` WRITE;
/*!40000 ALTER TABLE `institution_authorities` DISABLE KEYS */;
INSERT INTO `institution_authorities` VALUES ('de18c3c2-d62d-43a0-a4e6-7dcdb2997cdc','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','Virat Sir','','PRINCIPAL',NULL,NULL,'http://localhost:9000/vidyaverse/0ea3b292-ba4d-4e2e-9103-a13e637dbfc5/signatures/1777348376683-Screenshot_2025-12-18_151336.jpg',0,'2026-04-28 03:52:56.698','2026-04-28 03:52:56.698');
/*!40000 ALTER TABLE `institution_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institutions`
--

DROP TABLE IF EXISTS `institutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institutions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_type` enum('SCHOOL','COLLEGE','UNIVERSITY','COACHING_INSTITUTE','TRAINING_CENTER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHOOL',
  `address` text COLLATE utf8mb4_unicode_ci,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2025-2026',
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dark_logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Principal',
  `seal_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enabled_fields` json NOT NULL,
  `custom_fields` json NOT NULL,
  `enabled_services` json NOT NULL,
  `subscription_tier` enum('starter','professional','enterprise') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'starter',
  `subscription_status` enum('trial','active','suspended','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'trial',
  `trial_ends_at` datetime(3) DEFAULT NULL,
  `subscription_start` datetime(3) DEFAULT NULL,
  `subscription_end` datetime(3) DEFAULT NULL,
  `monthly_ai_usage` int NOT NULL DEFAULT '0',
  `monthly_pdf_pages` int NOT NULL DEFAULT '0',
  `monthly_email_sent` int NOT NULL DEFAULT '0',
  `storage_used_mb` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `onboarding_completed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `whatsapp_phone_number_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_waba_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_account_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_whatsapp_sent` int NOT NULL DEFAULT '0',
  `feature_overrides` json DEFAULT NULL,
  `module_config` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `institutions_code_key` (`code`),
  KEY `institutions_code_idx` (`code`),
  KEY `institutions_subscription_status_subscription_tier_idx` (`subscription_status`,`subscription_tier`),
  KEY `institutions_is_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institutions`
--

LOCK TABLES `institutions` WRITE;
/*!40000 ALTER TABLE `institutions` DISABLE KEYS */;
INSERT INTO `institutions` VALUES ('0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','Virat Gurukul  2','VG-010426','SCHOOL','201, RAHIL APPARTMENT, MAJAM JAMADAR STREET, RANDER','ADMIN@vinstitution.com','05461-232113','2026-2027','http://localhost:9000/vidyaverse/0ea3b292-ba4d-4e2e-9103-a13e637dbfc5/photos/1777348376259-site_pre_loader.png',NULL,NULL,'Principal',NULL,'{}','{}','{}','professional','active',NULL,NULL,NULL,0,0,0,0.00,1,1,'2026-04-28 03:50:53.117','2026-04-28 03:52:56.909',NULL,NULL,NULL,0,NULL,NULL),('4a890573-70e1-4d49-b116-d1d17c53ccff','Smoke Test School','VV-SMOKE','SCHOOL',NULL,NULL,NULL,'2025-2026',NULL,NULL,NULL,'Principal',NULL,'{}','{}','[\"whatsapp_messaging\"]','starter','trial',NULL,NULL,NULL,0,0,0,0.00,1,0,'2026-05-28 07:07:26.324','2026-05-30 17:27:36.068','PNID_SMOKE',NULL,NULL,5,'{\"grants\": [], \"revokes\": []}','{}');
/*!40000 ALTER TABLE `institutions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_categories`
--

DROP TABLE IF EXISTS `inventory_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('consumable','asset') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'consumable',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_categories_institution_id_name_key` (`institution_id`,`name`),
  KEY `inventory_categories_institution_id_idx` (`institution_id`),
  CONSTRAINT `inventory_categories_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_categories`
--

LOCK TABLES `inventory_categories` WRITE;
/*!40000 ALTER TABLE `inventory_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '0',
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_items_institution_id_idx` (`institution_id`),
  KEY `inventory_items_category_id_idx` (`category_id`),
  CONSTRAINT `inventory_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_executions`
--

DROP TABLE IF EXISTS `job_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_executions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_type` enum('photo_enhancement','bulk_pdf_generation','csv_import','facial_recognition','group_photo_processing','bulk_certificate_generation','bulk_hall_ticket_generation','bulk_marksheet_generation','monthly_usage_reset','email_batch') COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `initiated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('queued','processing','completed','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `progress` int NOT NULL DEFAULT '0',
  `total_items` int NOT NULL DEFAULT '0',
  `processed_items` int NOT NULL DEFAULT '0',
  `successful_items` int NOT NULL DEFAULT '0',
  `failed_items` int NOT NULL DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `error_stack` text COLLATE utf8mb4_unicode_ci,
  `result_data` json DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_executions_job_id_key` (`job_id`),
  KEY `job_executions_job_id_idx` (`job_id`),
  KEY `job_executions_status_idx` (`status`),
  KEY `job_executions_institution_id_idx` (`institution_id`),
  KEY `job_executions_job_type_status_idx` (`job_type`,`status`),
  CONSTRAINT `job_executions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_executions`
--

LOCK TABLES `job_executions` WRITE;
/*!40000 ALTER TABLE `job_executions` DISABLE KEYS */;
INSERT INTO `job_executions` VALUES ('4d738a2f-5e75-434a-b5a0-d05f10ec318c','2','csv_import','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73','1d5d687b-8d05-4af5-b92d-347f85c46bcf','completed',100,0,40,40,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-28 06:44:03.442');
/*!40000 ALTER TABLE `job_executions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date NOT NULL,
  `type` enum('receipt','payment','journal','contra') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'journal',
  `narration` text COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(14,2) NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('posted','void') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'posted',
  `created_by_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `journal_entries_institution_id_voucher_number_key` (`institution_id`,`voucher_number`),
  KEY `journal_entries_institution_id_idx` (`institution_id`),
  KEY `journal_entries_entry_date_idx` (`entry_date`),
  CONSTRAINT `journal_entries_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
INSERT INTO `journal_entries` VALUES ('4c00d135-2943-4fdd-905e-dea3c54bfb0a','4a890573-70e1-4d49-b116-d1d17c53ccff','V-1780064692524-539','2026-05-29','receipt','Donation',3000.00,NULL,NULL,'posted',NULL,'2026-05-29 14:24:52.526'),('b9d381af-9b95-4be8-89f0-e3199a3cc4fb','4a890573-70e1-4d49-b116-d1d17c53ccff','V-1780064692468-835','2026-05-29','payment','Stationery',5000.00,NULL,NULL,'posted',NULL,'2026-05-29 14:24:52.471'),('cef66d58-8737-4669-99a6-d1d7fa4d8c01','4a890573-70e1-4d49-b116-d1d17c53ccff','V-1780064692556-650','2026-05-29','receipt','Fee collection (invoice smoke-invoice-123)',2000.00,'fee_invoice','smoke-invoice-123','posted',NULL,'2026-05-29 14:24:52.557'),('f388935b-ac25-46ed-ba65-0663c0bf2616','4a890573-70e1-4d49-b116-d1d17c53ccff','V-1780064692427-709','2026-05-29','journal','Smoke balanced',1000.00,NULL,NULL,'posted',NULL,'2026-05-29 14:24:52.430');
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_lines`
--

DROP TABLE IF EXISTS `journal_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debit` decimal(14,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `journal_lines_institution_id_idx` (`institution_id`),
  KEY `journal_lines_entry_id_idx` (`entry_id`),
  KEY `journal_lines_account_id_idx` (`account_id`),
  CONSTRAINT `journal_lines_entry_id_fkey` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_lines`
--

LOCK TABLES `journal_lines` WRITE;
/*!40000 ALTER TABLE `journal_lines` DISABLE KEYS */;
INSERT INTO `journal_lines` VALUES ('0fb59775-3191-4223-8805-cad18cefec85','4a890573-70e1-4d49-b116-d1d17c53ccff','f388935b-ac25-46ed-ba65-0663c0bf2616','d9457ce9-8ab8-4c21-bb2e-356113859e04',0.00,1000.00,'2026-05-29 14:24:52.430'),('75dc9a86-2785-4082-984e-9fd858ce8b3a','4a890573-70e1-4d49-b116-d1d17c53ccff','b9d381af-9b95-4be8-89f0-e3199a3cc4fb','f4410454-ed3f-42ba-b0eb-0d13dbcdcbb1',0.00,5000.00,'2026-05-29 14:24:52.471'),('7c5a51fd-2886-4e68-b3bf-f8bedd94e09c','4a890573-70e1-4d49-b116-d1d17c53ccff','4c00d135-2943-4fdd-905e-dea3c54bfb0a','d9457ce9-8ab8-4c21-bb2e-356113859e04',0.00,3000.00,'2026-05-29 14:24:52.526'),('86146faf-7320-491c-a947-3323e79d0c8f','4a890573-70e1-4d49-b116-d1d17c53ccff','cef66d58-8737-4669-99a6-d1d7fa4d8c01','f4410454-ed3f-42ba-b0eb-0d13dbcdcbb1',2000.00,0.00,'2026-05-29 14:24:52.557'),('8e1fb08d-d91f-407c-825d-272167612a72','4a890573-70e1-4d49-b116-d1d17c53ccff','4c00d135-2943-4fdd-905e-dea3c54bfb0a','f4410454-ed3f-42ba-b0eb-0d13dbcdcbb1',3000.00,0.00,'2026-05-29 14:24:52.526'),('9bb83123-d72a-427b-a0e4-e1fd507d273b','4a890573-70e1-4d49-b116-d1d17c53ccff','b9d381af-9b95-4be8-89f0-e3199a3cc4fb','b6169a3c-826f-458f-bfc8-e712f987231e',5000.00,0.00,'2026-05-29 14:24:52.471'),('9f03a25e-f5a0-4540-816c-63333fd52209','4a890573-70e1-4d49-b116-d1d17c53ccff','cef66d58-8737-4669-99a6-d1d7fa4d8c01','eaa7cfe0-ac13-4e8f-8331-f7a840e33cc1',0.00,2000.00,'2026-05-29 14:24:52.557'),('a72eb695-0993-4531-981f-97776795e1c1','4a890573-70e1-4d49-b116-d1d17c53ccff','f388935b-ac25-46ed-ba65-0663c0bf2616','f4410454-ed3f-42ba-b0eb-0d13dbcdcbb1',1000.00,0.00,'2026-05-29 14:24:52.430');
/*!40000 ALTER TABLE `journal_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwks`
--

DROP TABLE IF EXISTS `jwks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `private_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwks`
--

LOCK TABLES `jwks` WRITE;
/*!40000 ALTER TABLE `jwks` DISABLE KEYS */;
INSERT INTO `jwks` VALUES ('3LNwbj08ar9oykN5cpSAuQ55nYEwJ4UW','{\"crv\":\"Ed25519\",\"x\":\"FUgL57RYI952wyoJV7yeuCH14Qk3T2AlJZYdXWZQKVA\",\"kty\":\"OKP\"}','\"7bbd68c6b470322f8e6fcddbb15ca1777051805e24bae5a12d01bf6998c34aff66bd2112d8b8500a4e55e5bb6edaadb2e9dffd8e85595ca8fc39e953936fa31d87cb092ca22aca93781e81f8c8f6764f0398927f4197257f99e6878556605e9faf431fe74e5097333efb3432f63edee6b8e98d9e2cd7c430d9456ccddedaaa4a5de3753d1a6402a3a7606b889e8d0a58072b4575bc8944d97bb1152b24653843e524def3b259fef51e\"','2026-05-29 21:08:08.847',NULL);
/*!40000 ALTER TABLE `jwks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `staff_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('casual','sick','earned','unpaid','maternity','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'casual',
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `days` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reviewed_by_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_requests_institution_id_idx` (`institution_id`),
  KEY `leave_requests_staff_id_idx` (`staff_id`),
  KEY `leave_requests_status_idx` (`status`),
  CONSTRAINT `leave_requests_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_accounts`
--

DROP TABLE IF EXISTS `ledger_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledger_accounts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','income','expense','equity') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ledger_accounts_institution_id_code_key` (`institution_id`,`code`),
  KEY `ledger_accounts_institution_id_idx` (`institution_id`),
  KEY `ledger_accounts_type_idx` (`type`),
  CONSTRAINT `ledger_accounts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_accounts`
--

LOCK TABLES `ledger_accounts` WRITE;
/*!40000 ALTER TABLE `ledger_accounts` DISABLE KEYS */;
INSERT INTO `ledger_accounts` VALUES ('37f1656c-f065-428f-b31d-762e03700855','4a890573-70e1-4d49-b116-d1d17c53ccff','SALARY_EXP','Salary Expense','expense',1,1,'2026-05-29 14:24:52.400','2026-05-29 14:24:52.400'),('63aa3bca-c7eb-494b-b5f7-51aa9e28e6b5','4a890573-70e1-4d49-b116-d1d17c53ccff','BANK','Bank','asset',1,1,'2026-05-29 14:24:52.363','2026-05-29 14:24:52.363'),('b6169a3c-826f-458f-bfc8-e712f987231e','4a890573-70e1-4d49-b116-d1d17c53ccff','GENERAL_EXP','General Expense','expense',1,1,'2026-05-29 14:24:52.411','2026-05-29 14:24:52.411'),('d9457ce9-8ab8-4c21-bb2e-356113859e04','4a890573-70e1-4d49-b116-d1d17c53ccff','MISC_INCOME','Miscellaneous Income','income',1,1,'2026-05-29 14:24:52.388','2026-05-29 14:24:52.388'),('eaa7cfe0-ac13-4e8f-8331-f7a840e33cc1','4a890573-70e1-4d49-b116-d1d17c53ccff','FEE_INCOME','Fee Income','income',1,1,'2026-05-29 14:24:52.376','2026-05-29 14:24:52.376'),('f4410454-ed3f-42ba-b0eb-0d13dbcdcbb1','4a890573-70e1-4d49-b116-d1d17c53ccff','CASH','Cash','asset',1,1,'2026-05-29 14:24:52.348','2026-05-29 14:24:52.348');
/*!40000 ALTER TABLE `ledger_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_cards`
--

DROP TABLE IF EXISTS `library_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_cards` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `library_card_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `max_books_allowed` int NOT NULL DEFAULT '3',
  `borrowing_period_days` int NOT NULL DEFAULT '14',
  `qr_code_data` text COLLATE utf8mb4_unicode_ci,
  `barcode_data` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `library_cards_library_card_number_key` (`library_card_number`),
  UNIQUE KEY `library_cards_student_id_institution_id_key` (`student_id`,`institution_id`),
  KEY `library_cards_student_id_idx` (`student_id`),
  KEY `library_cards_status_idx` (`status`),
  KEY `library_cards_institution_id_fkey` (`institution_id`),
  KEY `library_cards_template_id_fkey` (`template_id`),
  CONSTRAINT `library_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `library_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `library_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_cards`
--

LOCK TABLES `library_cards` WRITE;
/*!40000 ALTER TABLE `library_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_classes`
--

DROP TABLE IF EXISTS `live_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_classes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('zoom','meet','jitsi','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'meet',
  `join_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recording_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` datetime(3) NOT NULL,
  `duration_mins` int NOT NULL DEFAULT '45',
  `host_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('scheduled','live','ended','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `live_classes_institution_id_idx` (`institution_id`),
  KEY `live_classes_section_id_idx` (`section_id`),
  KEY `live_classes_status_idx` (`status`),
  CONSTRAINT `live_classes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_classes`
--

LOCK TABLES `live_classes` WRITE;
/*!40000 ALTER TABLE `live_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marks`
--

DROP TABLE IF EXISTS `marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_schedule_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `theory_max_marks` int DEFAULT NULL,
  `theory_obtained_marks` decimal(5,2) DEFAULT NULL,
  `practical_max_marks` int DEFAULT NULL,
  `practical_obtained_marks` decimal(5,2) DEFAULT NULL,
  `internal_max_marks` int DEFAULT NULL,
  `internal_obtained_marks` decimal(5,2) DEFAULT NULL,
  `total_max_marks` int DEFAULT NULL,
  `total_obtained_marks` decimal(5,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `grade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','submitted','approved','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `entered_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marks_student_id_subject_id_exam_schedule_id_key` (`student_id`,`subject_id`,`exam_schedule_id`),
  KEY `marks_student_id_idx` (`student_id`),
  KEY `marks_exam_schedule_id_idx` (`exam_schedule_id`),
  KEY `marks_status_idx` (`status`),
  KEY `marks_subject_id_fkey` (`subject_id`),
  CONSTRAINT `marks_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `marks_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `marks_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marks`
--

LOCK TABLES `marks` WRITE;
/*!40000 ALTER TABLE `marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marksheets`
--

DROP TABLE IF EXISTS `marksheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marksheets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_schedule_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculation_engine_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_percentage` decimal(5,2) DEFAULT NULL,
  `cgpa` decimal(4,2) DEFAULT NULL,
  `grade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_rank` int DEFAULT NULL,
  `section_rank` int DEFAULT NULL,
  `overall_rank` int DEFAULT NULL,
  `percentile` decimal(5,2) DEFAULT NULL,
  `total_students_in_comparison` int DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `digital_signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','generated','approved','published','sent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marksheets_student_id_exam_schedule_id_key` (`student_id`,`exam_schedule_id`),
  KEY `marksheets_student_id_idx` (`student_id`),
  KEY `marksheets_exam_schedule_id_idx` (`exam_schedule_id`),
  KEY `marksheets_institution_id_fkey` (`institution_id`),
  KEY `marksheets_template_id_fkey` (`template_id`),
  KEY `marksheets_calculation_engine_id_fkey` (`calculation_engine_id`),
  CONSTRAINT `marksheets_calculation_engine_id_fkey` FOREIGN KEY (`calculation_engine_id`) REFERENCES `calculation_engines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `marksheets_exam_schedule_id_fkey` FOREIGN KEY (`exam_schedule_id`) REFERENCES `exam_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `marksheets_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `marksheets_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `marksheets_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marksheets`
--

LOCK TABLES `marksheets` WRITE;
/*!40000 ALTER TABLE `marksheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `marksheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_bills`
--

DROP TABLE IF EXISTS `mess_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mess_bills` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bill_month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `due_date` date DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mess_bills_student_id_bill_month_key` (`student_id`,`bill_month`),
  KEY `mess_bills_institution_id_idx` (`institution_id`),
  KEY `mess_bills_status_idx` (`status`),
  CONSTRAINT `mess_bills_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_bills`
--

LOCK TABLES `mess_bills` WRITE;
/*!40000 ALTER TABLE `mess_bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `mess_bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_templates`
--

DROP TABLE IF EXISTS `message_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_templates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_template_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('utility','authentication','marketing','service') COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('whatsapp','sms') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'whatsapp',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dialect` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholders` json DEFAULT NULL,
  `button_config` json DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `meta_template_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_templates_institution_id_code_language_key` (`institution_id`,`code`,`language`),
  KEY `message_templates_institution_id_idx` (`institution_id`),
  KEY `message_templates_code_idx` (`code`),
  CONSTRAINT `message_templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_templates`
--

LOCK TABLES `message_templates` WRITE;
/*!40000 ALTER TABLE `message_templates` DISABLE KEYS */;
INSERT INTO `message_templates` VALUES ('2ca85a66-2280-4896-a252-7f72a44c7e1b','4a890573-70e1-4d49-b116-d1d17c53ccff','fee_reminder','fee_reminder','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, {{2}} की फीस ₹{{3}} बकाया है। कृपया नीचे दिए लिंक से भुगतान करें।','{\"body\": [\"guardian_name\", \"child_name\", \"amount\"], \"button\": [\"payment_link\"]}','{\"type\": \"url\", \"index\": 0}','approved',NULL,'2026-05-28 07:07:26.546','2026-05-29 13:58:55.126'),('518d4393-b647-40f0-95ac-7371f482b733','4a890573-70e1-4d49-b116-d1d17c53ccff','transport_alert','transport_alert','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, परिवहन सूचना: {{2}}','{\"body\": [\"guardian_name\", \"message\"]}','null','approved',NULL,'2026-05-29 13:58:55.197','2026-05-29 13:58:55.197'),('5621f41d-b25b-4948-b7a2-7fccb9dfe950','4a890573-70e1-4d49-b116-d1d17c53ccff','payment_confirmation','payment_confirmation','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, {{2}} की फीस ₹{{3}} का भुगतान प्राप्त हो गया है (रसीद: {{4}})। धन्यवाद!','{\"body\": [\"guardian_name\", \"child_name\", \"amount\", \"invoice_number\"]}','null','approved',NULL,'2026-05-28 22:40:34.686','2026-05-29 13:58:55.182'),('88d8a7e9-3bec-4a97-9324-f44ac38483c3','4a890573-70e1-4d49-b116-d1d17c53ccff','general_announcement','general_announcement','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, विद्यालय की ओर से सूचना: {{2}}','{\"body\": [\"guardian_name\", \"message\"]}','null','approved',NULL,'2026-05-28 07:07:26.576','2026-05-29 13:58:55.167'),('9e59afd1-b39f-4324-b73e-6d9fc4845930','4a890573-70e1-4d49-b116-d1d17c53ccff','digest_daily','digest_daily','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, आपके बच्चों के लिए आज {{2}} नई सूचनाएँ हैं:\n{{3}}','{\"body\": [\"guardian_name\", \"count\", \"summary\"]}','null','approved',NULL,'2026-05-28 07:07:26.532','2026-05-29 13:58:55.112'),('d2c54cd6-3bc9-47d1-b048-5f0acfc1d4cd','4a890573-70e1-4d49-b116-d1d17c53ccff','result_published','result_published','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, {{2}} का {{3}} परीक्षा परिणाम घोषित हो गया है। विवरण के लिए विद्यालय से संपर्क करें।','{\"body\": [\"guardian_name\", \"child_name\", \"exam_name\"]}','null','approved',NULL,'2026-05-28 07:07:26.557','2026-05-29 13:58:55.141'),('e1148a80-44fe-4d2f-8f7d-60758e6ca1bd','4a890573-70e1-4d49-b116-d1d17c53ccff','exam_schedule','exam_schedule','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, {{2}} की {{3}} परीक्षा {{4}} से शुरू होगी। कृपया तैयारी सुनिश्चित करें।','{\"body\": [\"guardian_name\", \"child_name\", \"exam_name\", \"start_date\"]}','null','approved',NULL,'2026-05-28 07:07:26.566','2026-05-29 13:58:55.153'),('ffe49ba3-d74b-4837-a3ca-58e5004f04a5','4a890573-70e1-4d49-b116-d1d17c53ccff','attendance_absent','attendance_absent','utility','whatsapp','hi',NULL,'नमस्ते {{1}} जी, आपका बच्चा {{2}} आज ({{3}}) स्कूल में अनुपस्थित रहा। यदि यह जानकारी ग़लत है तो विद्यालय से संपर्क करें।','{\"body\": [\"guardian_name\", \"child_name\", \"date\"]}','null','approved',NULL,'2026-05-28 07:07:26.520','2026-05-29 13:58:55.094');
/*!40000 ALTER TABLE `message_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `outbox_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staff_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel` enum('whatsapp','sms','ivr') COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wa_message_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direction` enum('outbound','inbound') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('utility','authentication','marketing','service') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivered_at` datetime(3) DEFAULT NULL,
  `read_at` datetime(3) DEFAULT NULL,
  `failed_at` datetime(3) DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_institution_id_idx` (`institution_id`),
  KEY `messages_guardian_id_idx` (`guardian_id`),
  KEY `messages_wa_message_id_idx` (`wa_message_id`),
  KEY `messages_outbox_id_idx` (`outbox_id`),
  CONSTRAINT `messages_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_outbox_id_fkey` FOREIGN KEY (`outbox_id`) REFERENCES `outbox` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('64f01757-4e18-4786-888c-63ecb995fc48','4a890573-70e1-4d49-b116-d1d17c53ccff','e11ad7dd-71a8-4222-bfac-f67c6906518e','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','general_announcement','dev-skip-52d71d8d-60f6-48f6-901b-2f2c80f53193','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 07:07:26.678','2026-05-28 07:07:26.678'),('67e7f967-1239-4dc0-8cd4-b9a781a2f253','4a890573-70e1-4d49-b116-d1d17c53ccff','753f77e1-737b-48b1-8019-2101315e2353','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','transport_alert','dev-skip-9f1c9ca3-6156-4fb9-8819-668bac416c67','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-29 13:58:55.430','2026-05-29 13:58:55.430'),('6dfac326-dfe8-42cf-8828-a0ebecc5f1be','4a890573-70e1-4d49-b116-d1d17c53ccff','e824e211-38c2-4cbe-93f4-a6834595f604','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','payment_confirmation','dev-skip-d4f2db5e-a35e-4bb2-8955-5fb4d6452d57','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 22:40:35.428','2026-05-28 22:40:35.428'),('78089030-197d-4572-913c-bcab8e961a2b','4a890573-70e1-4d49-b116-d1d17c53ccff','b2440f70-8db9-4579-97a5-a7acdaa67e4e','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','digest_daily','dev-skip-16630b82-7f86-4be5-a1a6-2daa24c040ba','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 07:07:27.247','2026-05-28 07:07:27.247'),('84f83ecf-8a29-4695-9152-8b86f083a001','4a890573-70e1-4d49-b116-d1d17c53ccff',NULL,NULL,NULL,'whatsapp',NULL,NULL,'outbound',NULL,'skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 23:00:16.124','2026-05-28 23:00:16.124'),('8bc95282-abf2-4c51-a27a-9342cb6d023f','4a890573-70e1-4d49-b116-d1d17c53ccff','288462ef-9a71-43a5-8170-cda70e1d6c8d','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','fee_reminder','dev-skip-f74043dd-f803-49fc-abf8-c70b14661987','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 22:40:34.835','2026-05-28 22:40:34.835'),('8d104bf0-be6d-4729-9c1b-aa14ed133a4f','4a890573-70e1-4d49-b116-d1d17c53ccff',NULL,NULL,NULL,'whatsapp',NULL,NULL,'outbound',NULL,'skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 23:00:16.045','2026-05-28 23:00:16.045'),('b1260ebb-b460-4f30-9581-e46326380f2f','4a890573-70e1-4d49-b116-d1d17c53ccff','74a50ad9-5a5b-40ba-972a-7b663d53b0f1','1cb94c6c-d957-43cb-8113-432ae2d9fe3e',NULL,'whatsapp','payment_confirmation','dev-skip-ec16f8c8-27b2-4a1a-a8b4-2bdf55067a11','outbound','utility','skipped_no_creds',NULL,NULL,NULL,NULL,'2026-05-28 23:00:16.299','2026-05-28 23:00:16.299');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` enum('all','staff','students','parents') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `category` enum('circular','event','holiday','exam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'circular',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `published_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notices_institution_id_idx` (`institution_id`),
  KEY `notices_status_idx` (`status`),
  KEY `notices_audience_idx` (`audience`),
  CONSTRAINT `notices_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('email','sms','push') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','sent','partial','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `message_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notification_logs_institution_id_idx` (`institution_id`),
  KEY `notification_logs_type_status_idx` (`type`,`status`),
  CONSTRAINT `notification_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_templates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('email','sms','push') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_templates_institution_id_idx` (`institution_id`),
  CONSTRAINT `notification_templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('info','success','warning','error') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `action_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_is_read_idx` (`user_id`,`is_read`),
  KEY `notifications_institution_id_idx` (`institution_id`),
  CONSTRAINT `notifications_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_tokens`
--

DROP TABLE IF EXISTS `oauth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_access_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_token_expires_at` datetime(3) NOT NULL,
  `refresh_token_expires_at` datetime(3) NOT NULL,
  `client_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth_access_tokens_access_token_key` (`access_token`),
  UNIQUE KEY `oauth_access_tokens_refresh_token_key` (`refresh_token`),
  KEY `oauth_access_tokens_client_id_idx` (`client_id`),
  KEY `oauth_access_tokens_user_id_idx` (`user_id`),
  CONSTRAINT `oauth_access_tokens_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `oauth_applications` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oauth_access_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_access_tokens`
--

LOCK TABLES `oauth_access_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_applications`
--

DROP TABLE IF EXISTS `oauth_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_applications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `client_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_secret` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_urls` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `disabled` tinyint(1) NOT NULL DEFAULT '0',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth_applications_client_id_key` (`client_id`),
  KEY `oauth_applications_user_id_idx` (`user_id`),
  CONSTRAINT `oauth_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_applications`
--

LOCK TABLES `oauth_applications` WRITE;
/*!40000 ALTER TABLE `oauth_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_consents`
--

DROP TABLE IF EXISTS `oauth_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_consents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth_consents_client_id_user_id_key` (`client_id`,`user_id`),
  KEY `oauth_consents_user_id_idx` (`user_id`),
  CONSTRAINT `oauth_consents_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `oauth_applications` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oauth_consents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_consents`
--

LOCK TABLES `oauth_consents` WRITE;
/*!40000 ALTER TABLE `oauth_consents` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_consents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_test_attempts`
--

DROP TABLE IF EXISTS `online_test_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_test_attempts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answers` json DEFAULT NULL,
  `score` int DEFAULT NULL,
  `max_score` int NOT NULL DEFAULT '0',
  `status` enum('in_progress','submitted','graded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_progress',
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `submitted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `online_test_attempts_test_id_student_id_key` (`test_id`,`student_id`),
  KEY `online_test_attempts_institution_id_idx` (`institution_id`),
  KEY `online_test_attempts_test_id_idx` (`test_id`),
  CONSTRAINT `online_test_attempts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `online_test_attempts_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `online_tests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_test_attempts`
--

LOCK TABLES `online_test_attempts` WRITE;
/*!40000 ALTER TABLE `online_test_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_test_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_tests`
--

DROP TABLE IF EXISTS `online_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_tests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question_ids` json NOT NULL,
  `total_marks` int NOT NULL DEFAULT '0',
  `duration_mins` int NOT NULL DEFAULT '30',
  `status` enum('draft','published','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `scheduled_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `online_tests_institution_id_idx` (`institution_id`),
  KEY `online_tests_section_id_idx` (`section_id`),
  KEY `online_tests_status_idx` (`status`),
  CONSTRAINT `online_tests_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_tests`
--

LOCK TABLES `online_tests` WRITE;
/*!40000 ALTER TABLE `online_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outbox`
--

DROP TABLE IF EXISTS `outbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outbox` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_type` enum('guardian','staff') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('whatsapp','sms','ivr') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'whatsapp',
  `template_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json DEFAULT NULL,
  `category` enum('utility','authentication','marketing','service') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('critical','high','normal','low') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `idempotency_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','sent','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `window_used` tinyint(1) NOT NULL DEFAULT '0',
  `sent_at` datetime(3) DEFAULT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `last_error` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outbox_idempotency_key_key` (`idempotency_key`),
  KEY `outbox_institution_id_idx` (`institution_id`),
  KEY `outbox_status_idx` (`status`),
  KEY `outbox_recipient_type_recipient_id_idx` (`recipient_type`,`recipient_id`),
  CONSTRAINT `outbox_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outbox`
--

LOCK TABLES `outbox` WRITE;
/*!40000 ALTER TABLE `outbox` DISABLE KEYS */;
INSERT INTO `outbox` VALUES ('288462ef-9a71-43a5-8170-cda70e1d6c8d','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','fee_reminder','{\"amount\": \"4900\", \"child_name\": \"Aarav Sharma\", \"payment_link\": \"https://rzp.example/dev/3afb9d5c-2ab0-4741-ba3f-439f536d63dd\", \"guardian_name\": \"Sunita\"}','utility','normal','fee-reminder:3afb9d5c-2ab0-4741-ba3f-439f536d63dd:1cb94c6c-d957-43cb-8113-432ae2d9fe3e','sent',0,'2026-05-28 22:40:34.818',1,NULL,'2026-05-28 22:40:34.773','2026-05-28 22:40:34.819'),('74a50ad9-5a5b-40ba-972a-7b663d53b0f1','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','payment_confirmation','{\"amount\": \"5000.00\", \"child_name\": \"Aarav Sharma\", \"guardian_name\": \"Sunita\", \"invoice_number\": \"INV-1780009215909-729\"}','utility','critical','payment-confirm:claim_bd916f84-5f28-4c6e-8fd8-002c2a0d6a37','sent',0,'2026-05-28 23:00:16.285',1,NULL,'2026-05-28 23:00:16.240','2026-05-28 23:00:16.286'),('753f77e1-737b-48b1-8019-2101315e2353','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','transport_alert','{\"message\": \"Route 7 — Sector 21 रूट की बस रवाना हो गई है। 🚌\", \"guardian_name\": \"Sunita\"}','utility','high','transport:781963cb-d374-46e9-a527-c66cf1425813:1cb94c6c-d957-43cb-8113-432ae2d9fe3e:1780063135322','sent',0,'2026-05-29 13:58:55.398',1,NULL,'2026-05-29 13:58:55.329','2026-05-29 13:58:55.401'),('b2440f70-8db9-4579-97a5-a7acdaa67e4e','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','digest_daily','{\"count\": \"1\", \"summary\": \"1. Aarav Sharma आज अनुपस्थित रहा\", \"guardian_name\": \"Sunita\"}','utility','high','digest:1cb94c6c-d957-43cb-8113-432ae2d9fe3e:2026-05-28T07:07','sent',0,'2026-05-28 07:07:27.207',1,NULL,'2026-05-28 07:07:27.171','2026-05-28 07:07:27.209'),('e11ad7dd-71a8-4222-bfac-f67c6906518e','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','general_announcement','{\"message\": \"स्मोक टेस्ट सूचना\", \"guardian_name\": \"Sunita\"}','utility','normal','smoke-direct-1779952046591','sent',0,'2026-05-28 07:07:26.658',1,NULL,'2026-05-28 07:07:26.593','2026-05-28 07:07:26.660'),('e824e211-38c2-4cbe-93f4-a6834595f604','4a890573-70e1-4d49-b116-d1d17c53ccff','guardian','1cb94c6c-d957-43cb-8113-432ae2d9fe3e','whatsapp','payment_confirmation','{\"amount\": \"4900.00\", \"child_name\": \"Aarav Sharma\", \"guardian_name\": \"Sunita\", \"invoice_number\": \"INV-1780008034702-613\"}','utility','critical','payment-confirm:pay_smoke_1780008035302','sent',0,'2026-05-28 22:40:35.412',1,NULL,'2026-05-28 22:40:35.369','2026-05-28 22:40:35.414');
/*!40000 ALTER TABLE `outbox` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payslips`
--

DROP TABLE IF EXISTS `payslips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payslips` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `staff_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `gross_earnings` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `breakdown` json NOT NULL,
  `status` enum('draft','finalized','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payslips_staff_id_month_year_key` (`staff_id`,`month`,`year`),
  KEY `payslips_institution_id_idx` (`institution_id`),
  KEY `payslips_staff_id_idx` (`staff_id`),
  CONSTRAINT `payslips_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payslips`
--

LOCK TABLES `payslips` WRITE;
/*!40000 ALTER TABLE `payslips` DISABLE KEYS */;
/*!40000 ALTER TABLE `payslips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `placement_applications`
--

DROP TABLE IF EXISTS `placement_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `placement_applications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drive_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('applied','shortlisted','selected','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'applied',
  `applied_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `placement_applications_drive_id_student_id_key` (`drive_id`,`student_id`),
  KEY `placement_applications_institution_id_idx` (`institution_id`),
  KEY `placement_applications_student_id_idx` (`student_id`),
  CONSTRAINT `placement_applications_drive_id_fkey` FOREIGN KEY (`drive_id`) REFERENCES `placement_drives` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `placement_applications_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `placement_applications`
--

LOCK TABLES `placement_applications` WRITE;
/*!40000 ALTER TABLE `placement_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `placement_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `placement_drives`
--

DROP TABLE IF EXISTS `placement_drives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `placement_drives` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_lpa` decimal(8,2) DEFAULT NULL,
  `drive_date` date DEFAULT NULL,
  `eligibility_criteria` text COLLATE utf8mb4_unicode_ci,
  `status` enum('upcoming','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'upcoming',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `placement_drives_institution_id_idx` (`institution_id`),
  KEY `placement_drives_status_idx` (`status`),
  CONSTRAINT `placement_drives_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `placement_drives`
--

LOCK TABLES `placement_drives` WRITE;
/*!40000 ALTER TABLE `placement_drives` DISABLE KEYS */;
/*!40000 ALTER TABLE `placement_drives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolio_sections`
--

DROP TABLE IF EXISTS `portfolio_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolio_sections` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `portfolio_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('about','education','skills','achievements','projects','gallery','contact','custom') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` json NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `portfolio_sections_portfolio_id_idx` (`portfolio_id`),
  CONSTRAINT `portfolio_sections_portfolio_id_fkey` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_sections`
--

LOCK TABLES `portfolio_sections` WRITE;
/*!40000 ALTER TABLE `portfolio_sections` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolio_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` enum('modern','classic','minimal','colorful','professional') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'modern',
  `theme_config` json DEFAULT NULL,
  `custom_domain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `view_count` int NOT NULL DEFAULT '0',
  `published_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `portfolios_student_id_key` (`student_id`),
  UNIQUE KEY `portfolios_slug_key` (`slug`),
  KEY `portfolios_institution_id_idx` (`institution_id`),
  KEY `portfolios_slug_idx` (`slug`),
  KEY `portfolios_status_idx` (`status`),
  KEY `portfolios_template_id_fkey` (`template_id`),
  CONSTRAINT `portfolios_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `portfolios_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `portfolios_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolios`
--

LOCK TABLES `portfolios` WRITE;
/*!40000 ALTER TABLE `portfolios` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank_items`
--

DROP TABLE IF EXISTS `question_bank_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('mcq','true_false','short_answer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'mcq',
  `options` json DEFAULT NULL,
  `correct_option` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marks` int NOT NULL DEFAULT '1',
  `difficulty` enum('easy','medium','hard') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `question_bank_items_institution_id_idx` (`institution_id`),
  KEY `question_bank_items_subject_idx` (`subject`),
  CONSTRAINT `question_bank_items_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank_items`
--

LOCK TABLES `question_bank_items` WRITE;
/*!40000 ALTER TABLE `question_bank_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_structures`
--

DROP TABLE IF EXISTS `salary_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_structures` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `staff_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_from` date NOT NULL,
  `basic` decimal(12,2) NOT NULL,
  `hra` decimal(12,2) NOT NULL DEFAULT '0.00',
  `conveyance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `special` decimal(12,2) NOT NULL DEFAULT '0.00',
  `other_allowances` json DEFAULT NULL,
  `pf_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `esi_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `professional_tax` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tds` decimal(12,2) NOT NULL DEFAULT '0.00',
  `other_deductions` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `salary_structures_institution_id_idx` (`institution_id`),
  KEY `salary_structures_staff_id_idx` (`staff_id`),
  CONSTRAINT `salary_structures_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_structures`
--

LOCK TABLES `salary_structures` WRITE;
/*!40000 ALTER TABLE `salary_structures` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_reports`
--

DROP TABLE IF EXISTS `saved_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_reports` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` json DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `saved_reports_institution_id_idx` (`institution_id`),
  CONSTRAINT `saved_reports_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_reports`
--

LOCK TABLES `saved_reports` WRITE;
/*!40000 ALTER TABLE `saved_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stream_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_student_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `class_teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sections_class_id_stream_id_name_key` (`class_id`,`stream_id`,`name`),
  KEY `sections_institution_id_fkey` (`institution_id`),
  KEY `sections_stream_id_fkey` (`stream_id`),
  KEY `sections_class_teacher_id_fkey` (`class_teacher_id`),
  CONSTRAINT `sections_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sections_class_teacher_id_fkey` FOREIGN KEY (`class_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sections_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sections_stream_id_fkey` FOREIGN KEY (`stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES ('045a8de1-828a-494e-9d34-539ce0eafe65','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','0a27e8ea-748b-432f-add5-cf4a143fa561',NULL,'A',40,'2026-04-28 03:51:39.504','2026-04-28 03:51:39.504',NULL),('1c123034-31b8-4466-9d89-f6c38b1bdc15','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','da54d939-df4f-4e32-a36b-7d69eb206230',NULL,'B',40,'2026-04-28 03:51:39.205','2026-04-28 03:51:39.205',NULL),('2583c18a-3c56-4127-a085-23ba16b5ee86','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','a8327097-733d-4933-9f1c-49535b4415bd',NULL,'B',40,'2026-04-28 03:51:42.316','2026-04-28 03:51:42.316',NULL),('27a5b58d-1155-469a-b6c6-a93a4cc2de87','4a890573-70e1-4d49-b116-d1d17c53ccff','c0732854-220f-4a66-9d37-132ba98bb0a4',NULL,'B',0,'2026-05-29 14:34:02.372','2026-05-29 14:34:02.372',NULL),('3390bf16-3beb-40d8-803d-be2001148d93','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','480103b5-08d0-4702-befa-9027c3463688',NULL,'B',40,'2026-04-28 03:51:38.047','2026-04-28 03:51:38.047',NULL),('376f1331-4c85-4b52-be25-00b8a8634c6f','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','1acf970b-2d49-4586-b848-556e00c761ae',NULL,'B',40,'2026-04-28 03:51:42.756','2026-04-28 03:51:42.756',NULL),('3c185166-f88c-42d7-8e36-b25fa7d782a8','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','cdb83ca7-7863-4401-9a74-b1b14dea270a',NULL,'A',40,'2026-04-28 03:51:41.255','2026-04-28 03:51:41.255',NULL),('46f76a3a-79a8-42a0-81a6-fb4a3d31a7e6','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','096bc41d-d496-405a-89b3-8a2206b97ae5',NULL,'A',40,'2026-04-28 03:51:40.865','2026-04-28 03:51:40.865',NULL),('47744199-e3c1-4d21-9acf-00bed091f05d','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','a8327097-733d-4933-9f1c-49535b4415bd','a635fe95-319c-49fc-90c0-cb55547e5636','B',40,'2026-04-28 06:43:02.500','2026-04-28 06:43:02.500',NULL),('485b4c5c-4aa4-4568-9cdf-573d925c8bff','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','096bc41d-d496-405a-89b3-8a2206b97ae5',NULL,'B',40,'2026-04-28 03:51:40.985','2026-04-28 03:51:40.985',NULL),('4abeb14d-e769-4e41-96f9-836f420af920','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','f0de89be-cf63-4c74-b47d-2dda2bf2b004',NULL,'B',40,'2026-04-28 03:51:38.942','2026-04-28 03:51:38.942',NULL),('532f58b1-4cdc-4383-a315-7b2387b5be20','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','cdb83ca7-7863-4401-9a74-b1b14dea270a',NULL,'B',40,'2026-04-28 03:51:41.375','2026-04-28 03:51:41.375',NULL),('68e37d9a-ac9b-49b5-80d3-9e0c003e2ba9','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','0a27e8ea-748b-432f-add5-cf4a143fa561',NULL,'B',40,'2026-04-28 03:51:39.713','2026-04-28 03:51:39.713',NULL),('8359dfb1-d272-4324-9264-dd2768a50f57','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','debe358a-8282-4426-8889-d454cfb9acf8',NULL,'B',40,'2026-04-28 03:51:38.502','2026-04-28 03:51:38.502',NULL),('8ab2ba88-1641-4e09-beab-f886d82e7806','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','aa2d67ba-2188-47e9-bc26-36c1c684d9f4',NULL,'A',40,'2026-04-28 03:51:41.643','2026-04-28 03:51:41.643',NULL),('8f02ad19-001f-458f-a7d7-33b681b0648a','4a890573-70e1-4d49-b116-d1d17c53ccff','c0732854-220f-4a66-9d37-132ba98bb0a4',NULL,'A',0,'2026-05-28 07:07:26.417','2026-05-28 07:07:26.417',NULL),('99dcfb9e-ea63-4064-abbb-d7f9cb3a1587','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','b236ba4c-c0d8-47a7-b17d-ee4172124bc3',NULL,'A',40,'2026-04-28 03:51:39.976','2026-04-28 03:51:39.976',NULL),('a237c28c-c77b-4804-9cdd-fcfcef93babc','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','190e8cc7-0a60-4973-8b4a-98e6fe645cbb',NULL,'B',40,'2026-04-28 03:51:40.561','2026-04-28 03:51:40.561',NULL),('a3263e33-9f4a-473a-b6bf-00f6abb8daa4','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','a8327097-733d-4933-9f1c-49535b4415bd',NULL,'A',40,'2026-04-28 03:51:42.143','2026-04-28 03:51:42.143',NULL),('ae3b9974-5251-42ff-bb4b-cc5b0e079ede','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','1acf970b-2d49-4586-b848-556e00c761ae',NULL,'A',40,'2026-04-28 03:51:42.583','2026-04-28 03:51:42.583',NULL),('aeced88d-9dd5-4e81-b4f2-ebdf7b947128','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','da54d939-df4f-4e32-a36b-7d69eb206230',NULL,'A',40,'2026-04-28 03:51:39.145','2026-04-28 03:51:39.145',NULL),('b929b5c5-44e1-437f-ada9-736e105bf647','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','aa2d67ba-2188-47e9-bc26-36c1c684d9f4',NULL,'B',40,'2026-04-28 03:51:41.832','2026-04-28 03:51:41.832',NULL),('c35aa8d0-cacd-4e01-b67a-1048f3a03f8e','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','190e8cc7-0a60-4973-8b4a-98e6fe645cbb',NULL,'A',40,'2026-04-28 03:51:40.445','2026-04-28 03:51:40.445',NULL),('d0be2cc5-72de-45b2-9b9e-6e16aa31459a','4a890573-70e1-4d49-b116-d1d17c53ccff','f4ea6051-4eae-41df-bb8a-08974262bbdf',NULL,'A',0,'2026-05-30 17:04:28.859','2026-05-30 17:04:28.859',NULL),('d657c104-6733-43b8-a56a-d04b290ddb15','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','debe358a-8282-4426-8889-d454cfb9acf8',NULL,'A',40,'2026-04-28 03:51:38.313','2026-04-28 03:51:38.313',NULL),('d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','a8327097-733d-4933-9f1c-49535b4415bd','a635fe95-319c-49fc-90c0-cb55547e5636','A',40,'2026-04-28 06:43:02.500','2026-04-28 06:43:02.500',NULL),('da3b6006-d1c3-4c7a-8ad9-e1939d110875','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','480103b5-08d0-4702-befa-9027c3463688',NULL,'A',40,'2026-04-28 03:51:37.921','2026-04-28 03:51:37.921',NULL),('e6653768-8204-4e1c-a684-0cabec17223e','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','b236ba4c-c0d8-47a7-b17d-ee4172124bc3',NULL,'B',40,'2026-04-28 03:51:40.117','2026-04-28 03:51:40.117',NULL),('f9097bac-2685-4bac-a83f-c4d6537d32f2','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','f0de89be-cf63-4c74-b47d-2dda2bf2b004',NULL,'A',40,'2026-04-28 03:51:38.817','2026-04-28 03:51:38.817',NULL);
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_token_key` (`token`),
  KEY `sessions_userId_fkey` (`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0L0IHs3rUW91g71ZC0BGRXuwWWMJox1j','2026-05-07 04:10:32.993','UmC4rtUFOWn0dhRGtjTzqNOoaGKk58VP','2026-04-30 04:10:32.993','2026-04-30 04:10:32.993','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('1hzEpOZ6KmmHbZPi9zuOPcez8sbRm16N','2026-06-06 19:15:25.480','nBcLbbEPE0lzkeSmgx2FIwsT4zYEGMHm','2026-05-30 19:15:25.480','2026-05-30 19:15:25.480','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('39Cn4PVw9bkomHF8eTw5BGbTb8xWV6yA','2026-05-06 22:31:59.446','NbIjpflvjMV30Uazm1IMH90PDz2sQp3X','2026-04-29 22:31:59.446','2026-04-29 22:31:59.446','2a09:bac5:3aed:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('9fTdMDKcOa74gLvCFJePqlWBp5hIM4Vj','2026-05-07 05:02:01.239','mml8o3F9THOZMfu7KsqKYwOjpLCK1K7L','2026-04-30 05:02:01.239','2026-04-30 05:02:01.239','2a09:bac5:3aef:0a82:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('eUA79GlbsYN9c6sFb96mp0h8BylOAMtG','2026-05-07 05:01:59.459','UehbEcHSE8VzgMXvBCT00L97aTGU5AIK','2026-04-30 05:01:59.459','2026-04-30 05:01:59.459','2a09:bac5:3aef:0a82:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('GfJwIvbB8E0T8TDzuFJU8LnCXI0RNn4F','2026-05-07 04:10:38.772','zAqWNW1iwuLDDtVXglnim6gKgonDPVSg','2026-04-30 04:10:38.772','2026-04-30 04:10:38.772','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('lM5PBHCAjYfNS1xw7FCHlXTztVtIHaM1','2026-05-05 03:13:59.319','6kmQ19Akm3LmRpo2PszNMzrkyl94oEJw','2026-04-28 03:13:59.319','2026-04-28 03:13:59.319','2a09:bac5:3aee:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('PwsP05rlIVai8xW7b2Fu5rjG6rTbODj7','2026-05-05 03:09:23.016','4MaIvhev4PmJwoGI7ajbU03eZRju8nRu','2026-04-28 03:09:23.026','2026-04-28 03:09:23.026','146.196.32.2','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('qQF6Sk7ewGDXov9DZvYqaOqN9fyiqqey','2026-05-06 22:28:19.680','zacvzfPQBkylhYuJfZa2fZQrpLArAU7w','2026-04-29 22:28:19.682','2026-04-29 22:28:19.682','146.196.34.203','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('test-session-id-1777269255692','2026-04-28 05:54:15.692','test-session-token-1777269255692','2026-04-27 05:54:15.692','2026-04-27 05:54:15.692','127.0.0.1','test-agent','test-preview-user'),('TQa7VKFc5JWi1gdImfvjsGrOTn03y0Sh','2026-05-07 04:10:25.016','dWuEQEHbEpo6o9fGXO9BMmBJpyPDW7dt','2026-04-30 04:10:25.035','2026-04-30 04:10:25.035','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('V0F3EhLp5LbwIGxktvZtOGtrnNHtmkOX','2026-05-07 04:10:44.976','x2v3FMprGEBZbWqFlruFd14ZzNlm7nYU','2026-04-30 04:10:44.976','2026-04-30 04:10:44.976','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('Vywh66hgn7iJ7Xnc2cJvIOrc8nfZONcT','2026-05-07 04:10:47.041','f3sjV2vB98IycUXkXvy8dvZFDBXPckz6','2026-04-30 04:10:47.041','2026-04-30 04:10:47.041','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf'),('YcOuWpdUSjywwNawVH3Z8vMP2thkMx3H','2026-05-07 04:10:26.416','sizQ9V6iuctrSxPPpFhn2BX7qnjJbvkO','2026-04-30 04:10:26.416','2026-04-30 04:10:26.416','2a09:bac5:3ae9:1a96:0000:0000:0000:0000','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','1d5d687b-8d05-4af5-b92d-347f85c46bcf');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_comments`
--

DROP TABLE IF EXISTS `social_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `social_comments_post_id_idx` (`post_id`),
  KEY `social_comments_author_user_id_idx` (`author_user_id`),
  CONSTRAINT `social_comments_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_comments`
--

LOCK TABLES `social_comments` WRITE;
/*!40000 ALTER TABLE `social_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_posts`
--

DROP TABLE IF EXISTS `social_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_posts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` enum('class_only','institution_only','my_saathi','public_vidyaverse') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'institution_only',
  `class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linked_article_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `social_posts_institution_id_idx` (`institution_id`),
  KEY `social_posts_author_user_id_idx` (`author_user_id`),
  KEY `social_posts_scope_idx` (`scope`),
  KEY `social_posts_class_id_idx` (`class_id`),
  KEY `social_posts_created_at_idx` (`created_at`),
  KEY `social_posts_author_student_id_fkey` (`author_student_id`),
  KEY `social_posts_section_id_fkey` (`section_id`),
  KEY `social_posts_linked_article_id_fkey` (`linked_article_id`),
  CONSTRAINT `social_posts_author_student_id_fkey` FOREIGN KEY (`author_student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `social_posts_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_posts_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `social_posts_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_posts_linked_article_id_fkey` FOREIGN KEY (`linked_article_id`) REFERENCES `visionarium_articles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `social_posts_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_posts`
--

LOCK TABLES `social_posts` WRITE;
/*!40000 ALTER TABLE `social_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_reactions`
--

DROP TABLE IF EXISTS `social_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_reactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reaction_type` enum('prerna') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'prerna',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_reactions_post_id_user_id_key` (`post_id`,`user_id`),
  KEY `social_reactions_post_id_idx` (`post_id`),
  KEY `social_reactions_user_id_idx` (`user_id`),
  CONSTRAINT `social_reactions_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_reactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_reactions`
--

LOCK TABLES `social_reactions` WRITE;
/*!40000 ALTER TABLE `social_reactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_relationships`
--

DROP TABLE IF EXISTS `social_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_relationships` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship_type` enum('guardian_of','ward_of','sibling','teacher_of','student_of','batchmate','schoolmate') COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `since_academic_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_relationships_from_user_id_to_user_id_relationship_ty_key` (`from_user_id`,`to_user_id`,`relationship_type`),
  KEY `social_relationships_from_user_id_idx` (`from_user_id`),
  KEY `social_relationships_to_user_id_idx` (`to_user_id`),
  KEY `social_relationships_institution_id_idx` (`institution_id`),
  CONSTRAINT `social_relationships_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_relationships_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_relationships_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_relationships`
--

LOCK TABLES `social_relationships` WRITE;
/*!40000 ALTER TABLE `social_relationships` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_saathi_links`
--

DROP TABLE IF EXISTS `social_saathi_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_saathi_links` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requester_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','accepted','rejected','blocked','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `context` enum('student','teacher','parent','alumni','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `message` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_saathi_links_requester_user_id_target_user_id_key` (`requester_user_id`,`target_user_id`),
  KEY `social_saathi_links_requester_user_id_idx` (`requester_user_id`),
  KEY `social_saathi_links_target_user_id_idx` (`target_user_id`),
  KEY `social_saathi_links_status_idx` (`status`),
  CONSTRAINT `social_saathi_links_requester_user_id_fkey` FOREIGN KEY (`requester_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_saathi_links_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_saathi_links`
--

LOCK TABLES `social_saathi_links` WRITE;
/*!40000 ALTER TABLE `social_saathi_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_saathi_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_attendances`
--

DROP TABLE IF EXISTS `staff_attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_attendances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `staff_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','half_day','leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `check_in` datetime(3) DEFAULT NULL,
  `check_out` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_attendances_staff_id_attendance_date_key` (`staff_id`,`attendance_date`),
  KEY `staff_attendances_institution_id_idx` (`institution_id`),
  CONSTRAINT `staff_attendances_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_attendances`
--

LOCK TABLES `staff_attendances` WRITE;
/*!40000 ALTER TABLE `staff_attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_members`
--

DROP TABLE IF EXISTS `staff_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_members` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_type` enum('full_time','part_time','contract','visiting') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'full_time',
  `date_of_joining` date DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','on_leave','resigned','terminated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_members_institution_id_employee_code_key` (`institution_id`,`employee_code`),
  KEY `staff_members_institution_id_idx` (`institution_id`),
  KEY `staff_members_status_idx` (`status`),
  CONSTRAINT `staff_members_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_members`
--

LOCK TABLES `staff_members` WRITE;
/*!40000 ALTER TABLE `staff_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('stock_in','stock_out','adjustment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `balance_after` int NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `performed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `stock_transactions_institution_id_idx` (`institution_id`),
  KEY `stock_transactions_item_id_idx` (`item_id`),
  KEY `stock_transactions_type_idx` (`type`),
  CONSTRAINT `stock_transactions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_transactions_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streams`
--

DROP TABLE IF EXISTS `streams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streams` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `streams_class_id_name_key` (`class_id`,`name`),
  KEY `streams_institution_id_fkey` (`institution_id`),
  CONSTRAINT `streams_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `streams_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streams`
--

LOCK TABLES `streams` WRITE;
/*!40000 ALTER TABLE `streams` DISABLE KEYS */;
INSERT INTO `streams` VALUES ('a635fe95-319c-49fc-90c0-cb55547e5636','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','a8327097-733d-4933-9f1c-49535b4415bd','biology',NULL,0,'2026-04-28 06:42:43.809','2026-04-28 06:42:43.809');
/*!40000 ALTER TABLE `streams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_form_progress`
--

DROP TABLE IF EXISTS `student_form_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_form_progress` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tab_academic` tinyint(1) NOT NULL DEFAULT '0',
  `tab_personal` tinyint(1) NOT NULL DEFAULT '0',
  `tab_photo` tinyint(1) NOT NULL DEFAULT '0',
  `tab_family` tinyint(1) NOT NULL DEFAULT '0',
  `tab_contact` tinyint(1) NOT NULL DEFAULT '0',
  `tab_other` tinyint(1) NOT NULL DEFAULT '0',
  `active_tab` enum('academic','personal','photo','family','contact','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'academic',
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_form_progress_student_id_key` (`student_id`),
  KEY `student_form_progress_institution_id_fkey` (`institution_id`),
  CONSTRAINT `student_form_progress_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_form_progress_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_form_progress`
--

LOCK TABLES `student_form_progress` WRITE;
/*!40000 ALTER TABLE `student_form_progress` DISABLE KEYS */;
INSERT INTO `student_form_progress` VALUES ('53905d34-988a-49a5-98a7-cf8c6c5a6364','e33cccdf-eca2-4f4c-89bb-0a0bcf9de3bf','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5',0,1,1,1,1,1,'other','2026-04-29 22:30:26.177','2026-04-29 22:29:25.771','2026-04-29 22:30:26.189');
/*!40000 ALTER TABLE `student_form_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_onboarding_tokens`
--

DROP TABLE IF EXISTS `student_onboarding_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_onboarding_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` enum('volunteer','selfservice') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'selfservice',
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `used_by_ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_onboarding_tokens_student_id_key` (`student_id`),
  UNIQUE KEY `student_onboarding_tokens_token_key` (`token`),
  KEY `student_onboarding_tokens_token_idx` (`token`),
  KEY `student_onboarding_tokens_student_id_idx` (`student_id`),
  KEY `student_onboarding_tokens_institution_id_fkey` (`institution_id`),
  CONSTRAINT `student_onboarding_tokens_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_onboarding_tokens_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_onboarding_tokens`
--

LOCK TABLES `student_onboarding_tokens` WRITE;
/*!40000 ALTER TABLE `student_onboarding_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_onboarding_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_transport`
--

DROP TABLE IF EXISTS `student_transport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_transport` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stop_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('pickup','drop','both') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'both',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_transport_institution_id_idx` (`institution_id`),
  KEY `student_transport_student_id_idx` (`student_id`),
  KEY `student_transport_route_id_idx` (`route_id`),
  CONSTRAINT `student_transport_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_transport`
--

LOCK TABLES `student_transport` WRITE;
/*!40000 ALTER TABLE `student_transport` DISABLE KEYS */;
INSERT INTO `student_transport` VALUES ('ba6204b4-bf11-46c1-a46b-3409172ce210','4a890573-70e1-4d49-b116-d1d17c53ccff','feae884d-0c21-4a17-b991-d4a003006e22','781963cb-d374-46e9-a527-c66cf1425813',NULL,'both',1,'2026-05-29 13:58:55.275','2026-05-29 13:58:55.275');
/*!40000 ALTER TABLE `student_transport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slot_id` char(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admission_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2025-2026',
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_relation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sex` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `blood_group` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aadhar_number` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caste` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `religion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_admission` date DEFAULT NULL,
  `previous_school` text COLLATE utf8mb4_unicode_ci,
  `transport_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medical_notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','active','graduated','transferred','withdrawn','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `data_status` enum('pending','filled','enhanced','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'filled',
  `consent_given` tinyint(1) NOT NULL DEFAULT '0',
  `consent_timestamp` datetime(3) DEFAULT NULL,
  `consent_given_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `custom_data` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `photo_metadata` json DEFAULT NULL,
  `photo_updated_at` datetime(3) DEFAULT NULL,
  `photo_version` int NOT NULL DEFAULT '0',
  `thumb_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_slot_id_key` (`slot_id`),
  UNIQUE KEY `students_admission_number_key` (`admission_number`),
  KEY `students_institution_id_idx` (`institution_id`),
  KEY `students_branch_id_idx` (`branch_id`),
  KEY `students_section_id_idx` (`section_id`),
  KEY `students_slot_id_idx` (`slot_id`),
  KEY `students_status_idx` (`status`),
  KEY `students_data_status_idx` (`data_status`),
  KEY `students_photo_hash_idx` (`photo_hash`),
  KEY `students_institution_id_status_idx` (`institution_id`,`status`),
  KEY `students_institution_id_data_status_idx` (`institution_id`,`data_status`),
  FULLTEXT KEY `students_name_father_name_mother_name_admission_number_idx` (`name`,`father_name`,`mother_name`,`admission_number`),
  CONSTRAINT `students_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `students_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `students_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `admission_slots` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('04f1195f-67c4-4af0-830b-fdbe0d39421c','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3iy00uvhlfczl8w5nql','VG0-2620-0015','Amit Mishra','2026-2027','Dinesh Mishra','Asha Mishra','Dinesh Mishra',NULL,'8545678901','male','2012-09-23','B+','678901234568','Brahmin','Hindu','8545678901',NULL,'44 Hazratganj','Lucknow','Uttar Pradesh','226001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.970','2026-04-28 06:44:04.970',NULL,NULL,0,NULL),('06e7344d-b6f9-45f4-868a-c678737f0a23','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3bq00u4hlfcm8yy2qax','VG0-2620-0006','Ananya Reddy','2026-2027','Ramesh Reddy','Padmavathi Reddy','Ramesh Reddy',NULL,'9456789012','female','2011-06-12','O+','789012345678','OBC','Hindu','9456789012',NULL,'67 Jubilee Hills','Hyderabad','Telangana','500033','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.709','2026-04-28 06:44:04.709',NULL,NULL,0,NULL),('09c80581-a157-4875-a7d6-37505301a4b8','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g46500wmhlfc14pqw85k','VG0-2620-0036','Simran Arora','2026-2027','Tejinder Arora','Manjit Arora','Tejinder Arora',NULL,'6456789012','female','2011-12-13','B+','789012345671','Khatri','Sikh','6456789012',NULL,'31 Sector 8','Chandigarh','Punjab','160008','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.794','2026-04-28 06:44:05.794',NULL,NULL,0,NULL),('0f27cab2-fa42-45a1-abd2-942ae530ea6c','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3ds00uahlfc05l9n6o8','VG0-2620-0008','Pooja Gupta','2026-2027','Manoj Gupta','Seema Gupta','Manoj Gupta',NULL,'9278901234','female','2011-12-03','B+','901234567890','Baniya','Hindu','9278901234',NULL,'22 Vastrapur','Ahmedabad','Gujarat','380015','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.772','2026-04-28 06:44:04.772',NULL,NULL,0,NULL),('1e24aa95-d7da-4216-9c22-cad82d073805','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3tc00vshlfcbfzm2l9k','VG0-2620-0026','Ishika Saxena','2026-2027','Vivek Saxena','Renu Saxena','Vivek Saxena',NULL,'7456789012','female','2011-06-15','B+','789012345670','Kayastha','Hindu','7456789012',NULL,'29 Sector 21','Noida','Uttar Pradesh','201301','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.333','2026-04-28 06:44:05.333',NULL,NULL,0,NULL),('2c5b6429-c866-450a-8571-98edc9a0ebd6','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g4aj00wyhlfcp8h99tnp','VG0-2620-0040','Diya Bhattacharya','2026-2027','Souvik Bhattacharya','Sutapa Bhattacharya','Souvik Bhattacharya',NULL,'6090123456','female','2011-11-07','B+','123456789014','Brahmin','Hindu','6090123456',NULL,'26 Jadavpur','Kolkata','West Bengal','700032','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.955','2026-04-28 06:44:05.955',NULL,NULL,0,NULL),('2d15bd48-20c6-4dcb-bf80-ed72b6c1e217','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g47600wphlfc8e2h2ws7','VG0-2620-0037','Aditya Kumar','2026-2027','Sanjiv Kumar','Usha Kumar','Sanjiv Kumar',NULL,'6367890123','male','2012-06-25','O+','890123456782','OBC','Hindu','6367890123',NULL,'92 Boring Canal Road','Patna','Bihar','800001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.840','2026-04-28 06:44:05.840',NULL,NULL,0,NULL),('31fafa25-3e77-48f8-ad36-2307de39622a','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3rb00vmhlfcj8lki8jv','VG0-2620-0024','Tanvi Patil','2026-2027','Santosh Patil','Sushma Patil','Santosh Patil',NULL,'7634567890','female','2011-08-04','AB+','567890123458','Maratha','Hindu','7634567890',NULL,'16 Kothrud','Pune','Maharashtra','411038','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.268','2026-04-28 06:44:05.268',NULL,NULL,0,NULL),('3d25b05c-3b53-44c1-ab1a-28b04757063f','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3po00vghlfcal4y1ka8','VG0-2620-0022','Riya Shah','2026-2027','Chirag Shah','Minal Shah','Chirag Shah',NULL,'7812345678','female','2011-01-19','B-','345678901236','Jain','Jain','7812345678',NULL,'64 Paldi','Ahmedabad','Gujarat','380007','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.201','2026-04-28 06:44:05.201',NULL,NULL,0,NULL),('3df3a3f9-7ad7-4a3e-a78f-9903bf344910','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3u100vvhlfcnk06ffaw','VG0-2620-0027','Pranav Kulkarni','2026-2027','Girish Kulkarni','Aparna Kulkarni','Girish Kulkarni',NULL,'7367890123','male','2012-09-08','O+','890123456781','Brahmin','Hindu','7367890123',NULL,'53 Sadashiv Peth','Pune','Maharashtra','411030','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.358','2026-04-28 06:44:05.358',NULL,NULL,0,NULL),('3f7a4da9-c288-4797-a027-604cd6b1d597','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g37u00tvhlfcua85gbor','VG0-2620-0003','Rohan Mehta','2026-2027','Suresh Mehta','Rekha Mehta','Suresh Mehta',NULL,'9712345678','male','2012-11-05','O-','456789012345','General','Hindu','9712345678',NULL,'8 MG Road','Pune','Maharashtra','411001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.559','2026-04-28 06:44:04.559',NULL,NULL,0,NULL),('433319fa-6e7c-426a-993c-41bc9dd806b8','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3y800w7hlfcczx1vzu9','VG0-2620-0031','Ayush Bhatt','2026-2027','Sudhir Bhatt','Champa Bhatt','Sudhir Bhatt',NULL,'6901234567','male','2012-04-03','O-','234567890126','Brahmin','Hindu','6901234567',NULL,'24 Rajpur Road','Dehradun','Uttarakhand','248001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.513','2026-04-28 06:44:05.513',NULL,NULL,0,NULL),('4367fdf6-46c0-42ce-a5d4-334cb276b863','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3k700uyhlfcasudzs77','VG0-2620-0016','Nisha Choudhary','2026-2027','Ramdev Choudhary','Sarla Choudhary','Ramdev Choudhary',NULL,'8456789012','female','2011-03-05','A-','789012345679','OBC','Hindu','8456789012',NULL,'6 Bani Park','Jaipur','Rajasthan','302016','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.005','2026-04-28 06:44:05.005',NULL,NULL,0,NULL),('5ca06c19-99f1-4fca-bd53-56e788543a7a','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3o600vahlfcx0xv61i6','VG0-2620-0020','Kavya Menon','2026-2027','Sunil Menon','Anitha Menon','Sunil Menon',NULL,'8090123456','female','2011-05-24','O+','123456789012','Nair','Hindu','8090123456',NULL,'9 Kakkanad','Kochi','Kerala','682030','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.146','2026-04-28 06:44:05.146',NULL,NULL,0,NULL),('5ea6e651-160b-43e4-b601-fabaa7ddac0b','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3a800tyhlfcgjvnzfvs','VG0-2620-0004','Sneha Iyer','2026-2027','Venkatesh Iyer','Lakshmi Iyer','Lakshmi Iyer',NULL,'9634567890','female','2011-09-18','AB+','567890123456','General','Hindu','9634567890',NULL,'23 Anna Salai','Chennai','Tamil Nadu','600002','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.644','2026-04-28 06:44:04.644',NULL,NULL,0,NULL),('6a781861-508b-425a-893e-0784e640a95f','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3gl00umhlfc8pxh4xbo','VG0-2620-0012','Meera Kulkarni','2026-2027','Dilip Kulkarni','Vaishali Kulkarni','Dilip Kulkarni',NULL,'8812345678','female','2011-10-27','B-','345678901235','Maratha','Hindu','8812345678',NULL,'33 Deccan Gymkhana','Pune','Maharashtra','411004','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.873','2026-04-28 06:44:04.873',NULL,NULL,0,NULL),('72767318-eb1b-4cba-b426-cab90eed9295','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3hg00uphlfc7msc6wzj','VG0-2620-0013','Siddharth Patel','2026-2027','Bhavesh Patel','Heena Patel','Bhavesh Patel',NULL,'8723456789','male','2012-06-09','O-','456789012346','Patel','Hindu','8723456789',NULL,'78 Navrangpura','Ahmedabad','Gujarat','380009','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.905','2026-04-28 06:44:04.905',NULL,NULL,0,NULL),('794e9f51-f638-4577-bce5-14ecc425a1d0','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3nh00v7hlfc129ew60g','VG0-2620-0019','Dev Chatterjee','2026-2027','Partha Chatterjee','Rima Chatterjee','Partha Chatterjee',NULL,'8189012345','male','2012-07-11','AB-','012345678902','Kayastha','Hindu','8189012345',NULL,'55 Ballygunge','Kolkata','West Bengal','700019','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.123','2026-04-28 06:44:05.123',NULL,NULL,0,NULL),('7f192bb5-8faa-4ed1-aa61-7b15c9dd0606','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3ef00udhlfcr5naq6w1','VG0-2620-0009','Vikram Joshi','2026-2027','Prakash Joshi','Meena Joshi','Prakash Joshi',NULL,'9189012345','male','2012-05-19','AB-','012345678901','Brahmin','Hindu','9189012345',NULL,'56 Tilak Nagar','Jaipur','Rajasthan','302004','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.795','2026-04-28 06:44:04.795',NULL,NULL,0,NULL),('8076fe34-4477-4bef-b86f-fd109e78542a','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g41n00wdhlfc01kseie0','VG0-2620-0033','Varun Krishnamurthy','2026-2027','Ravi Krishnamurthy','Lalitha Krishnamurthy','Ravi Krishnamurthy',NULL,'6723456789','male','2012-08-29','AB+','456789012348','Brahmin','Hindu','6723456789',NULL,'36 Jayanagar','Bengaluru','Karnataka','560041','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.638','2026-04-28 06:44:05.638',NULL,NULL,0,NULL),('8b1723c3-6301-4a7b-9c5f-e075cc889aea','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3s800vphlfc1j4q4jg5','VG0-2620-0025','Nikhil Bose','2026-2027','Abhijit Bose','Tanushree Bose','Abhijit Bose',NULL,'7545678901','male','2012-03-22','A-','678901234569','SC','Hindu','7545678901',NULL,'41 Tollygunge','Kolkata','West Bengal','700033','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.304','2026-04-28 06:44:05.304',NULL,NULL,0,NULL),('903d379b-220b-4eea-8293-afd3896a0c57','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3az00u1hlfc8aogefmd','VG0-2620-0005','Karan Singh','2026-2027','Harpreet Singh','Gurpreet Kaur','Harpreet Singh',NULL,'9545678901','male','2012-01-30','B-','678901234567','General','Sikh','9545678901',NULL,'15 Sector 17','Chandigarh','Punjab','160017','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.672','2026-04-28 06:44:04.672',NULL,NULL,0,NULL),('96e87e9b-32eb-45f0-aae4-d22f4c18a8b7','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3i500ushlfc8dnoah0z','VG0-2620-0014','Lakshmi Rao','2026-2027','Nagaraj Rao','Savitha Rao','Nagaraj Rao',NULL,'8634567890','female','2011-08-16','AB+','567890123457','OBC','Hindu','8634567890',NULL,'19 Malleswaram','Bengaluru','Karnataka','560003','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.929','2026-04-28 06:44:04.929',NULL,NULL,0,NULL),('975a26a2-d756-44a3-b219-e241561776da','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3ld00v1hlfcasl599ci','VG0-2620-0017','Yash Kapoor','2026-2027','Rohit Kapoor','Simran Kapoor','Rohit Kapoor',NULL,'8367890123','male','2012-04-17','O+','890123456780','Khatri','Hindu','8367890123',NULL,'27 Model Town','New Delhi','Delhi','110009','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.047','2026-04-28 06:44:05.047',NULL,NULL,0,NULL),('9bcc2a9f-7ba1-4c73-96f5-477b965f3423','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3wm00w1hlfcc4712mbi','VG0-2620-0029','Kunal Sinha','2026-2027','Rajiv Sinha','Anupama Sinha','Rajiv Sinha',NULL,'7189012345','male','2012-11-14','B+','012345678903','Kayastha','Hindu','7189012345',NULL,'85 Boring Road','Patna','Bihar','800001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.453','2026-04-28 06:44:05.453',NULL,NULL,0,NULL),('a06c22b0-16e8-490a-89c1-86e710f96162','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3xe00w4hlfckoy88s4d','VG0-2620-0030','Shruti Agarwal','2026-2027','Pankaj Agarwal','Anju Agarwal','Pankaj Agarwal',NULL,'7090123456','female','2011-09-01','A+','123456789013','Baniya','Hindu','7090123456',NULL,'17 Civil Lines','Agra','Uttar Pradesh','282002','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.480','2026-04-28 06:44:05.480',NULL,NULL,0,NULL),('a96269a7-f6a2-4298-aa6f-dc593d45368a','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g49700wvhlfczr5otlmk','VG0-2620-0039','Mohit Yadav','2026-2027','Ramprasad Yadav','Savita Yadav','Ramprasad Yadav',NULL,'6189012345','male','2012-10-16','A+','012345678904','OBC','Hindu','6189012345',NULL,'70 Gomti Nagar','Lucknow','Uttar Pradesh','226010','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.919','2026-04-28 06:44:05.919',NULL,NULL,0,NULL),('ac31497d-cd48-4b61-9c03-bb5003ec07a0','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3ow00vdhlfcy8ebtb8v','VG0-2620-0021','Harsh Pandey','2026-2027','Vijay Pandey','Kamla Pandey','Vijay Pandey',NULL,'7901234567','male','2012-10-06','A+','234567890125','Brahmin','Hindu','7901234567',NULL,'38 Lanka','Varanasi','Uttar Pradesh','221005','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.173','2026-04-28 06:44:05.173',NULL,NULL,0,NULL),('ad377d3c-8bb7-48da-8fb7-cb7230670644','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3fy00ujhlfcgzxqrh2m','VG0-2620-0011','Rahul Das','2026-2027','Subrata Das','Mithali Das','Subrata Das',NULL,'8901234567','male','2012-02-14','A+','234567890124','SC','Hindu','8901234567',NULL,'89 Salt Lake','Kolkata','West Bengal','700091','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.851','2026-04-28 06:44:04.851',NULL,NULL,0,NULL),('b232ad53-1b12-4c99-a75a-609ceb981283','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3qh00vjhlfcm7hxr92s','VG0-2620-0023','Saurabh Dubey','2026-2027','Ashok Dubey','Pushpa Dubey','Ashok Dubey',NULL,'7723456789','male','2012-12-28','O-','456789012347','Brahmin','Hindu','7723456789',NULL,'72 Napier Town','Jabalpur','Madhya Pradesh','482001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.230','2026-04-28 06:44:05.230',NULL,NULL,0,NULL),('b7646e91-f9bf-45ed-be59-48d33ebd089f','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g44d00wghlfcbh2cm0ud','VG0-2620-0034','Pallavi Desai','2026-2027','Hemant Desai','Sunanda Desai','Hemant Desai',NULL,'6634567890','female','2011-05-10','O+','567890123459','Brahmin','Hindu','6634567890',NULL,'48 Navpada','Surat','Gujarat','395009','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.731','2026-04-28 06:44:05.731',NULL,NULL,0,NULL),('b96f28aa-c569-4874-bb08-e2c344cbf379','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3f900ughlfcojfraz4y','VG0-2620-0010','Divya Pillai','2026-2027','Krishnan Pillai','Usha Pillai','Krishnan Pillai',NULL,'9090123456','female','2011-04-08','O+','123456789011','General','Hindu','9090123456',NULL,'11 Pattom','Thiruvananthapuram','Kerala','695004','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.825','2026-04-28 06:44:04.825',NULL,NULL,0,NULL),('b982acbf-f05b-47e7-b4fa-4d004dfd97b4','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3v400vyhlfc2sqkaxup','VG0-2620-0028','Aditi Malhotra','2026-2027','Deepak Malhotra','Neha Malhotra','Deepak Malhotra',NULL,'7278901234','female','2011-02-26','AB-','901234567892','Khatri','Hindu','7278901234',NULL,'7 Defence Colony','New Delhi','Delhi','110024','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.397','2026-04-28 06:44:05.397',NULL,NULL,0,NULL),('c02f6aec-95c8-4f0c-821b-e940b5eeb7b2','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g36o00tshlfcezmuoioh','VG0-2620-0002','Priya Verma','2026-2027','Anil Verma','Kavita Verma','Anil Verma',NULL,'9823456781','female','2011-07-22','A+','345678901234','OBC','Hindu','9823456781',NULL,'45 Shastri Nagar','Lucknow','Uttar Pradesh','226005','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.518','2026-04-28 06:44:04.518',NULL,NULL,0,NULL),('c14bc340-07aa-4385-9e62-227f677ae6c3','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3d200u7hlfcsqcg5cj7','VG0-2620-0007','Arjun Nair','2026-2027','Santhosh Nair','Deepa Nair','Santhosh Nair',NULL,'9367890123','male','2012-08-25','A-','890123456789','General','Hindu','9367890123',NULL,'34 Koramangala','Bengaluru','Karnataka','560034','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.747','2026-04-28 06:44:04.747',NULL,NULL,0,NULL),('ca3ed081-528a-405e-a21d-5af0fc1ec4d0','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g48c00wshlfco2dj5nvz','VG0-2620-0038','Keerthi Nambiar','2026-2027','Pradeep Nambiar','Smitha Nambiar','Pradeep Nambiar',NULL,'6278901234','female','2011-03-28','AB-','901234567893','Nambiar','Hindu','6278901234',NULL,'14 Calicut Road','Kozhikode','Kerala','673001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.873','2026-04-28 06:44:05.873',NULL,NULL,0,NULL),('d6ff1d7e-c2a9-42dc-99dd-02aa248fbc8f','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3zb00wahlfcnbpizkxa','VG0-2620-0032','Ritika Sharma','2026-2027','Naresh Sharma','Geeta Sharma','Naresh Sharma',NULL,'6812345678','female','2011-07-17','B-','345678901237','Brahmin','Hindu','6812345678',NULL,'60 Vaishali Nagar','Jaipur','Rajasthan','302021','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.548','2026-04-28 06:44:05.548',NULL,NULL,0,NULL),('d828963c-008d-4e12-a3f9-fac5cbd71157','4a890573-70e1-4d49-b116-d1d17c53ccff','8f02ad19-001f-458f-a7d7-33b681b0648a',NULL,NULL,NULL,'Karan Singh','2025-2026',NULL,NULL,NULL,NULL,'919812300022',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-05-29 00:58:57.719','2026-05-29 00:58:57.719',NULL,NULL,0,NULL),('e33cccdf-eca2-4f4c-89bb-0a0bcf9de3bf','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g32800tphlfcfejk5nb3','VG0-2620-0001','Aarav Sharma','2026-2027','Rajesh Sharma','Sunita Sharma','Rajesh Sharma',NULL,'9876543210','male','2012-03-14','B+','234567890123','General','Hindu','9876543210',NULL,'12 Lajpat Nagar','New Delhi','Delhi','110024','2025-04-01',NULL,NULL,'https://storage.vgraphics.in/photos/0ea3b292-ba4d-4e2e-9103-a13e637dbfc5/e33cccdf-eca2-4f4c-89bb-0a0bcf9de3bf/photo_1.webp','2cee690cd9f13929a8e653a70b243dbde4dd9341fb864677c7a40874e97066c6',NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:04.360','2026-04-29 22:30:26.179','{\"tier\": 2, \"processedAt\": \"2026-04-29T22:29:46.116Z\", \"qualityScore\": 100, \"originalWidth\": 992, \"originalHeight\": 1067, \"processedWidth\": 413, \"processedHeight\": 531, \"appliedEnhancements\": [\"exif_rotate\", \"resize_413x531\", \"normalise\", \"modulate\", \"contrast\", \"sharpen\", \"webp_srgb_300dpi\"]}','2026-04-29 22:29:47.896',1,'https://storage.vgraphics.in/photos/0ea3b292-ba4d-4e2e-9103-a13e637dbfc5/e33cccdf-eca2-4f4c-89bb-0a0bcf9de3bf/thumb_1.webp'),('f64c2cd3-4be4-4a90-bc72-9db2991a55f9','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g3md00v4hlfc1un85jaq','VG0-2620-0018','Anjali Tiwari','2026-2027','Santosh Tiwari','Poonam Tiwari','Santosh Tiwari',NULL,'8278901234','female','2011-11-29','B+','901234567891','Brahmin','Hindu','8278901234',NULL,'13 Civil Lines','Allahabad','Uttar Pradesh','211001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.083','2026-04-28 06:44:05.083',NULL,NULL,0,NULL),('f6970b21-2aef-4338-beb3-79aa06e296d0','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','d8aa5144-5826-4bc7-9f09-1f3ca9ddbf73',NULL,'cmoi9g45900wjhlfc3cryv7us','VG0-2620-0035','Rishab Jain','2026-2027','Sanjay Jain','Nirmala Jain','Sanjay Jain',NULL,'6545678901','male','2012-01-21','A-','678901234560','Jain','Jain','6545678901',NULL,'5 Nehru Place','Indore','Madhya Pradesh','452001','2025-04-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-04-28 06:44:05.763','2026-04-28 06:44:05.763',NULL,NULL,0,NULL),('feae884d-0c21-4a17-b991-d4a003006e22','4a890573-70e1-4d49-b116-d1d17c53ccff','8f02ad19-001f-458f-a7d7-33b681b0648a',NULL,NULL,NULL,'Aarav Sharma','2025-2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','filled',0,NULL,NULL,'{}','2026-05-28 07:07:26.448','2026-05-28 07:07:26.448',NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_type` enum('theory','practical','combined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'theory',
  `is_mandatory` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `subjects_class_id_idx` (`class_id`),
  KEY `subjects_institution_id_fkey` (`institution_id`),
  CONSTRAINT `subjects_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subjects_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `substitutions`
--

DROP TABLE IF EXISTS `substitutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `substitutions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slot_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `original_teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `substitute_teacher_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('planned','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `substitutions_institution_id_idx` (`institution_id`),
  KEY `substitutions_date_idx` (`date`),
  KEY `substitutions_substitute_teacher_id_idx` (`substitute_teacher_id`),
  KEY `substitutions_slot_id_fkey` (`slot_id`),
  CONSTRAINT `substitutions_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `timetable_slots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `substitutions`
--

LOCK TABLES `substitutions` WRITE;
/*!40000 ALTER TABLE `substitutions` DISABLE KEYS */;
INSERT INTO `substitutions` VALUES ('95063e03-1e89-40eb-98e7-04216443705a','4a890573-70e1-4d49-b116-d1d17c53ccff','1c3799c0-8564-4502-a41d-f24efcc05748','2026-06-10','b7b48e2b-6fc2-4994-8692-c67d0815ac2a','96fabd99-2ee2-4b0d-8583-f48888fd7141','Teacher on leave','planned','2026-05-29 14:34:02.504','2026-05-29 14:34:02.504');
/*!40000 ALTER TABLE `substitutions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_config_config_key_key` (`config_key`),
  KEY `system_config_config_key_idx` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES ('1d08d48a-049d-4c64-ad00-c266bfc643db','ai_enabled','true','boolean','Enable AI photo enhancement',0,'2026-04-25 03:38:11.661','2026-04-25 03:38:11.661'),('42c341fe-c594-47be-b384-3c8e27333289','maintenance_mode','false','boolean','Enable maintenance mode',1,'2026-04-25 03:38:11.582','2026-04-25 03:38:11.582'),('4598a469-2fef-4002-b3d9-f1b17a41ae10','opencv_threshold','0.5','number','OpenCV confidence threshold',0,'2026-04-25 03:38:11.700','2026-04-25 03:38:11.700'),('86daf15f-8ff5-472e-8554-30d61324b1ca','max_upload_size_mb','10','number','Maximum photo upload size',1,'2026-04-25 03:38:11.674','2026-04-25 03:38:11.674'),('924c1707-5335-4d7e-a427-b804c1181680','default_trial_days','7','number','Default trial period',0,'2026-04-25 03:38:11.686','2026-04-25 03:38:11.686'),('e7d7fa87-bafa-442a-b461-18672ca78798','gemini_fallback_enabled','true','boolean','Enable Gemini API fallback',0,'2026-04-25 03:38:11.712','2026-04-25 03:38:11.712');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('visiting_card','id_card','certificate','group_photo','portfolio','hall_ticket','marksheet','library_card','transfer_certificate') COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_type` enum('html','svg','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'html',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `css_styles` text COLLATE utf8mb4_unicode_ci,
  `width_mm` decimal(7,2) NOT NULL DEFAULT '85.60',
  `height_mm` decimal(7,2) NOT NULL DEFAULT '54.00',
  `orientation` enum('portrait','landscape') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'landscape',
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `target_audience` enum('ALL','STUDENT','TEACHER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `templates_institution_id_idx` (`institution_id`),
  KEY `templates_service_type_idx` (`service_type`),
  KEY `templates_is_default_idx` (`is_default`),
  KEY `templates_target_audience_idx` (`target_audience`),
  KEY `templates_institution_id_service_type_idx` (`institution_id`,`service_type`),
  CONSTRAINT `templates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES ('75a57047-88c6-4de3-a44b-bf442e32dd3d','0ea3b292-ba4d-4e2e-9103-a13e637dbfc5','Styudent ID','id_card','json','{\"elements\":[],\"canvasConfig\":{\"widthMm\":85.6,\"heightMm\":53.98,\"scale\":1,\"bgColor\":\"#ffffff\"},\"printConfig\":{\"pageCount\":1,\"hasBackSide\":false,\"bleedMm\":0,\"dpi\":300,\"colorMode\":\"rgb\"}}',NULL,85.60,53.98,'landscape',NULL,'',0,1,'STUDENT','2026-04-30 04:47:16.633','2026-04-30 04:47:16.633');
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_periods`
--

DROP TABLE IF EXISTS `timetable_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_periods` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_time` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int NOT NULL DEFAULT '0',
  `is_break` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `timetable_periods_institution_id_name_key` (`institution_id`,`name`),
  KEY `timetable_periods_institution_id_idx` (`institution_id`),
  CONSTRAINT `timetable_periods_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_periods`
--

LOCK TABLES `timetable_periods` WRITE;
/*!40000 ALTER TABLE `timetable_periods` DISABLE KEYS */;
INSERT INTO `timetable_periods` VALUES ('52c5aca9-d125-463f-87a3-6185423114a7','4a890573-70e1-4d49-b116-d1d17c53ccff','Period 2','08:45','09:30',2,0,'2026-05-29 14:34:02.431'),('ef89ee97-eea9-4429-82ca-59ec3efd0b2b','4a890573-70e1-4d49-b116-d1d17c53ccff','Period 1','08:00','08:45',1,0,'2026-05-29 14:34:02.411');
/*!40000 ALTER TABLE `timetable_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_slots`
--

DROP TABLE IF EXISTS `timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_slots` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timetable_slots_section_id_day_of_week_period_id_key` (`section_id`,`day_of_week`,`period_id`),
  KEY `timetable_slots_institution_id_idx` (`institution_id`),
  KEY `timetable_slots_section_id_idx` (`section_id`),
  KEY `timetable_slots_teacher_id_idx` (`teacher_id`),
  KEY `timetable_slots_period_id_fkey` (`period_id`),
  CONSTRAINT `timetable_slots_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `timetable_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_slots`
--

LOCK TABLES `timetable_slots` WRITE;
/*!40000 ALTER TABLE `timetable_slots` DISABLE KEYS */;
INSERT INTO `timetable_slots` VALUES ('1c3799c0-8564-4502-a41d-f24efcc05748','4a890573-70e1-4d49-b116-d1d17c53ccff','8f02ad19-001f-458f-a7d7-33b681b0648a','monday','ef89ee97-eea9-4429-82ca-59ec3efd0b2b','Mathematics',NULL,'b7b48e2b-6fc2-4994-8692-c67d0815ac2a','R101','2026-05-29 14:34:02.454','2026-05-29 14:34:02.454');
/*!40000 ALTER TABLE `timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_certificates`
--

DROP TABLE IF EXISTS `transfer_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer_certificates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tc_serial_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admission_date` date NOT NULL,
  `leaving_date` date NOT NULL,
  `last_class_studied` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason_for_leaving` text COLLATE utf8mb4_unicode_ci,
  `conduct_remarks` enum('excellent','good','satisfactory','needs_improvement') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `character_remarks` text COLLATE utf8mb4_unicode_ci,
  `fee_clearance_status` enum('cleared','pending','dues_outstanding') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `outstanding_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_working_days` int DEFAULT NULL,
  `total_present_days` int DEFAULT NULL,
  `attendance_percentage` decimal(5,2) DEFAULT NULL,
  `principal_signature_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seal_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_at` datetime(3) DEFAULT NULL,
  `duplicate_issued` tinyint(1) NOT NULL DEFAULT '0',
  `original_tc_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_approval','issued','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transfer_certificates_tc_serial_number_key` (`tc_serial_number`),
  KEY `transfer_certificates_student_id_idx` (`student_id`),
  KEY `transfer_certificates_tc_serial_number_idx` (`tc_serial_number`),
  KEY `transfer_certificates_status_idx` (`status`),
  KEY `transfer_certificates_institution_id_fkey` (`institution_id`),
  KEY `transfer_certificates_template_id_fkey` (`template_id`),
  CONSTRAINT `transfer_certificates_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transfer_certificates_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transfer_certificates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_certificates`
--

LOCK TABLES `transfer_certificates` WRITE;
/*!40000 ALTER TABLE `transfer_certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfer_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_routes`
--

DROP TABLE IF EXISTS `transport_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_routes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `vehicle_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `fee_amount` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transport_routes_institution_id_code_key` (`institution_id`,`code`),
  KEY `transport_routes_institution_id_idx` (`institution_id`),
  CONSTRAINT `transport_routes_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_routes`
--

LOCK TABLES `transport_routes` WRITE;
/*!40000 ALTER TABLE `transport_routes` DISABLE KEYS */;
INSERT INTO `transport_routes` VALUES ('781963cb-d374-46e9-a527-c66cf1425813','4a890573-70e1-4d49-b116-d1d17c53ccff','Route 7 — Sector 21','RT-1780063135212',NULL,'HR26-1234','Ramesh','919800011122',NULL,1500.00,1,'2026-05-29 13:58:55.216','2026-05-29 13:58:55.216');
/*!40000 ALTER TABLE `transport_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_stops`
--

DROP TABLE IF EXISTS `transport_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_stops` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int NOT NULL DEFAULT '0',
  `pickup_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drop_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `transport_stops_institution_id_idx` (`institution_id`),
  KEY `transport_stops_route_id_idx` (`route_id`),
  CONSTRAINT `transport_stops_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_stops`
--

LOCK TABLES `transport_stops` WRITE;
/*!40000 ALTER TABLE `transport_stops` DISABLE KEYS */;
INSERT INTO `transport_stops` VALUES ('149ae63b-f3ec-49c2-b9be-04d8929c239e','4a890573-70e1-4d49-b116-d1d17c53ccff','781963cb-d374-46e9-a527-c66cf1425813','Sector 21 Gate',1,'07:30',NULL,28.4595,77.0266,'2026-05-29 13:58:55.234');
/*!40000 ALTER TABLE `transport_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_trips`
--

DROP TABLE IF EXISTS `transport_trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_trips` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trip_date` date NOT NULL,
  `direction` enum('pickup','drop','both') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pickup',
  `status` enum('scheduled','started','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `last_latitude` double DEFAULT NULL,
  `last_longitude` double DEFAULT NULL,
  `last_ping_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transport_trips_institution_id_idx` (`institution_id`),
  KEY `transport_trips_route_id_idx` (`route_id`),
  CONSTRAINT `transport_trips_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_trips`
--

LOCK TABLES `transport_trips` WRITE;
/*!40000 ALTER TABLE `transport_trips` DISABLE KEYS */;
INSERT INTO `transport_trips` VALUES ('2af91927-ff90-402a-9e94-6423bb40a4d1','4a890573-70e1-4d49-b116-d1d17c53ccff','781963cb-d374-46e9-a527-c66cf1425813','2026-05-29','pickup','completed','2026-05-29 13:58:55.295','2026-05-29 13:58:55.891',28.4601,77.0301,'2026-05-29 13:58:55.871','2026-05-29 13:58:55.299','2026-05-29 13:58:55.894');
/*!40000 ALTER TABLE `transport_trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_institution_roles`
--

DROP TABLE IF EXISTS `user_institution_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_institution_roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('main_admin','school_admin','teacher','student') COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_classes` json DEFAULT NULL,
  `assigned_sections` json DEFAULT NULL,
  `student_access_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `student_access_expires` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_institution_roles_user_id_institution_id_key` (`user_id`,`institution_id`),
  KEY `user_institution_roles_role_idx` (`role`),
  KEY `user_institution_roles_institution_id_idx` (`institution_id`),
  CONSTRAINT `user_institution_roles_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_institution_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_institution_roles`
--

LOCK TABLES `user_institution_roles` WRITE;
/*!40000 ALTER TABLE `user_institution_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_institution_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `image` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime(3) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `global_role` enum('super_admin','admin','support','student','user') COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `last_login_at` datetime(3) DEFAULT NULL,
  `last_login_ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `locked_until` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `alternate_emails` json DEFAULT NULL,
  `external_subjects` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_password_reset_token_idx` (`password_reset_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1d5d687b-8d05-4af5-b92d-347f85c46bcf','thevinstitution@gmail.com',NULL,'Super Administrator',NULL,1,NULL,1,1,NULL,NULL,NULL,0,NULL,'super_admin',NULL,NULL,0,NULL,'2026-04-25 03:38:11.863','2026-04-25 20:34:16.641',NULL,NULL),('test-preview-user','testpreview@example.com',NULL,'Test Preview User',NULL,1,NULL,1,0,NULL,NULL,NULL,0,NULL,'student',NULL,NULL,0,NULL,'2026-04-27 05:54:15.417','2026-04-27 05:54:15.417',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccination_records`
--

DROP TABLE IF EXISTS `vaccination_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccination_records` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaccine_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_administered` date DEFAULT NULL,
  `next_due` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vaccination_records_institution_id_idx` (`institution_id`),
  KEY `vaccination_records_student_id_idx` (`student_id`),
  CONSTRAINT `vaccination_records_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccination_records`
--

LOCK TABLES `vaccination_records` WRITE;
/*!40000 ALTER TABLE `vaccination_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `vaccination_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verifications`
--

DROP TABLE IF EXISTS `verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `verifications_identifier_idx` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verifications`
--

LOCK TABLES `verifications` WRITE;
/*!40000 ALTER TABLE `verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_articles`
--

DROP TABLE IF EXISTS `visionarium_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_articles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `language` enum('hi','en','hi_en') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `category` enum('SCIENCE','MATHS','HISTORY','IT','ESSAY','POEM','ITIHASA','DARSHANA','BHARATIYA_VIGYAN','GENERAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
  `status` enum('draft','review','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `visionarium_articles_slug_key` (`slug`),
  KEY `visionarium_articles_institution_id_idx` (`institution_id`),
  KEY `visionarium_articles_author_user_id_idx` (`author_user_id`),
  KEY `visionarium_articles_category_idx` (`category`),
  KEY `visionarium_articles_status_idx` (`status`),
  KEY `visionarium_articles_language_idx` (`language`),
  KEY `visionarium_articles_author_student_id_fkey` (`author_student_id`),
  KEY `visionarium_articles_issue_id_fkey` (`issue_id`),
  CONSTRAINT `visionarium_articles_author_student_id_fkey` FOREIGN KEY (`author_student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visionarium_articles_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visionarium_articles_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visionarium_articles_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `visionarium_issues` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_articles`
--

LOCK TABLES `visionarium_articles` WRITE;
/*!40000 ALTER TABLE `visionarium_articles` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_issues`
--

DROP TABLE IF EXISTS `visionarium_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_issues` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publish_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `visionarium_issues_issue_code_key` (`issue_code`),
  KEY `visionarium_issues_issue_code_idx` (`issue_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_issues`
--

LOCK TABLES `visionarium_issues` WRITE;
/*!40000 ALTER TABLE `visionarium_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_school_subscriptions`
--

DROP TABLE IF EXISTS `visionarium_school_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_school_subscriptions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` enum('basic','premium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'basic',
  `starts_at` datetime(3) NOT NULL,
  `ends_at` datetime(3) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visionarium_school_subscriptions_institution_id_idx` (`institution_id`),
  KEY `visionarium_school_subscriptions_is_active_idx` (`is_active`),
  CONSTRAINT `visionarium_school_subscriptions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_school_subscriptions`
--

LOCK TABLES `visionarium_school_subscriptions` WRITE;
/*!40000 ALTER TABLE `visionarium_school_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_school_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_submissions`
--

DROP TABLE IF EXISTS `visionarium_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_submissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_by_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submission_type` enum('article','poem','story','artwork','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'article',
  `body` longtext COLLATE utf8mb4_unicode_ci,
  `content_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('submitted','accepted','rejected','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `linked_article_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visionarium_submissions_institution_id_idx` (`institution_id`),
  KEY `visionarium_submissions_submitted_by_user_id_idx` (`submitted_by_user_id`),
  KEY `visionarium_submissions_status_idx` (`status`),
  KEY `visionarium_submissions_student_id_fkey` (`student_id`),
  KEY `visionarium_submissions_linked_article_id_fkey` (`linked_article_id`),
  CONSTRAINT `visionarium_submissions_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visionarium_submissions_linked_article_id_fkey` FOREIGN KEY (`linked_article_id`) REFERENCES `visionarium_articles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visionarium_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visionarium_submissions_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_submissions`
--

LOCK TABLES `visionarium_submissions` WRITE;
/*!40000 ALTER TABLE `visionarium_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_test_attempts`
--

DROP TABLE IF EXISTS `visionarium_test_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_test_attempts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_series_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score_obtained` decimal(5,2) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visionarium_test_attempts_test_series_id_idx` (`test_series_id`),
  KEY `visionarium_test_attempts_student_id_idx` (`student_id`),
  CONSTRAINT `visionarium_test_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visionarium_test_attempts_test_series_id_fkey` FOREIGN KEY (`test_series_id`) REFERENCES `visionarium_test_series` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_test_attempts`
--

LOCK TABLES `visionarium_test_attempts` WRITE;
/*!40000 ALTER TABLE `visionarium_test_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_test_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visionarium_test_series`
--

DROP TABLE IF EXISTS `visionarium_test_series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visionarium_test_series` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` enum('hi','en','hi_en') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `total_marks` int NOT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visionarium_test_series_institution_id_idx` (`institution_id`),
  KEY `visionarium_test_series_class_id_idx` (`class_id`),
  KEY `visionarium_test_series_subject_id_fkey` (`subject_id`),
  CONSTRAINT `visionarium_test_series_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visionarium_test_series_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visionarium_test_series_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visionarium_test_series`
--

LOCK TABLES `visionarium_test_series` WRITE;
/*!40000 ALTER TABLE `visionarium_test_series` DISABLE KEYS */;
/*!40000 ALTER TABLE `visionarium_test_series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visiting_cards`
--

DROP TABLE IF EXISTS `visiting_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visiting_cards` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `front_pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `back_pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_data` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','generated','approved','printed','issued','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `issued_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `visiting_cards_card_number_key` (`card_number`),
  KEY `visiting_cards_institution_id_idx` (`institution_id`),
  KEY `visiting_cards_status_idx` (`status`),
  KEY `visiting_cards_user_id_idx` (`user_id`),
  KEY `visiting_cards_student_id_idx` (`student_id`),
  KEY `visiting_cards_template_id_fkey` (`template_id`),
  CONSTRAINT `visiting_cards_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visiting_cards_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visiting_cards_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visiting_cards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visiting_cards`
--

LOCK TABLES `visiting_cards` WRITE;
/*!40000 ALTER TABLE `visiting_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `visiting_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_logs`
--

DROP TABLE IF EXISTS `visitor_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whom_to_meet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('checked_in','checked_out') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'checked_in',
  `check_in_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `check_out_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_logs_institution_id_idx` (`institution_id`),
  KEY `visitor_logs_status_idx` (`status`),
  CONSTRAINT `visitor_logs_institution_id_fkey` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_logs`
--

LOCK TABLES `visitor_logs` WRITE;
/*!40000 ALTER TABLE `visitor_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitor_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'vidyaverse'
--

--
-- Dumping routines for database 'vidyaverse'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-31 23:21:53
