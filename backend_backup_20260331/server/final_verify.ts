import { pool } from './db.js';

async function verify() {
    try {
        console.log('--- ALLOCATIONS DATA ---');
        const [rows]: any = await pool.query(`
            SELECT 
                sa.id as allocation_id,
                sa.faculty_id,
                u.name as faculty_name,
                sa.subject_id,
                s.name as subject_name,
                s.code as subject_code,
                sa.section_id
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN users u ON sa.faculty_id = u.id
        `);
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

verify();
