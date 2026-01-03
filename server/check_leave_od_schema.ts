import { pool } from './db.js';

async function checkSchema() {
    try {
        const [leaveColumns]: any = await pool.query('DESCRIBE leave_requests');
        const [odColumns]: any = await pool.query('DESCRIBE od_requests');

        const fs = await import('fs/promises');
        await fs.writeFile('schema_output.json', JSON.stringify({
            leave_requests: leaveColumns,
            od_requests: odColumns
        }, null, 2));
        console.log('Schema saved to schema_output.json');

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await pool.end();
    }
}

checkSchema();
