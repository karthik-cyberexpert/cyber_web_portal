
-- Ensure circulars has correct columns
ALTER TABLE circulars 
ADD COLUMN IF NOT EXISTS description TEXT AFTER title,
ADD COLUMN IF NOT EXISTS audience ENUM('All', 'Students', 'Faculty', 'Tutors') DEFAULT 'All' AFTER description,
ADD COLUMN IF NOT EXISTS priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium' AFTER audience,
ADD COLUMN IF NOT EXISTS target_batch_id INT NULL AFTER priority,
ADD COLUMN IF NOT EXISTS target_section_id INT NULL AFTER target_batch_id,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Notice' AFTER target_section_id,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER type;

-- Add constraints if not exists
-- Use a procedure to avoid errors if FK already exists (simplified here for direct execution)
SET @fk_batch = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                 WHERE TABLE_NAME = 'circulars' AND COLUMN_NAME = 'target_batch_id' AND TABLE_SCHEMA = DATABASE() LIMIT 1);
IF @fk_batch IS NULL THEN
    ALTER TABLE circulars ADD CONSTRAINT fk_circular_batch FOREIGN KEY (target_batch_id) REFERENCES batches(id) ON DELETE SET NULL;
END IF;

SET @fk_section = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                   WHERE TABLE_NAME = 'circulars' AND COLUMN_NAME = 'target_section_id' AND TABLE_SCHEMA = DATABASE() LIMIT 1);
IF @fk_section IS NULL THEN
    ALTER TABLE circulars ADD CONSTRAINT fk_circular_section FOREIGN KEY (target_section_id) REFERENCES sections(id) ON DELETE SET NULL;
END IF;

-- Ensure description is populated from content
UPDATE circulars SET description = content WHERE description IS NULL OR description = '';
