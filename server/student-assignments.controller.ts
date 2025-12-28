import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student assignments
export const getStudentAssignments = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student's section
        const [students]: any = await pool.query(
            `SELECT section_id FROM student_profiles WHERE user_id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const sectionId = students[0].section_id;

        // Fetch assignments for the student's section with submission status
        const [assignments]: any = await pool.query(
            `SELECT 
                a.id,
                a.title,
                a.description,
                a.due_date,
                a.max_score as max_marks,
                a.created_at,
                a.attachment_url,
                s.name as subject_name,
                s.code as subject_code,
                u.name as assigned_by_name,
                asub.id as submission_id,
                asub.submitted_at,
                asub.score as marks_obtained,
                asub.feedback,
                asub.status as submission_status,
                sa.section_id
             FROM assignments a
             JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
             JOIN subjects s ON sa.subject_id = s.id
             LEFT JOIN users u ON sa.faculty_id = u.id
             LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
             WHERE sa.section_id = ?
             ORDER BY a.due_date ASC`,
            [studentId, sectionId]
        );

        // Categorize assignments
        const now = new Date();
        const pending: any[] = [];
        const submitted: any[] = [];
        const graded: any[] = [];

        assignments.forEach((assignment: any) => {
            const assignmentData = {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.due_date,
                maxMarks: assignment.max_marks,
                subjectName: assignment.subject_name,
                subjectCode: assignment.subject_code,
                assignedBy: assignment.assigned_by_name,
                submittedAt: assignment.submitted_at,
                marksObtained: assignment.marks_obtained,
                feedback: assignment.feedback,
                submissionStatus: assignment.submission_status
            };

            if (assignment.submission_status === 'graded') {
                graded.push(assignmentData);
            } else if (assignment.submission_id) {
                submitted.push(assignmentData);
            } else {
                pending.push(assignmentData);
            }
        });

        console.log('=== STUDENT ASSIGNMENTS DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Section ID:', sectionId);
        console.log('Total assignments:', assignments.length);
        console.log('Pending:', pending.length);
        console.log('Submitted:', submitted.length);
        console.log('Graded:', graded.length);

        res.json({
            pending,
            submitted,
            graded,
            totalAssignments: assignments.length
        });
    } catch (error) {
        console.error('Get Student Assignments Error:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};
