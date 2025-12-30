import { Router } from 'express';
import { getStudentResumeData, updatePersonalDetails } from './student-resume-data.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentResumeData);
router.put('/update-personal-info', authenticateToken, updatePersonalDetails);

export default router;
