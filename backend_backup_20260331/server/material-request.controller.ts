import { Request, Response } from 'express';
import { pool } from './db.js';

// Create a material request notification
export const createMaterialRequest = async (req: Request | any, res: Response) => {
    const studentId = req.user?.id;
    const { facultyId, description, subject } = req.body;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!facultyId || !description) {
        return res.status(400).json({ message: 'Faculty ID and description are required' });
    }

    try {
        // Get student info
        const [students]: any = await pool.query(
            `SELECT u.name FROM users u WHERE u.id = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const studentName = students[0].name;

        // Create notification for faculty
        await pool.query(
            `INSERT INTO notifications 
             (user_id, type, title, message, is_read, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                facultyId,
                'material_request',
                'Material Request',
                `${studentName} has requested study material: ${description}${subject ? ` for ${subject}` : ''}`
            ,
                false
            ]
        );

        console.log('=== MATERIAL REQUEST DEBUG ===');
        console.log('Student ID:', studentId);
        console.log('Student Name:', studentName);
        console.log('Faculty ID:', facultyId);
        console.log('Description:', description);

        res.json({ 
            message: 'Material request sent successfully',
            success: true
        });
    } catch (error) {
        console.error('Create Material Request Error:', error);
        res.status(500).json({ message: 'Error creating material request' });
    }
};
