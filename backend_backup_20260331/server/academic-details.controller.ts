import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student academic details (CGPA, credits, semesters, etc.)
export const getAcademicDetails = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student profile
        const [students]: any = await pool.query(
            `SELECT sp.*, u.name, u.email, s.name as section_name, b.name as batch_name
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN sections s ON sp.section_id = s.id
             LEFT JOIN batches b ON sp.batch_id = b.id
             WHERE u.id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const student = students[0];

        // Calculate CGPA from marks
        const [cgpaData]: any = await pool.query(
            `SELECT 
                AVG(marks_obtained) as avg_marks,
                COUNT(DISTINCT subject_id) as total_subjects
             FROM marks
             WHERE student_id = ?`,
            [studentId]
        );

        // Convert average marks to CGPA (assume 10-point scale)
        // 90-100 = 10, 80-89 = 9, etc.
        let cgpa = 0;
        if (cgpaData[0]?.avg_marks) {
            const avgMarks = cgpaData[0].avg_marks;
            cgpa = Number((avgMarks / 10).toFixed(2));
        }

        // Count total credits (placeholder - needs course credits table)
        const totalCredits = cgpaData[0]?.total_subjects ? cgpaData[0].total_subjects * 4 : 0;

        // Count backlogs (subjects with marks < 40)
        const [backlogsData]: any = await pool.query(
            `SELECT COUNT(DISTINCT subject_id) as backlog_count
             FROM marks
             WHERE student_id = ? AND marks_obtained < 40`,
            [studentId]
        );

        const backlogs = backlogsData[0]?.backlog_count || 0;

        // Get semester-wise breakdown (placeholder)
        // This would need a proper semester tracking in marks table
        const semesters: any[] = [];

        const academicDetails = {
            studentInfo: {
                name: student.name,
                email: student.email,
                rollNumber: student.roll_number,
                registerNumber: student.register_number || student.roll_number,
                section: student.section_name,
                batch: student.batch_name,
                program: 'B.Tech', // Placeholder
                department: 'CSE', // Placeholder
                year: 2, // Placeholder - calculate from batch
                currentStatus: 'Active'
            },
            cgpa,
            totalCredits,
            backlogs,
            semesters,
            activeSemester: null // Placeholder
        };

        console.log('=== ACADEMIC DETAILS DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Student Name:', student.name);
        console.log('CGPA:', cgpa);
        console.log('Total Credits:', totalCredits);
        console.log('Backlogs:', backlogs);

        res.json(academicDetails);
    } catch (error) {
        console.error('Get Academic Details Error:', error);
        res.status(500).json({ message: 'Error fetching academic details' });
    }
};
