import { pool } from './server/db';

async function migrate() {
    const connection = await pool.getConnection();
    try {
        console.log("Checking if 'grade' column exists in 'marks' table...");
        const [columns]: any = await connection.query("SHOW COLUMNS FROM marks LIKE 'grade'");
        
        if (columns.length === 0) {
            console.log("Adding 'grade' column...");
            await connection.query("ALTER TABLE marks ADD COLUMN grade VARCHAR(5) NULL AFTER marks_obtained");
            console.log("'grade' column added successfully.");
        } else {
            console.log("'grade' column already exists.");
        }
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        connection.release();
        process.exit();
    }
}

migrate();
