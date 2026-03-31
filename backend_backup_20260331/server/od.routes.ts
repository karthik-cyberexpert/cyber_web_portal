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
import multer from 'multer';

// Wrapper to handle upload errors
const handleUpload = (req: any, res: any, next: any) => {
    console.log('[OD ROUTE] handleUpload called, content-type:', req.headers['content-type']);
    uploadOD.single('file')(req, res, (err: any) => {
        console.log('[OD ROUTE] Multer callback, error:', err, 'file:', req.file ? req.file.filename : 'NO FILE');
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. file too large)
            console.log('[OD ROUTE] MulterError:', err.message);
            return res.status(400).json({ error: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading (e.g. invalid file type)
            console.log('[OD ROUTE] Unknown error:', err.message);
            return res.status(400).json({ error: err.message });
        }
        // Everything went fine
        console.log('[OD ROUTE] Upload success, proceeding to controller');
        next();
    });
};

const router = Router();

// Student routes
router.get('/my-requests', authenticateToken, getMyODRequests);
router.post('/request', authenticateToken, handleUpload, createODRequest);
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
