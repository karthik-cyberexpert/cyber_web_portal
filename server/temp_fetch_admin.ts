
import { pool } from './db.js';

async function getAdmin() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE role = 'admin'");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

getAdmin();
