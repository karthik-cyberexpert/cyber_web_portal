import { pool } from './db.js';

/**
 * Creates a notification for a specific user or for all users (if userId is null)
 */
export async function createNotification(userId: number | null, title: string, message: string, actionUrl?: string) {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, action_url) VALUES (?, ?, ?, ?)',
            [userId, title, message, actionUrl || null]
        );
        console.log(`Notification created: ${title} for ${userId === null ? 'All Users' : 'User ' + userId}`);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

/**
 * Creates notifications for multiple users (e.g., all students in a batch)
 */
export async function createBulkNotifications(userIds: number[], title: string, message: string, actionUrl?: string) {
    if (userIds.length === 0) return;
    
    try {
        const values = userIds.map(id => [id, title, message, actionUrl || null]);
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, action_url) VALUES ?',
            [values]
        );
        console.log(`${userIds.length} Bulk notifications created: ${title}`);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
    }
}
