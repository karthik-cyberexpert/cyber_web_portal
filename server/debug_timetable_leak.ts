
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

async function debugTimetable() {
    try {
        console.log("=== Debugging Faculty Timetable Query ===\n");

        // 1. Find the Faculty 'Clora Paris' (from screenshot)
        const [users]: any = await pool.query("SELECT id, name FROM users WHERE name LIKE '%Clora%'");
        if (users.length === 0) {
            console.log("Faculty 'Clora' not found.");
            return;
        }
        const facultyId = users[0].id;
        console.log(`Faculty: ${users[0].name} (ID: ${facultyId})`);

        // 2. Run the EXACT query from academic.controller.ts
        const query = `
          SELECT ts.id, ts.day_of_week, ts.period_number,
                 s.name as subject, s.semester as subject_sem,
                 b.name as batch, b.current_semester as batch_sem,
                 sa.is_active
          FROM timetable_slots ts
          LEFT JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
          LEFT JOIN subjects s ON sa.subject_id = s.id
          LEFT JOIN users u ON sa.faculty_id = u.id
          LEFT JOIN sections sec ON ts.section_id = sec.id
          LEFT JOIN batches b ON sec.batch_id = b.id
          WHERE 1=1 
          AND sa.faculty_id = ?
          -- We interpret strict check:
          -- AND s.semester = b.current_semester
          -- AND sa.is_active = TRUE
        `;
        
        // Fetch RAW (without filters first to see what exists)
        console.log("\n--- RAW SLOTS (No Filters) ---");
        const [rawRows]: any = await pool.query(query, [facultyId]);
        console.table(rawRows);

        // Filter Check
        console.log("\n--- Applying Filter: s.semester = b.current_semester ---");
        const filtered = rawRows.filter((r: any) => r.subject_sem == r.batch_sem);
        console.table(filtered);
        
        console.log("\n--- Applying Filter: is_active = TRUE ---");
        const active = rawRows.filter((r: any) => r.is_active === 1);
        console.table(active);

        // Full Query Check
        console.log("\n--- CONTROLLER QUERY RESULT ---");
        const [finalRows]: any = await pool.query(`
          SELECT ts.id, s.name, s.semester, b.name, b.current_semester
          FROM timetable_slots ts
          LEFT JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
          LEFT JOIN subjects s ON sa.subject_id = s.id
          LEFT JOIN sections sec ON ts.section_id = sec.id
          LEFT JOIN batches b ON sec.batch_id = b.id
          WHERE sa.faculty_id = ?
          AND s.semester = b.current_semester
          AND sa.is_active = TRUE
        `, [facultyId]);
        console.table(finalRows);

         // Clean up Test Sync Batches if exist
         console.log("\n--- Cleaning up 'Test Sync Batch' ---");
         const [del]: any = await pool.query("DELETE FROM batches WHERE name = 'Test Sync Batch'");
         console.log(`Deleted ${del.affectedRows} batches.`);

    } catch (e) {
        console.error("Debug Error:", e);
    } finally {
        await pool.end();
    }
}

debugTimetable();
