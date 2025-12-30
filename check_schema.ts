import { pool } from './server/db.js';

async function check() {
    try {
        const [rows]: any = await pool.query('DESCRIBE student_profiles');
        console.log('COLUMNS:', rows.map((r: any) => r.Field).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
