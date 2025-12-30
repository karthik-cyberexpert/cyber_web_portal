import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const UPLOADS_BASE = path.join(__dirname, '../uploads');

// Create directory structure if it doesn't exist
const createUploadDirs = () => {
    const dirs = [
        UPLOADS_BASE,
        path.join(UPLOADS_BASE, 'notes'),
        path.join(UPLOADS_BASE, 'avatars'),
        path.join(UPLOADS_BASE, 'assignments'),
        path.join(UPLOADS_BASE, 'circulars'),
        path.join(UPLOADS_BASE, 'temp')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

// Initialize directories on import
createUploadDirs();

// Storage configuration for Notes
const notesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOADS_BASE, 'notes');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_') // Sanitize filename
            .substring(0, 50); // Limit length
        cb(null, `${uniqueSuffix}_${basename}${ext}`);
    }
});

// Storage configuration for Avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOADS_BASE, 'avatars');
        cb(null, uploadPath);
    },
    filename: (req: any, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${userId}${ext}`);
    }
});

// Storage configuration for Assignments
const assignmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOADS_BASE, 'assignments');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `${uniqueSuffix}_${basename}${ext}`);
    }
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};

// Image-only filter for avatars
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Export multer instances
export const uploadNote = multer({
    storage: notesStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    }
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

export const uploadAssignment = multer({
    storage: assignmentStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Storage configuration for Leave Requests
const leaveStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOADS_BASE, 'leave_requests');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `leave_${uniqueSuffix}_${basename}${ext}`);
    }
});

// Storage configuration for OD Requests
const odStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOADS_BASE, 'od_requests');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `od_${uniqueSuffix}_${basename}${ext}`);
    }
});

export const uploadLeave = multer({
    storage: leaveStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export const uploadOD = multer({
    storage: odStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Helper to get file URL from path
export const getFileUrl = (filePath: string): string => {
    // Convert absolute path to relative URL
    const relativePath = filePath.replace(UPLOADS_BASE, '').replace(/\\/g, '/');
    return `/uploads${relativePath}`;
};

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export { UPLOADS_BASE };
