-- Add Education Details to Student Profiles
USE Cyber_Dept_Portal;

-- Add columns if they don't exist
SET @dbname = DATABASE();
SET @tablename = 'student_profiles';

SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = 'education_degree') = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN education_degree VARCHAR(255) DEFAULT "B.Tech in Computer Science"'),
    'SELECT "Column education_degree already exists."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = 'education_institution') = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN education_institution VARCHAR(255) DEFAULT "Your Institution"'),
    'SELECT "Column education_institution already exists."'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update the specific student data (assuming user_id 20 based on previous logs)
UPDATE student_profiles 
SET education_degree = 'BE - CSE(CYBER SECURITY)', 
    education_institution = 'Adhiyamaan College of Engineering - Hosur (635109)' 
WHERE user_id = 20;

-- Verification
SELECT user_id, education_degree, education_institution FROM student_profiles WHERE user_id = 20;
