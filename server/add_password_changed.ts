
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function addPasswordChangedColumn() {
    try {
        console.log("Adding password_changed column to users table...");

        // Check if column exists
        const [columns]: any = await pool.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_changed'
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log("Column 'password_changed' already exists. Skipping.");
        } else {
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN password_changed BOOLEAN DEFAULT FALSE
            `);
            console.log("Column 'password_changed' added successfully.");

            // Mark existing admin as having changed password (so they don't get onboarding)
            await pool.query(`
                UPDATE users SET password_changed = TRUE WHERE role = 'admin'
            `);
            console.log("Admin users marked as password_changed = TRUE.");
        }

    } catch (e) {
        console.error("Migration Error:", e);
    } finally {
        await pool.end();
    }
}

addPasswordChangedColumn();
