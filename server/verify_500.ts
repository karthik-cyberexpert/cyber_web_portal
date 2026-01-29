
import { pool } from './db';
import dotenv from 'dotenv';

dotenv.config();

async function checkHealth() {
    try {
        console.log('Checking Server Health...');
        const response = await fetch('http://localhost:3007/api/health');
        console.log('Health Check Status:', response.status);
        const data = await response.json();
        console.log('Health Check Data:', data);
    } catch (error: any) {
        console.error('Health Check Failed:', error.message);
    }
}

async function checkDB() {
    console.log('\nChecking Database Connection...');
    try {
        const connection = await pool.getConnection();
        console.log('Database Connected Successfully!');
        
        // Try a query that depends on the new schema changes (semester column)
        try {
            console.log('Verifying timetable_slots schema...');
             const [rows] = await connection.query('SHOW COLUMNS FROM timetable_slots LIKE "semester"');
             if ((rows as any[]).length > 0) {
                 console.log('Column "semester" exists in timetable_slots.');
             } else {
                 console.error('CRITICAL: Column "semester" MISSING in timetable_slots!');
             }
        } catch (err: any) {
            console.error('Schema Verification Failed:', err.message);
        }

        connection.release();
    } catch (error: any) {
        console.error('Database Connection Failed:', error.message);
    }
}

async function run() {
    await checkHealth();
    await checkDB();
    process.exit(0);
}

run();
