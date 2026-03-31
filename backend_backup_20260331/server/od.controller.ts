import { Request, Response } from 'express';
import { pool } from './db.js';
import { createNotification } from './notifications.utils.js';
import { 
    calculateWorkingDaysWithHolidays, 
    validateNotPastDate, 
    checkOverlappingRequests,
    checkExamDatesInRange
} from './leave-od.utils.js';
import { getFileUrl } from './upload.config.js';
import { sendApprovalEmail } from './email.utils.js';

// Create a new OD request (Student)
export async function createODRequest(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        console.log('[OD SERVER] Received request from user', userId);
        console.log('[OD SERVER] Headers content-type:', req.headers['content-type']);
        console.log('[OD SERVER] File:', req.file);
        console.log('[OD SERVER] Body:', req.body);
        
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

        // Check for exam dates in the requested range
        const examCheck = await checkExamDatesInRange(userId, start_date, end_date);
        if (examCheck.hasExams) {
            return res.status(400).json({ 
                error: 'Cannot apply for OD on exam dates',
                examDates: examCheck.examDates 
            });
        }

        // Calculate working days (excluding Sundays and holidays)
        const working_days = await calculateWorkingDaysWithHolidays(start_date, end_date);

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

        // Notify tutor
        const tutorIdQuery = await pool.query(
            `SELECT ta.faculty_id FROM tutor_assignments ta
             JOIN student_profiles sp ON ta.batch_id = sp.batch_id AND ta.section_id = sp.section_id
             WHERE sp.user_id = ? AND ta.is_active = TRUE
             LIMIT 1`,
            [userId]
        );
        if ((tutorIdQuery as any)[0].length > 0) {
            const tutorId = (tutorIdQuery as any)[0][0].faculty_id;
            await createNotification(
                tutorId,
                'New OD Request',
                `A student has submitted an OD request for ${category} (${working_days} day(s))`,
                '/tutor/od'
            );
        }

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

        // Get tutor's assigned ranges
        const [assignments]: any = await pool.query(
            'SELECT batch_id, section_id, reg_number_start, reg_number_end FROM tutor_assignments WHERE faculty_id = ? AND is_active = TRUE',
            [tutorId]
        );

        if (assignments.length === 0) {
            return res.json([]);
        }

        const allRequests: any[] = [];
        for (const assignment of assignments) {
            const [requests]: any = await pool.query(
                `SELECT od.id, od.user_id as userId, od.category as type, od.start_date as startDate, 
                        od.end_date as endDate, od.is_half_day as isHalfDay, od.session, 
                        od.duration_type as durationType, od.reason, od.place_to_visit as placeToVisit, od.proof_url as proofUrl, 
                        od.working_days as workingDays, od.status, od.tutor_id as tutorId, 
                        od.admin_id as adminId, 
                        od.rejection_reason as rejectionReason,
                        u.name as user_name, sp.roll_number, b.current_semester, b.name as batch_name 
                FROM od_requests od
                JOIN (
                    SELECT user_id, batch_id, section_id, roll_number, ROW_NUMBER() OVER (ORDER BY roll_number ASC) as row_num
                    FROM student_profiles
                    WHERE batch_id = ? AND section_id = ?
                ) sp ON od.user_id = sp.user_id
                JOIN users u ON od.user_id = u.id
                LEFT JOIN batches b ON sp.batch_id = b.id
                WHERE (? IS NULL OR ? IS NULL OR (sp.row_num >= ? AND sp.row_num <= ?))
                ORDER BY od.created_at DESC`,
                [
                    assignment.batch_id, 
                    assignment.section_id,
                    assignment.reg_number_start, assignment.reg_number_end,
                    parseInt(assignment.reg_number_start) || 0, parseInt(assignment.reg_number_end) || 0
                ]
            );
            allRequests.push(...requests);
        }

        res.json(allRequests);
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
                    od.working_days as workingDays, od.status, od.tutor_id as tutorId, 
                    od.admin_id as adminId, 
                    od.rejection_reason as rejectionReason,
                    u.name as user_name, sp.roll_number, sp.batch_id, sp.section_id, b.current_semester,
                    b.name as batch_name, t.name as forwarded_by_name
            FROM od_requests od
            JOIN users u ON od.user_id = u.id
            JOIN student_profiles sp ON od.user_id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN users t ON od.tutor_id = t.id
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
            SET status = 'forwarded_to_admin', tutor_id = ? 
            WHERE id = ?`,
            [userId, id]
        );

        res.json({ message: 'OD request forwarded to admin' });

        // Notification
        const [odInfo]: any = await pool.query('SELECT user_id, start_date FROM od_requests WHERE id = ?', [id]);
        if (odInfo.length > 0) {
            await createNotification(
                odInfo[0].user_id,
                'OD Forwarded',
                `Your OD request for ${new Date(odInfo[0].start_date).toLocaleDateString()} has been forwarded to Admin for approval.`,
                '/student/od'
            );
        }
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
        const currentStatus = String(request.status).trim().toLowerCase();

        // If it was a cancellation request, rejection means it stays approved or goes back to previous state?
        const isCancellationReject = currentStatus === 'cancel_requested';
        const newStatus = isCancellationReject ? 'approved' : 'rejected';
        
        console.log(`[REJECT DEBUG] Processing OD rejection for ID ${id}. Raw Status: "${request.status}", Trimmed: "${currentStatus}", IsCancellation: ${isCancellationReject}, New Status: "${newStatus}"`);

        // Determine if user is admin or tutor based on role
        const role = (req as any).user.role;
        
        if (role === 'admin') {
            await pool.query(
                `UPDATE od_requests 
                SET status = ?, admin_id = ?, rejection_reason = ? 
                WHERE id = ?`,
                [newStatus, userId, rejection_reason, id]
            );
        } else {
            await pool.query(
                `UPDATE od_requests 
                SET status = ?, tutor_id = ?, rejection_reason = ? 
                WHERE id = ?`,
                [newStatus, userId, rejection_reason, id]
            );
        }

        res.json({ message: 'OD request processed' });

        // Notification
        const [odInfo]: any = await pool.query('SELECT user_id, start_date FROM od_requests WHERE id = ?', [id]);
        if (odInfo.length > 0) {
            await createNotification(
                odInfo[0].user_id,
                `OD ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                `Your ${request.status === 'cancel_requested' ? 'cancellation request' : 'OD request'} for ${new Date(odInfo[0].start_date).toLocaleDateString()} has been ${newStatus}. Reason: ${rejection_reason || 'N/A'}`,
                '/student/od'
            );
        }
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

        // Get current status first
        const [requests]: any = await pool.query('SELECT status, user_id, start_date FROM od_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];
        const currentStatus = String(request.status).trim().toLowerCase();
        const isCancellationApprove = currentStatus === 'cancel_requested';
        const newStatus = isCancellationApprove ? 'cancelled' : 'approved';
        
        console.log(`[APPROVE DEBUG] Admin approving OD request ${id}. Raw Status: "${request.status}", Trimmed: "${currentStatus}", IsCancellation: ${isCancellationApprove}, New Status: "${newStatus}"`);

        await pool.query(
            `UPDATE od_requests 
            SET status = ?, admin_id = ? 
            WHERE id = ?`,
            [newStatus, userId, id]
        );

        res.json({ message: newStatus === 'cancelled' ? 'OD cancelled successfully' : 'OD request approved by admin' });

        // Notification
        if (newStatus === 'cancelled') {
            await createNotification(
                request.user_id,
                'OD Cancelled',
                `Your OD request for ${new Date(request.start_date).toLocaleDateString()} has been cancelled as requested by Admin.`,
                '/student/od'
            );
        } else {
            await createNotification(
                request.user_id,
                'OD Approved',
                `Your OD request for ${new Date(request.start_date).toLocaleDateString()} has been approved by Admin.`,
                '/student/od'
            );
            
            // Send Email Notification (Non-blocking)
            pool.query('SELECT email, name FROM users WHERE id = ?', [request.user_id])
                .then(([users]: any) => {
                    if (users.length > 0) {
                        sendApprovalEmail(users[0].email, users[0].name, 'OD', 'Approved', request.start_date, request.end_date)
                            .catch(err => console.error('[EMAIL] Background error:', err));
                    }
                });
        }
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
                    od.working_days as workingDays, od.status, od.tutor_id as tutorId, 
                    od.admin_id as adminId, 
                    od.rejection_reason as rejectionReason,
                    t.name as tutor_name, a.name as admin_name
            FROM od_requests od
            LEFT JOIN users t ON od.tutor_id = t.id
            LEFT JOIN users a ON od.admin_id = a.id
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
