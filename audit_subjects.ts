import { pool } from './server/db.js';

async function auditSubjects() {
  const connection = await pool.getConnection();
  try {
    const [subjects]: any = await connection.query("SELECT * FROM subjects");
    console.log('Subjects:');
    console.table(subjects);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
auditSubjects();
