import { Request, Response } from 'express';
import { pool } from './db.js';

// Get students for a specific subject allocation
export const getStudentsByAllocation = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    const allocationId = req.params.allocationId;

    if (!facultyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify this allocation belongs to the faculty AND is active
        const [allocation]: any = await pool.query(
            'SELECT * FROM subject_allocations WHERE id = ? AND faculty_id = ? AND is_active = TRUE',
            [allocationId, facultyId]
        );

        if (allocation.length === 0) {
            return res.status(403).json({ message: 'Access denied to this allocation' });
        }

        const sectionId = allocation[0].section_id;
        const subjectId = allocation[0].subject_id;

        // Get all students in this section with their attendance
        // FIX: Strict Semester Filter. Only show students if their Batch's current_semester
        // matches the Subject's semester.
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                sp.roll_number as register_number,
                0 as attendance_percentage
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            JOIN subjects s ON s.id = ?
            WHERE sp.section_id = ?
              AND s.semester = b.current_semester -- Key: Only show if semester matches
            ORDER BY sp.roll_number
        `;

        const [students]: any = await pool.query(query, [subjectId, sectionId]);

        console.log('=== FACULTY STUDENTS DEBUG ===');
        console.log('Allocation ID:', allocationId);
        console.log('Section ID:', sectionId);
        console.log('Subject ID:', subjectId);
        console.log('Students found:', students.length);
        if (students.length > 0) {
            console.log('Sample student:', students[0]);
        }

        res.json(students);
    } catch (error) {
        console.error('Get Students Error:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
};
