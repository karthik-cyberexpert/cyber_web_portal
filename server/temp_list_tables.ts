
import { pool } from './db.js';

async function listTables() {
  try {
    const [rows]: any = await pool.query("SHOW TABLES");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listTables();
