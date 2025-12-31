
import { pool } from './db.js';

async function checkDepartments() {
    try {
        const [rows]: any = await pool.query("SELECT * FROM departments");
        console.log('Departments:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.log('Error querying departments:', error);
    } finally {
        process.exit();
    }
}

checkDepartments();
