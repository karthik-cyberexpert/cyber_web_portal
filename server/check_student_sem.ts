import { pool } from './db.js';

async function check() {
    try {
        const [rows]: any = await pool.query(`
            SELECT sp.user_id, u.name, sp.current_semester, b.name as batch_name
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            JOIN batches b ON sp.batch_id = b.id
            WHERE b.name = '2024-2028'
            ORDER BY u.name ASC
            LIMIT 10
        `);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

check();
