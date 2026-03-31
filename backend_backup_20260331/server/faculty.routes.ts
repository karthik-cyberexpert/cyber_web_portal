import express from 'express';
import { getFacultyProfile, getFacultyTimetable, updateFacultyProfile, getAllFaculty } from './faculty.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllFaculty);
router.get('/profile', authenticateToken, getFacultyProfile);
router.put('/profile', authenticateToken, updateFacultyProfile);
router.get('/timetable', authenticateToken, getFacultyTimetable);

export default router;
