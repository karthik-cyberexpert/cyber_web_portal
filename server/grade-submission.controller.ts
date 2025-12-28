import { Request, Response } from 'express';
import { pool } from './db.js';

// Grade a submission
export const gradeSubmission = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    const { submissionId, score, feedback } = req.body;

    if (!facultyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!submissionId || score === undefined) {
        return res.status(400).json({ message: 'Submission ID and score are required' });
    }

    try {
        // Verify the submission exists and get assignment details
        const [submissions]: any = await pool.query(
            `SELECT asub.*, a.max_score, sa.faculty_id
             FROM assignment_submissions asub
             JOIN assignments a ON asub.assignment_id = a.id
             JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
             WHERE asub.id = ?`,
            [submissionId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissions[0];

        // Verify faculty owns this assignment
        if (submission.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'Not authorized to grade this submission' });
        }

        // Validate score is within max_score
        if (score < 0 || score > submission.max_score) {
            return res.status(400).json({ 
                message: `Score must be between 0 and ${submission.max_score}` 
            });
        }

        // Update submission with grade
        await pool.query(
            `UPDATE assignment_submissions 
             SET score = ?, feedback = ?, status = 'Graded'
             WHERE id = ?`,
            [score, feedback || null, submissionId]
        );

        console.log('=== GRADE SUBMISSION DEBUG ===');
        console.log('Faculty ID:', facultyId);
        console.log('Submission ID:', submissionId);
        console.log('Score:', score);
        console.log('Max Score:', submission.max_score);

        res.json({ 
            message: 'Submission graded successfully',
            success: true
        });
    } catch (error: any) {
        console.error('Grade Submission Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error grading submission', error: error.message });
    }
};
