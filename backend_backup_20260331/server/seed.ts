import { pool } from './db.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database.');

    // Check if admin exists
    const [rows]: any = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@orchids.edu']);
    
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)',
        ['admin@orchids.edu', hashedPassword, 'admin', 'System Admin']
      );
      console.log('Admin user created: admin@orchids.edu / admin123');
    } else {
      console.log('Admin user already exists.');
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
