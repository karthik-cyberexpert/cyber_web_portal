import express from 'express';
import { 
  getDashboardStats, 
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getAdminProfile,
  updateAdminProfile,
  updateAdminAvatar
} from './admin.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadAvatar } from './upload.config.js';

const router = express.Router();

router.get('/stats', authenticateToken, getDashboardStats);

router.get('/faculty', authenticateToken, getAllFaculty);
router.post('/faculty', authenticateToken, createFaculty);
router.put('/faculty/:id', authenticateToken, updateFaculty);
router.delete('/faculty/:id', authenticateToken, deleteFaculty);

// Admin Profile Routes
router.get('/profile', authenticateToken, getAdminProfile);
router.put('/profile', authenticateToken, updateAdminProfile);
router.post('/profile/avatar', authenticateToken, uploadAvatar.single('avatar'), updateAdminAvatar);

export default router;
