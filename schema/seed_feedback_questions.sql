-- Seed file for Feedback Forms and Questions
-- Database: Cyber_Dept_Portal

USE Cyber_Dept_Portal;

-- Insert a Standard Faculty Feedback Form
INSERT INTO `feedback_forms` (
    `title`, 
    `type`, 
    `closing_date`, 
    `status`
) VALUES (
    'Faculty Performance Evaluation (2025-26)', 
    'faculty', 
    '2026-06-30 23:59:59', 
    'Open'
);

SET @form_id = LAST_INSERT_ID();

-- Insert Standard Faculty Feedback Questions
INSERT INTO `feedback_questions` (`feedback_form_id`, `question_text`, `question_type`, `options`, `order_index`) VALUES
(@form_id, 'How much of the syllabus was covered in the class?', 'mcq', '[{"label": "85-100%", "value": 4}, {"label": "70-84%", "value": 3}, {"label": "55-69%", "value": 2}, {"label": "30-54%", "value": 1}, {"label": "Below 30%", "value": 0}]', 1),
(@form_id, 'How well did the teachers prepare for the classes?', 'mcq', '[{"label": "Thoroughly", "value": 4}, {"label": "Satisfactorily", "value": 3}, {"label": "Poorly", "value": 2}, {"label": "Indifferently", "value": 1}, {"label": "Won’t teach at all", "value": 0}]', 2),
(@form_id, 'How well were the teachers able to communicate?', 'mcq', '[{"label": "Always effective", "value": 4}, {"label": "Sometimes effective", "value": 3}, {"label": "Just satisfactorily", "value": 2}, {"label": "Generally ineffective", "value": 1}, {"label": "Very poor communication", "value": 0}]', 3),
(@form_id, 'The teacher’s approach to teaching can best be described as', 'mcq', '[{"label": "Excellent", "value": 4}, {"label": "Very good", "value": 3}, {"label": "Good", "value": 2}, {"label": "Fair", "value": 1}, {"label": "Poor", "value": 0}]', 4),
(@form_id, 'The teachers illustrate the concepts through examples and applications.', 'mcq', '[{"label": "Every time", "value": 4}, {"label": "Usually", "value": 3}, {"label": "Occasionally/Sometimes", "value": 2}, {"label": "Rarely", "value": 1}, {"label": "Never", "value": 0}]', 5),
(@form_id, 'The teachers identify your strengths and encourage you with providing right level of challenges.', 'mcq', '[{"label": "Fully", "value": 4}, {"label": "Reasonably", "value": 3}, {"label": "Partially", "value": 2}, {"label": "Slightly", "value": 1}, {"label": "Unable to", "value": 0}]', 6),
(@form_id, 'Teachers are able to identify your weaknesses and help you to overcome them.', 'mcq', '[{"label": "Every time", "value": 4}, {"label": "Usually", "value": 3}, {"label": "Occasionally/Sometimes", "value": 2}, {"label": "Rarely", "value": 1}, {"label": "Never", "value": 0}]', 7),
(@form_id, 'The overall quality of teaching-learning process toward this teacher is very good.', 'mcq', '[{"label": "Strongly agree", "value": 4}, {"label": "Agree", "value": 3}, {"label": "Neutral", "value": 2}, {"label": "Disagree", "value": 1}, {"label": "Strongly disagree", "value": 0}]', 8);
