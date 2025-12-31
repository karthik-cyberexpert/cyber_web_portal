
import { pool } from './db.js';

async function updateDepartment() {
    try {
        console.log('Updating department details...');
        const [result]: any = await pool.query(
            "UPDATE departments SET name = 'Cyber Security Department', code = 'CSS' WHERE code = 'CSE'"
        );
        console.log(`Updated ${result.affectedRows} row(s).`);
        
        const [rows]: any = await pool.query("SELECT * FROM departments");
        console.log('Current Departments:', JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error('Error updating department:', error);
    } finally {
        process.exit();
    }
}

updateDepartment();
