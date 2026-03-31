import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function fix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'Cyber_Dept_Portal'
    });

    const hash = await bcrypt.hash('password123', 10);
    console.log('Final Hash:', hash);

    await connection.execute('UPDATE users SET password_hash = ? WHERE email = "admin@css.com"', [hash]);
    console.log('Update successful');
    await connection.end();
}

fix();
