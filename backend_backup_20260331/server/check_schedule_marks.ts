import fs from 'fs';
import { pool } from './db.js';

async function check() {
    try {
        const [total]: any = await pool.query('SELECT COUNT(*) as count FROM marks WHERE schedule_id = 2');
        const [nonZero]: any = await pool.query('SELECT COUNT(*) as count FROM marks WHERE schedule_id = 2 AND marks_obtained > 0');
        const [sched]: any = await pool.query('SELECT * FROM schedules WHERE id = 2');
        
        const result = {
            total: total[0].count,
            nonZero: nonZero[0].count,
            category: sched[0]?.category,
            allMarks: (await pool.query('SELECT student_id, marks_obtained, status FROM marks WHERE schedule_id = 2'))[0]
        };

        fs.writeFileSync('checks.json', JSON.stringify(result, null, 2));
        console.log('Results written to checks.json');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
