
import { pool } from './db.js';
import { getStudentAttendancePercentage } from './attendance.utils.js';

async function debugStudent() {
    const email = 'student@css.com';
    console.log(`Debugging student: ${email}`);

    try {
        // 1. Get User ID
        const [users]: any = await pool.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('User not found!');
            process.exit(1);
        }
        const user = users[0];
        console.log('User found:', user);

        // 2. Check Profile
        const [profiles]: any = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
        if (profiles.length === 0) {
            console.log('Profile not found!');
        } else {
            console.log('Profile found:', profiles[0]);
        }

        const profile = profiles[0];

        // 3. Check Batch
        if (profile && profile.batch_id) {
            console.log(`Batch ID: ${profile.batch_id}`);
            const [batches]: any = await pool.query('SELECT * FROM batches WHERE id = ?', [profile.batch_id]);
            console.log('Batch:', batches[0]);
        } else {
            console.log('No Batch ID in profile');
        }

        // 4. Run the Dashboard Query
        console.log('Running Dashboard Query...');
        const [dashboardResult]: any = await pool.query(
            `SELECT sp.*, u.name, u.email, s.name as section_name, b.name as batch_name
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN sections s ON sp.section_id = s.id
             LEFT JOIN batches b ON sp.batch_id = b.id
             WHERE u.id = ?`,
            [user.id]
        );
        console.log('Dashboard Result:', dashboardResult[0]);
        
        if (dashboardResult[0]?.batch_name) {
             console.log("Batch Name is present:", dashboardResult[0].batch_name);
        } else {
             console.log("Batch Name is MISSING or NULL");
        }

        console.log('Checking Attendance Calculation...');
        const att = await getStudentAttendancePercentage(user.id);
        console.log('Attendance Result:', att);

        console.log('Checking Assignment Query...');
        const section_id = dashboardResult[0].section_id;
        const studentId = user.id;

        const [assignmentCounts]: any = await pool.query(
            `SELECT 
                COUNT(DISTINCT a.id) as total_assignments,
                COUNT(DISTINCT asub.id) as submitted_assignments
             FROM assignments a
             JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
             LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
             WHERE sa.section_id = ?`,
            [studentId, section_id]
        );
        console.log('Assignment Counts:', assignmentCounts[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

debugStudent();
