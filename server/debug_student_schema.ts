
import { pool } from './db.js';

async function debugStudentSchema() {
    try {
        const [cols]: any = await pool.query('SHOW COLUMNS FROM student_profiles');
        console.log('STUDENT_PROFILES:', JSON.stringify(cols.map((c: any) => c.Field)));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugStudentSchema();
