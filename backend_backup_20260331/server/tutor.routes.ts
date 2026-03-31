import express from 'express';
import { getAllTutors, assignTutor, deleteTutor, getTutorClass, getTutorTimetable } from './tutor.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllTutors);
router.post('/', authenticateToken, assignTutor);
router.delete('/:id', authenticateToken, deleteTutor);

// Tutor Class Management
router.get('/class', authenticateToken, getTutorClass);
router.get('/timetable', authenticateToken, getTutorTimetable);

export default router;
