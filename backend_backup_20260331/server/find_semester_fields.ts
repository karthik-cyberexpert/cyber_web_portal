import { pool } from './db.js';

async function findSemesterColumns() {
    try {
        const [rows]: any = await pool.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND (COLUMN_NAME LIKE '%semester%' OR COLUMN_NAME LIKE '%sem%')
        `);
        console.log('Tables and columns containing "semester" or "sem":');
        console.table(rows);
    } catch (e: any) {
        console.error('Error fetching columns:', e.message);
    } finally {
        process.exit();
    }
}

findSemesterColumns();
