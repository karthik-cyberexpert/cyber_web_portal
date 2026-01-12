
import { pool } from './db.js';

async function test() {
    // Replicating getApprovalStatus logic
    const [rows]: any = await pool.query(`
        SELECT 
            s.name as subjectName, 
            s.code as subjectCode,
            sec.id as sectionId,
            sec.name as sectionName,
            b.name as batchName,
            sch.category as examType,
            sch.id as scheduleId,
            fac.name as facultyName,
            tut.name as tutorName,
            COUNT(m.id) as studentCount,
            SUM(CASE WHEN m.status = 'pending_admin' THEN 1 ELSE 0 END) as pendingCount,
            MIN(m.created_at) as submittedAt,
            MIN(m.status) as markStatus
        FROM marks m
        JOIN schedules sch ON m.schedule_id = sch.id
        JOIN subjects s ON m.subject_id = s.id
        JOIN student_profiles sp ON m.student_id = sp.user_id
        JOIN sections sec ON sp.section_id = sec.id
        JOIN batches b ON sec.batch_id = b.id
        JOIN users fac ON m.faculty_id = fac.id
        LEFT JOIN users tut ON m.tutor_id = tut.id
        WHERE m.status IN ('pending_admin', 'approved')
        GROUP BY s.id, s.name, s.code, sec.id, sec.name, b.name, sch.id, sch.category, fac.name, tut.name
    `);
    console.log('Approval Status Rows:', rows);
    process.exit(0);
}
test();
