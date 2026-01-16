import { Request, Response } from 'express';
import { pool } from './db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Get faculty syllabus status
export const getSyllabusStatus = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;

    if (!facultyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get distinct subjects assigned to faculty and their syllabus status
        const query = `
            SELECT DISTINCT
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.semester,
                ss.id as syllabus_id,
                ss.file_url,
                ss.original_filename,
                CASE 
                    WHEN ss.id IS NOT NULL THEN 'Uploaded' 
                    ELSE 'Pending' 
                END as status
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            LEFT JOIN subject_syllabus ss ON s.id = ss.subject_id AND ss.faculty_id = ?
            WHERE sa.faculty_id = ? AND sa.is_active = TRUE
            ORDER BY s.semester, s.name
        `;

        const [results]: any = await pool.query(query, [facultyId, facultyId]);
        res.json(results);
    } catch (error) {
        console.error('Get Syllabus Status Error:', error);
        res.status(500).json({ message: 'Error fetching syllabus status' });
    }
};

// Get student syllabus status
export const getStudentSyllabus = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get student's section
        const [studentProfile]: any = await pool.query(
            'SELECT section_id FROM student_profiles WHERE user_id = ?',
            [studentId]
        );

        if (studentProfile.length === 0 || !studentProfile[0].section_id) {
            return res.json([]); // No section assigned or profile not found
        }

        const sectionId = studentProfile[0].section_id;

        const query = `
            SELECT DISTINCT
                s.id as subject_id,
                s.name as subject_name,
                s.code as subject_code,
                u.name as faculty_name,
                ss.file_url,
                CASE 
                    WHEN ss.file_url IS NOT NULL THEN 'Uploaded' 
                    ELSE 'Pending' 
                END as status
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            JOIN users u ON sa.faculty_id = u.id
            LEFT JOIN subject_syllabus ss ON sa.subject_id = ss.subject_id AND sa.faculty_id = ss.faculty_id
            WHERE sa.section_id = ? AND sa.is_active = TRUE
            ORDER BY s.name
        `;

        const [results]: any = await pool.query(query, [sectionId]);
        res.json(results);
    } catch (error) {
        console.error('Get Student Syllabus Error:', error);
        res.status(500).json({ message: 'Error fetching syllabus' });
    }
};

export const uploadSyllabus = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    const { subjectId } = req.body;
    const file = req.file;

    if (!facultyId || !subjectId || !file) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check if file size is > 1MB (handled by multer usually, but good to check)
        if (file.size > 1024 * 1024) {
            // Delete the file if it was saved
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'File size exceeds 1MB limit' });
        }

        const fileUrl = `/uploads/${file.filename}`;

        // Check if syllabus already exists
        const [existing]: any = await pool.query(
            'SELECT * FROM subject_syllabus WHERE subject_id = ? AND faculty_id = ?',
            [subjectId, facultyId]
        );

        if (existing.length > 0) {
            // Delete old file
            const oldFilePath = path.join(uploadsDir, path.basename(existing[0].file_url));
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Update record
            await pool.query(
                `UPDATE subject_syllabus 
                 SET file_url = ?, original_filename = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [fileUrl, file.originalname, existing[0].id]
            );
        } else {
            // Insert new record
            await pool.query(
                `INSERT INTO subject_syllabus (subject_id, faculty_id, file_url, original_filename) 
                 VALUES (?, ?, ?, ?)`,
                [subjectId, facultyId, fileUrl, file.originalname]
            );
        }

        res.json({ message: 'Syllabus uploaded successfully', fileUrl });
    } catch (error) {
        console.error('Upload Syllabus Error:', error);
        res.status(500).json({ message: 'Error uploading syllabus' });
    }
};



export const deleteSyllabus = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    const syllabusId = req.params.id;

    if (!facultyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [syllabus]: any = await pool.query(
            'SELECT * FROM subject_syllabus WHERE id = ? AND faculty_id = ?',
            [syllabusId, facultyId]
        );

        if (syllabus.length === 0) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        // Delete file
        const filePath = path.join(uploadsDir, path.basename(syllabus[0].file_url));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete DB record
        await pool.query('DELETE FROM subject_syllabus WHERE id = ?', [syllabusId]);

        res.json({ message: 'Syllabus deleted successfully' });
    } catch (error) {
        console.error('Delete Syllabus Error:', error);
        res.status(500).json({ message: 'Error deleting syllabus' });
    }
};
