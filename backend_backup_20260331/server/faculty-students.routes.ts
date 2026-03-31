import { Router } from 'express';
import { getStudentsByAllocation } from './faculty-students.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/:allocationId', authenticateToken, getStudentsByAllocation);

export default router;
