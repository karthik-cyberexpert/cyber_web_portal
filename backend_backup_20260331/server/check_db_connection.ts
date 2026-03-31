
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
const envPath = path.join(__dirname, '.env');
console.log(`[INFO] Loading .env from: ${envPath}`);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('[SUCCESS] .env file found and loaded.');
} else {
    console.error('[CRITICAL WARNING] .env file NOT found! Server will use default/fallback values (which may fail).');
    console.error('[HINT] Create a .env file in the server directory with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.');
}

async function checkConnection() {
    console.log('\n=============================================');
    console.log('       SERVER DIAGNOSTIC & DB CHECKER       ');
    console.log('=============================================\n');

    console.log('--- SYSTEM INFORMATION ---');
    console.log(`OS: ${os.type()} ${os.release()} (${os.platform()})`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Current Working Dir: ${process.cwd()}`);
    console.log(`Server Directory: ${__dirname}`);
    
    console.log('\n--- FILE SYSTEM CHECKS ---');
    const uploadsPath = path.join(__dirname, '../uploads');
    const distPath = path.join(__dirname, '../dist');
    
    console.log(`Checking 'uploads' directory: ${uploadsPath}`);
    if (fs.existsSync(uploadsPath)) {
        console.log(`[OK] 'uploads' directory exists.`);
    } else {
        console.warn(`[WARNING] 'uploads' directory MISSING! File uploads will fail.`);
        try {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log(`[FIXED] Created 'uploads' directory.`);
        } catch (e: any) {
            console.error(`[ERROR] Failed to create 'uploads' directory: ${e.message}`);
        }
    }

    console.log(`Checking 'dist' (frontend build): ${distPath}`);
    if (fs.existsSync(distPath)) {
        console.log(`[OK] 'dist' directory exists.`);
    } else {
        console.warn(`[WARNING] 'dist' directory MISSING! Frontend will not be served via Express (Dev mode might be fine).`);
    }

    console.log('\n--- DATABASE CONFIGURATION (Masked) ---');
    console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost (default)'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'root (default)'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'Cyber_Dept_Portal (default)'}`);
    console.log(`DB_PORT: ${process.env.DB_PORT || '3306 (default)'}`);
    const hasPassword = !!process.env.DB_PASSWORD;
    console.log(`DB_PASSWORD: ${hasPassword ? '****** (Set)' : '(Empty/Unset)'}`);

    console.log('\n--- CONNECTING TO DATABASE ---');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'Cyber_Dept_Portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('[SUCCESS] Connected to MySQL server successfully!');

        // Check if database exists and we are using it
        const [dbResult]: any = await connection.query('SELECT DATABASE() as db');
        console.log(`[INFO] Connected to Database Schema: ${dbResult[0].db}`);

        console.log('\n--- VERIFYING CRITICAL TABLES ---');
        
        const tablesToCheck = [
            { name: 'users', critical: true, warning: 'You won\'t be able to login.' },
            { name: 'departments', critical: true, warning: 'FK constraints will fail for new records.' },
            { name: 'academic_years', critical: true, warning: 'Subject assignment and academic features will fail.' },
            { name: 'batches', critical: true, warning: 'Student grouping will fail.' },
            { name: 'sections', critical: false, warning: 'Section data missing.' }
        ];

        for (const table of tablesToCheck) {
             try {
                const [rows]: any = await connection.query(`SELECT COUNT(*) as count FROM ${table.name}`);
                console.log(`[OK] Table '${table.name}' exists. Rows: ${rows[0].count}`);
                if (rows[0].count === 0 && table.critical) {
                    console.warn(`   [WARNING] Table '${table.name}' is EMPTY! ${table.warning}`);
                }
            } catch (tableError: any) {
                console.error(`[ERROR] Table '${table.name}' MISSING or invalid! Message: ${tableError.message}`);
            }
        }

        await connection.end();
        console.log('\n=============================================');
        console.log('       DIAGNOSTIC COMPLETED SUCCESSFULLY      ');
        console.log('=============================================\n');

    } catch (error: any) {
        console.error('\n[FATAL ERROR] Database Connection Failed!');
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code}`);
        console.error(`Errno: ${error.errno}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n[TROUBLESHOOTING] Connection Refused.');
            console.error('1. Is MySQL Server running?');
            console.error('2. Is it listening on the configured port?');
            console.error('3. Does the host name resolve?');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n[TROUBLESHOOTING] Access Denied.');
            console.error('1. Check DB_USER and DB_PASSWORD in .env');
            console.error('2. Ensure this user has permission to connect from this host.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n[TROUBLESHOOTING] Database Not Found.');
            console.error(`1. The database '${process.env.DB_NAME || 'Cyber_Dept_Portal'}' does not exist.`);
            console.error('2. Run the SQL initialization script to create the schema.');
        }
        process.exit(1);
    }
}

checkConnection();
