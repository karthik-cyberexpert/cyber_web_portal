import { pool } from './db.js';

async function runMigration() {
    try {
        console.log('--- Starting Schema Fix for Approval Columns ---');

        // 1. Fix leave_requests
        try {
            console.log('Checking leave_requests...');
            const [leaveCols]: any = await pool.query("SHOW COLUMNS FROM leave_requests LIKE 'approved_by'");
            if (leaveCols.length === 0) {
                console.log('Adding approved_by column to leave_requests...');
                await pool.query("ALTER TABLE leave_requests ADD COLUMN approved_by VARCHAR(50) DEFAULT NULL AFTER approver_id");
                console.log('✓ Added approved_by to leave_requests');
            } else {
                console.log('✓ approved_by already exists in leave_requests');
            }
        } catch (e) {
            console.error('Error updating leave_requests:', e);
        }

        // 2. Fix od_requests
        try {
            console.log('Checking od_requests...');
            const [odCols]: any = await pool.query("SHOW COLUMNS FROM od_requests LIKE 'approved_by'");
            if (odCols.length === 0) {
                console.log('Adding approved_by column to od_requests...');
                await pool.query("ALTER TABLE od_requests ADD COLUMN approved_by VARCHAR(50) DEFAULT NULL AFTER approver_id");
                console.log('✓ Added approved_by to od_requests');
            } else {
                console.log('✓ approved_by already exists in od_requests');
            }
        } catch (e) {
            console.error('Error updating od_requests:', e);
        }

        console.log('\n✅ Migration completed!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
