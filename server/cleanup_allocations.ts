
import { pool } from './db.js';

async function cleanupAllocations() {
    console.log('Cleaning up Admin Allocations...');
    try {
        // Delete allocations for admins
        const [result]: any = await pool.query(`
            DELETE sa FROM subject_allocations sa
            JOIN users u ON sa.faculty_id = u.id
            WHERE u.role = 'admin'
        `);
        console.log(`Deleted ${result.affectedRows} invalid allocations.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupAllocations();
