import { pool } from './db.js';
import fs from 'fs';
import path from 'path';

const runSchema = async () => {
    try {
        const schemaPath = path.join(process.cwd(), '../schema/create_lost_found_table.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running Lost and Found Schema...');
        await pool.query(schema);
        console.log('Lost and Found Schema executed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running schema:', error);
        process.exit(1);
    }
};

runSchema();
