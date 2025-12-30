-- Add target_section_id column to circulars table if not exists
USE Cyber_Dept_Portal;

-- Check and add target_section_id column
SET @dbname = DATABASE();
SET @tablename = 'circulars';
SET @columnname = 'target_section_id';

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
    'SELECT ''Column already exists'' AS Status',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER target_batch_id, ADD FOREIGN KEY (', @columnname, ') REFERENCES sections(id) ON DELETE SET NULL')
));

PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SELECT 'Migration completed successfully' AS Status;
