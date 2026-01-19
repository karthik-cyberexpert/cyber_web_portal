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
    let { sectionId, subjectCode, examType } = req.query;

    if (!sectionId || !subjectCode || !examType) {
        return res.status(400).json({ message: 'Missing required parameters: sectionId, subjectCode, examType' });
    }
    
    // Legacy mapping support
    const legacyMap: any = {
        'ia1': 'UT-1', 'ia2': 'UT-2', 'ia3': 'UT-3',
        'cia1': 'UT-1', 'cia2': 'UT-2', 'cia3': 'UT-3'
    };
    if (examType && legacyMap[(examType as string).toLowerCase()]) {
        examType = legacyMap[(examType as string).toLowerCase()];
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

        // 3. Find or Create Schedule
        // Frontend sends examType as title (e.g., 'cia 1', 'model')
        const [scheds]: any = await connection.query(
            'SELECT id FROM schedules WHERE batch_id = ? AND category = ? LIMIT 1', 
            [batchId, String(examType).toUpperCase()]
        );
        
        let scheduleId;
        if (scheds.length > 0) {
            scheduleId = scheds[0].id;
        } else {
            const [ins]: any = await connection.query(
                "INSERT INTO schedules (batch_id, title, category, start_date, end_date) VALUES (?, ?, ?, CURDATE(), CURDATE())",
                [batchId, String(examType).toUpperCase(), String(examType).toUpperCase()]
            );
            scheduleId = ins.insertId;
        }

        // 4. Fetch Students and Left Join Marks
        const [rows]: any = await connection.query(`
            SELECT 
                u.id, u.name, sp.roll_number as rollNumber,
                m.marks_obtained as currentMarks,
                m.grade,
                m.status as markStatus
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            LEFT JOIN marks m ON m.student_id = u.id AND m.schedule_id = ? AND m.subject_id = ?
            WHERE sp.section_id = ? 
              AND u.role = 'student'
            ORDER BY sp.roll_number ASC
        `, [scheduleId, subjectId, sectionId]);

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
    // marks: [{ studentId, marks, maxMarks, breakdown, absent, grade }]

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

        // Find/Create Schedule
        let scheduleId;
        const [scheds]: any = await connection.query(
            'SELECT id FROM schedules WHERE batch_id = ? AND category = ? LIMIT 1', 
            [batchId, String(examType).toUpperCase()]
        );
        if (scheds.length > 0) {
            scheduleId = scheds[0].id;
        } else {
             const [ins]: any = await connection.execute(
                "INSERT INTO schedules (batch_id, title, category, start_date, end_date) VALUES (?, ?, ?, CURDATE(), CURDATE())",
                [batchId, String(examType).toUpperCase(), String(examType).toUpperCase()]
            );
            scheduleId = ins.insertId;
        }

        const facultyId = (req as any).user?.id;

        // 2. Loop and Upsert
        for (const entry of marks) {
            const [existing]: any = await connection.query(
                'SELECT id FROM marks WHERE schedule_id = ? AND student_id = ? AND subject_id = ?',
                [scheduleId, entry.studentId, subjectId]
            );

            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE marks SET marks_obtained = ?, grade = ?, max_marks = ?, status = ?, faculty_id = ? WHERE id = ?',
                    [entry.marks, entry.grade || null, entry.maxMarks, entry.status || 'draft', facultyId, existing[0].id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO marks (schedule_id, student_id, subject_id, marks_obtained, grade, max_marks, status, faculty_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [scheduleId, entry.studentId, subjectId, entry.marks, entry.grade || null, entry.maxMarks, entry.status || 'draft', facultyId]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Marks updated successfully' });

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
                m.schedule_id as scheduleId,
                sch.category as examType,
                m.marks_obtained as marks,
                m.max_marks as maxMarks,
                m.status
            FROM marks m
            JOIN schedules sch ON m.schedule_id = sch.id
            JOIN subjects s ON m.subject_id = s.id
            JOIN sections sec ON s.id = s.id -- Join somehow to get batch info, or adjust
            -- Wait, marks doesn't have section_id anymore in new schema for simplicity? 
            -- Actually, it's better to join student_profiles to get batch/section.
            JOIN student_profiles sp ON m.student_id = sp.user_id
            WHERE sp.batch_id = ?
        `;
        const params: any[] = [batchId];

        if (sectionId) {
            query += ' AND sp.section_id = ?';
            params.push(sectionId);
        }

        if (semester) {
            query += ' AND s.semester = ?';
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
            SELECT m.student_id, m.subject_id, m.marks_obtained, m.max_marks, sch.category as exam_name
            FROM marks m
            JOIN schedules sch ON m.schedule_id = sch.id
            JOIN student_profiles sp ON m.student_id = sp.user_id
            WHERE sp.batch_id = ? AND sch.category IN ('CIA 1', 'CIA 2', 'CIA 3', 'Model')
              AND m.status = 'approved'
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

// Stage 2: Tutor verifies marks
// Get status for tutor's assigned section
export const getVerificationStatus = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const { semester } = req.query; // numeric semester 1-8
    const connection = await pool.getConnection();
    try {
        // 1. Get tutor's assigned ranges
        const [assignments]: any = await connection.query(
            'SELECT batch_id, section_id, reg_number_start, reg_number_end FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [userId]
        );

        if (assignments.length === 0) return res.json([]);

        const allRows: any[] = [];
        for (const assignment of assignments) {
            let query = `
                SELECT 
                    s.name as subjectName, 
                    s.code as subjectCode,
                    s.id as subjectId,
                    sec.id as sectionId,
                    sec.name as sectionName,
                    sch.category as examType,
                    sch.id as scheduleId,
                    u.name as facultyName,
                    COUNT(m.id) as studentCount,
                    COUNT(m.id) as studentCount,
                    SUM(CASE WHEN m.status = 'pending_tutor' THEN 1 ELSE 0 END) as pendingCount,
                    MIN(m.created_at) as submittedAt,
                    MIN(m.status) as markStatus,
                    MAX(m.grade) as hasGrades
                FROM marks m
                JOIN schedules sch ON m.schedule_id = sch.id
                JOIN subjects s ON m.subject_id = s.id
                JOIN (
                    SELECT user_id, section_id, ROW_NUMBER() OVER (ORDER BY roll_number ASC) as row_num
                    FROM student_profiles
                    WHERE batch_id = ? AND section_id = ?
                ) sp ON m.student_id = sp.user_id
                JOIN sections sec ON sp.section_id = sec.id
                JOIN users u ON m.faculty_id = u.id
                WHERE m.status IN ('pending_tutor', 'pending_admin', 'approved')
                  AND (? IS NULL OR ? IS NULL OR (sp.row_num >= ? AND sp.row_num <= ?))
            `;
            
            const params: any[] = [
                assignment.batch_id, 
                assignment.section_id,
                assignment.reg_number_start, assignment.reg_number_end,
                parseInt(assignment.reg_number_start) || 0, parseInt(assignment.reg_number_end) || 0
            ];

            if (semester) {
                query += ` AND s.semester = ?`;
                params.push(parseInt(semester as string));
            }

            query += ` GROUP BY s.id, sec.id, sch.id, u.id, u.name`;

            const [rows]: any = await connection.query(query, params);
            allRows.push(...rows);
        }

        res.json(allRows);
    } catch (e) {
        console.error("Get Verification Status Error:", e);
        res.status(500).json({ message: 'Error fetching status' });
    } finally {
        connection.release();
    }
};

// Get Detailed Student Marks for Tutor Verification
export const getDetailedVerifications = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const { scheduleId, subjectId, sectionId } = req.query;

    if (!scheduleId || !subjectId || !sectionId) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    const connection = await pool.getConnection();
    try {
        console.log('[Detailed Verification] Query Params:', req.query);
        const user = (req as any).user;
        console.log('[Detailed Verification] User from Token:', user);

        const userRole = user?.role?.toLowerCase();
        let rows;

        if (userRole === 'admin') {
            // Admins see everything for this section/subject/schedule
            console.log('[Detailed Verification] Admin access granted');
            [rows] = await connection.query(`
                SELECT 
                    u.id, u.name, sp.roll_number as rollNumber,
                    u.id, u.name, sp.roll_number as rollNumber,
                    m.marks_obtained as marks,
                    m.grade,
                    m.grade,
                    m.status as status
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                JOIN marks m ON m.student_id = u.id
                WHERE m.schedule_id = ? AND m.subject_id = ? AND sp.section_id = ?
                ORDER BY sp.roll_number ASC
            `, [scheduleId, subjectId, sectionId]);
        } else {
            console.log('[Detailed Verification] Tutor/Faculty access check for role:', userRole);
            // 1. Get tutor's assigned ranges for this section
            const [assignments]: any = await connection.query(
                'SELECT batch_id, section_id, reg_number_start, reg_number_end FROM tutor_assignments WHERE faculty_id = ? AND section_id = ? AND is_active = TRUE',
                [userId, sectionId]
            );

            if (assignments.length === 0) return res.status(403).json({ message: 'Not authorized for this section' });

            const assignment = assignments[0];

            // 2. Fetch marks for students in range
            [rows] = await connection.query(`
                SELECT 
                    u.id, u.name, sp.roll_number as rollNumber,
                    m.marks_obtained as marks,
                    m.status as status
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                JOIN (
                    SELECT user_id, ROW_NUMBER() OVER (ORDER BY roll_number ASC) as row_num
                    FROM student_profiles
                    WHERE batch_id = ? AND section_id = ?
                ) spnum ON u.id = spnum.user_id
                JOIN marks m ON m.student_id = u.id
                WHERE m.schedule_id = ? AND m.subject_id = ?
                  AND (? IS NULL OR ? IS NULL OR (spnum.row_num >= ? AND spnum.row_num <= ?))
                ORDER BY sp.roll_number ASC
            `, [
                assignment.batch_id, assignment.section_id,
                scheduleId, subjectId,
                assignment.reg_number_start, assignment.reg_number_end,
                parseInt(assignment.reg_number_start) || 0, parseInt(assignment.reg_number_end) || 0
            ]);
        }

        res.json(rows);
    } catch (e) {
        console.error("Detailed Verification Error:", e);
        res.status(500).json({ message: 'Error fetching details' });
    } finally {
        connection.release();
    }
};

export const verifyMarks = async (req: Request | any, res: Response) => {
    const { scheduleId, sectionId, subjectCode } = req.body;
    const userId = req.user?.id;

    const connection = await pool.getConnection();
    try {
        const [subjects]: any = await connection.query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
        if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
        const subjectId = subjects[0].id;

        await connection.query(
            "UPDATE marks SET status = 'pending_admin', tutor_id = ? WHERE schedule_id = ? AND subject_id = ? AND student_id IN (SELECT user_id FROM student_profiles WHERE section_id = ?)",
            [userId, scheduleId, subjectId, sectionId]
        );

        res.json({ message: 'Marks verified and forwarded to Admin' });
    } catch (e) {
        console.error("Verify Marks Error:", e);
        res.status(500).json({ message: 'Error verifying marks' });
    } finally {
        connection.release();
    }
};

// Stage 3: Admin approves marks
export const getApprovalStatus = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
        const [rows]: any = await connection.query(`
            SELECT 
                s.id as subjectId,
                s.name as subjectName, 
                s.code as subjectCode,
                sec.id as sectionId,
                sec.name as sectionName,
                b.name as batchName,
                sch.category as examType,
                sch.id as scheduleId,
                fac.name as facultyName,
                tut.name as tutorName,
                COUNT(m.id) as studentCount,
                SUM(CASE WHEN m.status = 'pending_admin' THEN 1 ELSE 0 END) as pendingCount,
                MIN(m.created_at) as submittedAt,
                MIN(m.status) as markStatus
            FROM marks m
            JOIN schedules sch ON m.schedule_id = sch.id
            JOIN subjects s ON m.subject_id = s.id
            JOIN student_profiles sp ON m.student_id = sp.user_id
            JOIN sections sec ON sp.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            JOIN users fac ON m.faculty_id = fac.id
            LEFT JOIN users tut ON m.tutor_id = tut.id
            WHERE m.status IN ('pending_admin', 'approved')
            GROUP BY s.id, s.name, s.code, sec.id, sec.name, b.name, sch.id, sch.category, fac.name, tut.name
        `);

        res.json(rows);
    } catch (e) {
        console.error("Get Approval Status Error:", e);
        res.status(500).json({ message: 'Error fetching status' });
    } finally {
        connection.release();
    }
};

export const approveMarks = async (req: Request | any, res: Response) => {
    const { scheduleId, sectionId, subjectCode } = req.body;
    const userId = req.user?.id;

    const connection = await pool.getConnection();
    try {
        const [subjects]: any = await connection.query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
        if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
        const subjectId = subjects[0].id;

        await connection.query(
            "UPDATE marks SET status = 'approved', admin_id = ? WHERE schedule_id = ? AND subject_id = ? AND student_id IN (SELECT user_id FROM student_profiles WHERE section_id = ?)",
            [userId, scheduleId, subjectId, sectionId]
        );

        res.json({ message: 'Marks approved successfully' });
    } catch (e) {
        console.error("Approve Marks Error:", e);
        res.status(500).json({ message: 'Error approving marks' });
    } finally {
        connection.release();
    }
};

// Get All Tutor Subjects (for External Marks Entry)
export const getTutorSubjects = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const { semester } = req.query;

    const connection = await pool.getConnection();
    try {
        // 1. Get tutor's assigned ranges
        const [assignments]: any = await connection.query(
            'SELECT batch_id, section_id, reg_number_start, reg_number_end FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [userId]
        );

        if (assignments.length === 0) return res.json([]);

        const allRows: any[] = [];

        for (const assignment of assignments) {
            // 2. Get Subjects for this Batch/Section
            // We want to show ALL subjects so they can enter marks
            let query = `
                SELECT 
                    s.name as subjectName,
                    s.code as subjectCode,
                    s.id as subjectId,
                    sec.id as sectionId,
                    sec.name as sectionName,
                    'SEMESTER' as examType,
                    NULL as scheduleId,
                    u.name as facultyName,
                    (
                        SELECT COUNT(*) FROM student_profiles sp 
                        WHERE sp.section_id = sec.id
                    ) as studentCount,
                    (
                        SELECT COUNT(m.id) FROM marks m 
                        JOIN schedules sch ON m.schedule_id = sch.id 
                        WHERE m.subject_id = s.id AND sch.category = 'SEMESTER' AND m.student_id IN (
                             SELECT user_id FROM student_profiles sp2 WHERE sp2.section_id = sec.id
                        )
                    ) as markedCount
                FROM subjects s
                JOIN batches b ON b.current_semester = s.semester -- Filter by current semester subjects
                JOIN sections sec ON sec.batch_id = b.id
                JOIN users u ON u.id = ? -- Current Tutor as 'faculty' context
                WHERE sec.id = ? 
            `;

            const params: any[] = [userId, assignment.section_id];

            if (semester) {
                query += ` AND s.semester = ?`;
                params.push(semester);
            }

            const [subjects]: any = await connection.query(query, params);
            
            // Map to match the frontend 'verification' interface partially
            const mapped = subjects.map((sub: any) => ({
                ...sub,
                pendingCount: sub.studentCount - sub.markedCount, // Treat un-marked as pending
                verified: sub.markedCount,
                markStatus: sub.markedCount === sub.studentCount ? 'completed' : 'pending_tutor', // Just for UI color
                submittedAt: new Date().toISOString() // Dummy date
            }));

            allRows.push(...mapped);
        }

        res.json(allRows);
    } catch (e: any) {
        console.error("Get Tutor Subjects Error:", e);
        res.status(500).json({ message: 'Error fetching tutor subjects' });
    } finally {
        connection.release();
    }
};
