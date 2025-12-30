import { pool } from './server/db.js';

async function checkSchema() {
    try {
        const [rows]: any = await pool.query('DESCRIBE users');
        console.log('START_USERS');
        rows.forEach((row: any) => {
            console.log(row.Field);
        });
        console.log('END_USERS');
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err);
        process.exit(1);
    }
}

checkSchema();
