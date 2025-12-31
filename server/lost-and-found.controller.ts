import { Request, Response } from 'express';
import { pool } from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads/lost-found');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 } // 1 MB limit
});

// Create Item
export const createItem = async (req: Request, res: Response) => {
    try {
        const { item_name, description } = req.body;
        const userId = (req as any).user.id;
        const file = req.file;

        let imagePath = null;
        if (file) {
            // Store relative path for frontend access
            imagePath = `uploads/lost-found/${file.filename}`;
        }

        await pool.query(
            `INSERT INTO lost_and_found_items (user_id, item_name, description, image_path) 
             VALUES (?, ?, ?, ?)`,
            [userId, item_name, description, imagePath]
        );

        res.status(201).json({ message: 'Item posted successfully' });
    } catch (error) {
        console.error('Create Lost Item Error:', error);
        res.status(500).json({ message: 'Error posting item' });
    }
};

// Get Items (Sorted by Status then Date)
export const getItems = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(`
            SELECT l.*, u.name as student_name, sp.roll_number,
                   b.name as batch_name, s.name as section_name
            FROM lost_and_found_items l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN sections s ON sp.section_id = s.id
            ORDER BY 
                CASE WHEN l.status = 'active' THEN 1 ELSE 2 END ASC,
                l.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Get Lost Items Error:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
};

// Mark as Found
export const markAsFound = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        // Verify ownership (or allow admin/tutor override if needed, but spec says creator)
        const [item]: any = await pool.query('SELECT user_id FROM lost_and_found_items WHERE id = ?', [itemId]);
        
        if (item.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Strict creator check
        if (item[0].user_id !== userId && userRole !== 'admin') { 
             return res.status(403).json({ message: 'Only the creator can mark this as found' });
        }

        await pool.query('UPDATE lost_and_found_items SET status = ? WHERE id = ?', ['resolved', itemId]);
        res.json({ message: 'Item marked as found' });

    } catch (error) {
        console.error('Mark Found Error:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
};
