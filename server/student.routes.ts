import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from './student.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

// Student Self Routes
import { getStudentProfile, getStudentMarks, updateStudentProfile, getStudentSubjects, getStudentAttendance } from './student.controller.js';
router.get('/profile', authenticateToken, getStudentProfile);
router.get('/marks', authenticateToken, getStudentMarks);
router.get('/subjects', authenticateToken, getStudentSubjects);
router.get('/attendance', authenticateToken, getStudentAttendance);
router.put('/profile', authenticateToken, updateStudentProfile);

// Public/Admin Routes
router.get('/', authenticateToken, getStudents); // Admin uses this
router.post('/', authenticateToken, createStudent);
router.put('/:id', authenticateToken, updateStudent);
router.delete('/:id', authenticateToken, deleteStudent);


export default router;
