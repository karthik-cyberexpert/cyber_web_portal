import { pool } from './db.js';
import bcrypt from 'bcrypt';

async function debug() {
    const email = 'admin@css.com';
    const password = 'password123';

    console.log('--- STARTING AUTH DEBUG ---');
    console.log(`Checking for user: ${email}`);

    try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            console.log('❌ ERROR: User not found in database.');
            const [allUsers]: any = await pool.query('SELECT email FROM users LIMIT 5');
            console.log('Available emails in DB:', allUsers.map((u: any) => u.email));
            return;
        }

        const user = rows[0];
        console.log('✅ User found in database.');
        console.log('Stored Hash:', user.password_hash);
        console.log('Role:', user.role);

        // Test bcrypt directly
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (match) {
            console.log('🎉 SUCCESS: Password matches! Logic is working.');
        } else {
            console.log('❌ ERROR: Password does NOT match the hash.');
            
            // Generate what the hash SHOULD be right now for comparison
            const newHash = await bcrypt.hash(password, 10);
            console.log('Current expected hash for "password123":', newHash);
        }

    } catch (error: any) {
        console.error('❌ DATABASE ERROR:', error.message);
    } finally {
        await pool.end();
        console.log('--- DEBUG FINISHED ---');
    }
}

debug();
