import { Router } from 'express';
import * as controller from './tutor-analytics.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/overview', authenticateToken, controller.getClassOverview);
router.get('/attendance', authenticateToken, controller.getAttendanceMetrics);
router.get('/performance', authenticateToken, controller.getPerformanceMetrics);
router.get('/subjects', authenticateToken, controller.getSubjectMetrics);

export default router;
