
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function run() {
    try {
        const [rows] = await pool.query('SELECT id, file_url, submitted_at, student_id FROM assignment_submissions ORDER BY submitted_at DESC LIMIT 5');
        console.log('Latest Submissions:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

run();
