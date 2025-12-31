
import { Request, Response } from 'express';
import { pool } from './db.js';
import fs from 'fs';
import path from 'path';

// Standard Questions constant (backend copy)
const FACULTY_FEEDBACK_QUESTIONS = [
    { text: "How much of the syllabus was covered in the class?", type: "mcq", options: ["85-100%", "70-84%", "55-69%", "30-54%", "Below 30%"] },
    { text: "How well did the teachers prepare for the classes?", type: "mcq", options: ["Thoroughly", "Satisfactorily", "Poorly", "Indifferently", "Won’t teach at all"] },
    { text: "How well were the teachers able to communicate?", type: "mcq", options: ["Always effective", "Sometimes effective", "Just satisfactorily", "Generally ineffective", "Very poor communication"] },
    { text: "The teacher’s approach to teaching can best be described as", type: "mcq", options: ["Excellent", "Very good", "Good", "Fair", "Poor"] },
    { text: "The teachers illustrate the concepts through examples and applications.", type: "mcq", options: ["Every time", "Usually", "Occasionally/Sometimes", "Rarely", "Never"] },
    { text: "The teachers identify your strengths and encourage you with providing right level of challenges.", type: "mcq", options: ["Fully", "Reasonably", "Partially", "Slightly", "Unable to"] },
    { text: "Teachers are able to identify your weaknesses and help you to overcome them.", type: "mcq", options: ["Every time", "Usually", "Occasionally/Sometimes", "Rarely", "Never"] },
    { text: "The overall quality of teaching-learning process toward this teacher is very good.", type: "mcq", options: ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"] }
];

// Create Feedback
export const createFeedback = async (req: Request | any, res: Response) => {
    const { title, type, batch_id, section_id, closing_date, custom_questions } = req.body;
    
    // basic validation
    if (!title || !type || !closing_date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert Form
        const [result]: any = await connection.query(`
            INSERT INTO feedback_forms (title, type, batch_id, section_id, closing_date, status)
            VALUES (?, ?, ?, ?, ?, 'Open')
        `, [title, type, batch_id === 'all' ? null : batch_id, section_id === 'all' ? null : section_id, closing_date]);
        
        const formId = result.insertId;

        // 2. Insert Questions
        if (type === 'faculty') {
            // Insert standard questions
            for (let i = 0; i < FACULTY_FEEDBACK_QUESTIONS.length; i++) {
                const q = FACULTY_FEEDBACK_QUESTIONS[i];
                await connection.query(`
                    INSERT INTO feedback_questions (feedback_form_id, question_text, question_type, options, order_index)
                    VALUES (?, ?, ?, ?, ?)
                `, [formId, q.text, q.type, JSON.stringify(q.options), i]);
            }
        } else if (type === 'other' && Array.isArray(custom_questions)) {
            // Insert custom questions
             for (let i = 0; i < custom_questions.length; i++) {
                const q = custom_questions[i];
                await connection.query(`
                    INSERT INTO feedback_questions (feedback_form_id, question_text, question_type, options, order_index)
                    VALUES (?, ?, ?, ?, ?)
                `, [formId, q.text, q.type, q.options ? JSON.stringify(q.options) : null, i]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Feedback created successfully', id: formId });

    } catch (error) {
        await connection.rollback();
        console.error('Create Feedback Error:', error);
        res.status(500).json({ message: 'Error creating feedback' });
    } finally {
        connection.release();
    }
};

// Get Admin Feedback List
export const getAdminFeedback = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(`
            SELECT 
                f.*,
                b.name as batch_name,
                s.name as section_name,
                (SELECT COUNT(*) FROM feedback_questions WHERE feedback_form_id = f.id) as question_count,
                (SELECT COUNT(*) FROM feedback_responses WHERE feedback_form_id = f.id) as response_count
            FROM feedback_forms f
            LEFT JOIN batches b ON f.batch_id = b.id
            LEFT JOIN sections s ON f.section_id = s.id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
         console.error('Get Admin Feedback Error:', error);
         res.status(500).json({ message: 'Error fetching feedback' });
    }
};

// Delete Feedback
export const deleteFeedback = async (req: Request, res: Response) => {
     try {
        await pool.query('DELETE FROM feedback_forms WHERE id = ?', [req.params.id]);
        res.json({ message: 'Feedback deleted' });
     } catch (error) {
         console.error('Delete Feedback Error:', error);
         res.status(500).json({ message: 'Error deleting feedback' });
     }
}

// Get Student Feedback List (Filtered by Batch/Section)
export const getStudentFeedback = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Get student's batch/section from profile
        const [student]: any = await pool.query(`
            SELECT sp.section_id, s.batch_id 
            FROM student_profiles sp 
            JOIN sections s ON sp.section_id = s.id
            WHERE sp.user_id = ?
        `, [userId]);

        if (student.length === 0) {
             return res.json([]); // No profile found
        }
        
        const { section_id, batch_id } = student[0];

        // Fetch Open Feedbacks matching criteria AND check for completion
        // Use subquery to avoid duplicate rows if multiple responses exist (legacy data)
        const [rows]: any = await pool.query(`
            SELECT 
                f.id, f.title, f.type, f.closing_date, f.status,
                (SELECT COUNT(*) FROM feedback_responses fr WHERE fr.feedback_form_id = f.id AND fr.student_id = ?) > 0 as is_completed
            FROM feedback_forms f
            WHERE f.status = 'Open'
            AND (f.batch_id IS NULL OR f.batch_id = ?)
            AND (f.section_id IS NULL OR f.section_id = ?)
            ORDER BY f.closing_date ASC
        `, [userId, batch_id, section_id]);

        res.json(rows);

    } catch (error) {
        console.error('Get Student Feedback Error:', error);
        res.status(500).json({ message: 'Error fetching student feedback' });
    }
};

// Get Feedback Details (Questions + Target Targets if Faculty)
export const getFeedbackDetails = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const formId = req.params.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
         // 1. Get Form Info
        const [forms]: any = await pool.query('SELECT * FROM feedback_forms WHERE id = ?', [formId]);
        if (forms.length === 0) return res.status(404).json({ message: 'Form not found' });
        const form = forms[0];

        // 2. Get Questions
        const [questions]: any = await pool.query('SELECT * FROM feedback_questions WHERE feedback_form_id = ? ORDER BY order_index ASC', [formId]);

        // 3. If Type is 'faculty', fetch assigned faculty targets
        let targets: any[] = [];
        if (form.type === 'faculty') {
             // Find student section
             const [student]: any = await pool.query('SELECT section_id FROM student_profiles WHERE user_id = ?', [userId]);
             if (student.length > 0) {
                 const sectionId = student[0].section_id;
                 
                 // Get Subject Allocations for this section
                 // Join with subjects and faculty profiles/users to get names
                 const [allocations]: any = await pool.query(`
                    SELECT 
                        sa.faculty_id, 
                        sub.name as subject_name,
                        u.name as faculty_name 
                    FROM subject_allocations sa
                    JOIN subjects sub ON sa.subject_id = sub.id
                    JOIN users u ON sa.faculty_id = u.id
                    WHERE sa.section_id = ? AND u.role != 'admin'
                 `, [sectionId]);
                 
                 targets = allocations;
             }
        }

        res.json({
            form,
            questions,
            targets // Empty if type is 'other'
        });

    } catch (error: any) {
        console.error('Get Feedback Details Error:', error);
        if (error.sqlMessage) console.error('SQL Error:', error.sqlMessage);
        res.status(500).json({ message: 'Error fetching details', error: error.message });
    }
};

// Submit Feedback Response
export const submitFeedback = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const formId = req.params.id;
    const { answers } = req.body; // Array of { question_id, target_id, answer }

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ message: 'No answers provided' });

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if already submitted
        const [existing]: any = await connection.query('SELECT id FROM feedback_responses WHERE feedback_form_id = ? AND student_id = ?', [formId, userId]);
        if (existing.length > 0) {
             connection.release();
             return res.status(400).json({ message: 'Feedback already submitted' });
        }

        // 2. Use User ID directly as student_id
        const studentId = userId;

        // 3. Create Response Record
        const [result]: any = await connection.query(`
            INSERT INTO feedback_responses (feedback_form_id, student_id)
            VALUES (?, ?)
        `, [formId, studentId]);
        const responseId = result.insertId;

        // 4. Insert Answers
        for (const ans of answers) {
            await connection.query(`
                INSERT INTO feedback_answers (response_id, question_id, target_id, answer)
                VALUES (?, ?, ?, ?)
            `, [responseId, ans.question_id, ans.target_id || null, ans.answer]);
        }

        await connection.commit();
        res.json({ message: 'Feedback submitted successfully' });

    } catch (error: any) {
        await connection.rollback();
        console.error('Submit Feedback Error:', error);
        
        const logData = `
------------------------------------------------
Timestamp: ${new Date().toISOString()}
Error: ${error.message}
SQL: ${error.sql}
SQL Message: ${error.sqlMessage}
User ID: ${userId}
Form ID: ${formId}
Answers Payload: ${JSON.stringify(answers)}
------------------------------------------------
`;
        try {
            fs.appendFileSync(path.join(process.cwd(), 'submit_error_log.txt'), logData);
        } catch (e) { console.error("Failed to write log", e); }

        if (error.sqlMessage) console.error('SQL Error:', error.sqlMessage);
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    } finally {
        connection.release();
    }
};

// Get Feedback Results (Admin)
export const getFeedbackResults = async (req: Request, res: Response) => {
    const formId = req.params.id;
    try {
        // 0. Get Form Details
        const [formDetails]: any = await pool.query(`
            SELECT f.*, b.name as batch_name, s.name as section_name
            FROM feedback_forms f
            LEFT JOIN batches b ON f.batch_id = b.id
            LEFT JOIN sections s ON f.section_id = s.id
            WHERE f.id = ?
        `, [formId]);

        if (!formDetails.length) return res.status(404).json({ message: 'Feedback form not found' });

        // 1. Get Questions
        const [questions]: any = await pool.query('SELECT * FROM feedback_questions WHERE feedback_form_id = ? ORDER BY order_index', [formId]);

        // 2. Get Respondents
        const [respondents]: any = await pool.query(`
            SELECT u.id as user_id, u.name, u.email, sp.roll_number, fr.submitted_at
            FROM feedback_responses fr
            JOIN users u ON fr.student_id = u.id
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE fr.feedback_form_id = ?
            ORDER BY fr.submitted_at DESC
        `, [formId]);

        // 3. Get Answers (Corrected column name: response_id)
        const [answers]: any = await pool.query(`
            SELECT fa.question_id, fa.answer, fr.student_id
            FROM feedback_answers fa
            JOIN feedback_responses fr ON fa.response_id = fr.id
            WHERE fr.feedback_form_id = ?
        `, [formId]);

        // Aggregate Stats (Count per option)
        const stats: any = {};
        answers.forEach((a: any) => {
            if (!stats[a.question_id]) stats[a.question_id] = {};
            const val = a.answer;
            stats[a.question_id][val] = (stats[a.question_id][val] || 0) + 1;
        });

        // Map answers by student ID for individual view
        const studentAnswers: any = {};
        answers.forEach((a: any) => {
            if (!studentAnswers[a.student_id]) studentAnswers[a.student_id] = {};
            studentAnswers[a.student_id][a.question_id] = a.answer;
        });

        res.json({
            form: formDetails[0],
            questions,
            respondents,
            stats,
            studentAnswers
        });

    } catch (error) {
        console.error('Get Feedback Results Error:', error);
        res.status(500).json({ message: 'Error fetching results' });
    }
};
