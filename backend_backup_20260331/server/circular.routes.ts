
import express from 'express';
import { getCirculars, createCircular, updateCircular, deleteCircular } from './circular.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadAssignment } from './upload.config.js';

const router = express.Router();

router.get('/', authenticateToken, getCirculars);
router.post('/', authenticateToken, uploadAssignment.single('file'), createCircular);
router.put('/:id', authenticateToken, uploadAssignment.single('file'), updateCircular);
router.delete('/:id', authenticateToken, deleteCircular);

export default router;
