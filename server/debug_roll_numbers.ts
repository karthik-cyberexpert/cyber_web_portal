
import { pool } from './db.js';

async function checkRollNumbers() {
    try {
        const [rows]: any = await pool.query("SELECT u.id, u.name, u.email, sp.roll_number FROM student_profiles sp JOIN users u ON sp.user_id = u.id");
        console.log('Students:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkRollNumbers();
