import { pool } from './server/db.js';

async function check() {
    try {
        const [users]: any = await pool.query('SELECT id, name, email, role FROM users WHERE name = "Tutor"');
        console.log("USER:", JSON.stringify(users[0], null, 2));
        
        if (users[0]) {
            const [assignments]: any = await pool.query('SELECT * FROM tutor_assignments WHERE faculty_id = ?', [users[0].id]);
            console.log("ASSIGNMENT:", JSON.stringify(assignments, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
