import { Router } from 'express';
import { authenticateToken } from './auth.middleware.js';
import { getStudentTrend, getTutorTrend, getAdminTrend } from './attendance-trend.controller.js';

const router = Router();

// Student: Get their leave/OD trend for current semester
router.get('/student', authenticateToken, getStudentTrend);

// Tutor: Get section's absence/OD trend for current semester
router.get('/tutor', authenticateToken, getTutorTrend);

// Admin: Get all batches overview (active semesters only)
router.get('/admin', authenticateToken, getAdminTrend);

export default router;
