import { pool } from './db.js';
import fs from 'fs';

async function logCols() {
    const [b]: any = await pool.query('SHOW COLUMNS FROM batches');
    const [bd]: any = await pool.query('SHOW COLUMNS FROM batch_details');
    fs.writeFileSync('batch_cols.log', JSON.stringify({ batches: b, batch_details: bd }, null, 2));
    process.exit();
}
logCols();
