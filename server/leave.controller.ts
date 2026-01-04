import { Request, Response } from 'express';
import { pool } from './db.js';
import { createNotification } from './notifications.utils.js';
import {
    calculateWorkingDaysWithHolidays,
    validateNotPastDate,
    checkOverlappingRequests,
    getTutorForStudent,
    checkExamDatesInRange
} from './leave-od.utils.js';
import { getFileUrl } from './upload.config.js';
import { canApplyCasualLeave } from './attendance.utils.js';

// Create a new leave request (Student)
export async function createLeaveRequest(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { category, start_date, end_date, is_half_day, session, reason, duration_type } = req.body;

        console.log('Leave request data:', { userId, category, start_date, end_date, duration_type, reason });

        // Validate required fields
        if (!category || !start_date || !end_date || !reason) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate not past date
        if (!validateNotPastDate(start_date)) {
            console.log('Validation failed: Past date');
            return res.status(400).json({ error: 'Cannot apply for past dates' });
        }

        // Check attendance for Casual Leave - must be >= 80%
        if (category === 'Casual Leave' || category === 'casual' || category.toLowerCase().includes('casual')) {
            const attendanceCheck = await canApplyCasualLeave(userId);
            if (!attendanceCheck.allowed) {
                console.log('Validation failed: Attendance too low for casual leave', attendanceCheck.attendancePercentage);
                return res.status(400).json({ 
                    error: attendanceCheck.message,
                    currentAttendance: attendanceCheck.attendancePercentage,
                    minimumRequired: 80
                });
            }
        }

        // Check for overlapping requests
        const hasOverlap = await checkOverlappingRequests(userId, start_date, end_date);
        if (hasOverlap) {
            console.log('Validation failed: Overlapping requests');
            return res.status(400).json({ error: 'You already have a leave/OD request for these dates' });
        }

        // Check for exam dates in the requested range
        const examCheck = await checkExamDatesInRange(userId, start_date, end_date);
        if (examCheck.hasExams) {
            console.log('Validation failed: Exam dates in range', examCheck.examDates);
            return res.status(400).json({ 
                error: 'Cannot apply for leave on exam dates',
                examDates: examCheck.examDates 
            });
        }

        // Calculate working days (excluding Sundays and holidays)
        const working_days = await calculateWorkingDaysWithHolidays(start_date, end_date);
        console.log('Working days calculated:', working_days);

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



        // Insert leave request
        const result = await pool.query(
            `INSERT INTO leave_requests
            (user_id, category, start_date, end_date, is_half_day, session, duration_type, reason, proof_url, working_days, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, category, start_date, end_date, isHalfDay, mappedSession, duration_type || 'Full-Day', reason, fileUrl, working_days]
        );

        console.log('Leave request created successfully');
        res.json({ message: 'Leave request submitted successfully', working_days });
    } catch (error: any) {
        console.error('ERROR creating leave request:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to create leave request', details: error.message });
    }
}

// Get leave requests for tutor
export async function getTutorLeaveRequests(req: Request, res: Response) {
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

        // Get leave requests from students in this section
        const [requests]: any = await pool.query(
            `SELECT lr.id, lr.user_id as userId, lr.category as type, lr.start_date as startDate,
                    lr.end_date as endDate, lr.is_half_day as isHalfDay, lr.session,
                    lr.duration_type as durationType, lr.reason, lr.proof_url as proofUrl,
                    lr.working_days as workingDays, lr.status, lr.forwarded_by as forwardedBy,
                    lr.forwarded_at as forwardedAt, lr.approver_id as approverId,
                    lr.approved_at as approvedAt, lr.rejection_reason as rejectionReason,
                    u.name as user_name, sp.roll_number, b.current_semester, b.name as batch_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN student_profiles sp ON lr.user_id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            WHERE sp.batch_id = ? AND sp.section_id = ?
            ORDER BY lr.created_at DESC`,
            [batch_id, section_id]
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting tutor leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
}

// Get leave requests for admin
export async function getAdminLeaveRequests(req: Request, res: Response) {
    try {
        // Get all leave requests for admin
        const [requests]: any = await pool.query(
            `SELECT lr.id, lr.user_id as userId, lr.category as type, lr.start_date as startDate,
                    lr.end_date as endDate, lr.is_half_day as isHalfDay, lr.session,
                    lr.duration_type as durationType, lr.reason, lr.proof_url as proofUrl,
                    lr.working_days as workingDays, lr.status, lr.forwarded_by as forwardedBy,
                    lr.forwarded_at as forwardedAt, lr.approver_id as approverId,
                    lr.approved_at as approvedAt, lr.rejection_reason as rejectionReason,
                    u.name as user_name, sp.roll_number, sp.batch_id, sp.section_id, b.current_semester,
                    b.name as batch_name, f.name as forwarded_by_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN student_profiles sp ON lr.user_id = sp.user_id
            LEFT JOIN batches b ON sp.batch_id = b.id
            LEFT JOIN users f ON lr.forwarded_by = f.id
            ORDER BY lr.created_at DESC`,
            []
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting admin leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
}

// Approve leave request (Tutor - only for <=2 days)
export async function approveLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Get the request
        const [requests]: any = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [id]);

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = requests[0];

        // Tutor can only approve if <=2 working days
        if (request.working_days > 2) {
            return res.status(400).json({ error: 'Cannot approve leave > 2 days. Please forward to admin.' });
        }

        // Update status based on current status
        const newStatus = request.status === 'cancel_requested' ? 'cancelled' : 'approved';

        await pool.query(
            `UPDATE leave_requests
            SET status = ?, approved_by = 'Tutor', approver_id = ?, approved_at = NOW()
            WHERE id = ?`,
            [newStatus, userId, id]
        );

        res.json({ message: 'Leave request approved' });

        // Notification
        await createNotification(
            request.user_id,
            'Leave Approved',
            `Your leave request for ${new Date(request.start_date).toLocaleDateString()} to ${new Date(request.end_date).toLocaleDateString()} has been approved by ${request.status === 'cancel_requested' ? 'Tutor (Cancellation)' : 'Tutor'}.`
        );
    } catch (error: any) {
        console.error('Error approving leave request:', error);
        res.status(500).json({ error: 'Failed to approve leave request' });
    }
}

// Forward leave request to admin (Tutor)
export async function forwardLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await pool.query(
            `UPDATE leave_requests
            SET status = 'pending_admin', forwarded_by = ?, forwarded_at = NOW()
            WHERE id = ?`,
            [userId, id]
        );

        res.json({ message: 'Leave request forwarded to admin' });

        // Notification for student
        const [leaveInfo]: any = await pool.query('SELECT user_id, start_date, end_date FROM leave_requests WHERE id = ?', [id]);
        if (leaveInfo.length > 0) {
            await createNotification(
                leaveInfo[0].user_id,
                'Leave Forwarded',
                `Your leave request for ${new Date(leaveInfo[0].start_date).toLocaleDateString()} has been forwarded to Admin for approval.`
            );
        }
    } catch (error: any) {
        console.error('Error forwarding leave request:', error);
        res.status(500).json({ error: 'Failed to forward leave request' });
    }
}

// Reject leave request (Tutor or Admin)
export async function rejectLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { rejection_reason } = req.body;

        // Get the request to check current status
        const [requests]: any = await pool.query('SELECT status FROM leave_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        const request = requests[0];

        // If it was a cancellation request, rejection means it stays approved or goes back to previous state?
        // Usually, rejecting a cancellation means it remains in its previous active state.
        const newStatus = request.status === 'cancel_requested' ? 'approved' : 'rejected';

        await pool.query(
            `UPDATE leave_requests
            SET status = ?, approved_by = ?, approver_id = ?, rejection_reason = ?, approved_at = NOW()
            WHERE id = ?`,
            [newStatus, userId === 1 ? 'Admin' : 'Tutor', userId, rejection_reason, id]
        );

        res.json({ message: 'Leave request processed' });

        // Notification
        const [leaveInfo]: any = await pool.query('SELECT user_id, start_date, end_date FROM leave_requests WHERE id = ?', [id]);
        if (leaveInfo.length > 0) {
            await createNotification(
                leaveInfo[0].user_id,
                `Leave ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                `Your ${request.status === 'cancel_requested' ? 'cancellation request' : 'leave request'} for ${new Date(leaveInfo[0].start_date).toLocaleDateString()} has been ${newStatus}. Reason: ${rejection_reason || 'N/A'}`
            );
        }
    } catch (error: any) {
        console.error('Error rejecting leave request:', error);
        res.status(500).json({ error: 'Failed to process leave request' });
    }
}

// Admin approve leave request
export async function adminApproveLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await pool.query(
            `UPDATE leave_requests 
            SET status = 'approved', approved_by = 'Admin', approver_id = ?, approved_at = NOW() 
            WHERE id = ?`,
            [userId, id]
        );

        res.json({ message: 'Leave request approved by admin' });

        // Notification
        const [leaveInfo]: any = await pool.query('SELECT user_id, start_date, end_date FROM leave_requests WHERE id = ?', [id]);
        if (leaveInfo.length > 0) {
            await createNotification(
                leaveInfo[0].user_id,
                'Leave Approved',
                `Your leave request for ${new Date(leaveInfo[0].start_date).toLocaleDateString()} has been approved by Admin.`
            );
        }
    } catch (error: any) {
        console.error('Error approving leave request:', error);
        res.status(500).json({ error: 'Failed to approve leave request' });
    }
}

// Admin revoke leave request (Reset to pending_admin)
export async function adminRevokeLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Check if leave has already started
        const [requests]: any = await pool.query('SELECT start_date FROM leave_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const startDate = new Date(requests[0].start_date);
        const now = new Date();
        
        if (startDate <= now) {
            return res.status(400).json({ error: 'Cannot revoke request as it has already started' });
        }

        await pool.query(
            `UPDATE leave_requests 
            SET status = 'pending_admin', approved_by = NULL, approver_id = NULL, approved_at = NULL, rejection_reason = NULL 
            WHERE id = ?`,
            [id]
        );

        res.json({ message: 'Leave request revoked and moved to pending' });
    } catch (error: any) {
        console.error('Error revoking leave request:', error);
        res.status(500).json({ error: 'Failed to revoke leave request' });
    }
}

// Tutor revoke leave request (Reset to pending) - Cannot revoke forwarded requests
export async function tutorRevokeLeaveRequest(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Check if leave has already started and is NOT forwarded
        const [requests]: any = await pool.query('SELECT start_date, status FROM leave_requests WHERE id = ?', [id]);
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
            `UPDATE leave_requests 
            SET status = 'pending', approved_by = NULL, approver_id = NULL, approved_at = NULL, rejection_reason = NULL 
            WHERE id = ?`,
            [id]
        );

        res.json({ message: 'Leave request revoked and moved to pending' });
    } catch (error: any) {
        console.error('Error revoking leave request:', error);
        res.status(500).json({ error: 'Failed to revoke leave request' });
    }
}

// Get student's own leave requests
export async function getMyLeaveRequests(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;

        const [requests]: any = await pool.query(
            `SELECT lr.id, lr.user_id as userId, lr.category as type, lr.start_date as startDate, 
                    lr.end_date as endDate, lr.is_half_day as isHalfDay, lr.session, 
                    lr.duration_type as durationType, lr.reason, lr.proof_url as proofUrl, 
                    lr.working_days as workingDays, lr.status, lr.forwarded_by as forwardedBy, 
                    lr.forwarded_at as forwardedAt, lr.approver_id as approverId, 
                    lr.approved_at as approvedAt, lr.rejection_reason as rejectionReason,
                    u.name as approver_name, f.name as forwarded_by_name
            FROM leave_requests lr
            LEFT JOIN users u ON lr.approver_id = u.id
            LEFT JOIN users f ON lr.forwarded_by = f.id
            WHERE lr.user_id = ?
            ORDER BY lr.created_at DESC`,
            [userId]
        );

        res.json(requests);
    } catch (error: any) {
        console.error('Error getting my leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch leave history' });
    }
}
// Student request to cancel leave
export async function requestCancelLeave(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check if request exists and belongs to user
        const [requests]: any = await pool.query(
            'SELECT status, start_date FROM leave_requests WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
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
            return res.status(400).json({ error: 'Cannot cancel leave that has already started' });
        }

        await pool.query(
            "UPDATE leave_requests SET status = 'cancel_requested' WHERE id = ?",
            [id]
        );

        res.json({ message: 'Cancellation request sent to tutor' });
    } catch (error: any) {
        console.error('Error requesting leave cancellation:', error);
        res.status(500).json({ error: 'Failed to request cancellation' });
    }
}
