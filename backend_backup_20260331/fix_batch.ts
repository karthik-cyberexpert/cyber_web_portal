import { pool } from './server/db.js';

async function fixBatch() {
  const connection = await pool.getConnection();
  try {
    const batchName = '2024-2028';
    console.log(`Updating batch ${batchName} to Semester 4...`);
    
    await connection.execute(
        'UPDATE batches SET current_semester = 4 WHERE name = ?',
        [batchName]
    );

    console.log('Update Complete.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixBatch();
