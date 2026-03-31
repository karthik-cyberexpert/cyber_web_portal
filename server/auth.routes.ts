import express from 'express';
import { login, googleLogin, setPassword, updatePassword, checkSession } from './auth.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { authLimiter } from './security.middleware.js';

const router = express.Router();

router.get('/check-session', authenticateToken, checkSession);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/set-password', authenticateToken, setPassword);
router.post('/update-password', authenticateToken, updatePassword);

export default router;

