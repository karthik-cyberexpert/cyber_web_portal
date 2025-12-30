import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        const sqlPath = path.join(process.cwd(), 'schema', 'add_education_details.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Executing ${statements.length} statements from add_education_details.sql...`);

        for (const statement of statements) {
            if (statement.startsWith('SELECT') || statement.startsWith('DESCRIBE')) {
                const [res] = await pool.query(statement);
                console.log('Result:', JSON.stringify(res, null, 2));
            } else {
                await pool.query(statement);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
run();
