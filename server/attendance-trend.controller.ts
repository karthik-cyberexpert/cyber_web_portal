import { Request, Response } from 'express';
import { pool } from './db.js';

// Helper to get student's batch info
const getStudentBatchInfo = async (userId: number) => {
    const [rows]: any = await pool.query(`
        SELECT sp.section_id, sp.batch_id, b.semester_start_date, b.semester_end_date, b.current_semester
        FROM student_profiles sp
        JOIN batches b ON sp.batch_id = b.id
        WHERE sp.user_id = ?
    `, [userId]);
    return rows[0] || null;
};

// Helper to get tutor's assignment and batch info
const getTutorBatchInfo = async (facultyId: number) => {
    const [rows]: any = await pool.query(`
        SELECT ta.section_id, ta.batch_id, s.name as section_name, 
               b.name as batch_name, b.semester_start_date, b.semester_end_date, b.current_semester
        FROM tutor_assignments ta
        JOIN sections s ON ta.section_id = s.id
        JOIN batches b ON ta.batch_id = b.id
        WHERE ta.faculty_id = ? AND ta.is_active = TRUE
        LIMIT 1
    `, [facultyId]);
    return rows[0] || null;
};

// GET /api/attendance-trend/student
// Returns monthly leave and OD days for current semester
export const getStudentTrend = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const batchInfo = await getStudentBatchInfo(userId);
        if (!batchInfo || !batchInfo.semester_start_date) {
            return res.json([]);
        }

        const startDate = batchInfo.semester_start_date;
        const endDate = new Date() < new Date(batchInfo.semester_end_date) 
            ? new Date() 
            : batchInfo.semester_end_date;

        // Get leave counts by month
        const [leaveData]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(start_date, '%b') as month,
                MONTH(start_date) as month_num,
                COUNT(*) as count
            FROM leave_requests
            WHERE user_id = ? 
              AND status IN ('approved', 'forwarded')
              AND start_date >= ?
              AND start_date <= ?
            GROUP BY month, month_num
            ORDER BY month_num
        `, [userId, startDate, endDate]);

        // Get OD counts by month
        const [odData]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(start_date, '%b') as month,
                MONTH(start_date) as month_num,
                COUNT(*) as count
            FROM od_requests
            WHERE user_id = ? 
              AND status IN ('approved', 'forwarded')
              AND start_date >= ?
              AND start_date <= ?
            GROUP BY month, month_num
            ORDER BY month_num
        `, [userId, startDate, endDate]);

        // Generate all months between start and end
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months: any[] = [];
        
        const current = new Date(start);
        while (current <= end) {
            const monthName = current.toLocaleDateString('en-US', { month: 'short' });
            const monthNum = current.getMonth() + 1;
            
            const leaveEntry = leaveData.find((l: any) => l.month_num === monthNum);
            const odEntry = odData.find((o: any) => o.month_num === monthNum);
            
            months.push({
                month: monthName,
                leaves: leaveEntry?.count || 0,
                ods: odEntry?.count || 0
            });
            
            current.setMonth(current.getMonth() + 1);
        }

        res.json(months);
    } catch (error) {
        console.error('Get Student Attendance Trend Error:', error);
        res.status(500).json({ message: 'Error fetching attendance trend' });
    }
};

// GET /api/attendance-trend/tutor
// Returns monthly absence/OD counts for tutor's section
export const getTutorTrend = async (req: Request | any, res: Response) => {
    const facultyId = req.user?.id;
    if (!facultyId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const batchInfo = await getTutorBatchInfo(facultyId);
        
        // Fallback: If no semester dates, use current year from January
        let startDate: Date;
        let endDate: Date = new Date();
        let sectionId: number | null = null;
        
        if (!batchInfo) {
            // No tutor assignment found - return empty with fallback months
            const now = new Date();
            startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        } else {
            sectionId = batchInfo.section_id;
            if (batchInfo.semester_start_date) {
                startDate = new Date(batchInfo.semester_start_date);
                if (batchInfo.semester_end_date && new Date() < new Date(batchInfo.semester_end_date)) {
                    endDate = new Date();
                } else if (batchInfo.semester_end_date) {
                    endDate = new Date(batchInfo.semester_end_date);
                }
            } else {
                // Semester dates not configured - use current year from January
                startDate = new Date(new Date().getFullYear(), 0, 1);
            }
        }

        // Get leave counts by month for all students in section (only if we have a section)
        let leaveData: any[] = [];
        let odData: any[] = [];
        
        if (sectionId) {
            [leaveData] = await pool.query(`
                SELECT 
                    DATE_FORMAT(lr.start_date, '%b') as month,
                    MONTH(lr.start_date) as month_num,
                    COUNT(*) as count
                FROM leave_requests lr
                JOIN student_profiles sp ON lr.user_id = sp.user_id
                WHERE sp.section_id = ?
                  AND lr.status IN ('approved', 'forwarded')
                  AND lr.start_date >= ?
                  AND lr.start_date <= ?
                GROUP BY month, month_num
                ORDER BY month_num
            `, [sectionId, startDate, endDate]) as any;

            [odData] = await pool.query(`
                SELECT 
                    DATE_FORMAT(od.start_date, '%b') as month,
                    MONTH(od.start_date) as month_num,
                    COUNT(*) as count
                FROM od_requests od
                JOIN student_profiles sp ON od.user_id = sp.user_id
                WHERE sp.section_id = ?
                  AND od.status IN ('approved', 'forwarded')
                  AND od.start_date >= ?
                  AND od.start_date <= ?
                GROUP BY month, month_num
                ORDER BY month_num
            `, [sectionId, startDate, endDate]) as any;
        }

        // Generate all months between start and end
        const months: any[] = [];
        
        const current = new Date(startDate);
        while (current <= endDate) {
            const monthName = current.toLocaleDateString('en-US', { month: 'short' });
            const monthNum = current.getMonth() + 1;
            
            const leaveEntry = leaveData.find((l: any) => l.month_num === monthNum);
            const odEntry = odData.find((o: any) => o.month_num === monthNum);
            
            months.push({
                month: monthName,
                absences: leaveEntry?.count || 0,
                ods: odEntry?.count || 0
            });
            
            current.setMonth(current.getMonth() + 1);
        }

        res.json(months);
    } catch (error) {
        console.error('Get Tutor Attendance Trend Error:', error);
        res.status(500).json({ message: 'Error fetching attendance trend' });
    }
};

// GET /api/attendance-trend/admin
// Returns all batches overview (only batches with active semesters)
export const getAdminTrend = async (req: Request | any, res: Response) => {
    try {
        // Get ALL batches for the distribution chart (regardless of semester dates)
        const [allBatches]: any = await pool.query(`
            SELECT b.id, b.name, b.current_semester,
                   (SELECT COUNT(*) FROM student_profiles sp WHERE sp.batch_id = b.id) as student_count
            FROM batches b
            ORDER BY b.name ASC
        `);

        // Get batches with active semesters for trend data (has semester dates and not ended)
        const [activeBatches]: any = await pool.query(`
            SELECT id, name, semester_start_date, semester_end_date, current_semester
            FROM batches
            WHERE semester_start_date IS NOT NULL
              AND (semester_end_date >= CURDATE() OR semester_end_date IS NULL)
            ORDER BY name ASC
        `);

        // If no batches at all, return empty
        if (allBatches.length === 0) {
            return res.json({ batches: [], trend: [] });
        }

        // Find the earliest start date and latest end date among active batches
        let earliestStart: Date | null = null;
        let latestEnd: Date = new Date();

        for (const batch of activeBatches) {
            const batchStart = new Date(batch.semester_start_date);
            if (!earliestStart || batchStart < earliestStart) {
                earliestStart = batchStart;
            }
        }

        if (!earliestStart) {
            return res.json({ batches: activeBatches, trend: [] });
        }

        // Aggregate leave and OD data across all active batches
        const batchIds = activeBatches.map((b: any) => b.id);
        
        const [leaveData]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(lr.start_date, '%b') as month,
                MONTH(lr.start_date) as month_num,
                COUNT(*) as count
            FROM leave_requests lr
            JOIN student_profiles sp ON lr.user_id = sp.user_id
            WHERE sp.batch_id IN (?)
              AND lr.status IN ('approved', 'forwarded')
              AND lr.start_date >= ?
              AND lr.start_date <= CURDATE()
            GROUP BY month, month_num
            ORDER BY month_num
        `, [batchIds, earliestStart]);

        const [odData]: any = await pool.query(`
            SELECT 
                DATE_FORMAT(od.start_date, '%b') as month,
                MONTH(od.start_date) as month_num,
                COUNT(*) as count
            FROM od_requests od
            JOIN student_profiles sp ON od.user_id = sp.user_id
            WHERE sp.batch_id IN (?)
              AND od.status IN ('approved', 'forwarded')
              AND od.start_date >= ?
              AND od.start_date <= CURDATE()
            GROUP BY month, month_num
            ORDER BY month_num
        `, [batchIds, earliestStart]);

        // Generate all months between start and now
        const months: any[] = [];
        const current = new Date(earliestStart);
        
        while (current <= latestEnd) {
            const monthName = current.toLocaleDateString('en-US', { month: 'short' });
            const monthNum = current.getMonth() + 1;
            
            const leaveEntry = leaveData.find((l: any) => l.month_num === monthNum);
            const odEntry = odData.find((o: any) => o.month_num === monthNum);
            
            months.push({
                month: monthName,
                leaves: leaveEntry?.count || 0,
                ods: odEntry?.count || 0
            });
            
            current.setMonth(current.getMonth() + 1);
        }

        res.json({
            batches: allBatches.map((b: any) => ({
                id: b.id,
                name: b.name,
                currentSemester: b.current_semester,
                studentCount: b.student_count || 0
            })),
            trend: months
        });
    } catch (error) {
        console.error('Get Admin Attendance Trend Error:', error);
        res.status(500).json({ message: 'Error fetching attendance trend' });
    }
};
