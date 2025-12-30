import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'schema', 'approval_workflow_migration.sql'), 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
        
        console.log(`Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (stmt) {
                console.log(`\n[${i + 1}/${statements.length}] Executing...`);
                try {
                    await pool.query(stmt);
                } catch (e: any) {
                    // Ignore "Duplicate column" errors as they mean migration already ran
                    if (!e.message.includes('Duplicate column') && !e.message.includes('already exists')) {
                        throw e;
                    }
                }
            }
        }
        
        console.log('\n✅ Approval workflow migration completed successfully');
        
    } catch (e: any) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        process.exit(0);
    }
}

migrate();
