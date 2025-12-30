import { pool } from './server/db.js';

async function check() {
    try {
        const [rows]: any = await pool.query('SELECT user_id as uid, education_degree as deg, education_institution as inst FROM student_profiles');
        console.log(JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
