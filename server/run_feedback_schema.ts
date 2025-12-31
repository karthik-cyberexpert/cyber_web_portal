
import { pool } from './db.js';

async function runFeedbackSchema() {
    console.log('Running Feedback Schema...');
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback_forms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type ENUM('faculty', 'other') NOT NULL,
                batch_id INT DEFAULT NULL,
                section_id INT DEFAULT NULL,
                closing_date DATETIME NOT NULL,
                status ENUM('Open', 'Closed') DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
                FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
            );
        `);
        console.log('Created feedback_forms table');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                feedback_form_id INT NOT NULL,
                question_text TEXT NOT NULL,
                question_type ENUM('mcq', 'text') NOT NULL DEFAULT 'text',
                options JSON DEFAULT NULL,
                order_index INT DEFAULT 0,
                FOREIGN KEY (feedback_form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE
            );
        `);
        console.log('Created feedback_questions table');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Schema creation failed:', error);
        process.exit(1);
    }
}

runFeedbackSchema();
