-- Add semester_dates_pending column to batches table
-- This tracks whether admin needs to set new semester dates

ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS semester_dates_pending BOOLEAN DEFAULT FALSE;

-- Update existing batches where semester has ended but flag not set
UPDATE batches 
SET semester_dates_pending = TRUE 
WHERE semester_end_date IS NOT NULL 
  AND semester_end_date < CURDATE()
  AND semester_dates_pending = FALSE;
