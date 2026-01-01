import { pool } from './db.js';

/**
 * Get holidays from calendar_events table for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of holiday date strings
 */
export async function getHolidaysInRange(startDate: string, endDate: string): Promise<string[]> {
    try {
        const [holidays]: any = await pool.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date FROM calendar_events 
             WHERE event_type = 'HOLIDAY' AND date BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        return holidays.map((h: any) => h.date);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

/**
 * Check if there are any exam dates in the given range for a student
 * @param userId - Student user ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Object with hasExams flag and list of exam dates
 */
export async function checkExamDatesInRange(
    userId: number,
    startDate: string,
    endDate: string
): Promise<{ hasExams: boolean; examDates: string[] }> {
    try {
        // Get student's batch and semester
        const [studentProfile]: any = await pool.query(
            `SELECT sp.batch_id, b.current_semester as semester 
             FROM student_profiles sp
             JOIN batches b ON sp.batch_id = b.id
             WHERE sp.user_id = ?`,
            [userId]
        );

        if (studentProfile.length === 0) {
            return { hasExams: false, examDates: [] };
        }

        const { batch_id, semester } = studentProfile[0];

        // Check for exams in the date range for this batch/semester
        const [exams]: any = await pool.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, event_type, s.name as subject_name
             FROM calendar_events ce
             LEFT JOIN subjects s ON ce.subject_id = s.id
             WHERE ce.event_type IN ('UT', 'MODEL', 'SEMESTER')
             AND ce.date BETWEEN ? AND ?
             AND (ce.batch_id = ? OR ce.batch_id IS NULL)
             AND (ce.semester = ? OR ce.semester IS NULL)`,
            [startDate, endDate, batch_id, semester]
        );

        return {
            hasExams: exams.length > 0,
            examDates: exams.map((e: any) => `${e.date} (${e.event_type}: ${e.subject_name || 'Exam'})`)
        };
    } catch (error) {
        console.error('Error checking exam dates:', error);
        return { hasExams: false, examDates: [] };
    }
}

/**
 * Calculate working days between two dates (excluding Sundays and holidays)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param holidays - Optional array of holiday dates to exclude
 * @returns Number of working days
 */
export function calculateWorkingDays(startDate: string, endDate: string, holidays: string[] = []): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    // Create a Set for faster holiday lookup
    const holidaySet = new Set(holidays);

    // Iterate through each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        // 0 = Sunday, 6 = Saturday
        // Exclude Sundays and holidays
        if (date.getDay() !== 0 && !holidaySet.has(dateStr)) {
            workingDays++;
        }
    }

    return workingDays;
}

/**
 * Async wrapper to calculate working days with holiday fetching
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Number of working days (excluding Sundays and holidays)
 */
export async function calculateWorkingDaysWithHolidays(startDate: string, endDate: string): Promise<number> {
    const holidays = await getHolidaysInRange(startDate, endDate);
    return calculateWorkingDays(startDate, endDate, holidays);
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

