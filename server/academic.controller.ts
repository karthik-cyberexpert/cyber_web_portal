import { Request, Response } from 'express';
import { pool } from './db.js';

// Get All Batches with Section Count
export const getBatches = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT b.*,
      (SELECT COUNT(*) FROM sections s WHERE s.batch_id = b.id) as section_count_actual
      FROM batches b 
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
  const { name, start_year, end_year, sections_count } = req.body;
  
  if (!name || !start_year || !end_year) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 0. Ensure Default Department Exists (Fail-safe)
    const [depts]: any = await connection.query('SELECT id FROM departments WHERE id = 1');
    if (depts.length === 0) {
         await connection.execute("INSERT INTO departments (id, name, code) VALUES (1, 'Computer Science and Engineering (Cyber Security)', 'CSE-CS')");
         console.log('[AUTO-FIX] Created default Department (ID 1)');
    }

    // 1. Find or Create Academic Year
    // Logic: A batch starting in 2024 usually belongs to AY "2024-2025" initially
    const ayStart = parseInt(start_year);
    const ayEnd = ayStart + 1;
    const ayName = `${ayStart}-${ayEnd}`;

    let academicYearId;
    const [ays]: any = await connection.query('SELECT id FROM academic_years WHERE start_year = ?', [ayStart]);
    
    if (ays.length > 0) {
        academicYearId = ays[0].id;
    } else {
        const [res]: any = await connection.execute(
            'INSERT INTO academic_years (name, start_year, end_year, is_active) VALUES (?, ?, ?, TRUE)',
            [ayName, ayStart, ayEnd]
        );
        academicYearId = res.insertId;
        console.log(`[AUTO] Created Academic Year ${ayName} (ID: ${academicYearId})`);
    }

    const [result]: any = await connection.execute(
      'INSERT INTO batches (name, start_year, end_year, sections_count, department_id, academic_year_id) VALUES (?, ?, ?, ?, 1, ?)',
      [name, start_year, end_year, sections_count || 1, academicYearId]
    );
    const batchId = result.insertId;

    // Auto-create sections
    const count = parseInt(sections_count) || 1;
    for (let i = 0; i < count; i++) {
        const sectionName = String.fromCharCode(65 + i); // 65 is 'A'
        await connection.execute(
            'INSERT INTO sections (batch_id, name) VALUES (?, ?)',
            [batchId, sectionName]
        );
    }

    await connection.commit();
    res.status(201).json({ id: batchId, message: 'Batch created successfully' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Create Batch Error:', error);
    res.status(500).json({ message: 'Error creating batch' });
  } finally {
    connection.release();
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

// Get All Sections (Master List)
export const getAllSections = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM sections ORDER BY name ASC');
    res.json(rows);
  } catch (error: any) {
    console.error('Get All Sections Error:', error);
    res.status(500).json({ message: 'Error fetching all sections' });
  }
};

// Create Section
export const createSection = async (req: Request, res: Response) => {
  const { batch_id, name } = req.body;

  try {
    const [result]: any = await pool.execute(
      'INSERT INTO sections (batch_id, name) VALUES (?, ?)',
      [batch_id, name]
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
        const [allBatches]: any = await pool.query('SELECT id, name, current_semester, semester_end_date, semester_dates_pending FROM batches');
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        for (const batch of allBatches) {
            const startYear = parseInt(batch.name.split('-')[0]);
            if (isNaN(startYear)) continue;

            const yearDiff = currentYear - startYear;
            let expectedSemester = (currentMonth >= 5) ? (yearDiff * 2) + 1 : (yearDiff * 2);
            
            // Clamp
            if (expectedSemester < 1) expectedSemester = 1;
            if (expectedSemester > 8) expectedSemester = 8;

            // If DB is lagging behind calendar expected semester
            if (batch.current_semester < expectedSemester) {
                console.log(`Auto-incrementing batch ${batch.name} from Sem ${batch.current_semester} to Sem ${expectedSemester}`);
                
                // Deactivate old allocations
                await pool.execute(`
                    UPDATE subject_allocations sa
                    JOIN subjects s ON sa.subject_id = s.id
                    JOIN sections sec ON sa.section_id = sec.id
                    SET sa.is_active = FALSE
                    WHERE sec.batch_id = ?
                      AND s.semester < ?
                      AND sa.is_active = TRUE
                `, [batch.id, expectedSemester]);

                await pool.execute(`
                    UPDATE batches 
                    SET current_semester = ?,
                        semester_dates_pending = TRUE,
                        semester_start_date = NULL,
                        semester_end_date = NULL
                    WHERE id = ?
                `, [expectedSemester, batch.id]);
            } 
            // Also handle the case where the current semester dates have passed
            else if (batch.semester_end_date && new Date(batch.semester_end_date) < now && !batch.semester_dates_pending && batch.current_semester < 8) {
                const nextSem = batch.current_semester + 1;
                console.log(`Semester ended for batch ${batch.name} (Sem ${batch.current_semester}). Moving to Sem ${nextSem}`);
                
                await pool.execute(`
                    UPDATE subject_allocations sa
                    JOIN subjects s ON sa.subject_id = s.id
                    JOIN sections sec ON sa.section_id = sec.id
                    SET sa.is_active = FALSE
                    WHERE sec.batch_id = ?
                      AND s.semester = ?
                      AND sa.is_active = TRUE
                `, [batch.id, batch.current_semester]);

                await pool.execute(`
                    UPDATE batches 
                    SET current_semester = ?,
                        semester_dates_pending = TRUE,
                        semester_start_date = NULL,
                        semester_end_date = NULL
                    WHERE id = ?
                `, [nextSem, batch.id]);
            }
        }

        // Now fetch all batches that need semester date configuration
        const [rows]: any = await pool.query(`
            SELECT b.id, b.name, b.current_semester, b.semester_start_date, b.semester_end_date
            FROM batches b
            WHERE b.semester_dates_pending = TRUE OR b.semester_start_date IS NULL OR b.semester_end_date IS NULL
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
  const { semester } = req.query; // Add semester filter

  try {
    let query = `SELECT * FROM subjects`;
    const params: any[] = [];

    if (semester) {
        query += ` WHERE semester = ?`;
        params.push(semester);
    }
    
    query += ` ORDER BY semester ASC, code ASC`;

    // Fetch subjects
    const [subjects]: any = await pool.query(query, params);

    // Fetch allocations (faculties assigned to subjects)
    // We assume allocations with NULL section_id are "General" assignments for this view
    const [allocations]: any = await pool.query(`
      SELECT sa.subject_id, u.id as faculty_id, u.name as faculty_name
      FROM subject_allocations sa
      JOIN users u ON sa.faculty_id = u.id
      WHERE sa.section_id IS NULL 
    `);

    // Merge allocations into subjects
    // Optimization: If semester is filtered, we could filter allocations too, but this is okay for now
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
    const [result]: any = await pool.query(
      'INSERT INTO subjects (name, code, credits, semester, type) VALUES (?, ?, ?, ?, ?)',
      [name, code, credits, semester, type || 'theory']
    );
    res.status(201).json({ id: result.insertId, message: 'Subject created successfully (v2)' });
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

    // 0. Verify subject exists
    const [subjectCheck]: any = await connection.query('SELECT id FROM subjects WHERE id = ?', [id]);
    if (subjectCheck.length === 0) {
        await connection.rollback();
        console.warn(`[Update Faculties] Subject ID ${id} not found.`);
        return res.status(404).json({ message: `Subject with ID ${id} not found` });
    }

    // 1. Remove existing "general" allocations (section_id IS NULL) for this subject
    await connection.execute(
      'DELETE FROM subject_allocations WHERE subject_id = ? AND section_id IS NULL',
      [id]
    );

    // 2. Insert new allocations
    if (facultyIds.length > 0) {
      // Find active academic year or pick the latest
      const [ayRows]: any = await connection.query('SELECT id FROM academic_years ORDER BY is_active DESC, start_year DESC LIMIT 1');
      const academicYearId = ayRows.length > 0 ? ayRows[0].id : 1;

      console.log(`[Update Faculties] Using Academic Year ID: ${academicYearId} for Subject ID: ${id}`);

      const values = facultyIds.map((fid: number) => [id, fid, null, academicYearId]); // subject_id, faculty_id, section_id, academic_year_id
      // Construct bulk insert query
      const placeholders = facultyIds.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();
      
      await connection.execute(
        `INSERT INTO subject_allocations (subject_id, faculty_id, section_id, academic_year_id) VALUES ${placeholders}`,
        flatValues
      );
    }

    await connection.commit();
    res.json({ message: 'Subject faculties updated successfully' });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Update Subject Faculties Error Detailed:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage,
        params: { id, facultyIds }
    });
    res.status(500).json({ 
        message: 'Error updating subject faculties',
        error: error.message,
        code: error.code
    });
  } finally {
    if (connection) connection.release();
  }
};
// -----------------------------------------------------------------------------
// Timetable Management
// -----------------------------------------------------------------------------

// Get Timetable
export const getTimetable = async (req: Request, res: Response) => {
  const { batchId, sectionId, facultyId, semester } = req.query;

  try {
    let query = `
      SELECT ts.*, 
             s.name as subject, s.code as subject_code, s.semester,
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
      AND (sa.id IS NULL OR sa.is_active = TRUE)
    `;
    const params: any[] = [];

    if (batchId && sectionId) {
      query += ' AND sec.batch_id = ? AND ts.section_id = ?';
      params.push(batchId, sectionId);
    } else if (facultyId) {
      // For faculty, we want to see their active slots for current semesters
      query += ' AND sa.faculty_id = ?';
      params.push(facultyId);
    }

    if (semester) {
        query += ' AND s.semester = ?';
        params.push(semester);
    }

    console.log('=== GET TIMETABLE DEBUG ===');
    console.log('Query Params:', { batchId, sectionId, facultyId });
    console.log('SQL Params:', params);

    const [rows]: any = await pool.query(query, params);
    
    console.log('Rows Returned:', rows.length);
    if (rows.length > 0) {
      console.log('Sample Row:', JSON.stringify(rows[0], null, 2));
    }

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
      type,
      semester // New field
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Conflict Check: Faculty Availability
    // Is this faculty assigned to ANY OTHER class at this specific time?
    // CRITICAL: Only check ACTIVE allocations to avoid historical conflicts
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
              AND ts.section_id != ? 
              AND sa.is_active = TRUE
        `, [faculty_id, day, period, section_id]);

        if (conflicts.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                message: `Conflict: Faculty is already assigned to ${conflicts[0].batch} - Section ${conflicts[0].section} at this time.` 
            });
        }
    }

    // 2. Resolve Subject Allocation Logic
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
            // Implicitly create allocation
            const [ins]: any = await connection.execute(
                'INSERT INTO subject_allocations (subject_id, faculty_id, section_id, academic_year_id) VALUES (?, ?, ?, 1)',
                [subjectId, faculty_id, section_id]
            );
            allocationId = ins.insertId;
            console.log(`Implicitly created allocation ${allocationId} for subject ${subjectId}, faculty ${faculty_id}, section ${section_id}`);
        }
    } else {
        console.log(`Clearing slot for section ${section_id}, day ${day}, period ${period}`);
    }

    // 3. Upsert Timetable Slot
    // Remove existing slot for this time in this section AND SEMESTER
    // This allows distinct timetables for different semesters
    await connection.execute(
        'DELETE FROM timetable_slots WHERE section_id = ? AND day_of_week = ? AND period_number = ? AND semester = ?',
        [section_id, day, period, semester]
    );

    if (allocationId || type === 'free') {
        // Only insert if it's a real slot (not just a delete/clear)
        // Wait, 'free' usually doesn't need a record unless we strictly track 'Free' periods?
        // Use implicit deletion for clear. If type='free' and no allocation, we effectively just deleted above.
        // But if type != 'free' (e.g. valid allocation), insert.
        if (allocationId) {
             await connection.execute(
                `INSERT INTO timetable_slots (section_id, day_of_week, period_number, subject_allocation_id, room_number, type, semester) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [section_id, day, period, allocationId, room, type || 'theory', semester]
            );
        }
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
