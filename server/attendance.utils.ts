import { pool } from './db.js';
import { getHolidaysInRange } from './leave-od.utils.js';

/**
 * Calculate student attendance percentage from semester start date to today.
 * 
 * Formula: (totalDays - leaveDays) / totalDays * 100
 * 
 * Note: 
 * - OD (On Duty) days are NOT counted as absent - they count as present
 * - Only approved leaves are counted as absent
 * - Sundays AND Holidays are excluded from total days
 */
export async function getStudentAttendancePercentage(userId: number): Promise<{
    totalDays: number;
    leaveDays: number;
    odDays: number;
    attendancePercentage: number;
    semesterStartDate: string | null;
}> {
    try {
        // 1. Get student's batch and semester_start_date
        const [studentInfo]: any = await pool.query(`
            SELECT sp.batch_id, b.semester_start_date
            FROM student_profiles sp
            JOIN batches b ON sp.batch_id = b.id
            WHERE sp.user_id = ?
        `, [userId]);

        if (studentInfo.length === 0 || !studentInfo[0].semester_start_date) {
            console.log(`[Attendance] No semester start date found for user ${userId}`);
            return {
                totalDays: 0,
                leaveDays: 0,
                odDays: 0,
                attendancePercentage: 100, // Default to 100% if no data
                semesterStartDate: null
            };
        }

        const semesterStartDate = new Date(studentInfo[0].semester_start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If semester hasn't started yet, full attendance
        if (semesterStartDate > today) {
            return {
                totalDays: 0,
                leaveDays: 0,
                odDays: 0,
                attendancePercentage: 100,
                semesterStartDate: studentInfo[0].semester_start_date
            };
        }

        // 2. Get holidays in the range
        const todayStr = today.toISOString().split('T')[0];
        const holidays = await getHolidaysInRange(studentInfo[0].semester_start_date, todayStr);
        const holidaySet = new Set(holidays);

        // 3. Calculate total calendar days excluding Sundays AND Holidays
        let totalDays = 0;
        const currentDate = new Date(semesterStartDate);
        
        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            // Exclude Sundays (0 = Sunday) AND Holidays
            if (currentDate.getDay() !== 0 && !holidaySet.has(dateStr)) {
                totalDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (totalDays === 0) {
            return {
                totalDays: 0,
                leaveDays: 0,
                odDays: 0,
                attendancePercentage: 100,
                semesterStartDate: studentInfo[0].semester_start_date
            };
        }

        // 3. Count approved leave days (leaves that reduce attendance)
        const [leaveResult]: any = await pool.query(`
            SELECT COALESCE(SUM(
                CASE 
                    WHEN is_half_day = TRUE THEN 0.5
                    ELSE working_days
                END
            ), 0) as total_leave_days
            FROM leave_requests
            WHERE user_id = ?
              AND status = 'approved'
              AND start_date >= ?
              AND start_date <= ?
        `, [userId, studentInfo[0].semester_start_date, today]);

        const leaveDays = parseFloat(leaveResult[0]?.total_leave_days || 0);

        // 4. Count approved OD days (ODs count as PRESENT, so we track but don't deduct)
        const [odResult]: any = await pool.query(`
            SELECT COALESCE(SUM(
                CASE 
                    WHEN is_half_day = TRUE THEN 0.5
                    ELSE working_days
                END
            ), 0) as total_od_days
            FROM od_requests
            WHERE user_id = ?
              AND status = 'approved'
              AND start_date >= ?
              AND start_date <= ?
        `, [userId, studentInfo[0].semester_start_date, today]);

        const odDays = parseFloat(odResult[0]?.total_od_days || 0);

        // 5. Calculate attendance percentage
        // Attendance = (totalDays - leaveDays) / totalDays * 100
        // OD days are NOT deducted - they count as present
        const attendancePercentage = ((totalDays - leaveDays) / totalDays) * 100;

        console.log(`[Attendance] User ${userId}: Total=${totalDays}, Leaves=${leaveDays}, ODs=${odDays}, Attendance=${attendancePercentage.toFixed(2)}%`);

        return {
            totalDays,
            leaveDays,
            odDays,
            attendancePercentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimal places
            semesterStartDate: studentInfo[0].semester_start_date
        };

    } catch (error) {
        console.error('[Attendance] Error calculating attendance:', error);
        return {
            totalDays: 0,
            leaveDays: 0,
            odDays: 0,
            attendancePercentage: 100, // Default to 100% on error to not block user
            semesterStartDate: null
        };
    }
}

/**
 * Check if a student is eligible for casual leave based on attendance.
 * Requires >= 80% attendance.
 */
export async function canApplyCasualLeave(userId: number): Promise<{
    allowed: boolean;
    attendancePercentage: number;
    message: string;
}> {
    const attendance = await getStudentAttendancePercentage(userId);
    const MINIMUM_ATTENDANCE = 80;

    if (attendance.attendancePercentage >= MINIMUM_ATTENDANCE) {
        return {
            allowed: true,
            attendancePercentage: attendance.attendancePercentage,
            message: 'Casual leave is allowed'
        };
    } else {
        return {
            allowed: false,
            attendancePercentage: attendance.attendancePercentage,
            message: `Your attendance (${attendance.attendancePercentage}%) is below the required ${MINIMUM_ATTENDANCE}% for casual leave`
        };
    }
}
