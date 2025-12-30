import { pool } from './server/db.js';

async function fix() {
    try {
        console.log('Attempting to update user_id 20...');
        const [result]: any = await pool.query(
            `UPDATE student_profiles 
             SET education_degree = ?, 
                 education_institution = ? 
             WHERE user_id = 20`,
            ['BE - CSE(CYBER SECURITY)', 'Adhiyamaan College of Engineering - Hosur (635109)']
        );
        console.log('Update result:', result);
        
        const [rows]: any = await pool.query('SELECT user_id, education_degree, education_institution FROM student_profiles WHERE user_id = 20');
        console.log('Verified data:', JSON.stringify(rows[0], null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}
fix();
