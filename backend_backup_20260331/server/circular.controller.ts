import { Request, Response } from 'express';
import { pool } from './db.js';
import { getFileUrl } from './upload.config.js';
import { createNotification, createBulkNotifications } from './notifications.utils.js';

// Get Circulars (Filtered by Role/Context)
export const getCirculars = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    
    // Admin sees all? Or mostly for Faculty view right now.
    // Faculty should see: 
    // 1. Circulars targeted to 'Faculty' or 'All'
    // 2. Circulars created by them?
    
    try {
        let query = `
            SELECT DISTINCT c.*, u.name as created_by_name,
                   b.name as batch_name, 
                   s.name as section_name,
                   c.content as description
            FROM circulars c 
            JOIN users u ON c.created_by = u.id 
            LEFT JOIN batches b ON c.target_batch_id = b.id
            LEFT JOIN sections s ON c.target_section_id = s.id
            LEFT JOIN circular_recipients cr ON c.id = cr.circular_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (role === 'admin') {
            // Admin sees everything
        } else if (role === 'faculty') {
            // See circulars if specifically targeted OR (No specific targets AND Audience is Faculty/All)
            query += ` AND (
                cr.user_id = ?
                OR (
                    NOT EXISTS (SELECT 1 FROM circular_recipients WHERE circular_id = c.id)
                    AND (c.audience IN ('Faculty', 'All') OR c.created_by = ?)
                )
            )`;
            params.push(userId, userId);
        } else if (role === 'tutor') {
            query += ` AND (
                cr.user_id = ?
                OR (
                    NOT EXISTS (SELECT 1 FROM circular_recipients WHERE circular_id = c.id)
                    AND (c.audience IN ('Tutors', 'All') OR c.created_by = ?)
                )
            )`;
            params.push(userId, userId);
        } else if (role === 'student') {
            const [studentProfile]: any = await pool.query(`
                SELECT sp.batch_id, sp.section_id
                FROM student_profiles sp
                WHERE sp.user_id = ?
            `, [userId]);

            const batchId = studentProfile[0]?.batch_id;
            const sectionId = studentProfile[0]?.section_id;

            query += ` AND (
                cr.user_id = ? 
                OR (
                    NOT EXISTS (SELECT 1 FROM circular_recipients WHERE circular_id = c.id)
                    AND c.audience IN ('Students', 'All') 
                    AND (c.target_batch_id IS NULL OR c.target_batch_id = ?) 
                    AND (c.target_section_id IS NULL OR c.target_section_id = ?)
                )
            )`;
            params.push(userId, batchId || null, sectionId || null);
        }

        query += ` ORDER BY c.published_at DESC, c.created_at DESC`;

        const [rows]: any = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get Circulars Error:', error);
        res.status(500).json({ message: 'Error fetching circulars' });
    }
};

// Create Circular
export const createCircular = async (req: Request | any, res: Response) => {
    console.log('=== CREATE CIRCULAR REQUEST ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, content, description, audience, priority, target_batch_id, target_section_id, type, recipient_ids } = req.body;
    const file = req.file;

    // Map audience to backend expected CamelCase
    const audienceMap: Record<string, string> = {
        'all': 'All',
        'students': 'Students',
        'faculty': 'Faculty',
        'tutors': 'Tutors'
    };
    const finalAudience = audienceMap[audience] || audience || 'All';

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Faculty Validation: Can only post to their allocated batches/sections
        if (role === 'faculty') {
            if (!target_batch_id && finalAudience === 'Students') {
                return res.status(400).json({ message: 'Faculty must specify a target batch for student circulars' });
            }

            if (target_batch_id) {
                // Verify allocation
                let allocationQuery = `
                    SELECT id FROM subject_allocations 
                    WHERE faculty_id = ? AND section_id IN (
                        SELECT id FROM sections WHERE batch_id = ?
                    )
                `;
                const allocationParams: any[] = [userId, target_batch_id];

                if (target_section_id && target_section_id !== 'all') {
                    allocationQuery += ` AND section_id = ?`;
                    allocationParams.push(target_section_id);
                }

                const [allocations]: any = await conn.query(allocationQuery, allocationParams);
                if (allocations.length === 0) {
                     await conn.rollback();
                     return res.status(403).json({ message: 'You are not authorized to post circulars for this batch/section' });
                }
            }
        }

        // Tutor Validation
        let tutorBatchId = target_batch_id;
        let tutorSectionId = target_section_id;

        if (role === 'tutor') {
            const [assignment]: any = await conn.query(`
                SELECT batch_id, section_id FROM tutor_assignments 
                WHERE faculty_id = ? AND is_active = TRUE LIMIT 1
            `, [userId]);

            if (assignment.length === 0) {
                await conn.rollback();
                return res.status(403).json({ message: 'You are not assigned as a tutor to any section' });
            }
            tutorBatchId = assignment[0].batch_id;
            tutorSectionId = assignment[0].section_id;
        }

        let attachment_url = null;
        if (file) attachment_url = getFileUrl(file.path);

        const [result]: any = await conn.query(`
            INSERT INTO circulars (title, content, description, audience, priority, target_batch_id, target_section_id, type, attachment_url, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, 
            content || description || '', 
            content || description || '', 
            finalAudience, 
            priority || 'Medium', 
            (role === 'tutor' ? tutorBatchId : target_batch_id) || null, 
            (role === 'tutor' ? tutorSectionId : (target_section_id && target_section_id !== 'all' ? target_section_id : null)),
            type || 'Notice', 
            attachment_url, 
            userId
        ]);

        const circularId = result.insertId;

        // Handle specific recipients
        if (recipient_ids && Array.isArray(recipient_ids) && recipient_ids.length > 0) {
            const recipientValues = recipient_ids.map(uid => [circularId, uid]);
            await conn.query(`INSERT INTO circular_recipients (circular_id, user_id) VALUES ?`, [recipientValues]);
        }

        await conn.commit();
        res.status(201).json({ message: 'Circular created successfully', id: circularId });

        // Notifications (Background)
        try {
            if (finalAudience === 'All') {
                await createNotification(null, `New Circular: ${title}`, content || description || 'A new circular has been published.');
            } else if (finalAudience === 'Students') {
                if (recipient_ids && recipient_ids.length > 0) {
                    await createBulkNotifications(recipient_ids, `New Circular: ${title}`, 'A new circular has been specifically shared with you.');
                } else {
                    const finalBatchId = role === 'tutor' ? tutorBatchId : target_batch_id;
                    const finalSectionId = role === 'tutor' ? tutorSectionId : (target_section_id && target_section_id !== 'all' ? target_section_id : null);

                    let studentQuery = 'SELECT user_id FROM student_profiles WHERE 1=1';
                    const studentParams = [];
                    if (finalBatchId) { studentQuery += ' AND batch_id = ?'; studentParams.push(finalBatchId); }
                    if (finalSectionId) { studentQuery += ' AND section_id = ?'; studentParams.push(finalSectionId); }
                    
                    const [students]: any = await pool.query(studentQuery, studentParams);
                    const studentIds = students.map((s: any) => s.user_id);
                    await createBulkNotifications(studentIds, `New Circular: ${title}`, 'A new circular has been published for your batch/section.');
                }
            } else if (finalAudience === 'Faculty') {
                if (recipient_ids && recipient_ids.length > 0) {
                    await createBulkNotifications(recipient_ids, `New Circular: ${title}`, 'A new circular has been specifically shared with you.');
                } else {
                    const [faculty]: any = await pool.query("SELECT id FROM users WHERE role = 'faculty'");
                    const facultyIds = faculty.map((f: any) => f.id);
                    await createBulkNotifications(facultyIds, `New Circular: ${title}`, 'A new circular has been published for faculty.');
                }
            }
        } catch (notificationError) {
            console.error('Notification Error (Circular):', notificationError);
        }

    } catch (error) {
        await conn.rollback();
        console.error('Create Circular Error:', error);
        res.status(500).json({ message: 'Error creating circular' });
    } finally {
        conn.release();
    }
};

// Update Circular
export const updateCircular = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const circularId = req.params.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, content, description, audience, priority, target_batch_id, target_section_id, type } = req.body;
    const file = req.file;

    try {
        // Check if circular exists and user is the creator
        const [existing]: any = await pool.query(
            'SELECT created_by, attachment_url FROM circulars WHERE id = ?',
            [circularId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        if (existing[0].created_by !== userId) {
            return res.status(403).json({ message: 'You can only edit your own circulars' });
        }

        // Faculty Validation: Can only post to their allocated batches/sections
        if (role === 'faculty' && target_batch_id) {
            let allocationQuery = `
                SELECT id FROM subject_allocations 
                WHERE faculty_id = ? AND section_id IN (
                    SELECT id FROM sections WHERE batch_id = ?
                )
            `;
            const allocationParams: any[] = [userId, target_batch_id];

            if (target_section_id && target_section_id !== 'all') {
                allocationQuery += ` AND section_id = ?`;
                allocationParams.push(target_section_id);
            }

            const [allocations]: any = await pool.query(allocationQuery, allocationParams);

            if (allocations.length === 0) {
                return res.status(403).json({ message: 'You are not authorized to post circulars for this batch/section' });
            }
        }

        let attachment_url = existing[0].attachment_url;
        if (file) {
            attachment_url = getFileUrl(file.path);
        }

        await pool.query(`
            UPDATE circulars 
            SET title = ?, content = ?, audience = ?, priority = ?, 
                target_batch_id = ?, target_section_id = ?, type = ?, attachment_url = ?
            WHERE id = ?
        `, [
            title, 
            content || description || null, 
            audience || 'All', 
            priority || 'Medium', 
            target_batch_id || null, 
            (target_section_id && target_section_id !== 'all') ? target_section_id : null, 
            type || 'Notice', 
            attachment_url,
            circularId
        ]);

        res.json({ message: 'Circular updated successfully' });

    } catch (error) {
        console.error('Update Circular Error:', error);
        res.status(500).json({ message: 'Error updating circular' });
    }
};

// Delete Circular
export const deleteCircular = async (req: Request | any, res: Response) => {
    const userId = req.user?.id;
    const circularId = req.params.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Check if circular exists and user is the creator
        const [existing]: any = await pool.query(
            'SELECT created_by FROM circulars WHERE id = ?',
            [circularId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        if (existing[0].created_by !== userId) {
            return res.status(403).json({ message: 'You can only delete your own circulars' });
        }

        await pool.query('DELETE FROM circulars WHERE id = ?', [circularId]);

        res.json({ message: 'Circular deleted successfully' });

    } catch (error) {
        console.error('Delete Circular Error:', error);
        res.status(500).json({ message: 'Error deleting circular' });
    }
};
