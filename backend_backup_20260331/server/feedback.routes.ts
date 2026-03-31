
import { Router } from 'express';
import { authenticateToken, authorizeRole } from './auth.middleware.js';
import { createFeedback, getAdminFeedback, deleteFeedback, getStudentFeedback, getFeedbackDetails, submitFeedback, getFeedbackResults } from './feedback.controller.js';

const router = Router();

// Admin Routes
router.post('/', authenticateToken, authorizeRole(['admin']), createFeedback);
router.get('/admin', authenticateToken, authorizeRole(['admin']), getAdminFeedback);
router.get('/:id/results', authenticateToken, authorizeRole(['admin']), getFeedbackResults);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteFeedback);

// Student Routes
router.get('/student', authenticateToken, authorizeRole(['student']), getStudentFeedback);
router.get('/:id/details', authenticateToken, authorizeRole(['student']), getFeedbackDetails);
router.post('/:id/submit', authenticateToken, authorizeRole(['student']), submitFeedback);

export default router;
