import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'Cyber_Dept_Portal'
    });

    try {
        console.log('Checking student_profiles table...');
        const [columns]: any = await connection.query('DESCRIBE student_profiles');
        const hasSem = columns.some((c: any) => c.Field === 'current_semester');

        if (!hasSem) {
            console.log('Adding current_semester column to student_profiles...');
            await connection.query('ALTER TABLE student_profiles ADD COLUMN current_semester INT DEFAULT 1');
            console.log('Column added successfully.');
        } else {
            console.log('Column current_semester already exists.');
        }

        console.log('Checking batches table...');
        const [batchCols]: any = await connection.query('DESCRIBE batches');
        const batchHasSem = batchCols.some((c: any) => c.Field === 'current_semester');

        if (batchHasSem) {
            console.log('Migrating data from batches to student_profiles...');
            await connection.query(`
                UPDATE student_profiles sp 
                JOIN batches b ON sp.batch_id = b.id 
                SET sp.current_semester = b.current_semester
            `);
            console.log('Data migrated.');

            console.log('Dropping current_semester from batches...');
            await connection.query('ALTER TABLE batches DROP COLUMN current_semester');
            console.log('Column dropped from batches.');
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
