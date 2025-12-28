import { Router } from 'express';
import { getStudentStats } from './student-stats.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentStats);

export default router;
