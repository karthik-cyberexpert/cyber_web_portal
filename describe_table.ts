import { pool } from './server/db.js';

async function describe() {
    try {
        const [res]: any = await pool.query('DESCRIBE student_profiles');
        console.log('--- START ---');
        for (const col of res) {
            console.log(`F: ${col.Field}`);
        }
        console.log('--- END ---');
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}
describe();
