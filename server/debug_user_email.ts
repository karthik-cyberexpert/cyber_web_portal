
import { pool } from './db.js';

async function checkUser() {
    try {
        const [rows]: any = await pool.query("SELECT id, email, name FROM users WHERE email = 'student1@college.edu'");
        console.log('Users found:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkUser();
