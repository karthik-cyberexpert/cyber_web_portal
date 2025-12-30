import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'schema', 'add_section_to_circulars.sql'), 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            await pool.query(statement);
        }
        
        console.log('✅ Migration completed successfully');
    } catch (e) {
        console.error('❌ Migration failed:', e);
    } finally {
        process.exit(0);
    }
}

migrate();
