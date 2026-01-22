import { pool } from './server/db.js';

async function auditProfile() {
  const connection = await pool.getConnection();
  try {
    const [students]: any = await connection.query(`
        SELECT u.email, sp.batch_id, b.name as batch_name, b.current_semester, b.id as bid
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN batches b ON sp.batch_id = b.id
        WHERE u.role = 'student'
    `);
    console.table(students);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
auditProfile();
