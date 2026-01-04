import { Request, Response } from 'express';
import { pool } from './db.js';
import { createBulkNotifications } from './notifications.utils.js';
import { getFileUrl, formatFileSize } from './upload.config.js';
import path from 'path';
import fs from 'fs';

// Get Assignments for Faculty
export const getFacultyAssignments = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // FIX: Handle sa.section_id IS NULL (Global Allocation) -> Join all sections in matching semester
        // We use sec.id for student_count to get accurate counts for the specific section row
        const [rows]: any = await pool.query(`
            SELECT 
                a.id, a.title, a.description, a.due_date, a.max_score, a.attachment_url, a.created_at,
                s.name as subject_name, s.code as subject_code,
                sec.name as section_name,
                b.name as batch_name,
                sa.id as subject_allocation_id,
                
                -- Student Count (based on section row)
                (SELECT COUNT(*) FROM student_profiles sp WHERE sp.section_id = sec.id) as student_count,
                
                -- Submission Stats
                (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id) as submission_count,
                (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id AND asub.status = 'Graded') as graded_count
                
            FROM assignments a
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON (sa.section_id = sec.id OR sa.section_id IS NULL)
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? AND sa.is_active = TRUE
              AND s.semester = b.current_semester
            ORDER BY a.created_at DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Faculty Assignments Error:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};

// Get Faculty's Subject Allocations
export const getFacultySubjectAllocations = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // FIX: Handle sa.section_id IS NULL -> Join all sections in matching semester
        const [rows]: any = await pool.query(`
            SELECT 
                sa.id as allocation_id,
                s.id as subject_id, s.name as subject_name, s.code as subject_code,
                sec.id as section_id, sec.name as section_name,
                b.id as batch_id, b.name as batch_name
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON (sa.section_id = sec.id OR sa.section_id IS NULL)
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? 
              AND sa.is_active = TRUE
              AND s.semester = b.current_semester
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Faculty Subject Allocations Error:', error);
        res.status(500).json({ message: 'Error fetching subject allocations' });
    }
};

// Create Assignment with File
export const createAssignmentWithFile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    console.log('[createAssignmentWithFile] Request body:', req.body);
    console.log('[createAssignmentWithFile] File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');

    const { title, description, subject_allocation_id, due_date, max_score } = req.body;
    const file = req.file;

    console.log('[createAssignmentWithFile] Parsed values:', { title, subject_allocation_id, due_date, max_score });

    if (!title || !subject_allocation_id || !due_date) {
        console.log('[createAssignmentWithFile] Validation failed');
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ message: 'Title, subject allocation and due date are required' });
    }

    try {
        // Verify the subject_allocation exists and belongs to this faculty
        console.log('[createAssignmentWithFile] Verifying subject allocation:', subject_allocation_id);
        const [allocation]: any = await pool.query(
            'SELECT id, faculty_id FROM subject_allocations WHERE id = ?',
            [subject_allocation_id]
        );

        if (allocation.length === 0) {
            console.log('[createAssignmentWithFile] Subject allocation not found');
            return res.status(404).json({ message: 'Subject allocation not found' });
        }

        if (allocation[0].faculty_id !== userId) {
            console.log('[createAssignmentWithFile] Not authorized for this allocation');
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        let attachment_url = null;

        if (file) {
            attachment_url = getFileUrl(file.path);
            console.log('[createAssignmentWithFile] File URL:', attachment_url);
        }

        console.log('[createAssignmentWithFile] Inserting assignment...');
        const [result]: any = await pool.query(`
            INSERT INTO assignments (title, description, subject_allocation_id, due_date, max_score, attachment_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, description || null, subject_allocation_id, due_date, max_score || 100, attachment_url]);

        console.log('[createAssignmentWithFile] Assignment created with ID:', result.insertId);

        const [newAssignment]: any = await pool.query(`
            SELECT 
                a.id, a.title, a.description, a.due_date, a.max_score, a.attachment_url, a.created_at,
                s.name as subject_name, s.code as subject_code,
                sec.name as section_name,
                b.name as batch_name
            FROM assignments a
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON sa.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE a.id = ?
        `, [result.insertId]);

        console.log('[createAssignmentWithFile] Success!');
        res.status(201).json(newAssignment[0]);

        // Notify students in the target section
        try {
            const [allocationInfo]: any = await pool.query('SELECT section_id, subject_id FROM subject_allocations WHERE id = ?', [subject_allocation_id]);
            if (allocationInfo.length > 0) {
                const sectionId = allocationInfo[0].section_id;
                const [students]: any = await pool.query('SELECT user_id FROM student_profiles WHERE section_id = ?', [sectionId]);
                const studentIds = students.map((s: any) => s.user_id);
                
                const [subjectInfo]: any = await pool.query('SELECT name FROM subjects WHERE id = ?', [allocationInfo[0].subject_id]);
                const subjectName = subjectInfo[0]?.name || 'a subject';

                await createBulkNotifications(
                    studentIds,
                    'New Assignment',
                    `A new assignment "${title}" has been posted for ${subjectName}. Due date: ${new Date(due_date).toLocaleDateString()}`
                );
            }
        } catch (notifError) {
            console.error('Error sending assignment notification:', notifError);
        }
    } catch (error: any) {
        console.error('[createAssignmentWithFile] Error:', error);
        console.error('[createAssignmentWithFile] Error details:', {
            message: error.message,
            code: error.code,
            sql: error.sql
        });
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: 'Error creating assignment', error: error.message });
    }
};

// Update Assignment
export const updateAssignment = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const { title, description, subject_allocation_id, due_date, max_score } = req.body;
    
    // Note: If a file is uploaded, we update the attachment_url.
    const file = req.file;

    try {
        // Verify ownership
        const [assignment]: any = await pool.query(`
            SELECT sa.faculty_id, a.attachment_url
            FROM assignments a
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            WHERE a.id = ?
        `, [id]);

        if (assignment.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (assignment[0].faculty_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let attachment_url = assignment[0].attachment_url;
        if (file) {
            // In a real app, delete old file logic here
            attachment_url = getFileUrl(file.path);
        }

        await pool.query(`
            UPDATE assignments 
            SET title = ?, description = ?, subject_allocation_id = ?, due_date = ?, max_score = ?, attachment_url = ?
            WHERE id = ?
        `, [title, description || null, subject_allocation_id, due_date, max_score || 100, attachment_url, id]);

        const [updatedAssignment]: any = await pool.query(`
            SELECT 
                a.id, a.title, a.description, a.due_date, a.max_score, a.attachment_url, a.created_at,
                s.name as subject_name, s.code as subject_code,
                sec.name as section_name,
                b.name as batch_name,
                sa.id as subject_allocation_id,
                 -- Student Count (based on section)
                (SELECT COUNT(*) FROM student_profiles sp WHERE sp.section_id = sa.section_id) as student_count,
                 -- Submission Stats
                (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id) as submission_count,
                (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id AND asub.status = 'Graded') as graded_count
            FROM assignments a
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON sa.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE a.id = ?
        `, [id]);

        res.json(updatedAssignment[0]);
    } catch (error) {
        console.error('Update Assignment Error:', error);
        res.status(500).json({ message: 'Error updating assignment' });
    }
};

// Delete Assignment
export const deleteAssignment = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;

    try {
        // Verify ownership
        const [assignment]: any = await pool.query(`
            SELECT sa.faculty_id 
            FROM assignments a
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            WHERE a.id = ?
        `, [id]);

        if (assignment.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (assignment[0].faculty_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete Assignment Error:', error);
        res.status(500).json({ message: 'Error deleting assignment' });
    }
};

// Get Submissions for Assignment
export const getSubmissions = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;

    try {
        const [rows]: any = await pool.query(`
            SELECT 
                asub.id, asub.file_url, asub.submitted_at, asub.score, asub.feedback, asub.status,
                u.id as student_id, u.name as student_name, u.email as student_email,
                sp.roll_number
            FROM assignment_submissions asub
            JOIN users u ON asub.student_id = u.id
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE asub.assignment_id = ?
            ORDER BY asub.submitted_at DESC
        `, [assignmentId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
};
