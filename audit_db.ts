import { pool } from './server/db.js';

async function audit() {
  const connection = await pool.getConnection();
  try {
    console.log('--- USERS ---');
    const [users]: any = await connection.query("SELECT id, name, email, role FROM users");
    console.table(users);

    console.log('\n--- STUDENT PROFILES ---');
    const [profiles]: any = await connection.query("SELECT user_id, roll_number, name FROM student_profiles");
    console.table(profiles);

    console.log('\n--- ORPHAN STUDENTS (Role Student but No Profile) ---');
    const orphanStudents = users.filter((u: any) => 
        u.role === 'student' && !profiles.find((p: any) => p.user_id === u.id)
    );
    console.table(orphanStudents);

    console.log('\n--- SUBJECTS ---');
    const [subjects]: any = await connection.query("SELECT id, name, code, semester FROM subjects");
    console.table(subjects);

    console.log('\n--- BATCHES ---');
    const [batches]: any = await connection.query("SELECT id, name, current_semester FROM batches");
    console.table(batches);

    process.exit(0);
  } catch (error) {
    console.error('Audit error:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

audit();
