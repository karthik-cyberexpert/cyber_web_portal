import { Request, Response } from 'express';
import { pool } from './db.js';
import { 
    calculateWorkingDays, 
    validateNotPastDate, 
    checkOverlappingRequests 
} from './leave-od.utils.js';

// Create a new OD request (Student)
export async function createODRequest(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { category, start_date, end_date, is_half_day, session, reason, duration_type, place_to_visit } = req.body;

        // Validate required fields
        if (!category || !start_date || !end_date || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }


        // Validate not past date
        if (!validateNotPastDate(start_date)) {
            return res.status(400).json({ error: 'Cannot apply for past dates' });
        }

        // Check for overlapping requests
        const hasOverlap = await checkOverlappingRequests(userId, start_date, end_date);
        if (hasOverlap) {
            return res.status(400).json({ error: 'You already have a leave/OD request for these dates' });
        }

        // Calculate working days
        const working_days = calculateWorkingDays(start_date, end_date);

        // Map duration_type to session for database
        let mappedSession = 'Full Day';
        const isHalfDay = duration_type !== 'Full-Day';
        if (duration_type === 'Half-Day (First Half)') {
            mappedSession = 'Forenoon';
        } else if (duration_type === 'Half-Day (Second Half)') {
            mappedSession = 'Afternoon';
        }

        // Check for file upload
        let fileUrl = null;
        if (req.file) {
            fileUrl = getFileUrl(req.file.path);
        } 
        
        // Ensure OD has proof if required (re-validate based on fileUrl if needed, though multer handles upload)
        if (!fileUrl) {
             return res.status(400).json({ error: 'Proof document is required for OD requests' });
        }

        // Insert OD request
        await pool.query(
            `INSERT INTO od_requests 
            (user_id, category, start_date, end_date, is_half_day, session, duration_type, reason, place_to_visit, proof_url, working_days, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, category, start_date, end_date, isHalfDay, mappedSession, duration_type || 'Full-Day', reason, place_to_visit, fileUrl, working_days]
        );

        res.json({ message: 'OD request submitted successfully', working_days });
    } catch (error: any) {
        console.error('Error creating OD request:', error);
        res.status(500).json({ error: 'Failed to create OD request' });
    }
}

// Get OD requests for tutor
export async function getTutorODRequests(req: Request, res: Response) {
    try {
        const tutorId = (req as any).user.id;

        // Get tutor's assigned batch and section
        const [assignments]: any = await pool.query(
            'SELECT batch_id, section_id FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [tutorId]
        );

        if (assignments.length === 0) {
            return res.json([]);
        }

        const { batch_id, section_id } = assignments[0];

        // Get OD requests from students in this section
        const [requests]: any = await pool.query(
            `SELECT od.id, od.user_id as userId, od.category as type, od.start_date as startDate, 
                    od.end_date as endDate, od.is_half_day as isHalfDay, od.session, 
                    od.duration_type as durationType, od.reason, od.place_to_visit as placeToVisit, od.proof_url as proofUrl, 
                    od.working_days as workingDays, od.status, od.forwarded_by as forwardedBy, 
                    od.forwarded_at as forwardedAt, od.approver_id as approverId, 
                    od.approved_at as approvedAt, od.rejection_reason as rejectionReason,
                    u.name as user_name, sp.roll_number, b.current_semester, b.name as batch_name 
            FROM od_requests od
            JOIN users u ON od.user_id = u.id
            JOIN student_profiles sp ON od.user_id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            WHERE sp.batch_id = ? AND sp.section_id = ?
            ORDER BY od.created_at DESC`,
            [batch_id, section_id]
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting tutor OD requests:', error);
        res.status(500).json({ error: 'Failed to fetch OD requests' });
    }
}

// Get OD requests for admin
export async function getAdminODRequests(req: Request, res: Response) {
    try {
        // Get all OD requests for admin
        const [requests]: any = await pool.query(
            `SELECT od.id, od.user_id as userId, od.category as type, od.start_date as startDate, 
                    od.end_date as endDate, od.is_half_day as isHalfDay, od.session, 
                    od.duration_type as durationType, od.reason, od.place_to_visit as placeToVisit, od.proof_url as proofUrl, 
                    od.working_days as workingDays, od.status, od.forwarded_by as forwardedBy, 
                    od.forwarded_at as forwardedAt, od.approver_id as approverId, 
                    od.approved_at as approvedAt, od.rejection_reason as rejectionReason,
                    u.name as user_name, sp.roll_number, sp.batch_id, sp.section_id, b.current_semester,
                    b.name as batch_name, f.name as forwarded_by_name
            FROM od_requests od
            JOIN users u ON od.user_id = u.id
            JOIN student_profiles sp ON od.user_id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN users f ON od.forwarded_by = f.id
            ORDER BY od.created_at DESC`,
            []
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting admin OD requests:', error);
        res.status(500).json({ error: 'Failed to fetch OD requests' });
    }
}

// Forward OD request to admin (Tutor) - OD cannot be approved by tutor
export async function forwardODRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await pool.query(
            `UPDATE od_requests 
            SET status = 'pending_admin', forwarded_by = ?, forwarded_at = NOW() 
            WHERE id = ?`,
            [userId, id]
        );

        res.json({ message: 'OD request forwarded to admin' });
    } catch (error: any) {
        console.error('Error forwarding OD request:', error);
        res.status(500).json({ error: 'Failed to forward OD request' });
    }
}

// Reject OD request (Tutor or Admin)
export async function rejectODRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { rejection_reason } = req.body;

        // Get the request to check current status
        const [requests]: any = await pool.query('SELECT status FROM od_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        const request = requests[0];

        // If it was a cancellation request, rejection means it stays approved or goes back to previous state?
        const newStatus = request.status === 'cancel_requested' ? 'approved' : 'rejected';

        await pool.query(
            `UPDATE od_requests 
            SET status = ?, approved_by = ?, approver_id = ?, rejection_reason = ?, approved_at = NOW() 
            WHERE id = ?`,
            [newStatus, userId === 1 ? 'Admin' : 'Tutor', userId, rejection_reason, id]
        );

        res.json({ message: 'OD request processed' });
    } catch (error: any) {
        console.error('Error rejecting OD request:', error);
        res.status(500).json({ error: 'Failed to process OD request' });
    }
}

// Admin approve OD request
export async function adminApproveODRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await pool.query(
            `UPDATE od_requests 
            SET status = 'approved', approved_by = 'Admin', approver_id = ?, approved_at = NOW() 
            WHERE id = ?`,
            [userId, id]
        );

        res.json({ message: 'OD request approved by admin' });
    } catch (error: any) {
        console.error('Error approving OD request:', error);
        res.status(500).json({ error: 'Failed to approve OD request' });
    }
}

// Admin revoke OD request (Reset to pending_admin)
export async function adminRevokeODRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Check if OD has already started
        const [requests]: any = await pool.query('SELECT start_date FROM od_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const startDate = new Date(requests[0].start_date);
        const now = new Date();
        
        if (startDate <= now) {
            return res.status(400).json({ error: 'Cannot revoke request as it has already started' });
        }

        await pool.query(
            `UPDATE od_requests 
            SET status = 'pending_admin', approved_by = NULL, approver_id = NULL, approved_at = NULL, rejection_reason = NULL 
            WHERE id = ?`,
            [id]
        );

        res.json({ message: 'OD request revoked and moved to pending' });
    } catch (error: any) {
        console.error('Error revoking OD request:', error);
        res.status(500).json({ error: 'Failed to revoke OD request' });
    }
}

// Tutor revoke OD request (Reset to pending) - Cannot revoke forwarded requests
export async function tutorRevokeODRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Check if OD has already started and is NOT forwarded
        const [requests]: any = await pool.query('SELECT start_date, status FROM od_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];
        
        if (request.status === 'pending_admin') {
            return res.status(400).json({ error: 'Cannot revoke a request that has been forwarded to admin' });
        }

        if (request.approved_by === 'Admin') {
            return res.status(400).json({ error: 'Cannot revoke a request approved by Admin' });
        }

        if (request.working_days >= 2) {
            return res.status(400).json({ error: 'Cannot revoke a request of 2 or more days' });
        }

        if (request.status === 'pending') {
            return res.status(400).json({ error: 'Request is already pending' });
        }

        const startDate = new Date(request.start_date);
        const now = new Date();
        
        if (startDate <= now) {
            return res.status(400).json({ error: 'Cannot revoke request as it has already started' });
        }

        await pool.query(
            `UPDATE od_requests 
            SET status = 'pending', approved_by = NULL, approver_id = NULL, approved_at = NULL, rejection_reason = NULL 
            WHERE id = ?`,
            [id]
        );

        res.json({ message: 'OD request revoked and moved to pending' });
    } catch (error: any) {
        console.error('Error revoking OD request:', error);
        res.status(500).json({ error: 'Failed to revoke OD request' });
    }
}

// Student request to cancel OD
export async function requestCancelOD(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check if request exists and belongs to user
        const [requests]: any = await pool.query(
            'SELECT status, start_date FROM od_requests WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'OD request not found' });
        }

        const request = requests[0];

        if (request.status === 'cancelled') {
            return res.status(400).json({ error: 'Request is already cancelled' });
        }

        if (request.status === 'rejected') {
            return res.status(400).json({ error: 'Cannot cancel a rejected request' });
        }

        const startDate = new Date(request.start_date);
        if (startDate <= new Date()) {
            return res.status(400).json({ error: 'Cannot cancel OD that has already started' });
        }

        await pool.query(
            "UPDATE od_requests SET status = 'cancel_requested' WHERE id = ?",
            [id]
        );

        res.json({ message: 'Cancellation request sent to tutor' });
    } catch (error: any) {
        console.error('Error requesting OD cancellation:', error);
        res.status(500).json({ error: 'Failed to request cancellation' });
    }
}

// Get student's own OD requests
export async function getMyODRequests(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;

        const [requests]: any = await pool.query(
            `SELECT od.id, od.user_id as userId, od.category as type, od.start_date as startDate, 
                    od.end_date as endDate, od.is_half_day as isHalfDay, od.session, 
                    od.duration_type as durationType, od.reason, od.place_to_visit as placeToVisit, od.proof_url as proofUrl, 
                    od.working_days as workingDays, od.status, od.forwarded_by as forwardedBy, 
                    od.forwarded_at as forwardedAt, od.approver_id as approverId, 
                    od.approved_at as approvedAt, od.rejection_reason as rejectionReason,
                    u.name as approver_name, f.name as forwarded_by_name
            FROM od_requests od
            LEFT JOIN users u ON od.approver_id = u.id
            LEFT JOIN users f ON od.forwarded_by = f.id
            WHERE od.user_id = ?
            ORDER BY od.created_at DESC`,
            [userId]
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting OD requests:', error);
        res.status(500).json({ error: 'Failed to fetch OD requests' });
    }
}
