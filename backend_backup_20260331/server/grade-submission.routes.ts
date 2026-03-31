import { Router } from 'express';
import { gradeSubmission } from './grade-submission.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.post('/', authenticateToken, gradeSubmission);

export default router;
