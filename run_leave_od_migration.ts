import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'schema', 'separate_leave_od_schema.sql'), 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
        
        console.log(`Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (stmt) {
                console.log(`\n[${i + 1}/${statements.length}] Executing...`);
                await pool.query(stmt);
            }
        }
        
        console.log('\n✅ Migration completed successfully');
        
        // Check counts
        const [leaves]: any = await pool.query('SELECT COUNT(*) as count FROM leave_requests');
        const [ods]: any = await pool.query('SELECT COUNT(*) as count FROM od_requests');
        console.log(`\n📊 Leave Requests: ${leaves[0].count}`);
        console.log(`📊 OD Requests: ${ods[0].count}`);
        
    } catch (e: any) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        process.exit(0);
    }
}

migrate();
