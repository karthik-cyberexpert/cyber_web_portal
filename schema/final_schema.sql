-- Final Consolidated Schema for ACE-HOSUR (Cyber Security Department)
-- Version: 1.1.0
-- Database: MySQL

CREATE DATABASE IF NOT EXISTS Cyber_Dept_Portal;
USE Cyber_Dept_Portal;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. User Management & Authentication
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `feedback_answers`;
DROP TABLE IF EXISTS `feedback_responses`;
DROP TABLE IF EXISTS `feedback_questions`;
DROP TABLE IF EXISTS `feedback_forms`;
DROP TABLE IF EXISTS `lost_and_found_items`;
DROP TABLE IF EXISTS `grievances`;
DROP TABLE IF EXISTS `eca_achievements`;
DROP TABLE IF EXISTS `calendar_events`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `circulars`;
DROP TABLE IF EXISTS `marks`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `assignment_submissions`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `od_requests`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `timetable_slots`;
DROP TABLE IF EXISTS `subject_allocations`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `faculty_profiles`;
DROP TABLE IF EXISTS `tutor_assignments`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `batches`;
DROP TABLE IF EXISTS `academic_years`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'faculty', 'student', 'tutor') NOT NULL,
    `phone` VARCHAR(20),
    `address` TEXT,
    `avatar_url` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE,
    `password_changed` BOOLEAN DEFAULT FALSE,
    `last_login` DATETIME,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Academic Structure
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `head_of_department_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`head_of_department_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS `academic_years` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `year_range` VARCHAR(20) NOT NULL,
    `is_active` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `batches` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `start_year` YEAR NOT NULL,
    `end_year` YEAR NOT NULL,
    `current_semester` INT DEFAULT 1,
    `semester_start_date` DATE,
    `semester_end_date` DATE,
    `semester_dates_pending` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `sections` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `batch_id` INT NOT NULL,
    `name` VARCHAR(10) NOT NULL,
    `capacity` INT DEFAULT 60,
    `class_incharge_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_incharge_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `tutor_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `batch_id` INT NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `revoked_at` TIMESTAMP NULL,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. Profiles
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `faculty_profiles` (
    `user_id` INT PRIMARY KEY,
    `department_id` INT,
    `name` VARCHAR(100) NOT NULL,
    `employee_id` VARCHAR(50) UNIQUE,
    `designation` VARCHAR(100),
    `qualification` VARCHAR(255),
    `specialization` VARCHAR(255),
    `experience_years` INT DEFAULT 0,
    `joining_date` DATE,
    `employment_type` ENUM('Full-Time', 'Part-Time', 'Contract', 'Guest') DEFAULT 'Full-Time',
    `current_status` ENUM('Active', 'On Leave', 'Resigned') DEFAULT 'Active',
    `cabin_location` VARCHAR(100),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `student_profiles` (
    `user_id` INT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `roll_number` VARCHAR(50) NOT NULL UNIQUE,
    `register_number` VARCHAR(50) NOT NULL UNIQUE,
    `batch_id` INT,
    `section_id` INT,
    `dob` DATE,
    `gender` ENUM('male', 'female', 'other'),
    `blood_group` VARCHAR(5),
    `guardian_name` VARCHAR(100),
    `guardian_phone` VARCHAR(20),
    `parent_name` VARCHAR(100),
    `parent_phone` VARCHAR(20),
    `address` TEXT,
    `cgpa` DECIMAL(4, 2) DEFAULT 0.00,
    `attendance_percentage` DECIMAL(5, 2) DEFAULT 0.00,
    `linkedin_url` VARCHAR(255),
    `github_url` VARCHAR(255),
    `portfolio_url` VARCHAR(255),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 4. Course Management & Timetable
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `semester` INT NOT NULL,
    `credits` INT DEFAULT 3,
    `type` ENUM('theory', 'lab', 'integrated') DEFAULT 'theory',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `subject_allocations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `section_id` INT,
    `academic_year_id` INT NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `timetable_slots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `section_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    `period_number` INT NOT NULL,
    `subject_allocation_id` INT,
    `room_number` VARCHAR(20),
    `start_time` TIME,
    `end_time` TIME,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_allocation_id`) REFERENCES `subject_allocations`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_section_slot` (section_id, day_of_week, period_number)
);

-- -----------------------------------------------------------------------------
-- 5. Attendance & Leaves/OD
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('present', 'absent', 'late', 'excused', 'on_duty') DEFAULT 'present',
    `marked_by` INT NOT NULL,
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_attendance` (`student_id`, `subject_id`, `date`),
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `leave_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Casual',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    `duration_type` ENUM('Full-Day', 'Half-Day (First Half)', 'Half-Day (Second Half)') DEFAULT 'Full-Day',
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT,
    `forwarded_by` INT,
    `forwarded_at` TIMESTAMP NULL,
    `approved_by` ENUM('Tutor', 'Admin') NULL,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    `working_days` DECIMAL(5,1) DEFAULT 0.0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `od_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Academic',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    `duration_type` ENUM('Full-Day', 'Half-Day (First Half)', 'Half-Day (Second Half)') DEFAULT 'Full-Day',
    `reason` TEXT NOT NULL,
    `place_to_visit` VARCHAR(255),
    `proof_url` VARCHAR(500),
    `status` ENUM('pending', 'pending_admin', 'approved', 'rejected') DEFAULT 'pending',
    `approver_id` INT,
    `forwarded_by` INT,
    `forwarded_at` TIMESTAMP NULL,
    `approved_by` ENUM('Tutor', 'Admin') NULL,
    `rejection_reason` TEXT,
    `approved_at` TIMESTAMP NULL,
    `working_days` DECIMAL(5,1) DEFAULT 0.0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 6. LMS (Notes, Assignments, Submissions)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `file_url` VARCHAR(500) NOT NULL,
    `unit_number` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_allocation_id` INT NOT NULL,
    `section_id` INT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `due_date` DATETIME NOT NULL,
    `max_score` INT DEFAULT 10,
    `file_url` VARCHAR(500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_allocation_id`) REFERENCES `subject_allocations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `file_url` VARCHAR(500),
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `score` INT,
    `feedback` TEXT,
    `status` ENUM('Pending', 'Graded', 'Late') DEFAULT 'Pending',
    FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 7. Examination & Marks
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `exam_type` ENUM('Internal', 'Model', 'University', 'Assignment', 'Quiz') DEFAULT 'Internal',
    `batch_id` INT NOT NULL,
    `start_date` DATE,
    `end_date` DATE,
    `is_published` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `marks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `section_id` INT,
    `marks_obtained` DECIMAL(5, 2),
    `max_marks` DECIMAL(5, 2) DEFAULT 100.00,
    `breakdown` JSON DEFAULT NULL,
    `status` ENUM('draft', 'submitted', 'approved', 'published') DEFAULT 'draft',
    `remarks` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 8. Communication & Events
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `circulars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `audience` ENUM('all', 'students', 'faculty', 'tutors') NOT NULL,
    `target_batch_id` INT,
    `target_section_id` INT,
    `type` ENUM('Notice', 'Event', 'Holiday', 'Exam') DEFAULT 'Notice',
    `attachment_url` VARCHAR(500),
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`target_batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`target_section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `calendar_events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_type` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(255),
    `description` TEXT,
    `batch_id` INT,
    `semester` INT,
    `subject_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 9. Student Welfare & Feedback
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `eca_achievements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `organizer` VARCHAR(255),
    `category` ENUM('Sports', 'Cultural', 'Technical', 'Symposium', 'Workshop', 'Hackathon') NOT NULL,
    `participation_type` ENUM('Participation', 'Merit/Prize') DEFAULT 'Participation',
    `level` ENUM('College', 'District', 'State', 'National', 'International') DEFAULT 'College',
    `event_date` DATE NOT NULL,
    `place_secured` VARCHAR(50),
    `proof_url` VARCHAR(500),
    `status` ENUM('Pending', 'In Progress', 'Approved', 'Rejected') DEFAULT 'Pending',
    `verified_by` INT,
    `verification_remarks` TEXT,
    `verified_at` TIMESTAMP NULL,
    `points_awarded` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `grievances` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `target_role` ENUM('Tutor', 'Admin') NOT NULL,
    `status` ENUM('Pending', 'In Progress', 'Solved', 'Returned') DEFAULT 'Pending',
    `attachment_path` VARCHAR(500),
    `action_by` INT,
    `action_reason` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`action_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `lost_and_found_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image_path` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('active', 'resolved') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `feedback_forms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('faculty', 'other') NOT NULL,
    `batch_id` INT DEFAULT NULL,
    `section_id` INT DEFAULT NULL,
    `closing_date` DATETIME NOT NULL,
    `status` ENUM('Open', 'Closed') DEFAULT 'Open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `feedback_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feedback_form_id` INT NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('mcq', 'text') NOT NULL DEFAULT 'text',
    `options` JSON DEFAULT NULL,
    `order_index` INT DEFAULT 0,
    FOREIGN KEY (`feedback_form_id`) REFERENCES `feedback_forms`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `feedback_responses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feedback_form_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`feedback_form_id`) REFERENCES `feedback_forms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `feedback_answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `response_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `target_id` INT DEFAULT NULL,
    `answer` TEXT,
    FOREIGN KEY (`response_id`) REFERENCES `feedback_responses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `feedback_questions`(`id`) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
