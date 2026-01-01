import { Request, Response } from 'express';
import { pool } from './db.js';

// Get All Batches with Department and Section Count
export const getBatches = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT b.*, d.name as department_name, d.code as department_code,
      (SELECT COUNT(*) FROM sections s WHERE s.batch_id = b.id) as section_count
      FROM batches b 
      JOIN departments d ON b.department_id = d.id 
      ORDER BY b.start_year DESC
    `);
    res.json(rows);
  } catch (error: any) {
    console.error('Get Batches Error:', error);
    res.status(500).json({ message: 'Error fetching batches' });
  }
};

// Create Batch
export const createBatch = async (req: Request, res: Response) => {
  const { department_id, name, start_year, end_year } = req.body;
  
  if (!department_id || !name || !start_year || !end_year) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result]: any = await pool.execute(
      'INSERT INTO batches (department_id, name, start_year, end_year) VALUES (?, ?, ?, ?)',
      [department_id, name, start_year, end_year]
    );
    res.status(201).json({ id: result.insertId, message: 'Batch created successfully' });
  } catch (error: any) {
    console.error('Create Batch Error:', error);
    res.status(500).json({ message: 'Error creating batch' });
  }
};

// Get Sections for a Batch
export const getSections = async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const [rows]: any = await pool.query('SELECT * FROM sections WHERE batch_id = ?', [batchId]);
    res.json(rows);
  } catch (error: any) {
    console.error('Get Sections Error:', error);
    res.status(500).json({ message: 'Error fetching sections' });
  }
};

// Create Section
export const createSection = async (req: Request, res: Response) => {
  const { batch_id, name, capacity } = req.body;

  try {
    const [result]: any = await pool.execute(
      'INSERT INTO sections (batch_id, name, capacity) VALUES (?, ?, ?)',
      [batch_id, name, capacity || 60]
    );
    res.status(201).json({ id: result.insertId, message: 'Section created successfully' });
  } catch (error: any) {
    console.error('Create Section Error:', error);
    res.status(500).json({ message: 'Error creating section' });
  }
};

// Update Batch (Fixed to accept actual semester number 1-8)
export const updateBatch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { semester, semester_start_date, semester_end_date } = req.body;

    try {
        await pool.execute(
            `UPDATE batches 
             SET current_semester = ?, 
                 semester_start_date = ?, 
                 semester_end_date = ?,
                 semester_dates_pending = FALSE 
             WHERE id = ?`,
            [semester, semester_start_date || null, semester_end_date || null, id]
        );
        res.json({ message: 'Batch updated successfully' });
    } catch (error: any) {
        console.error('Update Batch Error:', error);
        res.status(500).json({ message: 'Error updating batch' });
    }
};

// Get Pending Semester Updates - Returns batches that need new semester dates
export const getPendingSemesterUpdates = async (req: Request, res: Response) => {
    try {
        // First, auto-increment semesters for batches whose end date has passed
        // and set semester_dates_pending = TRUE
        await pool.execute(`
            UPDATE batches 
            SET current_semester = current_semester + 1,
                semester_dates_pending = TRUE,
                semester_start_date = NULL,
                semester_end_date = NULL
            WHERE semester_end_date IS NOT NULL 
              AND semester_end_date < CURDATE()
              AND semester_dates_pending = FALSE
              AND current_semester < 8
        `);

        // Now fetch all batches that need semester date configuration
        const [rows]: any = await pool.query(`
            SELECT b.id, b.name, b.current_semester, b.semester_start_date, b.semester_end_date,
                   d.name as department_name
            FROM batches b
            JOIN departments d ON b.department_id = d.id
            WHERE b.semester_dates_pending = TRUE
            ORDER BY b.name ASC
        `);

        res.json(rows);
    } catch (error: any) {
        console.error('Get Pending Semester Updates Error:', error);
        res.status(500).json({ message: 'Error checking pending semester updates' });
    }
};

// Set Semester Dates for a Batch
export const setSemesterDates = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { semester_start_date, semester_end_date } = req.body;

    if (!semester_start_date || !semester_end_date) {
        return res.status(400).json({ message: 'Both start and end dates are required' });
    }

    if (new Date(semester_start_date) >= new Date(semester_end_date)) {
        return res.status(400).json({ message: 'Start date must be before end date' });
    }

    try {
        await pool.execute(
            `UPDATE batches 
             SET semester_start_date = ?, 
                 semester_end_date = ?,
                 semester_dates_pending = FALSE 
             WHERE id = ?`,
            [semester_start_date, semester_end_date, id]
        );
        res.json({ message: 'Semester dates updated successfully' });
    } catch (error: any) {
        console.error('Set Semester Dates Error:', error);
        res.status(500).json({ message: 'Error setting semester dates' });
    }
};

// Delete Batch
export const deleteBatch = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM batches WHERE id = ?', [id]);
        res.json({ message: 'Batch deleted successfully' });
    } catch (error: any) {
        console.error('Delete Batch Error:', error);
        res.status(500).json({ message: 'Error deleting batch' });
    }
};

// Update Section
export const updateSection = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await pool.execute('UPDATE sections SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Section updated successfully' });
    } catch (error: any) {
        console.error('Update Section Error:', error);
        res.status(500).json({ message: 'Error updating section' });
    }
};

// Delete Section
export const deleteSection = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM sections WHERE id = ?', [id]);
        res.json({ message: 'Section deleted successfully' });
    } catch (error: any) {
         console.error('Delete Section Error:', error);
         res.status(500).json({ message: 'Error deleting section' });
    }
};

// -----------------------------------------------------------------------------
// Subjects Management
// -----------------------------------------------------------------------------

// Get All Subjects with Faculties (Simple "Master" List)
export const getSubjects = async (req: Request, res: Response) => {
  try {
    // Fetch subjects
    const [subjects]: any = await pool.query(`
      SELECT * FROM subjects ORDER BY semester ASC, code ASC
    `);

    // Fetch allocations (faculties assigned to subjects)
    // We assume allocations with NULL section_id are "General" assignments for this view
    const [allocations]: any = await pool.query(`
      SELECT sa.subject_id, u.id as faculty_id, u.name as faculty_name
      FROM subject_allocations sa
      JOIN users u ON sa.faculty_id = u.id
      WHERE sa.section_id IS NULL 
    `);

    // Merge allocations into subjects
    const subjectsWithFaculties = subjects.map((sub: any) => {
      const subAllocations = allocations.filter((a: any) => a.subject_id === sub.id);
      return {
        ...sub,
        faculties: subAllocations.map((a: any) => ({ id: a.faculty_id, name: a.faculty_name }))
      };
    });

    res.json(subjectsWithFaculties);
  } catch (error: any) {
    console.error('Get Subjects Error:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
};

// Create Subject
export const createSubject = async (req: Request, res: Response) => {
  const { name, code, credits, semester, type } = req.body;

  try {
    const [result]: any = await pool.execute(
      'INSERT INTO subjects (name, code, credits, semester, type) VALUES (?, ?, ?, ?, ?)',
      [name, code, credits, semester, type || 'theory']
    );
    res.status(201).json({ id: result.insertId, message: 'Subject created successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    console.error('Create Subject Error:', error);
    res.status(500).json({ message: 'Error creating subject' });
  }
};

// Update Subject
export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, credits, semester, type } = req.body;

  try {
    await pool.execute(
      'UPDATE subjects SET name = ?, code = ?, credits = ?, semester = ?, type = ? WHERE id = ?',
      [name, code, credits, semester, type || 'theory', id]
    );
    res.json({ message: 'Subject updated successfully' });
  } catch (error: any) {
    console.error('Update Subject Error:', error);
    res.status(500).json({ message: 'Error updating subject' });
  }
};

// Delete Subject
export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Delete Subject Error:', error);
    res.status(500).json({ message: 'Error deleting subject' });
  }
};

// Update Subject Faculties
export const updateSubjectFaculties = async (req: Request, res: Response) => {
  const { id } = req.params; // subject_id
  const { facultyIds } = req.body; // Array of user_ids

  if (!Array.isArray(facultyIds)) {
    return res.status(400).json({ message: 'facultyIds must be an array' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Remove existing "general" allocations (section_id IS NULL) for this subject
    await connection.execute(
      'DELETE FROM subject_allocations WHERE subject_id = ? AND section_id IS NULL',
      [id]
    );

    // 2. Insert new allocations
    if (facultyIds.length > 0) {
      const values = facultyIds.map((fid: number) => [id, fid, null]); // null for section_id
      // Construct bulk insert query
      const placeholders = facultyIds.map(() => '(?, ?, ?)').join(', ');
      const flatValues = values.flat();
      
      await connection.execute(
        `INSERT INTO subject_allocations (subject_id, faculty_id, section_id) VALUES ${placeholders}`,
        flatValues
      );
    }

    await connection.commit();
    res.json({ message: 'Subject faculties updated successfully' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Update Subject Faculties Error:', error);
    res.status(500).json({ message: 'Error updating subject faculties' });
  } finally {
    connection.release();
  }
};
// -----------------------------------------------------------------------------
// Timetable Management
// -----------------------------------------------------------------------------

// Get Timetable
export const getTimetable = async (req: Request, res: Response) => {
  const { batchId, sectionId, facultyId } = req.query;

  try {
    let query = `
      SELECT ts.*, 
             s.name as subject, s.code as subject_code,
             u.id as faculty_id, u.name as faculty_name,
             sec.name as section_name, b.name as batch_name,
             sec.id as section_id, b.id as batch_id,
             ts.type as type
      FROM timetable_slots ts
      LEFT JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
      LEFT JOIN subjects s ON sa.subject_id = s.id
      LEFT JOIN users u ON sa.faculty_id = u.id
      LEFT JOIN sections sec ON ts.section_id = sec.id
      LEFT JOIN batches b ON sec.batch_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (batchId && sectionId) {
      query += ' AND sec.batch_id = ? AND ts.section_id = ?';
      params.push(batchId, sectionId);
    } else if (facultyId) {
      query += ' AND sa.faculty_id = ?';
      params.push(facultyId);
    }

    const [rows]: any = await pool.query(query, params);

    // Transform to frontend format if needed (TimetableSlot interface)
    const formatted = rows.map((r: any) => ({
      id: r.id,
      day: r.day_of_week,
      period: r.period_number,
      classId: r.batch_id?.toString(), // Use batch_id as classId for frontend compatibility
      sectionId: r.section_id?.toString(),
      subject: r.subject || 'Free',
      subjectCode: r.subject_code || '',
      facultyId: r.faculty_id?.toString() || '',
      facultyName: r.faculty_name || '',
      room: r.room_number || '',
      type: r.type || 'theory' // Assuming type column exists or derived
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Get Timetable Error:', error);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
};

// Save Timetable Slot
export const saveTimetableSlot = async (req: Request, res: Response) => {
  const { 
      batch_id, // For context
      section_id, 
      day, 
      period, 
      subject_code, 
      faculty_id,
      room,
      type 
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Conflict Check: Faculty Availability
    // Is this faculty assigned to ANY OTHER class at this specific time?
    if (faculty_id) {
        const [conflicts]: any = await connection.query(`
            SELECT sec.name as section, b.name as batch
            FROM timetable_slots ts
            JOIN subject_allocations sa ON ts.subject_allocation_id = sa.id
            JOIN sections sec ON ts.section_id = sec.id
            JOIN batches b ON sec.batch_id = b.id
            WHERE sa.faculty_id = ? 
              AND ts.day_of_week = ? 
              AND ts.period_number = ?
              AND ts.section_id != ? -- Exclude current slot if updating same
        `, [faculty_id, day, period, section_id]);

        if (conflicts.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                message: `Conflict: Faculty is already assigned to ${conflicts[0].batch} - Section ${conflicts[0].section} at this time.` 
            });
        }
    }

    // 2. Resolve Subject Allocation Logic
    // Does an allocation exist for this Subject + Faculty + Section?
    // If not, we might need to create one implicitly or assume it exists.
    // For simplicity, we'll look up the Subject ID from Code, then look for allocation.
    
    let allocationId = null;

    if (subject_code && faculty_id) {
        // Find subject
        const [subjects]: any = await connection.query('SELECT id FROM subjects WHERE code = ?', [subject_code]);
        if (subjects.length === 0) {
             await connection.rollback();
             return res.status(400).json({ message: 'Invalid Subject Code' });
        }
        const subjectId = subjects[0].id;

        // Find/Create Allocation
        const [allocs]: any = await connection.query(
            'SELECT id FROM subject_allocations WHERE subject_id = ? AND faculty_id = ? AND section_id = ?',
            [subjectId, faculty_id, section_id]
        );

        if (allocs.length > 0) {
            allocationId = allocs[0].id;
        } else {
            // Implicitly create allocation (or fail? User prefers ease, so create)
            // Need academic year... assume active or default.
            // For now, we just insert.
            const [ins]: any = await connection.execute(
                'INSERT INTO subject_allocations (subject_id, faculty_id, section_id, academic_year_id) VALUES (?, ?, ?, 1)',
                [subjectId, faculty_id, section_id]
            );
            allocationId = ins.insertId;
        }
    }

    // 3. Upsert Timetable Slot
    // Remove existing slot for this time in this section (to handle replacement or deletion if empty)
    await connection.execute(
        'DELETE FROM timetable_slots WHERE section_id = ? AND day_of_week = ? AND period_number = ?',
        [section_id, day, period]
    );

    if (allocationId) {
        await connection.execute(
            `INSERT INTO timetable_slots (section_id, day_of_week, period_number, subject_allocation_id, room_number, type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [section_id, day, period, allocationId, room, type || 'theory']
        );
    }

    await connection.commit();
    res.json({ message: 'Timetable updated' });

  } catch (error: any) {
    await connection.rollback();
    console.error('Save Timetable Error:', error);
    res.status(500).json({ message: 'Error saving timetable slot' });
  } finally {
    connection.release();
  }
};
