import { Router } from 'express';
import { getStudentAssignments } from './student-assignments.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentAssignments);

export default router;
