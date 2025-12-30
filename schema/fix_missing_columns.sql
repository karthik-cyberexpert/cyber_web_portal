-- Disable Safe Updates for session
SET SQL_SAFE_UPDATES = 0;
SET @dbname = DATABASE();

-- Add place_to_visit to od_requests if not exists
SET @tablename = "od_requests";
SET @columnname = "place_to_visit";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE od_requests ADD COLUMN place_to_visit VARCHAR(255) DEFAULT NULL AFTER reason;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add section_id to attendance if not exists
SET @tablename = "attendance";
SET @columnname = "section_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE attendance ADD COLUMN section_id INT DEFAULT NULL AFTER student_id;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add section_id to assignments if not exists
SET @tablename = "assignments";
SET @columnname = "section_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE assignments ADD COLUMN section_id INT DEFAULT NULL;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Populate section_id in attendance from student_profiles
UPDATE attendance a
JOIN student_profiles sp ON a.student_id = sp.user_id
SET a.section_id = sp.section_id
WHERE a.section_id IS NULL;

-- Populate section_id in assignments from subject_allocations
UPDATE assignments a
JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
SET a.section_id = sa.section_id
WHERE a.section_id IS NULL;

SET SQL_SAFE_UPDATES = 1;
