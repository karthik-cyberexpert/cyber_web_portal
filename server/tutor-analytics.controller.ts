import { Request, Response } from 'express';
import { pool } from './db.js';

// Helper to get tutor's assigned section and batch
const getTutorAssignment = async (facultyId: string | number) => {
    const [rows]: any = await pool.query(`
        SELECT ta.section_id, ta.batch_id, s.name as section_name, b.name as batch_name,
               ta.reg_number_start, ta.reg_number_end
        FROM tutor_assignments ta
        JOIN sections s ON ta.section_id = s.id
        JOIN batches b ON ta.batch_id = b.id
        WHERE ta.faculty_id = ? AND ta.is_active = TRUE
        LIMIT 1
    `, [facultyId]);
    return rows[0] || null;
};

// Helper to get student IDs in range
const getTutorStudentIds = async (assignment: any) => {
    let query = `
        SELECT id FROM (
            SELECT u.id, ROW_NUMBER() OVER (ORDER BY sp.roll_number ASC) as row_num
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE sp.batch_id = ? AND sp.section_id = ? AND u.role = 'student'
        ) as ranked
    `;
    const params = [assignment.batch_id, assignment.section_id];
    
    if (assignment.reg_number_start && assignment.reg_number_end) {
        query += ` WHERE row_num >= ? AND row_num <= ?`;
        params.push(parseInt(assignment.reg_number_start), parseInt(assignment.reg_number_end));
    }
    
    const [rows]: any = await pool.query(query, params);
    return rows.map((r: any) => r.id);
};

// GET /api/tutor-analytics/overview
export const getClassOverview = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const assignment = await getTutorAssignment(facultyId);
        if (!assignment) {
            return res.json({ hasAssignment: false, message: 'No active tutor assignment found.' });
        }

        const studentIds = await getTutorStudentIds(assignment);
        if (studentIds.length === 0) {
             return res.json({
                hasAssignment: true,
                sectionName: assignment.section_name,
                batchName: assignment.batch_name,
                totalStudents: 0,
                avgAttendance: 0
            });
        }

        // Total Students
        const totalStudents = studentIds.length;

        // Attendance Avg
        const [attendance]: any = await pool.query(`
            SELECT AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as avg_attendance
            FROM attendance
            WHERE student_id IN (?)
        `, [studentIds]);

        res.json({
            hasAssignment: true,
            sectionName: assignment.section_name,
            batchName: assignment.batch_name,
            totalStudents,
            avgAttendance: attendance[0].avg_attendance || 0
        });
    } catch (error) {
        console.error('Tutor Overview Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/tutor-analytics/attendance
export const getAttendanceMetrics = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const assignment = await getTutorAssignment(facultyId);
        if (!assignment) return res.json([]);

        const studentIds = await getTutorStudentIds(assignment);
        if (studentIds.length === 0) return res.json([]);

        // Last 7 days trend
        const [rows]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%a') as day,
                COUNT(DISTINCT CASE WHEN status = 'present' THEN student_id END) as count
            FROM attendance
            WHERE student_id IN (?) 
            AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `, [studentIds]);

        res.json(rows);
    } catch (error) {
        console.error('Tutor Attendance Metrics Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/tutor-analytics/performance
export const getPerformanceMetrics = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const assignment = await getTutorAssignment(facultyId);
        if (!assignment) return res.json([]);

        const studentIds = await getTutorStudentIds(assignment);
        if (studentIds.length === 0) return res.json([]);

        // Grade Distribution (O, A+, A, B+, B, U)
        const [rows]: any = await pool.query(`
            SELECT 
                CASE 
                    WHEN (marks_obtained / max_marks) * 100 >= 90 THEN 'O (90-100)'
                    WHEN (marks_obtained / max_marks) * 100 >= 80 THEN 'A+ (80-89)'
                    WHEN (marks_obtained / max_marks) * 100 >= 70 THEN 'A (70-79)'
                    WHEN (marks_obtained / max_marks) * 100 >= 60 THEN 'B+ (60-69)'
                    WHEN (marks_obtained / max_marks) * 100 >= 50 THEN 'B (50-59)'
                    ELSE 'U (<50)'
                END as name,
                COUNT(*) as value
            FROM marks m
            JOIN schedules sch ON m.schedule_id = sch.id
            WHERE m.student_id IN (?) AND m.status = 'approved'
            GROUP BY name
        `, [studentIds]);

        // Map colors for frontend
        const colorMap: any = {
            'O (90-100)': '#f59e0b',
            'A+ (80-89)': '#10b981',
            'A (70-79)': '#3b82f6',
            'B+ (60-69)': '#8b5cf6',
            'B (50-59)': '#ec4899',
            'U (<50)': '#ef4444'
        };

        const distribution = rows.map((r: any) => ({
            ...r,
            color: colorMap[r.name] || '#6b7280'
        }));

        res.json(distribution);
    } catch (error) {
        console.error('Tutor Performance Metrics Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/tutor-analytics/subjects
export const getSubjectMetrics = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const assignment = await getTutorAssignment(facultyId);
        if (!assignment) return res.json([]);

        const studentIds = await getTutorStudentIds(assignment);
        if (studentIds.length === 0) return res.json([]);

        const [rows]: any = await pool.query(`
            SELECT 
                s.name as subject,
                AVG((m.marks_obtained / m.max_marks) * 100) as avg,
                (SUM(CASE WHEN (m.marks_obtained / m.max_marks) * 100 >= 50 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as pass
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id IN (?) AND m.status = 'approved'
            GROUP BY s.id
        `, [studentIds]);

        res.json(rows);
    } catch (error) {
        console.error('Tutor Subject Metrics Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
