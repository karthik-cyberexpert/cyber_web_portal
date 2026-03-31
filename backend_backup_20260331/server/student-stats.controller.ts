import { Request, Response } from 'express';
import { pool } from './db.js';
import { getStudentAttendancePercentage } from './attendance.utils.js';

// Get student dashboard statistics
export const getStudentStats = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        console.log(`[StudentStats] Fetching stats for student ID: ${studentId}`);
        
        // Get student profile info with exact academic details
        const [students]: any = await pool.query(
            `SELECT 
                sp.*, 
                u.name, 
                u.email, 
                s.name as section_name, 
                b.name as batch_name,
                COALESCE(sp.current_semester, b.current_semester, 1) as current_semester,
                CEIL(COALESCE(sp.current_semester, b.current_semester, 1) / 2) as current_year
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN sections s ON sp.section_id = s.id
             LEFT JOIN batches b ON sp.batch_id = b.id
             WHERE u.id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            console.log(`[StudentStats] Student profile not found for ID: ${studentId}`);
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const student = students[0];

        // Calculate attendance using new leave-based calculation
        const attendanceData = await getStudentAttendancePercentage(studentId);
        // Use the precise percentage
        const attendance = Number(attendanceData.attendancePercentage.toFixed(1)); 

        // Calculate internal average (marks)
        const [marksData]: any = await pool.query(
            `SELECT 
                AVG(marks_obtained) as avg_marks
             FROM marks
             WHERE student_id = ?`,
            [studentId]
        );

        const rawAvg = marksData[0]?.avg_marks;
        const internalAverage = rawAvg 
            ? Number(Number(rawAvg).toFixed(1)) 
            : 0;

        // Count pending assignments
        const [assignmentCounts]: any = await pool.query(
            `SELECT 
                COUNT(DISTINCT a.id) as total_assignments,
                COUNT(DISTINCT asub.id) as submitted_assignments
             FROM assignments a
             JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
             LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
             WHERE sa.section_id = ?`,
            [studentId, student.section_id]
        );

        const pendingTasks = assignmentCounts[0]
            ? (assignmentCounts[0].total_assignments - assignmentCounts[0].submitted_assignments)
            : 0;

        const stats = {
            attendance,
            internalAverage,
            pendingTasks,
            ecaPoints: 0, 
            studentInfo: {
                name: student.name,
                email: student.email,
                rollNumber: student.roll_number,
                registerNumber: student.register_number || student.roll_number,
                section: student.section_name,
                batch: student.batch_name,
                semester: student.current_semester,
                year: student.current_year > 4 ? 4 : (student.current_year < 1 ? 1 : student.current_year) // Clamp year 1-4
            }
        };

        console.log('[StudentStats] Returning stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Get Student Stats Error:', error);
        res.status(500).json({ message: 'Error fetching student stats' });
    }
};
