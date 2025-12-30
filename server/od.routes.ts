import { Router } from 'express';
import { 
    createODRequest,
    getTutorODRequests,
    getAdminODRequests,
    forwardODRequest,
    rejectODRequest,
    adminApproveODRequest,
    adminRevokeODRequest,
    getMyODRequests,
    requestCancelOD
} from './od.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadOD } from './upload.config.js';

const router = Router();

// Student routes
router.get('/my-requests', authenticateToken, getMyODRequests);
router.post('/request', authenticateToken, uploadOD.single('file'), createODRequest);
router.post('/:id/cancel-request', authenticateToken, requestCancelOD);

// Tutor routes (can only forward/reject, never approve)
router.get('/tutor', authenticateToken, getTutorODRequests);
router.post('/:id/forward', authenticateToken, forwardODRequest);
router.post('/:id/reject', authenticateToken, rejectODRequest);

// Admin routes
router.get('/admin', authenticateToken, getAdminODRequests);
router.post('/:id/admin-approve', authenticateToken, adminApproveODRequest);
router.post('/:id/admin-revoke', authenticateToken, adminRevokeODRequest);

export default router;
