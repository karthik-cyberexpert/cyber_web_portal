import express from 'express';
import { 
    getFacultyAssignments, 
    getFacultySubjectAllocations, 
    createAssignmentWithFile, 
    updateAssignment,
    deleteAssignment,
    getSubmissions 
} from './assignment.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadAssignment } from './upload.config.js';

const router = express.Router();

// Faculty routes
router.get('/my-assignments', authenticateToken, getFacultyAssignments);
router.get('/my-allocations', authenticateToken, getFacultySubjectAllocations);
router.post('/', authenticateToken, uploadAssignment.single('file'), createAssignmentWithFile);
router.put('/:id', authenticateToken, uploadAssignment.single('file'), updateAssignment); // Added PUT route
router.delete('/:id', authenticateToken, deleteAssignment);

// Submission routes
router.get('/:assignmentId/submissions', authenticateToken, getSubmissions);

export default router;
