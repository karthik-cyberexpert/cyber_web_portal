
import { pool } from './db.js';

async function testBatches() {
    try {
        console.log("Testing Get Batches Query...");
        const [rows]: any = await pool.query(`
          SELECT b.*,
          (SELECT COUNT(*) FROM sections s WHERE s.batch_id = b.id) as section_count_actual
          FROM batches b 
          ORDER BY b.start_year DESC
        `);
        console.log("Success! Rows:", rows);
    } catch (error: any) {
        console.error('Get Batches Error:', error);
    } finally {
        process.exit();
    }
}

testBatches();
