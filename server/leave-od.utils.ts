import { pool } from './db.js';

/**
 * Get holidays from schedules table for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of holiday date strings
 */
export async function getHolidaysInRange(startDate: string, endDate: string): Promise<string[]> {
    try {
        const [holidays]: any = await pool.query(
            `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') as date, 
                    DATE_FORMAT(end_date, '%Y-%m-%d') as end_date 
             FROM schedules 
             WHERE category = 'Holiday' 
             AND (
                (start_date BETWEEN ? AND ?) OR
                (end_date BETWEEN ? AND ?) OR
                (start_date <= ? AND end_date >= ?)
             )`,
            [startDate, endDate, startDate, endDate, startDate, endDate]
        );
        
        const holidayDates: string[] = [];
        holidays.forEach((h: any) => {
            let curr = new Date(h.date);
            const end = new Date(h.end_date);
            while (curr <= end) {
                holidayDates.push(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        });
        return holidayDates;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

/**
 * Check if there any exam dates in the given range for a student
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
        // Get student's batch
        const [studentProfile]: any = await pool.query(
            `SELECT sp.batch_id 
             FROM student_profiles sp
             WHERE sp.user_id = ?`,
            [userId]
        );

        if (studentProfile.length === 0) {
            console.log('[EXAM CHECK] No student profile found for userId:', userId);
            return { hasExams: false, examDates: [] };
        }

        const { batch_id } = studentProfile[0];
        console.log('[EXAM CHECK] Checking exams for userId:', userId, 'batch_id:', batch_id, 'date range:', startDate, 'to', endDate);

        // Check for exams in the date range for this batch
        // Exams are stored as: UT-1, UT-2, UT-3, MODEL, SEMESTER (or the old CIA format)
        const [exams]: any = await pool.query(
            `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') as start_date, 
                    DATE_FORMAT(end_date, '%Y-%m-%d') as end_date, 
                    category, title, batch_id, semester
             FROM schedules
             WHERE category IN ('CIA 1', 'CIA 2', 'CIA 3', 'UT-1', 'UT-2', 'UT-3', 'Model', 'MODEL', 'Semester', 'SEMESTER')
             AND (batch_id = ? OR batch_id IS NULL)
             AND (
                (start_date BETWEEN ? AND ?) OR
                (end_date BETWEEN ? AND ?) OR
                (start_date <= ? AND end_date >= ?)
             )`,
            [batch_id, startDate, endDate, startDate, endDate, startDate, endDate]
        );

        console.log('[EXAM CHECK] Found', exams.length, 'exam(s):', exams);

        const examDetails: string[] = [];
        exams.forEach((e: any) => {
            examDetails.push(`${e.start_date} to ${e.end_date} (${e.category}: ${e.title})`);
        });

        return {
            hasExams: exams.length > 0,
            examDates: examDetails
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
        
        // Get tutor for that specific student based on their rank in the section
        const [tutorAssignment]: any = await pool.query(`
            SELECT ta.faculty_id 
            FROM tutor_assignments ta
            JOIN (
                SELECT user_id, batch_id, section_id, 
                       ROW_NUMBER() OVER (ORDER BY roll_number ASC) as row_num
                FROM student_profiles
                WHERE batch_id = ? AND section_id = ?
            ) sp_ranked ON ta.batch_id = sp_ranked.batch_id AND ta.section_id = sp_ranked.section_id
            WHERE sp_ranked.user_id = ? 
              AND ta.is_active = TRUE
              AND (ta.reg_number_start IS NULL OR ta.reg_number_end IS NULL 
                   OR (sp_ranked.row_num >= CAST(ta.reg_number_start AS UNSIGNED) 
                       AND sp_ranked.row_num <= CAST(ta.reg_number_end AS UNSIGNED)))
            ORDER BY (ta.reg_number_start IS NOT NULL AND ta.reg_number_end IS NOT NULL) DESC
            LIMIT 1
        `, [batch_id, section_id, studentId]);
        
        return tutorAssignment.length > 0 ? tutorAssignment[0].faculty_id : null;
        
    } catch (error) {
        console.error('Error getting tutor:', error);
        return null;
    }
}

