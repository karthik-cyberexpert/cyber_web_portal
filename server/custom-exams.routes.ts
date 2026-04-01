import express from 'express';
import { authenticateToken } from './auth.middleware.js';
import { createCustomExam, getCustomExams, deleteCustomExam } from './custom-exams.controller.js';

const router = express.Router();

router.post('/', authenticateToken, createCustomExam);
router.get('/', authenticateToken, getCustomExams);
router.delete('/:id', authenticateToken, deleteCustomExam);

export default router;
