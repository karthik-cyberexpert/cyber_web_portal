import { Request, Response } from 'express';
import { pool } from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for assignment submissions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'assignments');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalname
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.zip', '.rar','.png','.jpg','.jpeg','.txt','.py','.js','.html','.css','.c','.cpp','.java','.cs','.php','.rb','.go','.swift','.kt','.dart','.ts','.tsx','.jsx','.json','.xml','.yaml','.yml','.md','.sh','.bat','.ps1'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, ZIP, and RAR files are allowed.'));
        }
    }
});

// Middleware for file upload
export const uploadMiddleware = upload.single('file');

// Submit an assignment with file upload
export const submitAssignment = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;
    const assignmentId = req.body.assignmentId; // Get from form data
    const file = req.file;

    console.log('=== ASSIGNMENT SUBMISSION REQUEST ===');
    console.log('Student ID:', studentId);
    console.log('Assignment ID:', assignmentId);
    console.log('File:', file);
    console.log('Body:', req.body);

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment ID is required' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Check if already submitted
        const [existing]: any = await pool.query(
            `SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?`,
            [assignmentId, studentId]
        );

        if (existing.length > 0) {
            // Delete uploaded file if submission already exists
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Assignment already submitted' });
        }

        // Store relative path for file access
        const fileUrl = `/uploads/assignments/${file.filename}`;

        // Insert submission
        await pool.query(
            `INSERT INTO assignment_submissions 
             (assignment_id, student_id, file_url, status, submitted_at) 
             VALUES (?, ?, ?, 'submitted', NOW())`,
            [assignmentId, studentId, fileUrl]
        );

        console.log('=== ASSIGNMENT SUBMISSION DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Assignment ID:', assignmentId);
        console.log('File URL:', fileUrl);
        console.log('Original Filename:', file.originalname);

        res.json({ 
            message: 'Assignment submitted successfully',
            success: true,
            fileUrl: fileUrl,
            fileName: file.originalname
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (file) {
            fs.unlinkSync(file.path);
        }
        console.error('Submit Assignment Error:', error);
        res.status(500).json({ message: 'Error submitting assignment' });
    }
};
