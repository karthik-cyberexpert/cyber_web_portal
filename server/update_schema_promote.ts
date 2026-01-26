
import { pool } from './db.js';

async function updateSchema() {
    console.log('--- UPDATING SCHEMA FOR PROMOTION FEATURE ---');
    try {
        const connection = await pool.getConnection();
        
        // Check if column exists
        const [columns]: any = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'Cyber_Dept_Portal'}' 
            AND TABLE_NAME = 'student_profiles' 
            AND COLUMN_NAME = 'current_semester'
        `);

        if (columns.length === 0) {
            console.log('Adding current_semester column...');
            await connection.query(`
                ALTER TABLE student_profiles
                ADD COLUMN current_semester INT DEFAULT 1 AFTER section_id
            `);
            console.log('[SUCCESS] Added current_semester column.');
        } else {
            console.log('[INFO] current_semester column already exists.');
        }

        connection.release();
    } catch (error) {
        console.error('[ERROR] Failed to update schema:', error);
    } finally {
        process.exit();
    }
}

updateSchema();
