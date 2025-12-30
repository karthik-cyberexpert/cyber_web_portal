-- Add duration_type column to leave and OD tables
USE Cyber_Dept_Portal;

-- Add duration_type to leave_requests
ALTER TABLE leave_requests 
  ADD COLUMN duration_type ENUM('Full-Day', 'Half-Day (First Half)', 'Half-Day (Second Half)') DEFAULT 'Full-Day' AFTER is_half_day;

-- Add duration_type to od_requests
ALTER TABLE od_requests 
  ADD COLUMN duration_type ENUM('Full-Day', 'Half-Day (First Half)', 'Half-Day (Second Half)') DEFAULT 'Full-Day' AFTER is_half_day;

SELECT 'Duration type column added successfully' AS Status;
