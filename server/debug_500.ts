import { pool } from './db.js';

async function check() {
    try {
        const [subs]: any = await pool.query('SELECT * FROM subjects');
        console.log('All Subjects:', subs);
        
        const [allocs]: any = await pool.query('SELECT * FROM subject_allocations');
        console.log('All Allocations:', allocs);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
