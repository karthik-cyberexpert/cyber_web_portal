-- Separate Leave and OD Schema
-- This file splits the unified leave_od_requests into two separate tables

USE Cyber_Dept_Portal;

-- -----------------------------------------------------------------------------
-- Leave Requests (Personal Leaves)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leave_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` ENUM('Casual', 'Medical', 'Sick', 'Emergency', 'Other') DEFAULT 'Casual',
    
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    
    -- Half-day support
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),                -- Medical Certificate, etc.
    
    -- Approval Workflow
    `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    `approver_id` INT,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- On-Duty (OD) Requests
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `od_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` ENUM('Academic', 'Sports', 'Symposium', 'Workshop', 'Conference', 'Competition', 'Other') DEFAULT 'Academic',
    
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    
    -- Half-day support
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),                -- Event Invitation, OD Letter, etc.
    
    -- Approval Workflow
    `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    `approver_id` INT,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- Data Migration from leave_od_requests
-- -----------------------------------------------------------------------------
-- Migrate Leave requests
INSERT INTO leave_requests (
    user_id, category, start_date, end_date, is_half_day, session, 
    reason, proof_url, status, approver_id, rejection_reason, approved_at, created_at, updated_at
)
SELECT 
    user_id, 
    CASE 
        WHEN category IN ('Casual', 'Medical') THEN category 
        ELSE 'Other' 
    END,
    start_date, end_date, is_half_day, session,
    reason, proof_url, status, approver_id, rejection_reason, approved_at, created_at, updated_at
FROM leave_od_requests
WHERE request_type = 'Leave';

-- Migrate OD requests
INSERT INTO od_requests (
    user_id, category, start_date, end_date, is_half_day, session,
    reason, proof_url, status, approver_id, rejection_reason, approved_at, created_at, updated_at
)
SELECT 
    user_id,
    CASE 
        WHEN category IN ('Academic', 'Sports', 'Symposium', 'Workshop') THEN category
        ELSE 'Other'
    END,
    start_date, end_date, is_half_day, session,
    reason, proof_url, status, approver_id, rejection_reason, approved_at, created_at, updated_at
FROM leave_od_requests
WHERE request_type = 'OD';

-- Optional: Archive old table (uncomment to execute)
-- RENAME TABLE leave_od_requests TO leave_od_requests_archive;

SELECT 'Migration completed successfully' AS Status;
