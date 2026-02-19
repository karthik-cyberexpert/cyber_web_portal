
import { pool } from './db.js';

async function checkColumns() {
  try {
    const subjects = await pool.query("DESCRIBE subjects");
    console.log("SUBJECTS:", JSON.stringify(subjects[0], null, 2));
    
    const notifications = await pool.query("DESCRIBE notifications");
    console.log("NOTIFICATIONS:", JSON.stringify(notifications[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkColumns();
