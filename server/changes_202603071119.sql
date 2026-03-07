-- Migration script: Fixing timetable_slots table
-- Purpose: Add semester support and expand type enum

-- 1. Add semester column
ALTER TABLE timetable_slots ADD COLUMN semester INT DEFAULT NULL;

-- 2. Update existing records
UPDATE timetable_slots ts 
JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id 
JOIN subjects s ON sa.subject_id = s.id 
SET ts.semester = s.semester
WHERE ts.semester IS NULL;

-- 3. Modify type enum
ALTER TABLE timetable_slots MODIFY COLUMN type ENUM('theory', 'lab', 'tutorial', 'free') DEFAULT 'theory';

-- 4. Unique index
CREATE UNIQUE INDEX unique_section_slot_sem ON timetable_slots (section_id, day_of_week, period_number, semester);
