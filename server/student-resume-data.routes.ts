import { Router } from 'express';
import { getStudentResumeData } from './student-resume-data.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentResumeData);

export default router;
