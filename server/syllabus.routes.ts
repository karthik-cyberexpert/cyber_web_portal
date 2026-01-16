import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSyllabusStatus, getStudentSyllabus, uploadSyllabus, deleteSyllabus } from './syllabus.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'syllabus-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 } // 1MB limit
});

router.get('/', authenticateToken, getSyllabusStatus);
router.get('/student', authenticateToken, getStudentSyllabus);
router.post('/upload', authenticateToken, upload.single('file'), uploadSyllabus);
router.delete('/:id', authenticateToken, deleteSyllabus);

export default router;
