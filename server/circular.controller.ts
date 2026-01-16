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
            SELECT c.*, u.name as created_by_name,
                   b.name as batch_name, 
                   s.name as section_name
            FROM circulars c 
            JOIN users u ON c.created_by = u.id 
            LEFT JOIN batches b ON c.target_batch_id = b.id
            LEFT JOIN sections s ON c.target_section_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (role === 'faculty') {
            // See circulars for Faculty OR All
            // Also see circulars created by themselves
            query += ` AND (c.audience IN ('Faculty', 'All') OR c.created_by = ?)`;
            params.push(userId);
        } else if (role === 'tutor') {
            // See circulars for Tutors OR All
            // Also see circulars created by themselves
            query += ` AND (c.audience IN ('Tutors', 'All') OR c.created_by = ?)`;
            params.push(userId);
        } else if (role === 'student') {
            // See circulars for Students OR All
            // Filter by batch AND section
            
            // First get the student's batch_id, section_id, AND semester start date
            const [studentProfile]: any = await pool.query(`
                SELECT sp.batch_id, sp.section_id, b.semester_start_date 
                FROM student_profiles sp
                LEFT JOIN batches b ON sp.batch_id = b.id
                WHERE sp.user_id = ?
            `, [userId]);

            const batchId = studentProfile[0]?.batch_id;
            const sectionId = studentProfile[0]?.section_id;
            const semesterStartDate = studentProfile[0]?.semester_start_date;

            // Only show circulars created AFTER the current semester started
            if (semesterStartDate) {
                query += ` AND c.created_at >= ?`;
                params.push(semesterStartDate);
            }

            if (batchId && sectionId) {
                // Show circulars that are:
                // 1. Targeted to Students/All AND
                // 2. Either no specific batch OR matching batch AND
                // 3. Either no specific section OR matching section
                query += ` AND c.audience IN ('Students', 'All') 
                    AND (c.target_batch_id IS NULL OR c.target_batch_id = ?) 
                    AND (c.target_section_id IS NULL OR c.target_section_id = ?)`;
                params.push(batchId, sectionId);
            } else if (batchId) {
                query += ` AND c.audience IN ('Students', 'All') 
                    AND (c.target_batch_id IS NULL OR c.target_batch_id = ?)`;
                params.push(batchId);
            } else {
                query += ` AND c.audience IN ('Students', 'All')`;
            }
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

    const { title, content, description, audience, priority, target_batch_id, target_section_id, type } = req.body;
    const file = req.file;

    try {
        // Faculty Validation: Can only post to their allocated batches/sections
        if (role === 'faculty') {
            if (!target_batch_id) {
                return res.status(400).json({ message: 'Faculty must specify a target batch' });
            }

            // Verify allocation
            let allocationQuery = `
                SELECT id FROM subject_allocations 
                WHERE faculty_id = ? AND section_id IN (
                    SELECT id FROM sections WHERE batch_id = ?
                )
            `;
            const allocationParams: any[] = [userId, target_batch_id];

            if (target_section_id) {
                allocationQuery += ` AND section_id = ?`;
                allocationParams.push(target_section_id);
            }

            const [allocations]: any = await pool.query(allocationQuery, allocationParams);

            if (allocations.length === 0) {
                 return res.status(403).json({ message: 'You are not authorized to post circulars for this batch/section' });
            }
        }

        // Tutor Validation: Can only post to their assigned section
        let tutorBatchId = target_batch_id;
        let tutorSectionId = target_section_id;

        if (role === 'tutor') {
            // Get tutor's assigned section
            const [assignment]: any = await pool.query(`
                SELECT batch_id, section_id 
                FROM tutor_assignments 
                WHERE faculty_id = ? AND is_active = TRUE
                LIMIT 1
            `, [userId]);

            if (assignment.length === 0) {
                return res.status(403).json({ message: 'You are not assigned as a tutor to any section' });
            }

            // Auto-assign the tutor's section
            tutorBatchId = assignment[0].batch_id;
            tutorSectionId = assignment[0].section_id;
        }

        let attachment_url = null;
        if (file) {
            attachment_url = getFileUrl(file.path);
        }

        await pool.query(`
            INSERT INTO circulars (title, content, audience, priority, target_batch_id, target_section_id, type, attachment_url, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, 
            content || description || null, 
            audience || 'All', 
            priority || 'Medium', 
            (role === 'tutor' ? tutorBatchId : target_batch_id) || null, 
            (role === 'tutor' ? tutorSectionId : (target_section_id && target_section_id !== 'all' ? target_section_id : null)),
            type || 'Notice', 
            attachment_url, 
            userId
        ]);

        res.status(201).json({ message: 'Circular created successfully' });

        // Notifications
        if (audience === 'All') {
            await createNotification(null, `New Circular: ${title}`, content || description || 'A new circular has been published.');
        } else if (audience === 'Students') {
            const finalBatchId = role === 'tutor' ? tutorBatchId : target_batch_id;
            const finalSectionId = role === 'tutor' ? tutorSectionId : (target_section_id && target_section_id !== 'all' ? target_section_id : null);

            let studentQuery = 'SELECT user_id FROM student_profiles WHERE 1=1';
            const studentParams = [];
            if (finalBatchId) {
                studentQuery += ' AND batch_id = ?';
                studentParams.push(finalBatchId);
            }
            if (finalSectionId) {
                studentQuery += ' AND section_id = ?';
                studentParams.push(finalSectionId);
            }
            const [students]: any = await pool.query(studentQuery, studentParams);
            const studentIds = students.map((s: any) => s.user_id);
            await createBulkNotifications(studentIds, `New Circular: ${title}`, content || description || 'A new circular has been published for your batch/section.');
        } else if (audience === 'Faculty') {
            // Get all faculty users
            const [faculty]: any = await pool.query("SELECT id FROM users WHERE role = 'faculty'");
            const facultyIds = faculty.map((f: any) => f.id);
            await createBulkNotifications(facultyIds, `New Circular: ${title}`, content || description || 'A new circular has been published for faculty.');
        } else if (audience === 'Tutors') {
            // Get all tutors (who are faculty with tutor assignments)
            const [tutors]: any = await pool.query("SELECT id FROM users WHERE role = 'tutor'");
            const tutorIds = tutors.map((t: any) => t.id);
            await createBulkNotifications(tutorIds, `New Circular: ${title}`, content || description || 'A new circular has been published for tutors.');
        }

    } catch (error) {
        console.error('Create Circular Error:', error);
        res.status(500).json({ message: 'Error creating circular' });
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
