import { Router } from 'express';
import { 
    createLeaveRequest,
    getTutorLeaveRequests,
    getAdminLeaveRequests,
    approveLeaveRequest,
    forwardLeaveRequest,
    rejectLeaveRequest,
    adminApproveLeaveRequest,
    adminRevokeLeaveRequest,
    tutorRevokeLeaveRequest,
    getMyLeaveRequests,
    requestCancelLeave
} from './leave.controller.js';
import { authenticateToken } from './auth.middleware.js';
import { uploadLeave } from './upload.config.js';

const router = Router();

// Student routes
router.get('/my-requests', authenticateToken, getMyLeaveRequests);
router.post('/request', authenticateToken, uploadLeave.single('file'), createLeaveRequest);
router.post('/:id/cancel-request', authenticateToken, requestCancelLeave);

// Tutor routes
router.get('/tutor', authenticateToken, getTutorLeaveRequests);
router.post('/:id/approve', authenticateToken, approveLeaveRequest);
router.post('/:id/forward', authenticateToken, forwardLeaveRequest);
router.post('/:id/reject', authenticateToken, rejectLeaveRequest);
router.post('/:id/revoke', authenticateToken, tutorRevokeLeaveRequest);

// Admin routes
router.get('/admin', authenticateToken, getAdminLeaveRequests);
router.post('/:id/admin-approve', authenticateToken, adminApproveLeaveRequest);
router.post('/:id/admin-revoke', authenticateToken, adminRevokeLeaveRequest);

export default router;
