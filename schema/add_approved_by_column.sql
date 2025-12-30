USE Cyber_Dept_Portal;

-- Add approved_by column to leave_requests
ALTER TABLE `leave_requests` 
ADD COLUMN `approved_by` ENUM('Tutor', 'Admin') DEFAULT NULL AFTER `status`;

-- Add approved_by column to od_requests
ALTER TABLE `od_requests` 
ADD COLUMN `approved_by` ENUM('Tutor', 'Admin') DEFAULT NULL AFTER `status`;

-- Optional: Update existing approved/rejected requests 
-- (Assuming they were mostly approved by Admins in the previous version if forwarded, or tutors if not)
UPDATE `leave_requests` SET `approved_by` = 'Admin' WHERE `status` IN ('approved', 'rejected') AND `forwarded_at` IS NOT NULL;
UPDATE `leave_requests` SET `approved_by` = 'Tutor' WHERE `status` IN ('approved', 'rejected') AND `forwarded_at` IS NULL;

UPDATE `od_requests` SET `approved_by` = 'Admin' WHERE `status` IN ('approved', 'rejected') AND `forwarded_at` IS NOT NULL;
UPDATE `od_requests` SET `approved_by` = 'Tutor' WHERE `status` IN ('approved', 'rejected') AND `forwarded_at` IS NULL;
