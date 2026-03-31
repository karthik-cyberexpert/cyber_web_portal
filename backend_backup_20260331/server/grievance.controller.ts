
import { Request, Response } from 'express';
import { pool } from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/grievances';
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

export const upload = multer({ storage: storage });

// Create Grievance
export const createGrievance = async (req: Request, res: Response) => {
    try {
        const { title, description, target_role } = req.body;
        const studentId = (req as any).user.id;
        const file = req.file;

        let attachmentPath = null;
        if (file) {
            attachmentPath = `uploads/grievances/${file.filename}`;
        }

        const [result]: any = await pool.query(
            `INSERT INTO grievances (user_id, title, description, target_role, attachment_path) 
             VALUES (?, ?, ?, ?, ?)`,
            [studentId, title, description, target_role, attachmentPath]
        );

        res.status(201).json({ message: 'Grievance submitted successfully', id: result.insertId });
    } catch (error) {
        console.error('Create Grievance Error:', error);
        res.status(500).json({ message: 'Error submitting grievance' });
    }
};

// Get Grievances (Filtered by Role)
export const getGrievances = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role; // 'student', 'tutor', 'admin', 'faculty'
        
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT g.*, u.name as student_name, sp.roll_number,
                   b.name as batch_name, s.name as section_name,
                   au.name as action_by_name
            FROM grievances g
            JOIN users u ON g.user_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN sections s ON sp.section_id = s.id
            LEFT JOIN users au ON g.action_by = au.id
        `;
        let countQuery = `SELECT COUNT(*) as total FROM grievances g`;
        let params: any[] = [];

        // Role-based filtering
        // Role-based filtering
        if (userRole === 'student') {
            query += ` WHERE g.user_id = ?`;
            countQuery += ` WHERE g.user_id = ?`;
            params.push(userId);
        } else if (userRole === 'admin') {
            // Admin sees ALL grievances
        } else if (userRole === 'tutor' || userRole === 'faculty') {
              query += ` WHERE g.target_role = 'Tutor'`;
              countQuery += ` WHERE g.target_role = 'Tutor'`;
        }

        query += ` ORDER BY g.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        console.log('DEBUG: getGrievances', { userId, userRole, query, params });

        const [rows]: any = await pool.query(query, params);
        const [countResult]: any = await pool.query(countQuery, params.slice(0, -2)); // Remove limit/offset for count

        res.json({
            grievances: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        });

    } catch (error) {
        console.error('Get Grievances Error:', error);
        res.status(500).json({ message: 'Error fetching grievances' });
    }
};

// Update Status (Solve/Return)
export const updateGrievanceStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, action_reason } = req.body; // 'Solved', 'Returned'
        const actionBy = (req as any).user.id;

        await pool.query(
            `UPDATE grievances 
             SET status = ?, action_by = ?, action_reason = ?, updated_at = NOW() 
             WHERE id = ?`,
            [status, actionBy, action_reason, id]
        );

        res.json({ message: 'Grievance status updated' });
    } catch (error) {
         console.error('Update Grievance Error:', error);
         res.status(500).json({ message: 'Error updating grievance' });
    }
};
