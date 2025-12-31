
import { pool } from './db.js';

async function runResponseSchema() {
    console.log('Running Feedback Response Schema V2...');
    try {
        const connection = await pool.getConnection();

        // Drop if exists to be clean (although likely didn't exist)
        await connection.query('DROP TABLE IF EXISTS feedback_answers');
        await connection.query('DROP TABLE IF EXISTS feedback_responses');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                feedback_form_id INT NOT NULL,
                student_id INT NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (feedback_form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
            );
        `);
        console.log('Created feedback_responses table (linked to student_profiles)');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback_answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                response_id INT NOT NULL,
                question_id INT NOT NULL,
                target_id INT DEFAULT NULL, 
                answer TEXT,
                FOREIGN KEY (response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES feedback_questions(id) ON DELETE CASCADE
            );
        `);
        console.log('Created feedback_answers table');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Schema creation failed:', error);
        process.exit(1);
    }
}

runResponseSchema();
