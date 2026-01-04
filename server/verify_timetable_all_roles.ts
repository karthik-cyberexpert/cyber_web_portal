
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

async function verifyAllRolesTimetable() {
    try {
        console.log("=== Verifying Timetable Sync (Faculty, Tutor, Student) ===\n");

        // 1. Setup Data: Batch (Sem 1), Section, Subject (Sem 1), Faculty, Tutor
        const [batchRes]: any = await pool.query("INSERT INTO batches (name, department_id, start_year, end_year, current_semester) VALUES ('Mega Sync Batch', 1, 2024, 2028, 1)");
        const batchId = batchRes.insertId;

        const [secRes]: any = await pool.query("INSERT INTO sections (batch_id, name) VALUES (?, 'A')", [batchId]);
        const sectionId = secRes.insertId;

        const [subRes]: any = await pool.query("INSERT INTO subjects (name, code, credits, semester, type) VALUES ('Sync 101', 'SYN101', 3, 1, 'theory')");
        const subjectId = subRes.insertId;

        // Create Faculty
        const [facRes]: any = await pool.query("INSERT INTO users (name, email, role, password_hash, phone) VALUES ('Sync Faculty', 'syncfac@test.com', 'faculty', 'hash', '1234')");
        const facultyId = facRes.insertId;

        // Create Tutor (can be same user, but let's make separate for clarity)
        const [tutRes]: any = await pool.query("INSERT INTO users (name, email, role, password_hash, phone) VALUES ('Sync Tutor', 'synctut@test.com', 'faculty', 'hash', '5678')");
        const tutorId = tutRes.insertId;
        // Assign Tutor
        await pool.query("INSERT INTO tutor_assignments (faculty_id, section_id, batch_id, is_active) VALUES (?, ?, ?, TRUE)", [tutorId, sectionId, batchId]);

        // Allocation
        const [allRes]: any = await pool.query("INSERT INTO subject_allocations (subject_id, faculty_id, section_id, is_active) VALUES (?, ?, ?, TRUE)", [subjectId, facultyId, sectionId]);
        const allocationId = allRes.insertId;

        // Slot
        await pool.query("INSERT INTO timetable_slots (section_id, day_of_week, period_number, subject_allocation_id, room_number) VALUES (?, 'Monday', 1, ?, '101')", [sectionId, allocationId]);

        console.log(`Setup Done. Batch Sem: 1. Subject Sem: 1.`);

        // 2. Initial Fetch Test (Expect Success)
        console.log("\n--- Phase 1: Valid Semester ---");
        
        // Faculty View Check (via academic controller logic)
        const [facSlots]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE sa.faculty_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [facultyId]);
        console.log(`Faculty View Slots: ${facSlots.length} (Expected: 1)`);

        // Tutor View Check (via tutor controller logic)
        const [tutSlots]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE ts.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [sectionId]);
        console.log(`Tutor View Slots: ${tutSlots.length} (Expected: 1)`);


        // 3. Update Batch to Sem 2
        console.log("\n--- Phase 2: Batch Moved to Sem 2 ---");
        await pool.query("UPDATE batches SET current_semester = 2 WHERE id = ?", [batchId]);

        // 4. Fetch Test (Expect Empty/Hidden)
        
        // Faculty View
        const [facSlots2]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE sa.faculty_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [facultyId]);
        console.log(`Faculty View Slots: ${facSlots2.length} (Expected: 0)`);
        if (facSlots2.length === 0) console.log("SUCCESS: Faculty View Cleared.");
        else console.error("FAILURE: Faculty View shows stale data!");

        // Tutor View
        const [tutSlots2]: any = await pool.query(`
             SELECT ts.id FROM timetable_slots ts
             JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             JOIN sections sec ON ts.section_id = sec.id
             JOIN batches b ON sec.batch_id = b.id
             WHERE ts.section_id = ?
               AND sa.is_active = TRUE
               AND s.semester = b.current_semester
        `, [sectionId]);
        console.log(`Tutor View Slots: ${tutSlots2.length} (Expected: 0)`);
        if (tutSlots2.length === 0) console.log("SUCCESS: Tutor View Cleared.");
        else console.error("FAILURE: Tutor View shows stale data!");


        // 5. Cleanup
        await pool.query("DELETE FROM timetable_slots WHERE section_id = ?", [sectionId]);
        await pool.query("DELETE FROM subject_allocations WHERE id = ?", [allocationId]);
        await pool.query("DELETE FROM tutor_assignments WHERE faculty_id = ?", [tutorId]);
        await pool.query("DELETE FROM subjects WHERE id = ?", [subjectId]);
        await pool.query("DELETE FROM users WHERE id IN (?, ?)", [facultyId, tutorId]);
        await pool.query("DELETE FROM sections WHERE id = ?", [sectionId]);
        await pool.query("DELETE FROM batches WHERE id = ?", [batchId]);
        console.log("Cleanup Complete.");

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyAllRolesTimetable();
