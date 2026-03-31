
import express from 'express';
import { getClassStatistics } from './class-stats.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getClassStatistics);

export default router;
