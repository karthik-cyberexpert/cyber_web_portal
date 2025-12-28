import { Router } from 'express';
import { getStudentMarks } from './student-marks.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentMarks);

export default router;
