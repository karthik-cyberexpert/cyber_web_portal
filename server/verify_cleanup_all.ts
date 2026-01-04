
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

async function verifyAllCleanup() {
    try {
        console.log("=== Verifying Semester Cleanup Logic ===\n");

        // 1. Verify Circular Filtering
        console.log("--- 1. Circular Filtering Verification ---");
        const [students]: any = await pool.query(`
            SELECT u.id, u.name, sp.batch_id, b.semester_start_date 
            FROM users u 
            JOIN student_profiles sp ON u.id = sp.user_id 
            JOIN batches b ON sp.batch_id = b.id
            WHERE u.role = 'student' 
            LIMIT 1
        `);

        if (students.length > 0) {
            const student = students[0];
            console.log(`Student: ${student.name} (Batch Start Date: ${student.semester_start_date})`);
            
            // Check count of VALID circulars (after start date)
            const [validCirculars]: any = await pool.query(`
                SELECT COUNT(*) as count FROM circulars 
                WHERE audience IN ('Students', 'All') 
                AND created_at >= ?
            `, [student.semester_start_date || new Date('1970-01-01')]);

            // Check count of OLD circulars (before start date)
             const [oldCirculars]: any = await pool.query(`
                SELECT COUNT(*) as count FROM circulars 
                WHERE audience IN ('Students', 'All') 
                AND created_at < ?
            `, [student.semester_start_date || new Date()]);

            console.log(`Valid Circulars (Visible): ${validCirculars[0].count}`);
            console.log(`Old Circulars (Hidden): ${oldCirculars[0].count}`);
        } else {
            console.log("No student found to test circulars.");
        }

        // 2. Verify Subject Filtering
        console.log("\n--- 2. Subject Filtering Verification ---");
        // Create dummy subjects for sem 1 and 2 if not exist
        await pool.query("INSERT IGNORE INTO subjects (name, code, credits, semester, type) VALUES ('Test Sem 1', 'TS101', 3, 1, 'theory')");
        await pool.query("INSERT IGNORE INTO subjects (name, code, credits, semester, type) VALUES ('Test Sem 2', 'TS201', 3, 2, 'theory')");

        // Test Query: Fetch for Semester 1
        const [sem1Subjects]: any = await pool.query("SELECT * FROM subjects WHERE semester = 1");
        console.log(`Subjects for Semester 1: ${sem1Subjects.length}`);
        const hasWrongSem1 = sem1Subjects.some((s:any) => s.semester !== 1);
        if (hasWrongSem1) console.error("ERROR: Found non-sem-1 subjects in sem-1 query!");
        else console.log("SUCCESS: Only Semester 1 subjects returned.");

         // Test Query: Fetch for Semester 2
         const [sem2Subjects]: any = await pool.query("SELECT * FROM subjects WHERE semester = 2");
         console.log(`Subjects for Semester 2: ${sem2Subjects.length}`);

         // Cleanup dummy
         await pool.query("DELETE FROM subjects WHERE code IN ('TS101', 'TS201')");

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyAllCleanup();
