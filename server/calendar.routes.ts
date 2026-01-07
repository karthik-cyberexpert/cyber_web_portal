import express, { Router, Request, Response } from 'express';
import { pool as db } from './db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET events (with optional filtering)
router.get('/events', async (req: Request, res: Response) => {
    try {
        const { category, batchId, semester, month, year } = req.query;

        let query = `
            SELECT sc.*, sc.category as event_type, sc.start_date as date, s.name as subject_name, s.code as subject_code
            FROM schedules sc
            LEFT JOIN subjects s ON sc.subject_id = s.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (category) {
            query += ` AND sc.category = ?`;
            params.push(category);
        }

        if (batchId) {
            query += ` AND (sc.batch_id = ? OR sc.batch_id IS NULL)`;
            params.push(batchId);
        }

        if (semester) {
            query += ` AND (sc.semester = ? OR sc.semester IS NULL)`;
            params.push(semester);
        }

        if (month && year) {
            query += ` AND (MONTH(sc.start_date) = ? AND YEAR(sc.start_date) = ? OR MONTH(sc.end_date) = ? AND YEAR(sc.end_date) = ?)`;
            params.push(month, year, month, year);
        }

        query += ` ORDER BY sc.start_date ASC`;

        const [rows] = await db.query<RowDataPacket[]>(query, params);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST create event
router.post('/events', async (req: Request, res: Response) => {
    try {
        const { event_type, date, title, description, batch_id, semester, subject_id, end_date } = req.body;

        if (!event_type || !date) {
            return res.status(400).json({ message: 'Event type and date are required' });
        }

        // Map frontend categories to DB ENUM
        let mappedCategory = event_type;
        if (event_type === 'UT') {
            // Check if it's CIA 1, 2, or 3 based on title or other logic
            // For now, let's assume 'CIA 1' if it's UT. 
            // Better to update frontend to send 'CIA 1', etc.
            mappedCategory = title && title.includes('2') ? 'CIA 2' : title && title.includes('3') ? 'CIA 3' : 'CIA 1';
        } else if (event_type === 'MODEL') {
            mappedCategory = 'Model';
        } else if (event_type === 'SEMESTER') {
            mappedCategory = 'Semester';
        } else if (event_type === 'HOLIDAY') {
            mappedCategory = 'Holiday';
        }

        // Check for existing schedule for same subject, category, and batch
        const [existing]: any = await db.query(
            `SELECT id FROM schedules 
             WHERE subject_id = ? AND category = ? AND batch_id = ?`,
            [subject_id, mappedCategory, batch_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ 
                message: `This subject is already scheduled for ${mappedCategory} in this batch.` 
            });
        }

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO schedules (title, category, start_date, end_date, batch_id, semester, subject_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title || description || mappedCategory, mappedCategory, date, end_date || date, batch_id, semester, subject_id]
        );

        res.status(201).json({ id: result.insertId, message: 'Schedule created successfully' });
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE event
router.delete('/events/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM schedules WHERE id = ?', [id]);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const calendarRouter = router;
