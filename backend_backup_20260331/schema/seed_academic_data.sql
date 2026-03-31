-- Seed file for mandatory academic structure
-- Database: Cyber_Dept_Portal

USE Cyber_Dept_Portal;

-- 1. Insert Default Department (Required for Batches and Faculty)
INSERT INTO `departments` (`id`, `name`, `code`) 
VALUES (1, 'Cyber Security', 'CSS')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `code` = VALUES(`code`);

-- 2. Insert Default Academic Year
INSERT INTO `academic_years` (`id`, `year_range`, `is_active`) 
VALUES (1, '2024-2028', TRUE)
ON DUPLICATE KEY UPDATE `year_range` = VALUES(`year_range`), `is_active` = VALUES(`is_active`);
