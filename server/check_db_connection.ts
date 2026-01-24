
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkConnection() {
    console.log('--- DATABASE CONNECTION CHECK ---');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'Cyber_Dept_Portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('\n[SUCCESS] Connected to server successfully!');

        // Check if database exists and we are using it
        const [dbResult]: any = await connection.query('SELECT DATABASE() as db');
        console.log(`[INFO] Current Database: ${dbResult[0].db}`);

        // Check for 'batches' table
        try {
            const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM batches');
            console.log(`[SUCCESS] Table 'batches' found. Row count: ${rows[0].count}`);
        } catch (tableError: any) {
            console.error(`\n[ERROR] Could not query 'batches' table: ${tableError.message}`);
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                console.error('[HINT] The table "batches" does not exist. Did you import the SQL schema?');
            }
        }

        // Check for 'sections' table
        try {
            const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM sections');
            console.log(`[SUCCESS] Table 'sections' found. Row count: ${rows[0].count}`);
        } catch (tableError: any) {
             console.log(`[WARNING] Could not query 'sections': ${tableError.message}`);
        }

        await connection.end();

    } catch (error: any) {
        console.error('\n[FATAL ERROR] Connection Failed!');
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('[HINT] Is MySQL running? Is the port correct?');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('[HINT] Check your DB_USER and DB_PASSWORD in .env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('[HINT] Database "Cyber_Dept_Portal" does not exist. Run "CREATE DATABASE Cyber_Dept_Portal;"');
        }
    }
    console.log('\n---------------------------------');
}

checkConnection();
