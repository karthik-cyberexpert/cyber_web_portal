import { pool } from './db.js';

async function fullCleanup() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log('Starting Full Cleanup...');

    // 1. Delete Dummy Users
    const dummyEmails = ['admin@css.com', 'student@css.com', 'faculty@css.com'];
    console.log(`Deleting users: ${dummyEmails.join(', ')}`);
    const qMarks = dummyEmails.map(() => '?').join(',');
    await connection.query(`DELETE FROM users WHERE email IN (${qMarks})`, dummyEmails);

    // 2. Delete Dummy Subjects
    const dummySubjects = ['CSS01', 'CSS02'];
    console.log(`Deleting subjects: ${dummySubjects.join(', ')}`);
    const qMarksSub = dummySubjects.map(() => '?').join(',');
    await connection.query(`DELETE FROM subjects WHERE code IN (${qMarksSub})`, dummySubjects);

    await connection.commit();
    console.log('Cleanup Successful!');
    process.exit(0);

  } catch (error) {
    await connection.rollback();
    console.error('Cleanup Failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

fullCleanup();
