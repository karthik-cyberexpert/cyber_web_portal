
import { pool } from './db.js';

async function updateBatchSemester() {
  try {
    console.log('Updating Batch 2024-2028 to Semester 4...');
    
    // Update Batch
    const [result]: any = await pool.query(`
        UPDATE batches 
        SET current_semester = 4 
        WHERE name = '2024-2028'
    `);
    console.log(`Updated Batches: ${result.affectedRows}`);

    // Update Students in that batch to use the batch semester (ignoring their individual override if it was 1)
    const [studentResult]: any = await pool.query(`
        UPDATE student_profiles sp
        JOIN batches b ON sp.batch_id = b.id
        SET sp.current_semester = 4
        WHERE b.name = '2024-2028'
    `);
    console.log(`Updated Students: ${studentResult.affectedRows}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateBatchSemester();
