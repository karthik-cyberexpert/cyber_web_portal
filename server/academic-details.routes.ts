import { Router } from 'express';
import { getAcademicDetails } from './academic-details.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getAcademicDetails);

export default router;
