-- Add approval workflow columns to separated tables
USE Cyber_Dept_Portal;

-- Update leave_requests table - add columns first, then modify
ALTER TABLE leave_requests ADD COLUMN forwarded_by INT NULL;
ALTER TABLE leave_requests ADD COLUMN forwarded_at TIMESTAMP NULL;
ALTER TABLE leave_requests ADD COLUMN working_days INT DEFAULT 0;

-- Update od_requests table - add columns first, then modify
ALTER TABLE od_requests ADD COLUMN forwarded_by INT NULL;
ALTER TABLE od_requests ADD COLUMN forwarded_at TIMESTAMP NULL;
ALTER TABLE od_requests ADD COLUMN working_days INT DEFAULT 0;

-- Modify status enum to include workflow stages
ALTER TABLE leave_requests MODIFY COLUMN status ENUM('pending', 'pending_tutor', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE od_requests MODIFY COLUMN status ENUM('pending', 'pending_tutor', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending';

SELECT 'Approval workflow columns added successfully' AS Status;
