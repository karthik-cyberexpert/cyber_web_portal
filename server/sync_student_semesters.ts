
import { pool } from './db.js';

async function syncSemesters() {
    console.log('--- SYNCING STUDENT SEMESTERS WITH BATCH LEVELS ---');
    try {
        const connection = await pool.getConnection();
        
        // Update student_profiles.current_semester to match batches.current_semester
        // This sets the baseline for all existing students
        const [result]: any = await connection.query(`
            UPDATE student_profiles sp
            JOIN batches b ON sp.batch_id = b.id
            SET sp.current_semester = b.current_semester
            WHERE sp.current_semester = 1 -- Only update those currently at default
        `);

        console.log(`[SUCCESS] Synced semesters for ${result.affectedRows} students.`);

        connection.release();
    } catch (error) {
        console.error('[ERROR] Failed to sync semesters:', error);
    } finally {
        process.exit();
    }
}

syncSemesters();
