-- Vidyaverse Pro Database Initialization
-- This script runs automatically on first MySQL container startup

CREATE DATABASE IF NOT EXISTS `vidyaverse`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant full privileges to the application user
GRANT ALL PRIVILEGES ON `vidyaverse`.* TO 'vidyaverse'@'%';
FLUSH PRIVILEGES;
