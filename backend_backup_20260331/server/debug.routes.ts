// Temporary debug endpoint to check schedules
import { Router, Request, Response } from 'express';
import { pool } from './db.js';

const router = Router();

router.get('/debug/schedules', async (req: Request, res: Response) => {
    try {
        const [schedules] = await pool.query(`
            SELECT id, title, category, start_date, end_date, batch_id, semester, subject_id 
            FROM schedules 
            WHERE DATE(start_date) = '2026-01-14' OR DATE(end_date) = '2026-01-14'
        `);
        
        const [allSchedules] = await pool.query(`
            SELECT id, title, category, start_date, end_date, batch_id, semester, subject_id 
            FROM schedules 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        const [batches] = await pool.query(`SELECT id, name FROM batches`);
        
        const [studentProfile] = await pool.query(`
            SELECT user_id, batch_id FROM student_profiles WHERE user_id = 3
        `);

        res.json({
            schedulesFor14th: schedules,
            recentSchedules: allSchedules,
            batches,
            studentProfile
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: String(error) });
    }
});

export const debugRouter = router;
