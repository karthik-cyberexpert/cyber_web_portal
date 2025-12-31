
import { pool } from './db.js';

async function debugData() {
    try {
        const query = `
            SELECT 
                sa.id as allocation_id,
                sa.section_id,
                sa.faculty_id as faculty_user_id,
                u.name as user_name,
                u.role as user_role,
                sub.name as subject_name
            FROM subject_allocations sa
            JOIN users u ON sa.faculty_id = u.id
            LEFT JOIN subjects sub ON sa.subject_id = sub.id
        `;
        const [rows]: any = await pool.query(query);
        console.log("ALLOCATION DATA:", JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugData();
