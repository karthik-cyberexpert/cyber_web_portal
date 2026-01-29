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

-- 3. Update Unique Constraints & Foreign Keys
-- Goal: Replace index 'unique_section_slot' with 'unique_section_slot_sem'
-- Problem: 'unique_section_slot' is used by FK on 'section_id'. We must drop FK first.

-- 3a. Drop Foreign Key on section_id (if exists)
SET @dbname = DATABASE();
SET @tablename = "timetable_slots";
SET @fkName = (SELECT CONSTRAINT_NAME 
               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
               WHERE TABLE_SCHEMA = @dbname 
                 AND TABLE_NAME = @tablename 
                 AND COLUMN_NAME = 'section_id' 
                 AND REFERENCED_TABLE_NAME = 'sections' 
               LIMIT 1);

SET @preparedStatementDropFK = IF(@fkName IS NOT NULL, 
                                  CONCAT('ALTER TABLE timetable_slots DROP FOREIGN KEY ', @fkName), 
                                  'SELECT 1');
PREPARE stmtDropFK FROM @preparedStatementDropFK;
EXECUTE stmtDropFK;
DEALLOCATE PREPARE stmtDropFK;


-- 3b. Drop old constraint 'unique_section_slot' (if exists)
SET @indexName = "unique_section_slot";
SET @preparedStatementDropIndex = (SELECT IF(
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
PREPARE stmtDropIndex FROM @preparedStatementDropIndex;
EXECUTE stmtDropIndex;
DEALLOCATE PREPARE stmtDropIndex;


-- 3c. Add new constraint 'unique_section_slot_sem' (if not exists)
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
PREPARE stmtAddIndex FROM @preparedStatementAddIndex;
EXECUTE stmtAddIndex;
DEALLOCATE PREPARE stmtAddIndex;


-- 3d. Restore Foreign Key on section_id (if not exists)
-- We check if ANY FK on section_id referencing sections exists now. 
-- Since we dropped the old one, we should add our stable one 'fk_timetable_slots_section'
SET @fkCheck = (SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = @dbname 
                  AND TABLE_NAME = @tablename 
                  AND COLUMN_NAME = 'section_id' 
                  AND REFERENCED_TABLE_NAME = 'sections');

SET @preparedStatementAddFK = IF(@fkCheck = 0, 
                                 'ALTER TABLE timetable_slots ADD CONSTRAINT fk_timetable_slots_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;', 
                                 'SELECT 1');
PREPARE stmtAddFK FROM @preparedStatementAddFK;
EXECUTE stmtAddFK;
DEALLOCATE PREPARE stmtAddFK;

SET SQL_SAFE_UPDATES = 1;
