import { pool } from './server/db.js';

async function check() {
    try {
        console.log("Checking for leave/OD tables...\n");
        
        const [tables]: any = await pool.query("SHOW TABLES LIKE '%request%'");
        console.log("Tables found:");
        console.table(tables);
        
        // Try to describe leave_requests
        try {
            const [leaveSchema]: any = await pool.query("DESCRIBE leave_requests");
            console.log("\nleave_requests schema:");
            console.table(leaveSchema);
        } catch (e: any) {
            console.log("\n❌ leave_requests table does not exist");
        }
        
        // Try to describe od_requests
        try {
            const [odSchema]: any = await pool.query("DESCRIBE od_requests");
            console.log("\nod_requests schema:");
            console.table(odSchema);
        } catch (e: any) {
            console.log("\n❌ od_requests table does not exist");
        }
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

check();
