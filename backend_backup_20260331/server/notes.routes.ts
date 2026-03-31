import express from 'express';
import { 
    getFacultyNotes, 
    getFacultySubjects, 
    createNoteWithFile, 
    deleteNote, 
    getNotesForSubject,
    incrementDownload 
} from './notes.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadNote } from './upload.config.js';
import { pool } from './db.js';

const router = express.Router();

// Admin analytics route - get all notes with stats
router.get('/analytics', authenticateToken, async (req: any, res) => {
    try {
        const batchId = req.query.batchId;
        
        let query = `
            SELECT 
                n.id, n.title, n.description, n.type, n.file_type, n.file_url, n.file_size,
                n.download_count, n.is_published, n.created_at,
                s.name as subject_name, s.code as subject_code, s.semester,
                sec.name as section_name, sec.id as section_id,
                b.name as batch_name, b.id as batch_id,
                u.name as faculty_name
            FROM notes n
            JOIN subjects s ON n.subject_id = s.id
            LEFT JOIN sections sec ON n.section_id = sec.id
            LEFT JOIN batches b ON sec.batch_id = b.id
            JOIN users u ON n.uploaded_by = u.id
        `;
        
        const params: any[] = [];
        if (batchId && batchId !== 'all') {
            query += ' WHERE b.id = ?';
            params.push(batchId);
        }
        
        query += ' ORDER BY n.created_at DESC';
        
        const [rows]: any = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Notes Analytics Error:', error);
        res.status(500).json({ message: 'Error fetching notes analytics' });
    }
});

// Faculty routes
router.get('/my-notes', authenticateToken, getFacultyNotes);
router.get('/my-subjects', authenticateToken, getFacultySubjects);
router.post('/', authenticateToken, uploadNote.single('file'), createNoteWithFile);
router.delete('/:id', authenticateToken, deleteNote);

// Public/Student routes
router.get('/subject/:subjectId', getNotesForSubject);
router.post('/:id/download', incrementDownload);

export default router;
