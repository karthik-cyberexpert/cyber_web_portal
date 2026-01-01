import { Request, Response } from 'express';
import { pool } from './db.js';

// Get Faculty Classes (Subjects & Sections)
export const getFacultyClasses = async (req: Request | any, res: Response) => {
    const userId = req.user?.id; // From authenticateToken
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const connection = await pool.getConnection();
    try {
        // Fetch allocations: Subject Name, Code, Section Name, Batch Name
        // Only show subjects where subject.semester matches batch.current_semester
        const [rows]: any = await connection.query(`
            SELECT 
                s.name as subjectName, 
                s.code as subjectCode,
                sec.id as sectionId,
                sec.name as sectionName,
                b.name as batchName,
                s.semester as subjectSemester,
                b.current_semester as batchCurrentSemester
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON sa.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? 
              AND sa.is_active = TRUE
              AND s.semester = b.current_semester
        `, [userId]);

        // Transform for frontend
        // We want a list of unique Subjects and unique Sections (or mapped)
        // actually existing UI selects Section then Subject.
        // Let's send the raw list or a structured object.
        res.json(rows);
    } catch (e: any) {
        console.error("Get Faculty Classes Error:", e);
        res.status(500).json({ message: 'Error fetching classes' });
    } finally {
        connection.release();
    }
};

// Get Marks for a Section, Subject, Exam
// Returns list of students in that section, with their marks if they exist
export const getMarks = async (req: Request, res: Response) => {
    const { sectionId, subjectCode, examType } = req.query;

    if (!sectionId || !subjectCode || !examType) {
        return res.status(400).json({ message: 'Missing required parameters: sectionId, subjectCode, examType' });
    }

    const connection = await pool.getConnection();
    try {
        console.log('[getMarks] Request params:', { sectionId, subjectCode, examType });
        
        // 1. Get Subject ID from Code (assuming unique code)
        const [subjects]: any = await connection.query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
        console.log('[getMarks] Subjects query result:', subjects);
        
        if (subjects.length === 0) {
            console.log('[getMarks] Subject not found for code:', subjectCode);
            return res.status(404).json({ message: 'Subject not found' });
        }
        const subjectId = subjects[0].id;
        console.log('[getMarks] Subject ID:', subjectId);

        // 2. Get Batch ID from Section
        const [sections]: any = await connection.query('SELECT batch_id FROM sections WHERE id = ?', [sectionId]);
        console.log('[getMarks] Sections query result:', sections);
        
        if (sections.length === 0) {
            console.log('[getMarks] Section not found for ID:', sectionId);
            return res.status(404).json({ message: 'Section not found' });
        }
        const batchId = sections[0].batch_id;
        console.log('[getMarks] Batch ID:', batchId);

        // 3. Find or Create Exam
        // Frontend sends examType as name (e.g., 'ia1', 'ia2')
        // Database has exam_type ENUM ('Internal', 'Model', 'Semester', 'Assignment')
        // We should search by name field, not exam_type
        const [exams]: any = await connection.query(
            'SELECT id FROM exams WHERE batch_id = ? AND name = ? LIMIT 1', 
            [batchId, String(examType).toUpperCase()]
        );
        console.log('[getMarks] Exams query for name:', { batchId, examName: String(examType).toUpperCase(), result: exams });
        
        let examId;
        if (exams.length > 0) {
            examId = exams[0].id;
            console.log('[getMarks] Found existing exam ID:', examId);
        } else {
            console.log('[getMarks] Creating new exam with name:', String(examType).toUpperCase());
            const [ins]: any = await connection.query(
                "INSERT INTO exams (batch_id, semester, name, exam_type) VALUES (?, 1, ?, 'Internal')",
                [batchId, String(examType).toUpperCase()]
            );
            examId = ins.insertId;
            console.log('[getMarks] Created new exam ID:', examId);
        }

        // 4. Fetch Students and Left Join Marks
        console.log('[getMarks] Fetching students with marks for:', { examId, subjectId, sectionId });
        const [rows]: any = await connection.query(`
            SELECT 
                u.id, u.name, u.email, sp.roll_number as rollNumber,
                m.marks_obtained as currentMarks,
                m.breakdown,
                m.status as markStatus
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN marks m ON m.student_id = u.id AND m.exam_id = ? AND m.subject_id = ?
            WHERE sp.section_id = ? AND u.role = 'student'
            ORDER BY sp.roll_number ASC
        `, [examId, subjectId, sectionId]);

        console.log('[getMarks] Students fetched:', rows.length);
        res.json(rows);

    } catch (e: any) {
        console.error("[getMarks] Error:", e);
        console.error("[getMarks] Error stack:", e.stack);
        res.status(500).json({ message: 'Error fetching marks', error: e.message });
    } finally {
        connection.release();
    }
};

// Bulk Save Marks
export const saveMarks = async (req: Request, res: Response) => {
    const { sectionId, subjectCode, examType, marks } = req.body;
    // marks: [{ studentId, marks, maxMarks, breakdown, absent }]

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Resolve IDs (Subject, Exam) - Same logic as get
        const [subjects]: any = await connection.query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
        if (subjects.length === 0) throw new Error('Subject not found');
        const subjectId = subjects[0].id;

        const [sections]: any = await connection.query('SELECT batch_id FROM sections WHERE id = ?', [sectionId]);
        if (sections.length === 0) throw new Error('Section not found');
        const batchId = sections[0].batch_id;

        // Find/Create Exam
        let examId;
        const [exams]: any = await connection.query(
            'SELECT id FROM exams WHERE batch_id = ? AND name = ? LIMIT 1', 
            [batchId, String(examType).toUpperCase()]
        );
        if (exams.length > 0) {
            examId = exams[0].id;
        } else {
             const [ins]: any = await connection.query(
                "INSERT INTO exams (batch_id, semester, name, exam_type) VALUES (?, 1, ?, 'Internal')",
                [batchId, String(examType).toUpperCase()]
            );
            examId = ins.insertId;
        }

        // 2. Loop and Upsert
        for (const entry of marks) {
            // breakdown: { partA: [...], partB: [...], absent: true/false }
            const breakdownJson = JSON.stringify(entry.breakdown || {});
            
            // Check if exists
             const [existing]: any = await connection.query(
                'SELECT id FROM marks WHERE exam_id = ? AND student_id = ? AND subject_id = ?',
                [examId, entry.studentId, subjectId]
            );

            if (existing.length > 0) {
                await connection.query(
                    'UPDATE marks SET marks_obtained = ?, max_marks = ?, breakdown = ?, section_id = ?, updated_at = NOW() WHERE id = ?',
                    [entry.marks, entry.maxMarks, breakdownJson, sectionId, existing[0].id]
                );
            } else {
                await connection.query(
                    'INSERT INTO marks (exam_id, student_id, subject_id, section_id, marks_obtained, max_marks, breakdown) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [examId, entry.studentId, subjectId, sectionId, entry.marks, entry.maxMarks, breakdownJson]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Marks saved successfully' });

    } catch (e: any) {
        await connection.rollback();
        console.error("Save Marks Error:", e);
        res.status(500).json({ message: 'Error saving marks' });
    } finally {
        connection.release();
    }
};
