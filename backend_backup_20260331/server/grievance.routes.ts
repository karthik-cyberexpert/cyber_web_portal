
import express from 'express';
import { authenticateToken } from './auth.middleware.js';
import { createGrievance, getGrievances, updateGrievanceStatus, upload } from './grievance.controller.js';

const router = express.Router();

router.post('/', authenticateToken, upload.single('attachment'), createGrievance);
router.get('/', authenticateToken, getGrievances);
router.put('/:id/status', authenticateToken, updateGrievanceStatus);

export default router;
