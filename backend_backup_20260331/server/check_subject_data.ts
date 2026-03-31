import { pool } from './db.js';

async function checkAllocations() {
    try {
        const [users]: any = await pool.query('SELECT id, name, email, role FROM users');
        const [subjects]: any = await pool.query('SELECT id, name, code FROM subjects');
        const [sections]: any = await pool.query('SELECT id, name, batch_id FROM sections');
        const [allocations]: any = await pool.query('SELECT * FROM subject_allocations');

        console.log(JSON.stringify({ users, subjects, sections, allocations }, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkAllocations();
