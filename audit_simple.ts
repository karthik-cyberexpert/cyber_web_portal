import { pool } from './server/db.js';

async function audit() {
  const connection = await pool.getConnection();
  console.log('Connected');
  try {
    const [users]: any = await connection.query("SELECT id, email, role FROM users");
    console.log('Users:', users.length);
    users.forEach((u: any) => console.log(`${u.id}: ${u.email} (${u.role})`));

    const [profiles]: any = await connection.query("SELECT user_id FROM student_profiles");
    console.log('Profiles:', profiles.length);

    const orphanCount = users.filter((u: any) => u.role === 'student' && !profiles.find((p: any) => p.user_id === u.id)).length;
    console.log('Orphans:', orphanCount);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
audit();
