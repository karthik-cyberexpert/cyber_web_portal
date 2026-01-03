import { pool } from './db.js';

async function clearNotifications() {
    const connection = await pool.getConnection();
    try {
        console.log('Clearing all notifications...');
        await connection.query('TRUNCATE TABLE notifications');
        console.log('Notifications cleared successfully.');
    } catch (error) {
        console.error('Error clearing notifications:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

clearNotifications();
