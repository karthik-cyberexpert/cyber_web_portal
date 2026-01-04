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
        // FIX: Allow section_id to be NULL (Global Allocation) -> Join all sections in matching semester
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
            JOIN sections sec ON (sa.section_id = sec.id OR sa.section_id IS NULL)
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
        
        // FIX: Strict Semester Filter
        // Only fetch students if their batch is currently in the semester of the exam/subject
        // Actually, we should check if the Exam's semester matches the Batch's current semester
        // But for "Reviewing old marks", maybe we want to allow it?
        // User Requirement: "reset... UI should be blank and new for the next semester."
        // So, if we are in Sem 4, we should NOT see Sem 3 marks in the active entry view?
        // Or rather, the "My Classes" dropdown already filters subjects.
        // If I access a "Maths (Sem 3)" subject, and my batch is in Sem 4, I shouldn't see any students there to enter marks for.
        // The student list query below drives the rows.
        
        const [rows]: any = await connection.query(`
            SELECT 
                u.id, u.name, u.email, sp.roll_number as rollNumber,
                m.marks_obtained as currentMarks,
                m.breakdown,
                m.status as markStatus
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            LEFT JOIN marks m ON m.student_id = u.id AND m.exam_id = ? AND m.subject_id = ?
            JOIN exams e ON e.id = ?
            WHERE sp.section_id = ? 
              AND u.role = 'student'
              AND e.semester = b.current_semester -- Key: Only show students if exam sem matches batch current sem
            ORDER BY sp.roll_number ASC
        `, [examId, subjectId, examId, sectionId]);

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

// Get All Marks for a Batch (Admin Report)
export const getMarksByBatch = async (req: Request, res: Response) => {
    const { batchId, sectionId, semester } = req.query;

    if (!batchId) {
        return res.status(400).json({ message: 'Missing required parameter: batchId' });
    }

    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                m.student_id as studentId,
                m.subject_id as subjectId,
                s.code as subjectCode,
                s.name as subjectName,
                m.exam_id as examId,
                e.name as examType,
                m.marks_obtained as marks,
                m.max_marks as maxMarks
            FROM marks m
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects s ON m.subject_id = s.id
            JOIN sections sec ON m.section_id = sec.id
            WHERE sec.batch_id = ?
        `;
        const params: any[] = [batchId];

        if (sectionId) {
            query += ' AND m.section_id = ?';
            params.push(sectionId);
        }

        if (semester) {
            query += ' AND e.semester = ?';
            params.push(semester);
        }

        const [rows]: any = await connection.query(query, params);
        res.json(rows);

    } catch (e: any) {
        console.error("Get Batch Marks Error:", e);
        res.status(500).json({ message: 'Error fetching batch marks' });
    } finally {
        connection.release();
    }
};

// Get Internal Marks Calculation (Theory)
export const getTheoryInternalMarks = async (req: Request, res: Response) => {
    const { batchId, semester } = req.query;

    if (!batchId) {
        return res.status(400).json({ message: 'Missing required parameter: batchId' });
    }

    const connection = await pool.getConnection();
    try {
        // 1. Fetch Students
        const [students]: any = await connection.query(`
            SELECT u.id, u.name, sp.roll_number 
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN sections sec ON sp.section_id = sec.id
            WHERE sec.batch_id = ? AND u.role = 'student'
            ORDER BY sp.roll_number
        `, [batchId]);

        // 2. Fetch Theory Subjects for the context (semester)
        let subjectQuery = "SELECT id, name, code FROM subjects WHERE type = 'theory'";
        const subjectParams: any[] = [];
        if (semester) {
            subjectQuery += " AND semester = ?";
            subjectParams.push(semester);
        }
        const [subjects]: any = await connection.query(subjectQuery, subjectParams);

        // 3. Fetch Marks (CIA 1, CIA 2, CIA 3, Model)
        // Optimization: Fetch all marks for this batch and filter in JS
        const [allMarks]: any = await connection.query(`
            SELECT m.student_id, m.subject_id, m.marks_obtained, m.max_marks, e.name as exam_name
            FROM marks m
            JOIN exams e ON m.exam_id = e.id
            JOIN sections sec ON m.section_id = sec.id
            WHERE sec.batch_id = ? AND e.name IN ('CIA 1', 'CIA 2', 'CIA 3', 'Model')
        `, [batchId]);

        // 4. Fetch Assignment Stats
        // We need: For each student+subject, count of assigned vs submitted
        // Assignments are linked to subject_allocations -> subject
        const [assignmentStats]: any = await connection.query(`
            SELECT 
                u.id as student_id,
                s.id as subject_id,
                COUNT(DISTINCT a.id) as total_assignments,
                COUNT(DISTINCT asub.id) as submitted_assignments
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN sections sec ON sp.section_id = sec.id
            -- Link students to assignments via their section's allocations
            JOIN subject_allocations sa ON sa.section_id = sec.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN assignments a ON a.subject_allocation_id = sa.id
            LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = u.id
            WHERE sec.batch_id = ? AND s.type = 'theory'
            GROUP BY u.id, s.id
        `, [batchId]);

        // 5. Aggregate Data
        const report: any[] = [];

        for (const student of students) {
            for (const subject of subjects) {
                const studentMarks = allMarks.filter((m: any) => m.student_id === student.id && m.subject_id === subject.id);
                const assignStat = assignmentStats.find((a: any) => a.student_id === student.id && a.subject_id === subject.id);

                // Helper to get normalized score
                const getScore = (examName: string, maxTarget: number) => {
                    const entry = studentMarks.find((m: any) => m.exam_name.toUpperCase() === examName.toUpperCase());
                    if (!entry || !entry.max_marks) return 0;
                    return (entry.marks_obtained / entry.max_marks) * maxTarget;
                };

                const cia1 = getScore('CIA 1', 10);
                const cia2 = getScore('CIA 2', 10);
                const cia3 = getScore('CIA 3', 10);
                const model = getScore('Model', 5);

                // Assignment Logic: (Submitted / Total) * 5
                let assignmentScore = 0;
                if (assignStat && assignStat.total_assignments > 0) {
                    assignmentScore = (assignStat.submitted_assignments / assignStat.total_assignments) * 5;
                } else if (assignStat && assignStat.total_assignments === 0) {
                     // If no assignments given...
                     assignmentScore = 0;
                }

                // If user meant "Assignment total is 5 and we add it", we do exactly that.
                // If they meant something else, we can adjust.
                
                const total = cia1 + cia2 + cia3 + model + assignmentScore;

                report.push({
                    studentId: student.id,
                    studentName: student.name,
                    rollNumber: student.roll_number,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    subjectCode: subject.code,
                    cia1: parseFloat(cia1.toFixed(2)),
                    cia2: parseFloat(cia2.toFixed(2)),
                    cia3: parseFloat(cia3.toFixed(2)),
                    model: parseFloat(model.toFixed(2)),
                    assignment: parseFloat(assignmentScore.toFixed(2)),
                    total: parseFloat(total.toFixed(2)) // Should be out of 40
                });
            }
        }

        res.json(report);

    } catch (e: any) {
        console.error("Get Theory Internal Marks Error:", e);
        res.status(500).json({ message: 'Error calculating internal marks' });
    } finally {
        connection.release();
    }
};

