
import { pool } from './db.js';

async function debugAllocations() {
    console.log('Testing Allocations Query...');
    try {
        // 1. Check if section exists
        const [sections]: any = await pool.query('SELECT id FROM sections LIMIT 1');
        if (sections.length === 0) {
            console.log('No sections found to test with.');
            process.exit(0);
        }
        const sectionId = sections[0].id;
        console.log(`Testing with Section ID: ${sectionId}`);

        // 2. Run the query
        const query = `
            SELECT 
                sa.faculty_id, 
                sub.name as subject_name,
                u.name as faculty_name 
            FROM subject_allocations sa
            JOIN subjects sub ON sa.subject_id = sub.id
            JOIN users u ON sa.faculty_id = u.id
            WHERE sa.section_id = ?
        `;
        console.log('Query:', query);
        
        const [rows]: any = await pool.query(query, [sectionId]);
        console.log('Result:', JSON.stringify(rows, null, 2));

        process.exit(0);
    } catch (error: any) {
        console.error('Query Failed!');
        console.error('Message:', error.message);
        console.error('SQL State:', error.sqlState);
        process.exit(1);
    }
}

debugAllocations();
