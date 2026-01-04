import { pool } from './db.js';

const checkMarksSchema = async () => {
    try {
        console.log("--- TABLE: marks ---");
        const [rows] = await pool.query("DESCRIBE marks");
        console.table(rows);
    } catch (e) {
        console.error("Error describing marks:", e);
    } finally {
        process.exit();
    }
};

checkMarksSchema();
