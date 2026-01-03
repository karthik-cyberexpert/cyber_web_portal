import { Request, Response } from 'express';
import { pool } from './db.js';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        // Fetch notifications for the user or system-wide (user_id IS NULL)
        const [rows]: any = await pool.query(
            'SELECT * FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = FALSE ORDER BY created_at DESC',
            [userId]
        );
        
        res.json(rows);
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
            [id, userId]
        );
        
        res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE (user_id = ? OR user_id IS NULL)',
            [userId]
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
