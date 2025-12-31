
import { pool } from './db.js';

async function addMissingColumns() {
    const connection = await pool.getConnection();
    try {
        console.log('Checking for missing columns...');

        // 1. Check/Add address to users
        try {
            await connection.query("SELECT address FROM users LIMIT 1");
            console.log('✓ address column exists in users');
        } catch (err) {
            console.log('Adding address column to users...');
            await connection.query("ALTER TABLE users ADD COLUMN address TEXT");
            console.log('✓ Added address column');
        }

        // 2. Check/Add columns to student_profiles
        const profileCols = ['guardian_name', 'guardian_phone', 'dob', 'gender'];
        
        for (const col of profileCols) {
             try {
                await connection.query(`SELECT ${col} FROM student_profiles LIMIT 1`);
                console.log(`✓ ${col} column exists in student_profiles`);
            } catch (err) {
                console.log(`Adding ${col} column to student_profiles...`);
                let def = "VARCHAR(255)";
                if (col === 'dob') def = "DATE";
                if (col === 'gender') def = "VARCHAR(50)";
                
                await connection.query(`ALTER TABLE student_profiles ADD COLUMN ${col} ${def}`);
                console.log(`✓ Added ${col} column`);
            }
        }

        console.log('Schema check complete.');

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

addMissingColumns();
