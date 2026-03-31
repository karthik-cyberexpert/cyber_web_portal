
import { pool } from './db.js';

async function test() {
    const [marks]: any = await pool.query(`
        SELECT COUNT(DISTINCT m.schedule_id, m.subject_id, sp.section_id) as count 
        FROM marks m 
        JOIN student_profiles sp ON m.student_id = sp.user_id
        WHERE m.status = 'pending_admin'
    `);
    console.log('Pending Marks Count:', marks[0].count);
    
    const [nulls]: any = await pool.query('SELECT m.student_id, sp.section_id FROM marks m LEFT JOIN student_profiles sp ON m.student_id = sp.user_id WHERE m.status = \"pending_admin\"');
    console.log('Pending Marks Section IDs:', nulls);
    
    process.exit(0);
}
test();
