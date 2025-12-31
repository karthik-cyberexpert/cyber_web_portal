
import { pool } from './db.js';

async function debugSchema() {
    try {
        const [fpCols]: any = await pool.query('SHOW COLUMNS FROM faculty_profiles');
        console.log('FACULTY_PROFILES:', JSON.stringify(fpCols.map((c: any) => c.Field)));

        const [saCols]: any = await pool.query('SHOW COLUMNS FROM subject_allocations');
        console.log('SUBJECT_ALLOCATIONS:', JSON.stringify(saCols.map((c: any) => c.Field)));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugSchema();
