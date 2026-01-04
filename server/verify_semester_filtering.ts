
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

async function verifyFiltering() {
    try {
        console.log("Verifying Semester Filtering...");

        // 1. Get a Faculty ID to test
        const [faculties]: any = await pool.query("SELECT id, name FROM users WHERE role = 'faculty' LIMIT 1");
        if (faculties.length === 0) {
            console.log("No faculty found.");
            return;
        }
        const facultyId = faculties[0].id; // "4" in example
        console.log(`Testing with Faculty: ${faculties[0].name} (${facultyId})`);

        // 2. Test getFacultySubjectAllocations logic
        console.log("\n--- Testing Subject Allocations ---");
        const [allocations]: any = await pool.query(`
            SELECT 
                sa.id as allocation_id,
                s.name as subject_name,
                sec.name as section_name,
                b.name as batch_name,
                s.semester as subject_sem,
                b.current_semester as batch_sem,
                sa.section_id as original_section_id
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON (sa.section_id = sec.id OR sa.section_id IS NULL)
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? 
              AND sa.is_active = TRUE
              AND s.semester = b.current_semester
        `, [facultyId]);

        if (allocations.length > 0) {
            console.table(allocations);
        } else {
            console.log("No allocations found for this faculty in current semester.");
            // Debug: Check if any raw allocations exist
            const [raw]: any = await pool.query("SELECT * FROM subject_allocations WHERE faculty_id = ?", [facultyId]);
            console.log("Raw Allocations count:", raw.length);
        }

        // 3. Test Timetable
        console.log("\n--- Testing Timetable Filtering ---");
        // We need a batchId to test timetable
        const [batches]: any = await pool.query("SELECT id, current_semester FROM batches LIMIT 1");
        if (batches.length > 0) {
            const batchId = batches[0].id;
            const currentSem = batches[0].current_semester;
            
            const [timetable]: any = await pool.query(`
                SELECT ts.id, s.name as subject, ts.day_of_week
                FROM timetable_slots ts
                JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
                JOIN subjects s ON sa.subject_id = s.id
                JOIN sections sec ON ts.section_id = sec.id
                JOIN batches b ON sec.batch_id = b.id
                WHERE sec.batch_id = ?
                AND s.semester = b.current_semester
            `, [batchId]);
             console.log(`Timetable slots for Batch ${batchId} (Sem ${currentSem}):`, timetable.length);
        }


    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyFiltering();
