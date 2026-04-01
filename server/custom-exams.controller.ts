import { Request, Response } from 'express';
import { pool } from './db.js';
import { createNotification } from './notifications.controller.js';

// Create a new custom exam
export const createCustomExam = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    const { subjectCode, sectionId, title, questionBreakdown } = req.body;
    // questionBreakdown: [{ mark: number, count: number }]

    try {
        // Resolve subjectId and batchId
        const [subjects]: any = await pool.query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
        if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
        const subjectId = subjects[0].id;

        const [sections]: any = await pool.query('SELECT batch_id FROM sections WHERE id = ?', [sectionId]);
        if (sections.length === 0) return res.status(404).json({ message: 'Section not found' });
        const batchId = sections[0].batch_id;

        // Auto-calculate total marks
        let totalMarks = 0;
        questionBreakdown.forEach((q: any) => {
            totalMarks += (q.mark * q.count);
        });

        // Use custom label format
        const examTypeLabel = `CUSTOM_${Date.now()}`;

        await pool.query(
            `INSERT INTO custom_exams (faculty_id, subject_id, section_id, batch_id, title, exam_type_label, question_breakdown, total_marks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [facultyId, subjectId, sectionId, batchId, title, examTypeLabel, JSON.stringify(questionBreakdown), totalMarks]
        );

        res.json({ message: 'Custom exam created successfully', examTypeLabel });

        // --- Notifications (Non-blocking) ---
        (async () => {
            try {
                const [students]: any = await pool.query('SELECT user_id FROM student_profiles WHERE section_id = ?', [sectionId]);
                for (const student of students) {
                    await createNotification(
                        student.user_id,
                        'New Assessment Scheduled 🖋️',
                        `A new custom exam "${title}" has been scheduled for ${subjectCode}. Check your marks portal for details.`,
                        'info',
                        '/student/marks'
                    );
                }
            } catch (err) {
                console.error("[Custom Exam Notification Error]", err);
            }
        })();
    } catch (e) {
        console.error("Create Custom Exam Error:", e);
        res.status(500).json({ message: 'Error creating custom exam' });
    }
};

// Get custom exams for current user
export const getCustomExams = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let query = `
            SELECT ce.*, s.name as subjectName, s.code as subjectCode, sec.name as sectionName, u.name as facultyName
            FROM custom_exams ce
            JOIN subjects s ON ce.subject_id = s.id
            JOIN sections sec ON ce.section_id = sec.id
            JOIN users u ON ce.faculty_id = u.id
        `;
        const params: any[] = [];

        if (role === 'faculty') {
            query += ' WHERE ce.faculty_id = ?';
            params.push(userId);
        } else if (role === 'student') {
            // Student sees custom exams for their section
            query += ` WHERE ce.section_id = (SELECT section_id FROM student_profiles WHERE user_id = ?)`;
            params.push(userId);
        } else if (role === 'tutor') {
            // Tutor sees custom exams for their section
            query += ` WHERE ce.section_id = (SELECT section_id FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE LIMIT 1)`;
            params.push(userId);
        }
        // Admin sees all

        query += ' ORDER BY ce.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (e) {
        console.error("Get Custom Exams Error:", e);
        res.status(500).json({ message: 'Error fetching exams' });
    }
};

// Delete a custom exam
export const deleteCustomExam = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    const { id } = req.params;

    try {
        const [exam]: any = await pool.query('SELECT * FROM custom_exams WHERE id = ?', [id]);
        if (exam.length === 0) return res.status(404).json({ message: 'Exam not found' });

        if (exam[0].faculty_id !== facultyId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not allowed to delete this exam' });
        }

        await pool.query('DELETE FROM custom_exams WHERE id = ?', [id]);
        // Also consider deleting related marks if absolutely necessary, but user might want to keep records
        res.json({ message: 'Exam deleted' });
    } catch (e) {
        console.error("Delete Custom Exam Error:", e);
        res.status(500).json({ message: 'Error deleting' });
    }
};
