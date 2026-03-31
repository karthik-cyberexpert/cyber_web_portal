import { Router } from 'express';
import { getStudentNotes } from './student-notes.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentNotes);

export default router;
