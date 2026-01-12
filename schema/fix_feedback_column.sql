
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `feedback_questions` 
CHANGE COLUMN `form_id` `feedback_form_id` INT NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;
