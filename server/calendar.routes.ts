import express, { Router, Request, Response } from 'express';
import { db } from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET events (with optional filtering)
router.get('/events', async (req: Request, res: Response) => {
    try {
        const { type, batchId, semester, month, year } = req.query;

        let query = `
            SELECT ce.*, s.name as subject_name, s.code as subject_code
            FROM calendar_events ce
            LEFT JOIN subjects s ON ce.subject_id = s.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (type) {
            query += ` AND ce.event_type = ?`;
            params.push(type);
        }

        if (batchId) {
            query += ` AND (ce.batch_id = ? OR ce.batch_id IS NULL)`;
            params.push(batchId);
        }

        if (semester) {
            query += ` AND (ce.semester = ? OR ce.semester IS NULL)`;
            params.push(semester);
        }

        if (month && year) {
            query += ` AND MONTH(ce.date) = ? AND YEAR(ce.date) = ?`;
            params.push(month, year);
        }

        query += ` ORDER BY ce.date ASC`;

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
        const { event_type, date, title, description, batch_id, semester, subject_id } = req.body;

        if (!event_type || !date) {
            return res.status(400).json({ message: 'Event type and date are required' });
        }

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO calendar_events (event_type, date, title, description, batch_id, semester, subject_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [event_type, date, title, description, batch_id, semester, subject_id]
        );

        res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE event
router.delete('/events/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM calendar_events WHERE id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const calendarRouter = router;
