import { Request, Response } from 'express';
import { pool } from './db.js';

// Get student marks and grades
export const getStudentMarks = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Fetch student's current semester
        const [studentProfile]: any = await pool.query(
            `SELECT b.current_semester 
             FROM student_profiles sp 
             JOIN batches b ON sp.batch_id = b.id 
             WHERE sp.user_id = ?`,
            [studentId]
        );
        console.log('[Get Student Marks] Student ID:', studentId);
        console.log('[Get Student Marks] Profile Query Result:', studentProfile);
        
        const currentSemester = studentProfile[0]?.current_semester || 8;
        console.log('[Get Student Marks] Determined Semester:', currentSemester);

        // Fetch marks grouped by subject from schedules table
        const [marksData]: any = await pool.query(
            `SELECT 
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.credits,
                s.semester,
                sch.title as exam_name,
                sch.category as exam_type,
                m.marks_obtained,
                m.max_marks,
                m.status,
                m.remarks
             FROM marks m
             JOIN schedules sch ON m.schedule_id = sch.id
             JOIN subjects s ON m.subject_id = s.id
             WHERE m.student_id = ? AND m.status IN ('approved', 'pending_admin')
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
                    semester: mark.semester,
                    ia1: null,
                    ia2: null,
                    cia3: null,
                    model: null,
                    assignment: null,
                    total: 0,
                    grade: null,
                    status: mark.status
                };
            }

            const subject = subjectMarksMap[mark.subject_id];
            
            // Map schedule types to fields
            const type = mark.exam_type?.toUpperCase() || '';
            const title = mark.exam_name?.toUpperCase() || '';

            if (type === 'UT-1' || type === 'IA1' || title.includes('UNIT TEST 1') || title.includes('IA-1')) {
                subject.ia1 = mark.marks_obtained;
            } else if (type === 'UT-2' || type === 'IA2' || title.includes('UNIT TEST 2') || title.includes('IA-2')) {
                subject.ia2 = mark.marks_obtained;
            } else if (type === 'UT-3' || type === 'IA3' || type === 'CIA 3' || title.includes('UNIT TEST 3') || title.includes('CIA-3')) {
                subject.cia3 = mark.marks_obtained;
            } else if (type === 'MODEL' || title.includes('MODEL')) {
                subject.model = mark.marks_obtained;
            } else if (type === 'ASSIGNMENT' || title.includes('ASSIGNMENT')) {
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
                totalMarks: Number(totalMarks.toFixed(2)),
                currentSemester
            }
        });
    } catch (error) {
        console.error('Get Student Marks Error:', error);
        res.status(500).json({ message: 'Error fetching marks' });
    }
};
