
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

async function cleanupTestData() {
    try {
        console.log("Cleaning up Test Data...");

        // 1. Delete Test Student
        const [users]: any = await pool.query("SELECT id FROM users WHERE email = 'test.dynamic@test.com'");
        if (users.length > 0) {
            const userId = users[0].id;
            await pool.query("DELETE FROM student_profiles WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM users WHERE id = ?", [userId]);
            console.log(`Deleted Test Student (ID: ${userId})`);
        }

        // 2. Delete Test Allocation
        // Need to find allocation for 'Test Subject Sem 3'
        const [subjects]: any = await pool.query("SELECT id FROM subjects WHERE code = 'TS300'");
        if (subjects.length > 0) {
            const subjectId = subjects[0].id;
            await pool.query("DELETE FROM subject_allocations WHERE subject_id = ?", [subjectId]);
            await pool.query("DELETE FROM subjects WHERE id = ?", [subjectId]);
             console.log(`Deleted Test Subject (ID: ${subjectId})`);
        }

        // 3. Delete Test Section & Batch
        const [batches]: any = await pool.query("SELECT id FROM batches WHERE name = 'Test Dynamic Batch'");
        if (batches.length > 0) {
            const batchId = batches[0].id;
            // Delete sections first
            await pool.query("DELETE FROM sections WHERE batch_id = ?", [batchId]);
            // Delete batch
            await pool.query("DELETE FROM batches WHERE id = ?", [batchId]);
            console.log(`Deleted Test Batch (ID: ${batchId})`);
        }
        
        console.log("Cleanup Complete.");

    } catch (e) {
        console.error("Cleanup Error:", e);
    } finally {
        await pool.end();
    }
}

cleanupTestData();
