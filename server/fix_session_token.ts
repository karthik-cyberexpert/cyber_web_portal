
import { pool } from './db.js';

async function fixUserSchema() {
    console.log('--- ADDING MISSING session_token COLUMN ---');
    try {
        await pool.query('ALTER TABLE users ADD COLUMN session_token VARCHAR(255) AFTER password_changed');
        console.log('Successfully added session_token column to users table.');
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column session_token already exists.');
            process.exit(0);
        }
        console.error('Failed to add column:', error.message);
        process.exit(1);
    }
}

fixUserSchema();
