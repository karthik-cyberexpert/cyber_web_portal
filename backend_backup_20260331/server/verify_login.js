import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function verifyLogin() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'Cyber_Dept_Portal'
    };

    const connection = await mysql.createConnection(config);

    try {
        const email = 'admin@css.com';
        const password = 'password123';
        
        console.log(`Attempting login for ${email}...`);
        
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            console.log('User not found!');
            return;
        }

        const user = users[0];
        console.log('User found:', user.email, 'Role:', user.role);
        console.log('Stored Hash:', user.password_hash);

        const match = await bcrypt.compare(password, user.password_hash);
        console.log('Password Match:', match);
        
        if (match) {
            console.log('LOGIN SUCCESSFUL via Script');
        } else {
            console.log('LOGIN FAILED via Script - Hash mismatch');
            console.log('Current Hash:', user.password_hash);
            
            // Force Update
            console.log('FIXING PASSWORD...');
            const newHash = await bcrypt.hash('password123', 10);
            await connection.execute('UPDATE users SET password_hash = ? WHERE email = ?', [newHash, email]);
            console.log('Password updated to new hash for password123');
            
            // Verify again
            const match2 = await bcrypt.compare(password, newHash);
            console.log('Re-verification Success:', match2);
        }

    } catch (error) {
        console.error('Login verify error:', error);
    } finally {
        await connection.end();
    }
}

verifyLogin();
