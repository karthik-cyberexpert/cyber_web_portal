import { Request, Response } from 'express';
import { pool } from './db.js';
import { getFileUrl } from './upload.config.js';
import path from 'path';
import fs from 'fs';

// Universal Avatar Upload for all user roles
export const uploadUserAvatar = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Get the file URL
        const avatarUrl = getFileUrl(req.file.path);

        console.log(`[AVATAR] Uploading avatar for User ID: ${userId}, Role: ${userRole}`);
        console.log(`[AVATAR] File saved at: ${req.file.path}`);
        console.log(`[AVATAR] Avatar URL: ${avatarUrl}`);

        // Update user's avatar_url in the database
        await pool.query(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatarUrl, userId]
        );

        console.log(`[AVATAR] Database updated for user ${userId}`);

        res.json({ 
            message: 'Avatar uploaded successfully',
            avatarUrl: avatarUrl
        });

    } catch (error: any) {
        console.error('[AVATAR] Upload error:', error);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('[AVATAR] Failed to cleanup file:', e);
            }
        }
        
        res.status(500).json({ message: 'Error uploading avatar' });
    }
};

// Get current user's avatar
export const getUserAvatar = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [users]: any = await pool.query(
            'SELECT avatar_url FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ avatarUrl: users[0].avatar_url });

    } catch (error: any) {
        console.error('[AVATAR] Get avatar error:', error);
        res.status(500).json({ message: 'Error fetching avatar' });
    }
};
