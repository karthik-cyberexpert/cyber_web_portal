import express from 'express';
import { uploadUserAvatar, getUserAvatar } from './avatar.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadAvatar } from './upload.config.js';

const router = express.Router();

// POST /api/avatar - Upload avatar for authenticated user
router.post('/', authenticateToken, uploadAvatar.single('avatar'), uploadUserAvatar);

// GET /api/avatar - Get current user's avatar
router.get('/', authenticateToken, getUserAvatar);

export default router;
