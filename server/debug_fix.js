import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'Cyber_Dept_Portal'
    };

    console.log(`Connecting to ${config.database} as ${config.user}...`);
    const connection = await mysql.createConnection(config);

    try {
        console.log('1. Checking Admin Hash...');
        const [users] = await connection.query("SELECT password_hash FROM users WHERE email='admin@css.com'");
        if (users.length > 0) {
            console.log('Admin Hash:', users[0].password_hash);
            if (users[0].password_hash.startsWith('$2b$10$agNv')) {
                console.log('SUCCESS: Admin hash matches v1.8.0');
            } else {
                console.log('FAILURE: Admin hash DOES NOT match v1.8.0');
            }
        } else {
            console.log('FAILURE: Admin user not found');
        }

        console.log('\n2. Running Failing Query...');
        const sql = `
            SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.role, fp.employee_id,
                   fp.qualification, fp.specialization, fp.experience_years as experience, 
                   fp.joining_date, u.address, d.name as department
            FROM users u
            LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
            LEFT JOIN departments d ON fp.department_id = d.id
            WHERE u.role IN ('faculty', 'tutor')
            ORDER BY u.name ASC
        `;
        const [rows] = await connection.query(sql);
        console.log(`SUCCESS: Query executed. Returned ${rows.length} rows.`);

    } catch (error) {
        console.error('FAILURE: Query Error:', error.code, error.message);
    } finally {
        await connection.end();
    }
}

debug();
