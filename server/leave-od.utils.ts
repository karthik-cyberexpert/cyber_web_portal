import { pool } from './db.js';

/**
 * Calculate working days between two dates (excluding Sundays)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Number of working days
 */
export function calculateWorkingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    // Iterate through each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        // 0 = Sunday, 6 = Saturday
        // We only exclude Sunday (0)
        if (date.getDay() !== 0) {
            workingDays++;
        }
    }

    return workingDays;
}

/**
 * Validate that dates are not in the past
 * @param startDate - Start date
 * @returns True if valid, false otherwise
 */
export function validateNotPastDate(startDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const start = new Date(startDate);
    return start >= today;
}

/**
 * Check if there are overlapping leave/OD requests for a user
 * @param userId - User ID
 * @param startDate - Requested start date
 * @param endDate - Requested end date
 * @param excludeId - Optional ID to exclude from check (for edits)
 * @returns True if overlap exists, false otherwise
 */
export async function checkOverlappingRequests(
    userId: number,
    startDate: string,
    endDate: string,
    excludeId?: number
): Promise<boolean> {
    try {
        // Check leave_requests
        let leaveQuery = `
            SELECT id FROM leave_requests 
            WHERE user_id = ? 
            AND status IN ('pending', 'pending_admin', 'approved')
            AND (
                (start_date <= ? AND end_date >= ?) OR
                (start_date <= ? AND end_date >= ?) OR
                (start_date >= ? AND end_date <= ?)
            )
        `;
        const leaveParams: any[] = [userId, endDate, startDate, endDate, endDate, startDate, endDate];
        
        if (excludeId) {
            leaveQuery += ' AND id != ?';
            leaveParams.push(excludeId);
        }
        
        const [leaveOverlaps]: any = await pool.query(leaveQuery, leaveParams);
        
        // Check od_requests
        let odQuery = `
            SELECT id FROM od_requests 
            WHERE user_id =? 
            AND status IN ('pending', 'pending_admin', 'approved')
            AND (
                (start_date <= ? AND end_date >= ?) OR
                (start_date <= ? AND end_date >= ?) OR
                (start_date >= ? AND end_date <= ?)
            )
        `;
        const odParams: any[] = [userId, endDate, startDate, endDate, endDate, startDate, endDate];
        
        if (excludeId) {
            odQuery += ' AND id != ?';
            odParams.push(excludeId);
        }
        
        const [odOverlaps]: any = await pool.query(odQuery, odParams);
        
        return leaveOverlaps.length > 0 || odOverlaps.length > 0;
        
    } catch (error) {
        console.error('Error checking overlaps:', error);
        throw error;
    }
}

/**
 * Get tutor ID for a student
 * @param studentId - Student user ID
 * @returns Tutor user ID or null
 */
export async function getTutorForStudent(studentId: number): Promise<number | null> {
    try {
        // Get student's batch and section
        const [studentProfile]: any = await pool.query(
            'SELECT batch_id, section_id FROM student_profiles WHERE user_id = ?',
            [studentId]
        );
        
        if (studentProfile.length === 0) return null;
        
        const { batch_id, section_id } = studentProfile[0];
        
        // Get tutor for that batch/section
        const [tutorAssignment]: any = await pool.query(
            'SELECT faculty_id FROM tutor_assignments WHERE batch_id = ? AND section_id = ? AND is_active = TRUE LIMIT 1',
            [batch_id, section_id]
        );
        
        return tutorAssignment.length > 0 ? tutorAssignment[0].faculty_id : null;
        
    } catch (error) {
        console.error('Error getting tutor:', error);
        return null;
    }
}
