
import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function applyFix() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'schema', 'fix_feedback_forms_columns.sql'), 'utf-8');
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }
        console.log('Feedback forms column fix applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

applyFix();
