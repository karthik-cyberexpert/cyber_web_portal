import { pool } from './db.js';

async function check() {
    try {
        const [rows]: any = await pool.query('DESCRIBE circulars');
        rows.forEach((r: any) => {
            console.log(`${r.Field}: ${r.Type} | Null: ${r.Null} | Default: ${r.Default}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
