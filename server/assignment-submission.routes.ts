import { Router } from 'express';
import { submitAssignment, uploadMiddleware } from './assignment-submission.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.post('/', authenticateToken, uploadMiddleware, submitAssignment);

export default router;
