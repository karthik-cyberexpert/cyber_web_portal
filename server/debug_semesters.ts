
import { pool } from './db.js';

async function debugSemesters() {
  try {
    console.log('--- Batches ---');
    const [batches]: any = await pool.query('SELECT * FROM batches');
    console.table(batches);

    console.log('\n--- Student Profiles (Limit 5) ---');
    const [students]: any = await pool.query(`
        SELECT sp.user_id, sp.name, sp.current_semester as sp_sem, b.name as batch, b.current_semester as batch_sem 
        FROM student_profiles sp 
        JOIN batches b ON sp.batch_id = b.id 
        LIMIT 5
    `);
    console.table(students);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugSemesters();
