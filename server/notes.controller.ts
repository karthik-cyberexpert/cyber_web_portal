import { Request, Response } from 'express';
import { pool } from './db.js';
import { getFileUrl, formatFileSize } from './upload.config.js';
import path from 'path';
import fs from 'fs';

// Get Notes for Faculty (their own uploads)
export const getFacultyNotes = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [rows]: any = await pool.query(`
            SELECT 
                n.id, n.title, n.description, n.type, n.file_type, n.file_url, n.file_size,
                n.download_count, n.is_published, n.created_at,
                s.name as subject_name, s.code as subject_code,
                sec.name as section_name,
                b.name as batch_name
            FROM notes n
            JOIN subjects s ON n.subject_id = s.id
            LEFT JOIN sections sec ON n.section_id = sec.id
            LEFT JOIN batches b ON sec.batch_id = b.id
            WHERE n.uploaded_by = ?
            ORDER BY n.created_at DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Faculty Notes Error:', error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};

// Get Faculty's Allocated Subjects & Sections (for dropdown)
export const getFacultySubjects = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const [rows]: any = await pool.query(`
            SELECT DISTINCT
                s.id as subject_id, s.name as subject_name, s.code as subject_code,
                sec.id as section_id, sec.name as section_name,
                b.name as batch_name
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN sections sec ON sa.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? 
              AND sa.is_active = TRUE
              AND s.semester = b.current_semester
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Faculty Subjects Error:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
};

// Upload Note with File (Create)
export const createNoteWithFile = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Debug: Log incoming data
    console.log('[createNoteWithFile] Body:', req.body);
    console.log('[createNoteWithFile] File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');

    const { title, description, subject_id, section_id, type } = req.body;
    const file = req.file; // Multer attaches the file here

    console.log('[createNoteWithFile] Parsed values:', { title, subject_id, section_id, type });

    if (!title || !subject_id) {
        console.log('[createNoteWithFile] Validation failed - title:', title, 'subject_id:', subject_id);
        // If file was uploaded but validation fails, delete it
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ message: 'Title and subject are required' });
    }

    try {
        // Get file info if uploaded
        let file_url = null;
        let file_size = null;
        let file_type = 'PDF';

        if (file) {
            file_url = getFileUrl(file.path);
            file_size = formatFileSize(file.size);
            file_type = path.extname(file.originalname).replace('.', '').toUpperCase() || 'PDF';
        }

        const [result]: any = await pool.query(`
            INSERT INTO notes (title, description, subject_id, section_id, type, file_type, file_url, file_size, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, description || null, subject_id, section_id || null, type || 'Note', file_type, file_url, file_size, userId]);

        const [newNote]: any = await pool.query(`
            SELECT 
                n.id, n.title, n.description, n.type, n.file_type, n.file_url, n.file_size,
                n.download_count, n.is_published, n.created_at,
                s.name as subject_name, s.code as subject_code,
                sec.name as section_name
            FROM notes n
            JOIN subjects s ON n.subject_id = s.id
            LEFT JOIN sections sec ON n.section_id = sec.id
            WHERE n.id = ?
        `, [result.insertId]);

        console.log('Note created with file:', { id: result.insertId, file_url, file_size });
        res.status(201).json(newNote[0]);
    } catch (error) {
        console.error('Create Note Error:', error);
        // Clean up file if database insert fails
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: 'Error creating note' });
    }
};

// Delete Note
export const deleteNote = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;

    try {
        // Check if user owns this note
        const [note]: any = await pool.query('SELECT uploaded_by FROM notes WHERE id = ?', [id]);
        if (note.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note[0].uploaded_by !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        await pool.query('DELETE FROM notes WHERE id = ?', [id]);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ message: 'Error deleting note' });
    }
};

// Get Notes for Students (by subject)
export const getNotesForSubject = async (req: Request, res: Response) => {
    const { subjectId } = req.params;

    try {
        const [rows]: any = await pool.query(`
            SELECT 
                n.id, n.title, n.description, n.type, n.file_type, n.file_url, n.file_size,
                n.download_count, n.created_at,
                s.name as subject_name, s.code as subject_code,
                u.name as uploaded_by_name
            FROM notes n
            JOIN subjects s ON n.subject_id = s.id
            JOIN users u ON n.uploaded_by = u.id
            WHERE n.subject_id = ? AND n.is_published = TRUE
            ORDER BY n.created_at DESC
        `, [subjectId]);

        res.json(rows);
    } catch (error) {
        console.error('Get Notes for Subject Error:', error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};

// Increment download count
export const incrementDownload = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await pool.query('UPDATE notes SET download_count = download_count + 1 WHERE id = ?', [id]);
        res.json({ message: 'Download count updated' });
    } catch (error) {
        console.error('Increment Download Error:', error);
        res.status(500).json({ message: 'Error updating download count' });
    }
};
