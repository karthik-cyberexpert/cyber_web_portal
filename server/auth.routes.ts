import express from 'express';
import { login, setPassword, updatePassword } from './auth.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/set-password', authenticateToken, setPassword);
router.post('/update-password', authenticateToken, updatePassword);

export default router;

