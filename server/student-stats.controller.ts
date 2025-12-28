import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student dashboard statistics
export const getStudentStats = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student profile info
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

        // Calculate overall attendance percentage
        // Count total classes and attended classes across all subjects
        const [attendanceData]: any = await pool.query(
            `SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'present' OR status = 'late' THEN 1 ELSE 0 END) as attended_classes
             FROM attendance
             WHERE student_id = ?`,
            [studentId]
        );

        let attendance = 0;
        if (attendanceData[0] && attendanceData[0].total_classes > 0) {
            attendance = Math.round((attendanceData[0].attended_classes / attendanceData[0].total_classes) * 100);
        }

        // Calculate internal average (marks)
        // This will fetch from marks table once it's populated
        const [marksData]: any = await pool.query(
            `SELECT 
                AVG(marks_obtained) as avg_marks
             FROM marks
             WHERE student_id = ?`,
            [studentId]
        );

        const internalAverage = marksData[0]?.avg_marks 
            ? Number(marksData[0].avg_marks.toFixed(1)) 
            : 0;

        // Count pending assignments
        // Get all subjects this student is enrolled in
        const [subjects]: any = await pool.query(
            `SELECT DISTINCT sa.id as allocation_id, sa.subject_id
             FROM subject_allocations sa
             WHERE sa.section_id = ?`,
            [student.section_id]
        );

        // Count assignments not yet submitted
        const [assignmentCounts]: any = await pool.query(
            `SELECT 
                COUNT(DISTINCT a.id) as total_assignments,
                COUNT(DISTINCT asub.id) as submitted_assignments
             FROM assignments a
             LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
             WHERE a.section_id = ?`,
            [studentId, student.section_id]
        );

        const pendingTasks = assignmentCounts[0]
            ? (assignmentCounts[0].total_assignments - assignmentCounts[0].submitted_assignments)
            : 0;

        const stats = {
            attendance,
            internalAverage,
            pendingTasks,
            ecaPoints: 0, // Placeholder - needs ECA table
            studentInfo: {
                name: student.name,
                email: student.email,
                rollNumber: student.roll_number,
                registerNumber: student.register_number || student.roll_number,
                section: student.section_name,
                batch: student.batch_name
            }
        };

        console.log('=== STUDENT STATS DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Student Name:', student.name);
        console.log('Section ID:', student.section_id);
        console.log('Attendance:', attendance, '%');
        console.log('Total Classes:', attendanceData[0]?.total_classes);
        console.log('Attended:', attendanceData[0]?.attended_classes);
        console.log('Pending Tasks:', pendingTasks);
        console.log('Stats:', stats);

        res.json(stats);
    } catch (error) {
        console.error('Get Student Stats Error:', error);
        res.status(500).json({ message: 'Error fetching student stats' });
    }
};
