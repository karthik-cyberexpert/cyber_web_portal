-- =====================================================================
-- MANUAL DATABASE SETUP FOR LEAVE AND OD REQUEST SYSTEM
-- =====================================================================
-- INSTRUCTIONS:
-- 1. Open this file in your MySQL client (phpMyAdmin, MySQL Workbench, etc.)
-- 2. Execute the entire script
-- 3. Verify tables are created successfully
-- =====================================================================

USE Cyber_Dept_Portal;

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `od_requests`;

-- =====================================================================
-- LEAVE REQUESTS TABLE
-- =====================================================================
CREATE TABLE `leave_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` ENUM('Casual', 'Medical', 'Sick', 'Emergency', 'Other') DEFAULT 'Casual',
    
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    
    -- Half-day support
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),
    
    -- Multi-tier Approval Workflow
    -- pending = submitted to tutor
    -- pending_admin = forwarded to admin by tutor
    -- approved = final approval
    -- rejected = rejected by tutor or admin
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT NULL,
    `forwarded_by` INT NULL,
    `forwarded_at` TIMESTAMP NULL,
    `rejection_reason` TEXT NULL,
    `approved_at` TIMESTAMP NULL,
    `working_days` INT DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_date` (`start_date`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- OD (ON-DUTY) REQUESTS TABLE
-- =====================================================================
CREATE TABLE `od_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` ENUM('Academic', 'Sports', 'Symposium', 'Workshop', 'Conference', 'Competition', 'Other') DEFAULT 'Academic',
    
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    
    -- Half-day support
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),
    
    -- Multi-tier Approval Workflow
    -- pending = submitted to tutor
    -- pending_admin = forwarded to admin by tutor  
    -- approved = final approval by admin
    -- rejected = rejected by tutor or admin
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT NULL,
    `forwarded_by` INT NULL,
    `forwarded_at` TIMESTAMP NULL,
    `rejection_reason` TEXT NULL,
    `approved_at` TIMESTAMP NULL,
    `working_days` INT DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_date` (`start_date`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- VERIFICATION
-- =====================================================================
SELECT 'SUCCESS: leave_requests table created' AS Status;
SELECT 'SUCCESS: od_requests table created' AS Status;

-- Show table structures
DESCRIBE leave_requests;
DESCRIBE od_requests;
