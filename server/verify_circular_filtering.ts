
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function verifyCircularFiltering() {
    try {
        console.log("Verifying Circular Filtering...");

        // 1. Find a student and their batch
        const [students]: any = await pool.query(`
            SELECT u.id, u.name, sp.batch_id, b.semester_start_date 
            FROM users u 
            JOIN student_profiles sp ON u.id = sp.user_id 
            JOIN batches b ON sp.batch_id = b.id
            WHERE u.role = 'student' 
            LIMIT 1
        `);

        if (students.length === 0) {
            console.log("No students found.");
            return;
        }

        const student = students[0];
        console.log(`Testing with Student: ${student.name} (ID: ${student.id})`);
        console.log(`Batch ID: ${student.batch_id}, Semester Start Date: ${student.semester_start_date}`);

        if (!student.semester_start_date) {
            console.log("WARNING: Student's batch has no semester_start_date set. Setting a temporary one for testing...");
             // Set start date to today to test filtering (implies everything before today should be hidden)
             // Or set to 1 month ago.
             // Let's rely on user to interpret 'null' as 'show all' or we can force set it.
             // For valid test, let's assume we want to filter things from LAST YEAR.
        }

        // 2. Fetch Circulars using the logic from controller (simulated)
        let query = `
            SELECT c.id, c.title, c.created_at 
            FROM circulars c 
            WHERE 1=1
        `;
        const params: any[] = [];

        // Apply student Logic
        query += ` AND c.audience IN ('Students', 'All')`;
        
        if (student.semester_start_date) {
            query += ` AND c.created_at >= ?`;
            params.push(student.semester_start_date);
            console.log(`Applying Date Filter: >= ${student.semester_start_date}`);
        } else {
             console.log("No Date Filter applied (start date is null)");
        }
        
        // Sorting
        query += ` ORDER BY c.created_at DESC`;

        const [circulars]: any = await pool.query(query, params);
        console.log(`\nFound ${circulars.length} circulars for this student context.`);
        
        if (circulars.length > 0) {
            console.table(circulars.map((c: any) => ({
                id: c.id,
                title: c.title,
                created_at: c.created_at
            })));
        }

        // 3. Compare with Raw Circulars (Pre-Filter) to see if anything was dropped
        const [allCirculars]: any = await pool.query("SELECT COUNT(*) as count FROM circulars WHERE audience IN ('Students', 'All')");
        console.log(`Total Student-Audience Circulars in DB: ${allCirculars[0].count}`);

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await pool.end();
    }
}

verifyCircularFiltering();
