
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

async function verifyFacultyDynamicView() {
    try {
        console.log("=== Verifying Faculty Dynamic View ===\n");

        // 1. Setup Test Data
        // Create a Batch in Sem 3
        const [batchRes]: any = await pool.query("INSERT INTO batches (name, department_id, start_year, end_year, current_semester) VALUES ('Test Dynamic Batch', 1, 2024, 2028, 3)");
        const batchId = batchRes.insertId;

        // Create Section
        const [secRes]: any = await pool.query("INSERT INTO sections (batch_id, name) VALUES (?, 'A')", [batchId]);
        const sectionId = secRes.insertId;

        // Create Subject for Sem 3
        const [sub3Res]: any = await pool.query("INSERT INTO subjects (name, code, credits, semester, type) VALUES ('Test Subject Sem 3', 'TS300', 3, 3, 'theory')");
        const subject3Id = sub3Res.insertId;

        // Create Student
        const [userRes]: any = await pool.query("INSERT INTO users (name, email, role, password_hash, phone) VALUES ('Test Student Dynamic', 'test.dynamic@test.com', 'student', 'hash', '1234567890')");
        const userId = userRes.insertId;
        // Fix: Add issue_date and valid_until if they are required (guessing based on previous error)
        // Or maybe it was another table? Let's try adding them to be safe if they exist, or maybe the error was from a trigger?
        // Actually, checking schema first would be ideal, but let's try standard fields first.
        // If error persists, I will check schema.
        await pool.query(`
            INSERT INTO student_profiles (
                user_id, roll_number, register_number, batch_id, section_id, 
                dob, gender, blood_group, guardian_name, guardian_phone,
                issue_date, valid_until
            ) VALUES (?, 'DYN001', 'DYN001', ?, ?, '2000-01-01', 'Male', 'O+', 'Parent', '9999999999', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 4 YEAR))
        `, [userId, batchId, sectionId]);

        // Create Allocation
        // Need a faculty... use existing or dummy.
        const [facRes]: any = await pool.query("SELECT id FROM users WHERE role = 'faculty' LIMIT 1");
        const facultyId = facRes[0].id;
        
        await pool.query("INSERT INTO subject_allocations (subject_id, faculty_id, section_id, is_active) VALUES (?, ?, ?, TRUE)", [subject3Id, facultyId, sectionId]);
        
        console.log(`Setup: Batch ${batchId} is in Sem 3. Subject ${subject3Id} is Sem 3. Student ${userId} is in Batch.`);

        // 2. Test Fetch (Should Success)
        console.log("\n--- Test 1: Batch Sem 3 vs Subject Sem 3 ---");
        const [students1]: any = await pool.query(`
            SELECT u.name FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            JOIN subjects s ON s.id = ?
            WHERE sp.section_id = ?
              AND s.semester = b.current_semester
        `, [subject3Id, sectionId]);
        
        console.log(`Students found: ${students1.length}`);
        if (students1.length === 1) console.log("SUCCESS: Student visible.");
        else console.error("FAILURE: Student NOT visible.");

        // 3. Update Batch to Sem 4
        console.log("\n--- Moving Batch to Semester 4 ---");
        await pool.query("UPDATE batches SET current_semester = 4 WHERE id = ?", [batchId]);

        // 4. Test Fetch (Should Fail/Empty)
        console.log("--- Test 2: Batch Sem 4 vs Subject Sem 3 ---");
        const [students2]: any = await pool.query(`
            SELECT u.name FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            JOIN subjects s ON s.id = ?
            WHERE sp.section_id = ?
              AND s.semester = b.current_semester
        `, [subject3Id, sectionId]);

        console.log(`Students found: ${students2.length}`);
        if (students2.length === 0) console.log("SUCCESS: Student hidden (Batch moved to next sem).");
        else console.error("FAILURE: Student still visible!");


        // Cleanup
        await pool.query("DELETE FROM subjects WHERE id = ?", [subject3Id]);
        await pool.query("DELETE FROM subject_allocations WHERE subject_id = ?", [subject3Id]);
        await pool.query("DELETE FROM student_profiles WHERE user_id = ?", [userId]);
        await pool.query("DELETE FROM users WHERE id = ?", [userId]);
        await pool.query("DELETE FROM sections WHERE id = ?", [sectionId]);
        await pool.query("DELETE FROM batches WHERE id = ?", [batchId]);

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyFacultyDynamicView();
