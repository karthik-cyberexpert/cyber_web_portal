-- Migration: Add Semester to Timetable Slots
-- Description: Allows separate timetables for different semesters within the same batch/section history.

SET SQL_SAFE_UPDATES = 0;

-- 1. Add semester column
ALTER TABLE timetable_slots ADD COLUMN semester INT DEFAULT NULL;

-- 2. Populate semester for existing data
UPDATE timetable_slots ts 
JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id 
JOIN subjects s ON sa.subject_id = s.id 
SET ts.semester = s.semester
WHERE ts.semester IS NULL;

-- 3. Update Unique Constraints
-- Drop old constraint that prevented same slot time for different semesters
ALTER TABLE timetable_slots DROP INDEX unique_section_slot;

-- Add new constraint including semester
CREATE UNIQUE INDEX unique_section_slot_sem ON timetable_slots (section_id, day_of_week, period_number, semester);

SET SQL_SAFE_UPDATES = 1;
