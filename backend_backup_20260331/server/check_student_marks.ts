import { pool } from './db.js';

async function check() {
    try {
        const [students]: any = await pool.query('SELECT id, name, email FROM users WHERE role = "student"');
        console.log('Students:', students);

        for (const s of students) {
            console.log(`\nMarks for ${s.name} (ID: ${s.id}):`);
            const [marks]: any = await pool.query(`
                SELECT m.*, sch.category, sub.name as subject_name
                FROM marks m
                JOIN schedules sch ON m.schedule_id = sch.id
                JOIN subjects sub ON m.subject_id = sub.id
                WHERE m.student_id = ?
            `, [s.id]);
            console.log(marks);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
