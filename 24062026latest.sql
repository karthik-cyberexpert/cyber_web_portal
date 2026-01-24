-- Final Consolidated Schema for ACE-HOSUR (Cyber Security Department)
-- Analyzed and Constructed on 2026-01-24
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
DROP TABLE IF EXISTS `exams`; -- Keeping exams if needed, but schedules is primary for marks
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
DROP TABLE IF EXISTS `schedules`;

CREATE TABLE `users` (
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

CREATE TABLE `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `head_of_department_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`head_of_department_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 2. Academic Structure
-- -----------------------------------------------------------------------------

CREATE TABLE `academic_years` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `start_year` YEAR NOT NULL,
    `end_year` YEAR NOT NULL,
    `is_active` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `batches` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `department_id` INT DEFAULT 1,
    `academic_year_id` INT,
    `start_year` YEAR NOT NULL,
    `end_year` YEAR NOT NULL,
    `sections_count` INT DEFAULT 1,
    `current_semester` INT DEFAULT 1,
    `semester_start_date` DATE,
    `semester_end_date` DATE,
    `semester_dates_pending` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL
);

CREATE TABLE `sections` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `batch_id` INT NOT NULL,
    `name` VARCHAR(10) NOT NULL,
    `capacity` INT DEFAULT 60,
    `class_incharge_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_incharge_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `tutor_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_id` INT NOT NULL,
    `batch_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `reg_number_start` VARCHAR(50),
    `reg_number_end` VARCHAR(50),
    `is_active` BOOLEAN DEFAULT TRUE,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. Profiles
-- -----------------------------------------------------------------------------

CREATE TABLE `faculty_profiles` (
    `user_id` INT PRIMARY KEY,
    `department_id` INT,
    `name` VARCHAR(100),
    `employee_id` VARCHAR(50) UNIQUE,
    `designation` VARCHAR(100),
    `qualification` VARCHAR(255),
    `specialization` VARCHAR(255),
    `experience_years` INT DEFAULT 0,
    `joining_date` DATE,
    `cabin_location` VARCHAR(100),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
);

CREATE TABLE `student_profiles` (
    `user_id` INT PRIMARY KEY,
    `name` VARCHAR(100),
    `roll_number` VARCHAR(50) NOT NULL UNIQUE,
    `register_number` VARCHAR(50) NOT NULL UNIQUE,
    `batch_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `dob` DATE,
    `gender` ENUM('male', 'female', 'other'),
    `blood_group` VARCHAR(5),
    `guardian_name` VARCHAR(100),
    `guardian_phone` VARCHAR(20),
    `cgpa` DECIMAL(4, 2) DEFAULT 0.00,
    `attendance_percentage` DECIMAL(5, 2) DEFAULT 100.00,
    `linkedin_url` VARCHAR(255),
    `github_url` VARCHAR(255),
    `portfolio_url` VARCHAR(255),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 4. Course Management & Timetable
-- -----------------------------------------------------------------------------

CREATE TABLE `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `semester` INT NOT NULL,
    `credits` INT DEFAULT 3,
    `type` ENUM('theory', 'lab', 'integrated') DEFAULT 'theory'
);

CREATE TABLE `subject_allocations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `section_id` INT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `academic_year_id` INT NOT NULL,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE
);

CREATE TABLE `timetable_slots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `section_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    `period_number` INT NOT NULL,
    `subject_allocation_id` INT,
    `room_number` VARCHAR(20),
    `start_time` TIME,
    `end_time` TIME,
    `type` ENUM('theory', 'lab') DEFAULT 'theory',
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_allocation_id`) REFERENCES `subject_allocations`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_section_slot` (section_id, day_of_week, period_number)
);

-- -----------------------------------------------------------------------------
-- 5. Attendance & Leaves/OD
-- -----------------------------------------------------------------------------

CREATE TABLE `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `period_number` INT NOT NULL,
    `status` ENUM('present', 'absent', 'on_duty') DEFAULT 'present',
    `marked_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `leave_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    `reason` TEXT NOT NULL,
    `proof_url` VARCHAR(500),
    `status` ENUM('pending', 'forwarded_to_admin', 'approved', 'rejected', 'cancel_requested', 'cancelled') DEFAULT 'pending',
    `tutor_id` INT,
    `admin_id` INT,
    `category` VARCHAR(50),
    `working_days` DECIMAL(5,1) DEFAULT 1.0,
    `duration_type` VARCHAR(50),
    `rejection_reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `od_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_half_day` BOOLEAN DEFAULT FALSE,
    `session` ENUM('Forenoon', 'Afternoon', 'Full Day') DEFAULT 'Full Day',
    `reason` TEXT NOT NULL,
    `place_to_visit` VARCHAR(255),
    `proof_url` VARCHAR(500),
    `status` ENUM('pending', 'forwarded_to_admin', 'approved', 'rejected', 'cancel_requested', 'cancelled') DEFAULT 'pending',
    `tutor_id` INT,
    `admin_id` INT,
    `category` VARCHAR(50),
    `working_days` DECIMAL(5,1) DEFAULT 1.0,
    `duration_type` VARCHAR(50),
    `rejection_reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 6. Academic Workload & Performance
-- -----------------------------------------------------------------------------

CREATE TABLE `notes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `uploaded_by` INT NOT NULL,
    `section_id` INT DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `file_url` VARCHAR(500) NOT NULL,
    `type` VARCHAR(50) DEFAULT 'Note',
    `file_type` VARCHAR(20) DEFAULT 'PDF',
    `file_size` VARCHAR(20) DEFAULT NULL,
    `download_count` INT DEFAULT 0,
    `is_published` BOOLEAN DEFAULT TRUE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `subject_allocation_id` INT NOT NULL,
    `due_date` DATETIME NOT NULL,
    `max_score` INT DEFAULT 100,
    `attachment_url` VARCHAR(500),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_allocation_id`) REFERENCES `subject_allocations`(`id`) ON DELETE CASCADE
);

CREATE TABLE `assignment_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('submitted', 'late', 'graded') DEFAULT 'submitted',
    `grade` VARCHAR(10),
    `feedback` TEXT,
    FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('CIA 1', 'CIA 2', 'CIA 3', 'Semester', 'Quiz', 'Assignment') NOT NULL,
    `academic_year_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE
);

CREATE TABLE `schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL, -- Exam, CIA 1, Holiday, etc.
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `batch_id` INT,
    `semester` INT,
    `subject_id` INT,
    `description` TEXT,
    `is_holiday` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL
);

CREATE TABLE `marks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `schedule_id` INT NOT NULL,
    `marks_obtained` DECIMAL(5, 2) NOT NULL,
    `max_marks` DECIMAL(5, 2) DEFAULT 100.00,
    `grade` VARCHAR(10) DEFAULT NULL,
    `status` ENUM('draft', 'pending_tutor', 'pending_admin', 'approved', 'rejected') DEFAULT 'draft',
    `remarks` TEXT,
    `breakdown` JSON,
    `faculty_id` INT,
    `tutor_id` INT,
    `admin_id` INT,
    `section_id` INT, -- Optional, derived from student/schedule
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 7. Communication & events
-- -----------------------------------------------------------------------------

CREATE TABLE `circulars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT, 
    `content` TEXT, -- Keep both to be safe, circular controller uses content/description
    `audience` ENUM('All', 'Students', 'Faculty', 'Tutors') DEFAULT 'All',
    `priority` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    `target_batch_id` INT NULL,
    `target_section_id` INT NULL,
    `type` VARCHAR(50) DEFAULT 'Notice',
    `attachment_url` VARCHAR(500),
    `created_by` INT NOT NULL,
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`target_batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`target_section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL, -- Modified to allow NULL for global notifs if needed, though schema usually enforces user_id
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `action_url` VARCHAR(255) DEFAULT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `type` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `calendar_events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `type` ENUM('academic', 'holiday', 'exam', 'event') DEFAULT 'event',
    `is_holiday` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. Feedback & Student Welfare
-- -----------------------------------------------------------------------------

CREATE TABLE `feedback_forms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('faculty', 'other', 'course', 'general') NOT NULL, -- Merged enums
    `batch_id` INT DEFAULT NULL,
    `section_id` INT DEFAULT NULL,
    `closing_date` DATETIME NOT NULL,
    `status` ENUM('Open', 'Closed') DEFAULT 'Open',
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
);

CREATE TABLE `feedback_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feedback_form_id` INT NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('mcq', 'text', 'rating', 'multiple_choice') NOT NULL DEFAULT 'text',
    `options` JSON DEFAULT NULL,
    `order_index` INT DEFAULT 0,
    FOREIGN KEY (`feedback_form_id`) REFERENCES `feedback_forms`(`id`) ON DELETE CASCADE
);

CREATE TABLE `feedback_responses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feedback_form_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`feedback_form_id`) REFERENCES `feedback_forms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `feedback_answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `response_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `target_id` INT DEFAULT NULL,
    `answer` TEXT,
    FOREIGN KEY (`response_id`) REFERENCES `feedback_responses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `feedback_questions`(`id`) ON DELETE CASCADE
);

CREATE TABLE `grievances` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `target_role` ENUM('Tutor', 'Admin', 'student', 'faculty') NOT NULL, -- Merged case sensitivity issues
    `status` ENUM('Pending', 'In Progress', 'Solved', 'Returned') DEFAULT 'Pending',
    `attachment_path` VARCHAR(500),
    `action_by` INT,
    `action_reason` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`action_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `eca_achievements` (
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

CREATE TABLE `lost_and_found_items` (
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

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Seed Data (Basic)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (email, name, password_hash, role, is_active) 
VALUES ('admin@css.com', 'Admin', '$2b$10$FjXxOfR/t5LEyi7xBtQaJOEstHU0jF6.iSa//X1Ra83G9eimS3lTq', 'admin', TRUE);
