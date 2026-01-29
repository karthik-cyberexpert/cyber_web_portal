-- Migration: Add Semester to Timetable Slots
-- Description: Allows separate timetables for different semesters within the same batch/section history.
-- Idempotent version: Checks for column/index existence before altering.

SET SQL_SAFE_UPDATES = 0;

-- 1. Add semester column ONLY if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "timetable_slots";
SET @columnname = "semester";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE timetable_slots ADD COLUMN semester INT DEFAULT NULL;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Populate semester for existing data
-- This UPDATE is safe to run multiple times as it targets NULLs
UPDATE timetable_slots ts 
JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id 
JOIN subjects s ON sa.subject_id = s.id 
SET ts.semester = s.semester
WHERE ts.semester IS NULL;

-- 3. Update Unique Constraints
-- Drop old constraint 'unique_section_slot' ONLY if it exists
SET @indexName = "unique_section_slot";
SET @preparedStatementDrop = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexName)
  ) > 0,
  "ALTER TABLE timetable_slots DROP INDEX unique_section_slot;",
  "SELECT 1"
));
PREPARE dropIfExists FROM @preparedStatementDrop;
EXECUTE dropIfExists;
DEALLOCATE PREPARE dropIfExists;

-- Add new constraint 'unique_section_slot_sem' ONLY if it doesn't exist
SET @newIndexName = "unique_section_slot_sem";
SET @preparedStatementAddIndex = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @newIndexName)
  ) > 0,
  "SELECT 1",
  "CREATE UNIQUE INDEX unique_section_slot_sem ON timetable_slots (section_id, day_of_week, period_number, semester);"
));
PREPARE addIndexIfNotExists FROM @preparedStatementAddIndex;
EXECUTE addIndexIfNotExists;
DEALLOCATE PREPARE addIndexIfNotExists;

SET SQL_SAFE_UPDATES = 1;
