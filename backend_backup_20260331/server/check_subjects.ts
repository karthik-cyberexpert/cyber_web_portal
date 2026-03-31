import { pool } from './db.js';

async function check() {
    try {
        const [counts]: any = await pool.query('SELECT semester, COUNT(*) as count FROM subjects GROUP BY semester');
        console.log('Semester Counts:', counts);
        
        const [all]: any = await pool.query('SELECT id, name, code, semester FROM subjects');
        console.log('All Subjects:', all);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
