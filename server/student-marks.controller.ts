import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student marks and grades
export const getStudentMarks = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Fetch marks grouped by subject from schedules table
        const [marksData]: any = await pool.query(
            `SELECT 
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.credits,
                sch.title as exam_name,
                sch.category as exam_type,
                m.marks_obtained,
                m.max_marks,
                m.status,
                m.remarks
             FROM marks m
             JOIN schedules sch ON m.schedule_id = sch.id
             JOIN subjects s ON m.subject_id = s.id
             WHERE m.student_id = ? AND m.status = 'approved'
             ORDER BY s.name, sch.category`,
            [studentId]
        );

        // Group marks by subject
        const subjectMarksMap: any = {};
        
        marksData.forEach((mark: any) => {
            if (!subjectMarksMap[mark.subject_id]) {
                subjectMarksMap[mark.subject_id] = {
                    subjectId: mark.subject_id,
                    subject: mark.subject_name,
                    code: mark.subject_code,
                    credits: mark.credits,
                    ia1: null,
                    ia2: null,
                    cia3: null,
                    model: null,
                    assignment: null,
                    total: 0,
                    grade: null
                };
            }

            const subject = subjectMarksMap[mark.subject_id];
            
            // Map schedule types to fields
            // New schema uses schedules.type which might be 'Internal', 'Model', etc.
            const type = mark.exam_type.toLowerCase();
            const title = mark.exam_name.toUpperCase();

            if (type.includes('internal') || type.includes('ia')) {
                if (title.includes('1') || title.includes('I')) {
                    subject.ia1 = mark.marks_obtained;
                } else if (title.includes('2') || title.includes('II')) {
                    subject.ia2 = mark.marks_obtained;
                } else if (title.includes('3') || title.includes('III')) {
                    subject.cia3 = mark.marks_obtained;
                }
            } else if (type.includes('model')) {
                subject.model = mark.marks_obtained;
            } else if (type.includes('assignment')) {
                subject.assignment = mark.marks_obtained;
            }
        });

        // Calculate totals and grades for each subject
        const subjectMarks = Object.values(subjectMarksMap).map((subject: any) => {
            const marks = [
                subject.ia1 || 0,
                subject.ia2 || 0,
                subject.cia3 || 0,
                subject.model || 0,
                subject.assignment || 0
            ];
            
            subject.total = marks.reduce((sum, m) => sum + Number(m), 0);
            
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
