-- Standardize Student Profiles Schema
-- This script ensures consistent naming for guardian details and adds professional link columns.

USE Cyber_Dept_Portal;

-- 1. Rename parent_name to guardian_name (if it exists)
SET @dbname = DATABASE();
SET @tablename = 'student_profiles';
SET @oldcolumn = 'parent_name';
SET @newcolumn = 'guardian_name';

-- Rename parent_name to guardian_name
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = @oldcolumn) > 0,
    CONCAT('ALTER TABLE ', @tablename, ' CHANGE ', @oldcolumn, ' ', @newcolumn, ' VARCHAR(100)'),
    'SELECT "Column parent_name does not exist or already renamed."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Rename parent_phone to guardian_phone (if it exists)
SET @oldcolumn = 'parent_phone';
SET @newcolumn = 'guardian_phone';

SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = @oldcolumn) > 0,
    CONCAT('ALTER TABLE ', @tablename, ' CHANGE ', @oldcolumn, ' ', @newcolumn, ' VARCHAR(20)'),
    'SELECT "Column parent_phone does not exist or already renamed."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Ensure Professional Link Columns exist
-- (Using procedural logic to avoid errors if they already exist)
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = 'linkedin_url') = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN linkedin_url VARCHAR(255) DEFAULT NULL'),
    'SELECT "Column linkedin_url already exists."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = 'github_url') = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN github_url VARCHAR(255) DEFAULT NULL'),
    'SELECT "Column github_url already exists."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = 'portfolio_url') = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN portfolio_url VARCHAR(255) DEFAULT NULL'),
    'SELECT "Column portfolio_url already exists."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verification
DESCRIBE student_profiles;
