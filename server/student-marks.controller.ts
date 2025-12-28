import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student marks and grades
export const getStudentMarks = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student's section
        const [students]: any = await pool.query(
            `SELECT section_id, batch_id FROM student_profiles WHERE user_id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const { section_id, batch_id } = students[0];

        // Fetch marks grouped by subject
        const [marksData]: any = await pool.query(
            `SELECT 
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.credits,
                e.name as exam_name,
                e.exam_type,
                m.marks_obtained,
                m.max_marks,
                m.status,
                m.remarks
             FROM marks m
             JOIN exams e ON m.exam_id = e.id
             JOIN subjects s ON m.subject_id = s.id
             WHERE m.student_id = ? AND m.status = 'published'
             ORDER BY s.name, e.exam_type`,
            [studentId]
        );

        // Group marks by subject
        const subjectMarksMap: any = {};
        
        marksData.forEach((mark: any) => {
            if (!subjectMarksMap[mark.subject_id]) {
                subjectMarksMap[mark.subject_id] = {
                    subjectId: mark.subject_id,
                    subjectName: mark.subject_name,
                    subjectCode: mark.subject_code,
                    credits: mark.credits,
                    cia1: null,
                    cia2: null,
                    cia3: null,
                    model: null,
                    assignment: null,
                    total: 0,
                    grade: null
                };
            }

            const subject = subjectMarksMap[mark.subject_id];
            
            // Map exam types to fields
            if (mark.exam_type === 'Internal') {
                if (mark.exam_name.includes('1') || mark.exam_name.includes('I')) {
                    subject.cia1 = mark.marks_obtained;
                } else if (mark.exam_name.includes('2') || mark.exam_name.includes('II')) {
                    subject.cia2 = mark.marks_obtained;
                } else if (mark.exam_name.includes('3') || mark.exam_name.includes('III')) {
                    subject.cia3 = mark.marks_obtained;
                }
            } else if (mark.exam_type === 'Model') {
                subject.model = mark.marks_obtained;
            } else if (mark.exam_type === 'Assignment') {
                subject.assignment = mark.marks_obtained;
            }
        });

        // Calculate totals and grades for each subject
        const subjectMarks = Object.values(subjectMarksMap).map((subject: any) => {
            const marks = [
                subject.cia1 || 0,
                subject.cia2 || 0,
                subject.cia3 || 0,
                subject.model || 0,
                subject.assignment || 0
            ];
            
            subject.total = marks.reduce((sum, m) => sum + m, 0);
            
            // Calculate grade
            const percentage = subject.total;
            if (percentage >= 90) subject.grade = 'O';
            else if (percentage >= 80) subject.grade = 'A+';
            else if (percentage >= 70) subject.grade = 'A';
            else if (percentage >= 60) subject.grade = 'B+';
            else if (percentage >= 50) subject.grade = 'B';
            else if (percentage >= 40) subject.grade = 'C';
            else subject.grade = 'F';
            
            return subject;
        });

        // Calculate overall stats
        const totalMarks = subjectMarks.reduce((sum, s) => sum + s.total, 0);
        const totalSubjects = subjectMarks.length;
        const averageMarks = totalSubjects > 0 ? totalMarks / totalSubjects : 0;
        
        // Calculate CGPA (on 10-point scale)
        const cgpa = averageMarks / 10;

        console.log('=== STUDENT MARKS DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Total subjects:', totalSubjects);
        console.log('Average marks:', averageMarks.toFixed(2));
        console.log('CGPA:', cgpa.toFixed(2));

        res.json({
            subjectMarks,
            stats: {
                totalSubjects,
                averageMarks: Number(averageMarks.toFixed(2)),
                cgpa: Number(cgpa.toFixed(2)),
                totalMarks: Number(totalMarks.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Get Student Marks Error:', error);
        res.status(500).json({ message: 'Error fetching marks' });
    }
};
