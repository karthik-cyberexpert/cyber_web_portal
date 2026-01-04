import { pool } from './db.js';

const checkSchema = async () => {
    try {
        const [rows] = await pool.query("DESCRIBE subjects");
        console.table(rows);
    } catch (e) {
        console.error("Error describing subjects:", e);
    } finally {
        process.exit();
    }
};

checkSchema();
