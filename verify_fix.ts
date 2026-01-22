import { pool } from './server/db.js';

async function verifyDb() {
  const connection = await pool.getConnection();
  try {
    const [batches]: any = await connection.query("SELECT * FROM batches");
    console.log('Batches:', batches);
    
    const [stats]: any = await connection.query(`
             SELECT 
                u.email,
                b.name as batch_name,
                IFNULL(b.current_semester, 1) as current_semester,
                CEIL(IFNULL(b.current_semester, 1) / 2) as current_year
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN batches b ON sp.batch_id = b.id
             WHERE u.email = 'student@css.com'
    `);
    console.log('Student Stats Query Result:', stats);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
verifyDb();
