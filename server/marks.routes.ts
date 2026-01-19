import express from 'express';
import * as marksController from './marks.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

// Faculty Routes
router.get('/faculty/classes', authenticateToken, marksController.getFacultyClasses);
router.get('/faculty/marks', authenticateToken, marksController.getMarks);
router.post('/faculty/marks', authenticateToken, marksController.saveMarks);

// Tutor Routes
router.get('/verification-status', authenticateToken, marksController.getVerificationStatus);
router.get('/detailed-verification', authenticateToken, marksController.getDetailedVerifications);
router.get('/tutor/subjects', authenticateToken, marksController.getTutorSubjects);
router.post('/verify', authenticateToken, marksController.verifyMarks);

// Admin Routes
router.get('/approval-status', authenticateToken, marksController.getApprovalStatus);
router.post('/approve', authenticateToken, marksController.approveMarks);

// Reports
router.get('/batch-marks', authenticateToken, marksController.getMarksByBatch);
router.get('/theory-internal', authenticateToken, marksController.getTheoryInternalMarks);

export default router;
