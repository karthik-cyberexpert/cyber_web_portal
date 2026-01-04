import { pool } from './db.js';

const addSubjectType = async () => {
    const connection = await pool.getConnection();
    try {
        console.log("Checking for 'type' column in subjects table...");
        try {
            // Attempt to add the column. strict sql might fail if it exists, or we catch duplicate column error
            await connection.query("ALTER TABLE subjects ADD COLUMN type ENUM('theory', 'lab', 'integrated') NOT NULL DEFAULT 'theory'");
            console.log("SUCCESS: Added 'type' column to subjects table.");
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("SKIPPED: 'type' column already exists.");
            } else {
                console.error("Alter Error:", e);
            }
        }
    } catch (e: any) {
        console.error("General Error:", e);
    } finally {
        connection.release();
        process.exit();
    }
};

addSubjectType();
