
-- Create feedback_responses table
CREATE TABLE IF NOT EXISTS feedback_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_form_id INT NOT NULL,
    student_id INT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create feedback_answers table
CREATE TABLE IF NOT EXISTS feedback_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    target_id INT DEFAULT NULL, -- faculty_id for faculty feedback
    answer TEXT,
    FOREIGN KEY (response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES feedback_questions(id) ON DELETE CASCADE
);
