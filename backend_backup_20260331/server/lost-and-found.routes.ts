import express from 'express';
import { authenticateToken } from './auth.middleware.js';
import { createItem, getItems, upload, markAsFound } from './lost-and-found.controller.js';

const router = express.Router();

router.post('/', authenticateToken, upload.single('image'), createItem);
router.get('/', authenticateToken, getItems);
router.put('/:id/status', authenticateToken, markAsFound);

export default router;
