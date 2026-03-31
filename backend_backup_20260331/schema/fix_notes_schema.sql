
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `notes`
DROP FOREIGN KEY `notes_ibfk_2`;

ALTER TABLE `notes`
CHANGE COLUMN `faculty_id` `uploaded_by` INT NOT NULL,
ADD COLUMN `section_id` INT DEFAULT NULL AFTER `subject_id`,
ADD COLUMN `type` varchar(50) DEFAULT 'Note' AFTER `description`,
ADD COLUMN `file_type` varchar(20) DEFAULT 'PDF' AFTER `type`,
ADD COLUMN `file_size` varchar(20) DEFAULT NULL AFTER `file_url`,
ADD COLUMN `download_count` INT DEFAULT 0,
ADD COLUMN `is_published` BOOLEAN DEFAULT TRUE,
ADD KEY `section_id` (`section_id`),
ADD KEY `uploaded_by` (`uploaded_by`),
ADD CONSTRAINT `notes_ibfk_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `notes_ibfk_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
