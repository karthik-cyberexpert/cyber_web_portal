USE Cyber_Dept_Portal;

-- Update status ENUM for leave_requests
ALTER TABLE `leave_requests` 
MODIFY COLUMN `status` ENUM('pending', 'pending_admin', 'approved', 'rejected', 'cancel_requested', 'cancelled') DEFAULT 'pending';

-- Update status ENUM for od_requests
ALTER TABLE `od_requests` 
MODIFY COLUMN `status` ENUM('pending', 'pending_admin', 'approved', 'rejected', 'cancel_requested', 'cancelled') DEFAULT 'pending';
