
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `feedback_answers`;
DROP TABLE IF EXISTS `feedback_responses`;

CREATE TABLE `feedback_responses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feedback_form_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

SET FOREIGN_KEY_CHECKS = 1;
