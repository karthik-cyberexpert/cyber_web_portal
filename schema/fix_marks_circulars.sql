
-- Fix Circulars Schema
ALTER TABLE circulars 
ADD COLUMN description TEXT AFTER title,
ADD COLUMN audience ENUM('All', 'Students', 'Faculty', 'Tutors') DEFAULT 'All' AFTER description,
ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium' AFTER audience,
ADD COLUMN target_batch_id INT NULL AFTER priority,
ADD COLUMN target_section_id INT NULL AFTER target_batch_id,
ADD COLUMN type VARCHAR(50) DEFAULT 'Notice' AFTER target_section_id,
ADD COLUMN published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER type,
ADD CONSTRAINT fk_circular_batch FOREIGN KEY (target_batch_id) REFERENCES batches(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_circular_section FOREIGN KEY (target_section_id) REFERENCES sections(id) ON DELETE SET NULL;

-- Migrate content to description if it exists
UPDATE circulars SET description = content WHERE description IS NULL;
-- Drop old columns if they exist
-- ALTER TABLE circulars DROP COLUMN content;
-- ALTER TABLE circulars DROP COLUMN target_role;

-- Fix Marks GROUP BY issues in code (will do in controller)
-- But let's check if marks table has everything it needs.
-- Earlier I saw marks table has section_id.

-- The error "Unknown column 'section_id' in 'on clause'" might be from a query 
-- where 'section_id' is used without a prefix and is ambiguous.
