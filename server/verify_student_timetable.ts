
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

async function verifyStudentTimetable() {
    try {
        console.log("=== Verifying Student Timetable Sync ===\n");

        // 1. Setup Test Data (Similar to Dynamic View test but for Timetable)
        const [batchRes]: any = await pool.query("INSERT INTO batches (name, department_id, start_year, end_year, current_semester) VALUES ('Test Sync Batch', 1, 2024, 2028, 5)");
        const batchId = batchRes.insertId;

        const [secRes]: any = await pool.query("INSERT INTO sections (batch_id, name) VALUES (?, 'SyncSec')", [batchId]);
        const sectionId = secRes.insertId;

        const [subRes]: any = await pool.query("INSERT INTO subjects (name, code, credits, semester, type) VALUES ('Sync Subject', 'SYN500', 3, 5, 'theory')");
        const subjectId = subRes.insertId;

        const [userRes]: any = await pool.query("INSERT INTO users (name, email, role, password_hash, phone) VALUES ('Sync Student', 'sync@test.com', 'student', 'hash', '1112223333')");
        const studentId = userRes.insertId;
        
        await pool.query(`
             INSERT INTO student_profiles (
                user_id, roll_number, register_number, batch_id, section_id, 
                dob, gender, blood_group, guardian_name, guardian_phone
            ) VALUES (?, 'SYN001', 'SYN001', ?, ?, '2000-01-01', 'Male', 'O+', 'Parent', '9999999999')
        `, [studentId, batchId, sectionId]);

        // Allocation
        const [facRes]: any = await pool.query("SELECT id FROM users WHERE role = 'faculty' LIMIT 1");
        const facultyId = facRes[0].id;
        const [allRes]: any = await pool.query("INSERT INTO subject_allocations (subject_id, faculty_id, section_id, is_active) VALUES (?, ?, ?, TRUE)", [subjectId, facultyId, sectionId]);
        const allocationId = allRes.insertId;

        // Timetable Slot
        await pool.query("INSERT INTO timetable_slots (section_id, day_of_week, period_number, subject_allocation_id, room_number) VALUES (?, 'Monday', 1, ?, '101')", [sectionId, allocationId]);

        console.log("Setup Complete. Batch Sem: 5, Subject Sem: 5. Allocation Active.");

        // 2. Fetch Timetable (Should see 1 slot)
        // Simulate the query from controller
        const [slots1]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE ts.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [sectionId]);

        console.log(`Slots Found (Sem 5): ${slots1.length}`);
        if (slots1.length === 1) console.log("SUCCESS: Slot visible.");
        else console.error("FAILURE: Slot missing.");

        // 3. Update Batch to Sem 6
        console.log("\n--- Moving Batch to Sem 6 ---");
        await pool.query("UPDATE batches SET current_semester = 6 WHERE id = ?", [batchId]);

        // 4. Fetch Timetable (Should see 0 slots)
        const [slots2]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE ts.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [sectionId]);

        console.log(`Slots Found (Sem 6): ${slots2.length}`);
        if (slots2.length === 0) console.log("SUCCESS: Slot hidden (Semester mistmatch).");
        else console.error("FAILURE: Slot still visible!");

        // 5. Cleanup
        await pool.query("DELETE FROM timetable_slots WHERE section_id = ?", [sectionId]);
        await pool.query("DELETE FROM subject_allocations WHERE id = ?", [allocationId]);
        await pool.query("DELETE FROM subjects WHERE id = ?", [subjectId]);
        await pool.query("DELETE FROM student_profiles WHERE user_id = ?", [studentId]);
        await pool.query("DELETE FROM users WHERE id = ?", [studentId]);
        await pool.query("DELETE FROM sections WHERE id = ?", [sectionId]);
        await pool.query("DELETE FROM batches WHERE id = ?", [batchId]);
        console.log("Cleanup Complete.");

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyStudentTimetable();
