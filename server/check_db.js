import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'Cyber_Dept_Portal'
    };

    console.log(`Diagnostic for database: ${config.database}...`);
    
    const connection = await mysql.createConnection(config);

    try {
        console.log('--- Faculty Profiles Table ---');
        const [facultyCols] = await connection.query('DESCRIBE faculty_profiles');
        console.log(facultyCols.map(c => `${c.Field} (${c.Type})`).join(', '));

        console.log('\n--- Admin User Check ---');
        const [admins] = await connection.query("SELECT id, email, role FROM users WHERE role = 'admin' OR email = 'admin@css.com'");
        console.log(JSON.stringify(admins, null, 2));

    } catch (error) {
        console.error('Diagnostic failed:', error.message);
    } finally {
        await connection.end();
    }
}

check();
