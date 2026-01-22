import { pool } from './db.js';

async function fixBatchRobust() {
  const connection = await pool.getConnection();
  try {
    const batchName = '2024-2028';
    console.log(`Checking batch ${batchName}...`);

    const [rows]: any = await connection.query("SELECT * FROM batches WHERE name = ?", [batchName]);
    if (rows.length === 0) {
        console.error("Batch not found!");
        process.exit(1);
    }
    console.log("Current State:", rows[0]);

    console.log(`Updating batch ${batchName} to Semester 4...`);
    
    // Set explicit dates for Sem 4 (Jan - May 2026)
    const startDate = '2026-01-01';
    const endDate = '2026-05-31';

    await connection.beginTransaction();
    await connection.execute(
        `UPDATE batches 
         SET current_semester = 4, 
             semester_dates_pending = 0,
             semester_start_date = ?,
             semester_end_date = ?
         WHERE name = ?`,
        [startDate, endDate, batchName]
    );
    await connection.commit();

    console.log('Update Complete. Verifying...');
    const [rows2]: any = await connection.query("SELECT * FROM batches WHERE name = ?", [batchName]);
    console.log("New State:", rows2[0]);

    if(rows2[0].current_semester === 4) {
        console.log("SUCCESS: Batch set to Sem 4.");
    } else {
        console.log("FAILURE: Batch didn't update.");
    }

    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
}
fixBatchRobust();
