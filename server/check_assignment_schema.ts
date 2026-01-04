import { pool } from './db.js';

const checkAssignmentSchema = async () => {
    try {
        console.log("--- TABLE: assignments ---");
        const [rows] = await pool.query("DESCRIBE assignments");
        console.table(rows);
        
        console.log("--- TABLE: student_assignments (submissions) ---");
        try {
             const [subs] = await pool.query("DESCRIBE student_assignments");
             console.table(subs);
        } catch (e) {
            console.log("student_assignments table may not exist or has different name");
        }
    } catch (e) {
        console.error("Error describing assignments:", e);
    } finally {
        process.exit();
    }
};

checkAssignmentSchema();
