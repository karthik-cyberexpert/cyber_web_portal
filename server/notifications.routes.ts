import express from 'express';
import { authenticateToken } from './auth.middleware.js';
import * as notificationController from './notifications.controller.js';

const router = express.Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;
