
import { pool } from './db.js';

async function checkSchema() {
    try {
        console.log("=== student_profiles ===");
        const [spRows]: any = await pool.query("DESCRIBE student_profiles");
        console.log(JSON.stringify(spRows, null, 2));

        console.log("\n=== batches ===");
        const [bRows]: any = await pool.query("DESCRIBE batches");
        console.log(JSON.stringify(bRows, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
