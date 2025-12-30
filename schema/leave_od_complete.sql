-- Complete Leave and OD Schema with Approval Workflow
USE Cyber_Dept_Portal;

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `od_requests`;

-- Create Leave Requests table
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
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT,
    `forwarded_by` INT NULL,
    `forwarded_at` TIMESTAMP NULL,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    `working_days` INT DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Create OD Requests table
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
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT,
    `forwarded_by` INT NULL,
    `forwarded_at` TIMESTAMP NULL,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    `working_days` INT DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

SELECT 'Leave and OD tables created successfully with approval workflow' AS Status;
