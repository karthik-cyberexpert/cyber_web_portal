import { pool } from './server/db.js';

async function check() {
    try {
        const [rows]: any = await pool.query('DESCRIBE circulars');
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
