
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `feedback_forms`
ADD COLUMN `batch_id` INT DEFAULT NULL,
ADD COLUMN `section_id` INT DEFAULT NULL,
ADD COLUMN `closing_date` DATE DEFAULT NULL,
ADD COLUMN `status` ENUM('Open', 'Closed') DEFAULT 'Open',
ADD KEY `batch_id` (`batch_id`),
ADD KEY `section_id` (`section_id`),
ADD CONSTRAINT `feedback_forms_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `feedback_forms_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
