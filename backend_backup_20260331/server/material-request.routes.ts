import { Router } from 'express';
import { createMaterialRequest } from './material-request.controller.js';
import { authenticateToken } from './auth.middleware.js';

const router = Router();

router.post('/', authenticateToken, createMaterialRequest);

export default router;
