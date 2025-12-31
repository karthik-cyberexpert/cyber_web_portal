
import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSchema = async () => {
    try {
        const schemaPath = path.join(__dirname, '../schema/create_grievance_table.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Running Grievance Schema...');
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }
        
        console.log('Grievance Schema executed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running schema:', error);
        process.exit(1);
    }
};

runSchema();
