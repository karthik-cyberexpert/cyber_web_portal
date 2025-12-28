import { Router } from 'express';
import { getStudentTimetable } from './student-timetable.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStudentTimetable);

export default router;
