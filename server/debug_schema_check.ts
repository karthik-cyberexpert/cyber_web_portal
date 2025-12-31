
import { pool } from './db.js';

async function checkSchema() {
    try {
        const [usersCols]: any = await pool.query("DESCRIBE users");
        const [profilesCols]: any = await pool.query("DESCRIBE student_profiles");

        console.log('--- USERS COLUMNS ---');
        console.log(usersCols.map((c: any) => c.Field).join(', '));

        console.log('\n--- PROFILES COLUMNS ---');
        console.log(profilesCols.map((c: any) => c.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
